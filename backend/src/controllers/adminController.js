const db = require('../config/db');

// 1. Admin Dashboard Overview KPI Cards
async function getAdminDashboard(req, res, next) {
  try {
    const statsSql = `
      SELECT 
        (SELECT COUNT(*) FROM seminars) AS total_seminars,
        (SELECT COUNT(*) FROM seminars WHERE date >= CURRENT_DATE AND status = 'published') AS upcoming_seminars,
        (SELECT COUNT(*) FROM registrations WHERE status = 'confirmed') AS total_registrations,
        (SELECT COUNT(*) FROM attendance WHERE status = 'present') AS total_attendees,
        (SELECT COUNT(*) FROM certificates) AS certificates_issued,
        (
          SELECT COALESCE(SUM(GREATEST(0, s.capacity - COALESCE(r.cnt, 0))), 0)
          FROM seminars s
          LEFT JOIN (
            SELECT seminar_id, COUNT(*) AS cnt 
            FROM registrations 
            WHERE status = 'confirmed' 
            GROUP BY seminar_id
          ) r ON s.id = r.seminar_id
          WHERE s.date >= CURRENT_DATE AND s.status = 'published'
        ) AS available_seats
    `;

    const statsRes = await db.query(statsSql);

    // Recent registrations
    const recentRegSql = `
      SELECT 
        r.id,
        r.registration_id,
        r.registered_at,
        r.status,
        u.name AS student_name,
        u.student_id,
        u.department,
        s.title AS seminar_title,
        s.date AS seminar_date
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      JOIN seminars s ON r.seminar_id = s.id
      ORDER BY r.registered_at DESC
      LIMIT 6
    `;
    const recentRegRes = await db.query(recentRegSql);

    // Recent check-ins
    const recentCheckinsSql = `
      SELECT 
        a.id,
        a.check_in_time,
        a.status,
        u.name AS student_name,
        u.student_id,
        s.title AS seminar_title
      FROM attendance a
      JOIN registrations r ON a.registration_id = r.id
      JOIN users u ON r.user_id = u.id
      JOIN seminars s ON r.seminar_id = s.id
      ORDER BY a.check_in_time DESC
      LIMIT 6
    `;
    const recentCheckinsRes = await db.query(recentCheckinsSql);

    return res.json({
      success: true,
      stats: {
        total_seminars: parseInt(statsRes.rows[0].total_seminars, 10),
        upcoming_seminars: parseInt(statsRes.rows[0].upcoming_seminars, 10),
        total_registrations: parseInt(statsRes.rows[0].total_registrations, 10),
        total_attendees: parseInt(statsRes.rows[0].total_attendees, 10),
        certificates_issued: parseInt(statsRes.rows[0].certificates_issued, 10),
        available_seats: parseInt(statsRes.rows[0].available_seats, 10),
      },
      recent_registrations: recentRegRes.rows,
      recent_checkins: recentCheckinsRes.rows,
    });
  } catch (error) {
    next(error);
  }
}

