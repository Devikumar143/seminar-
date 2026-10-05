const db = require('../config/db');
const { sendAttendanceEmail } = require('../services/emailService');

// 1. Scan QR code / Mark attendance (Admin action)
async function scanAttendance(req, res, next) {
  try {
    const { qr_token, registration_id, seminar_id } = req.body;

    if (!qr_token && !registration_id) {
      return res.status(400).json({
        success: false,
        message: 'A QR token or Registration ID is required to mark attendance.',
      });
    }

    // Search for registration
    let findSql = `
      SELECT 
        r.id AS registration_pk,
        r.registration_id,
        r.status AS registration_status,
        r.seminar_id,
        u.id AS user_id,
        u.name AS student_name,
        u.student_id,
        u.email,
        u.department,
        u.year,
        s.id AS seminar_pk,
        s.title AS seminar_title,
        s.date AS seminar_date,
        s.venue AS seminar_venue,
        s.status AS seminar_status
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      JOIN seminars s ON r.seminar_id = s.id
      WHERE (r.qr_code_token = $1 OR r.registration_id = $2)
    `;

    const regResult = await db.query(findSql, [qr_token || '', registration_id || '']);

    if (regResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or unrecognized QR pass. Registration not found.',
      });
    }

    const reg = regResult.rows[0];

    // Check registration status
    if (reg.registration_status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: `This registration is not active (Status: ${reg.registration_status}).`,
      });
    }

    // If specific seminar context was supplied, check match
    if (seminar_id && parseInt(seminar_id, 10) !== reg.seminar_pk) {
      return res.status(400).json({
        success: false,
        message: `Pass mismatch! This pass is registered for "${reg.seminar_title}", not the selected seminar.`,
      });
    }

    // Check if attendance already recorded
    const existingAttRes = await db.query(
      'SELECT id, check_in_time, status FROM attendance WHERE registration_id = $1',
      [reg.registration_pk]
    );

    if (existingAttRes.rows.length > 0) {
      const existing = existingAttRes.rows[0];
      return res.status(400).json({
        success: false,
        alreadyMarked: true,
        message: 'Attendance has ALREADY been recorded for this student!',
        attendance: {
          student_name: reg.student_name,
          student_id: reg.student_id,
          seminar_title: reg.seminar_title,
          check_in_time: existing.check_in_time,
          status: existing.status,
        },
      });
    }

    // Record attendance
    const insertAttRes = await db.query(
      `INSERT INTO attendance (registration_id, check_in_time, status, marked_by)
       VALUES ($1, CURRENT_TIMESTAMP, 'present', $2)
       RETURNING id, check_in_time, status`,
      [reg.registration_pk, req.user.id]
    );

    const attendance = insertAttRes.rows[0];

    // Create in-app notification
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, 'success')`,
      [
        reg.user_id,
        'Attendance Verified ✅',
        `Your attendance for "${reg.seminar_title}" was marked as PRESENT at ${new Date(attendance.check_in_time).toLocaleTimeString()}.`,
      ]
    );

    // Send confirmation email asynchronously
    sendAttendanceEmail(
      { name: reg.student_name, email: reg.email },
      { title: reg.seminar_title, date: reg.seminar_date },
      attendance.check_in_time
    ).catch((err) => console.error('Attendance email error:', err));

    return res.status(200).json({
      success: true,
      message: 'Attendance Marked Successfully! Check-in confirmed.',
      attendance: {
        student_name: reg.student_name,
        student_id: reg.student_id,
        department: reg.department,
        seminar: reg.seminar_title,
        check_in_time: attendance.check_in_time,
        status: attendance.status,
      },
    });
  } catch (error) {
    next(error);
  }
}

// 2. Student attendance history
async function getMyAttendance(req, res, next) {
  try {
    const userId = req.user.id;

    const sql = `
      SELECT 
        s.id AS seminar_id,
        s.title AS seminar_title,
        s.date,
        s.start_time,
        s.end_time,
        s.venue,
        s.speaker,
        r.registration_id,
        CASE 
          WHEN a.id IS NOT NULL THEN a.status
          WHEN s.date > CURRENT_DATE THEN 'Not Started'
          ELSE 'Absent'
        END AS attendance_status,
        a.check_in_time,
        c.certificate_id
      FROM registrations r
      JOIN seminars s ON r.seminar_id = s.id
      LEFT JOIN attendance a ON r.id = a.registration_id
      LEFT JOIN certificates c ON r.id = c.registration_id
      WHERE r.user_id = $1 AND r.status = 'confirmed'
      ORDER BY s.date DESC
    `;

    const result = await db.query(sql, [userId]);

    return res.json({
      success: true,
      attendance: result.rows,
    });
  } catch (error) {
    next(error);
  }
}

// 3. Admin: Seminar Attendance List & Stats
async function getSeminarAttendance(req, res, next) {
  try {
    const { id } = req.params;

    const statsSql = `
      SELECT 
        COUNT(r.id) AS total_registered,
        COUNT(a.id) FILTER (WHERE a.status = 'present') AS total_present,
        COUNT(r.id) - COUNT(a.id) FILTER (WHERE a.status = 'present') AS total_absent
      FROM registrations r
      LEFT JOIN attendance a ON r.id = a.registration_id
      WHERE r.seminar_id = $1 AND r.status = 'confirmed'
    `;
    const statsRes = await db.query(statsSql, [id]);

    const listSql = `
      SELECT 
        r.id AS registration_id_pk,
        r.registration_id,
        u.id AS user_id,
        u.name AS student_name,
        u.student_id,
        u.email,
        u.department,
        u.year,
        a.id AS attendance_id,
        COALESCE(a.status, 'unmarked') AS attendance_status,
        a.check_in_time,
        m.name AS marked_by_name
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN attendance a ON r.id = a.registration_id
      LEFT JOIN users m ON a.marked_by = m.id
      WHERE r.seminar_id = $1 AND r.status = 'confirmed'
      ORDER BY a.check_in_time DESC NULLS LAST, u.name ASC
    `;
    const listRes = await db.query(listSql, [id]);

    return res.json({
      success: true,
      stats: statsRes.rows[0],
      attendees: listRes.rows,
    });
  } catch (error) {
    next(error);
  }
}

// 4. Admin: Manual Mark Attendance
async function manualMarkAttendance(req, res, next) {
  try {
    const { registration_id, status = 'present' } = req.body;

    if (!registration_id) {
      return res.status(400).json({
        success: false,
        message: 'Registration ID is required.',
      });
    }

    const regRes = await db.query(
      `SELECT r.id, r.user_id, s.title AS seminar_title, u.name AS student_name, u.email, s.date
       FROM registrations r
       JOIN seminars s ON r.seminar_id = s.id
       JOIN users u ON r.user_id = u.id
       WHERE ${/^\d+$/.test(String(registration_id).trim()) ? 'r.id = $1' : 'r.registration_id = $1'}`,
      [registration_id]
    );

    if (regRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found.',
      });
    }

    const reg = regRes.rows[0];

    const attRes = await db.query(
      `INSERT INTO attendance (registration_id, check_in_time, status, marked_by)
       VALUES ($1, CURRENT_TIMESTAMP, $2, $3)
       ON CONFLICT (registration_id)
       DO UPDATE SET status = $2, check_in_time = CURRENT_TIMESTAMP, marked_by = $3
       RETURNING *`,
      [reg.id, status, req.user.id]
    );

    return res.json({
      success: true,
      message: `Attendance marked as ${status.toUpperCase()} for ${reg.student_name}.`,
      attendance: attRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  scanAttendance,
  getMyAttendance,
  getSeminarAttendance,
  manualMarkAttendance,
};