// 2. Admin Analytics Charts
async function getAdminAnalytics(req, res, next) {
  try {
    // 1. Registrations over time (last 14 days)
    const timeTrendSql = `
      SELECT 
        TO_CHAR(d.day, 'YYYY-MM-DD') AS date,
        TO_CHAR(d.day, 'Mon DD') AS label,
        COUNT(r.id) AS count
      FROM (
        SELECT generate_series(CURRENT_DATE - INTERVAL '13 days', CURRENT_DATE, '1 day'::interval)::date AS day
      ) d
      LEFT JOIN registrations r ON d.day = DATE(r.registered_at) AND r.status = 'confirmed'
      GROUP BY d.day
      ORDER BY d.day ASC
    `;
    const timeTrendRes = await db.query(timeTrendSql);

    // 2. Attendance Statistics
    const attStatsSql = `
      SELECT 
        COUNT(a.id) FILTER (WHERE a.status = 'present') AS present_count,
        COUNT(r.id) - COUNT(a.id) FILTER (WHERE a.status = 'present') AS absent_count,
        COUNT(w.id) FILTER (WHERE w.status = 'waiting') AS waitlist_count
      FROM registrations r
      LEFT JOIN attendance a ON r.id = a.registration_id
      LEFT JOIN waitlist w ON r.seminar_id = w.seminar_id
      WHERE r.status = 'confirmed'
    `;
    const attStatsRes = await db.query(attStatsSql);

    // 3. Seminar Popularity (top 6 seminars by registrations)
    const popularitySql = `
      SELECT 
        s.id,
        s.title,
        s.capacity,
        COUNT(r.id) AS registration_count
      FROM seminars s
      LEFT JOIN registrations r ON s.id = r.seminar_id AND r.status = 'confirmed'
      GROUP BY s.id, s.title, s.capacity
      ORDER BY registration_count DESC
      LIMIT 6
    `;
    const popularityRes = await db.query(popularitySql);

    // 4. Department-wise participation
    const deptSql = `
      SELECT 
        COALESCE(u.department, 'Unspecified') AS department,
        COUNT(r.id) AS count
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      WHERE r.status = 'confirmed'
      GROUP BY u.department
      ORDER BY count DESC
      LIMIT 8
    `;
    const deptRes = await db.query(deptSql);

    return res.json({
      success: true,
      analytics: {
        registrations_over_time: timeTrendRes.rows,
        attendance_stats: {
          present: parseInt(attStatsRes.rows[0].present_count || 0, 10),
          absent: Math.max(0, parseInt(attStatsRes.rows[0].absent_count || 0, 10)),
          waitlist: parseInt(attStatsRes.rows[0].waitlist_count || 0, 10),
        },
        seminar_popularity: popularityRes.rows.map((row) => ({
          ...row,
          registration_count: parseInt(row.registration_count, 10),
        })),
        department_participation: deptRes.rows.map((row) => ({
          ...row,
          count: parseInt(row.count, 10),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
}

// 3. Admin Registrations Table
async function getAdminRegistrations(req, res, next) {
  try {
    const {
      search,
      seminar_id,
      status,
      attendance, // 'present', 'absent', 'all'
      page = 1,
      limit = 15,
      sortBy = 'registered_at',
      sortOrder = 'DESC',
    } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const conditions = [];
    const params = [];

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      conditions.push(`(
        u.name ILIKE $${params.length} OR
        u.student_id ILIKE $${params.length} OR
        u.email ILIKE $${params.length} OR
        r.registration_id ILIKE $${params.length} OR
        s.title ILIKE $${params.length}
      )`);
    }

    if (seminar_id && seminar_id !== 'all') {
      params.push(seminar_id);
      conditions.push(`r.seminar_id = $${params.length}`);
    }

    if (status && status !== 'all') {
      params.push(status);
      conditions.push(`r.status = $${params.length}`);
    }

    if (attendance === 'present') {
      conditions.push(`att.status = 'present'`);
    } else if (attendance === 'absent') {
      conditions.push(`(att.id IS NULL OR att.status != 'present')`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*) AS total
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      JOIN seminars s ON r.seminar_id = s.id
      LEFT JOIN attendance att ON r.id = att.registration_id
      ${whereClause}
    `;
    const countRes = await db.query(countSql, params);
    const total = parseInt(countRes.rows[0].total, 10);

    const safeSort = ['registered_at', 'student_name', 'seminar_title'].includes(sortBy)
      ? sortBy
      : 'registered_at';
    const safeOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    params.push(parseInt(limit, 10));
    const limitParam = params.length;

    params.push(offset);
    const offsetParam = params.length;

    const sql = `
      SELECT 
        r.id,
        r.registration_id,
        r.registered_at,
        r.status AS registration_status,
        r.qr_code_token,
        u.id AS user_id,
        u.name AS student_name,
        u.student_id,
        u.email,
        u.department,
        u.year,
        s.id AS seminar_id,
        s.title AS seminar_title,
        s.date AS seminar_date,
        s.venue,
        att.id AS attendance_id,
        att.status AS attendance_status,
        att.check_in_time,
        cert.certificate_id
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      JOIN seminars s ON r.seminar_id = s.id
      LEFT JOIN attendance att ON r.id = att.registration_id
      LEFT JOIN certificates cert ON r.id = cert.registration_id
      ${whereClause}
      ORDER BY ${safeSort === 'student_name' ? 'u.name' : safeSort === 'seminar_title' ? 's.title' : 'r.registered_at'} ${safeOrder}
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;

    const result = await db.query(sql, params);

    return res.json({
      success: true,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      registrations: result.rows,
    });
  } catch (error) {
    next(error);
  }
}

// 4. Export Registrations to CSV
async function exportRegistrationsCSV(req, res, next) {
  try {
    const { seminar_id } = req.query;
    let sql = `
      SELECT 
        r.registration_id,
        u.name AS student_name,
        u.student_id,
        u.email,
        u.phone,
        u.department,
        u.year,
        s.title AS seminar_title,
        s.date AS seminar_date,
        s.venue,
        r.status AS registration_status,
        r.registered_at,
        COALESCE(att.status, 'unmarked') AS attendance_status,
        att.check_in_time,
        cert.certificate_id
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      JOIN seminars s ON r.seminar_id = s.id
      LEFT JOIN attendance att ON r.id = att.registration_id
      LEFT JOIN certificates cert ON r.id = cert.registration_id
    `;

    const params = [];
    if (seminar_id && seminar_id !== 'all') {
      params.push(seminar_id);
      sql += ' WHERE r.seminar_id = $1';
    }
    sql += ' ORDER BY r.registered_at DESC';

    const result = await db.query(sql, params);

    const headers = [
      'Registration ID',
      'Student Name',
      'Student ID',
      'Email',
      'Phone',
      'Department',
      'Year',
      'Seminar Title',
      'Date',
      'Venue',
      'Status',
      'Registered At',
      'Attendance',
      'Check-in Time',
      'Certificate ID',
    ];

    const csvRows = [headers.join(',')];

    for (const row of result.rows) {
      const values = [
        row.registration_id,
        `"${(row.student_name || '').replace(/"/g, '""')}"`,
        row.student_id || '',
        row.email || '',
        row.phone || '',
        `"${(row.department || '').replace(/"/g, '""')}"`,
        row.year || '',
        `"${(row.seminar_title || '').replace(/"/g, '""')}"`,
        row.seminar_date ? new Date(row.seminar_date).toLocaleDateString() : '',
        `"${(row.venue || '').replace(/"/g, '""')}"`,
        row.registration_status,
        row.registered_at ? new Date(row.registered_at).toISOString() : '',
        row.attendance_status,
        row.check_in_time ? new Date(row.check_in_time).toISOString() : '',
        row.certificate_id || 'N/A',
      ];
      csvRows.push(values.join(','));
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=seminar_registrations.csv');
    return res.send(csvRows.join('\n'));
  } catch (error) {
    next(error);
  }
}

// 5. Admin: Users Management List
async function getAdminUsers(req, res, next) {
  try {
    const { search, role, department, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const conditions = [];
    const params = [];

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      conditions.push(`(
        name ILIKE $${params.length} OR
        email ILIKE $${params.length} OR
        student_id ILIKE $${params.length} OR
        department ILIKE $${params.length}
      )`);
    }

    if (role && role !== 'all') {
      params.push(role);
      conditions.push(`role = $${params.length}`);
    }

    if (department && department !== 'all') {
      params.push(department);
      conditions.push(`department = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM users ${whereClause}`;
    const countRes = await db.query(countSql, params);
    const total = parseInt(countRes.rows[0].total, 10);

    params.push(parseInt(limit, 10));
    const limitParam = params.length;
    params.push(offset);
    const offsetParam = params.length;

    const sql = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.student_id,
        u.phone,
        u.department,
        u.year,
        u.role,
        u.profile_photo,
        u.created_at,
        COUNT(r.id) AS total_registrations,
        COUNT(a.id) FILTER (WHERE a.status = 'present') AS total_attended
      FROM users u
      LEFT JOIN registrations r ON u.id = r.user_id
      LEFT JOIN attendance a ON r.id = a.registration_id
      ${whereClause}
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;

    const result = await db.query(sql, params);

    return res.json({
      success: true,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      users: result.rows,
    });
  } catch (error) {
    next(error);
  }
}

// 6. Update User Role (Super Admin only)
async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['student', 'event_admin', 'super_admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified.',
      });
    }

    const updateRes = await db.query(
      'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, email, role',
      [role, id]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.json({
      success: true,
      message: `User ${updateRes.rows[0].name} role updated to ${role}.`,
      user: updateRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAdminDashboard,
  getAdminAnalytics,
  getAdminRegistrations,
  exportRegistrationsCSV,
  getAdminUsers,
  updateUserRole,
};
