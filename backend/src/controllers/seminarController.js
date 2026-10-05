const db = require('../config/db');

// 1. Get all seminars with filters, search, and seat counts
async function getSeminars(req, res, next) {
  try {
    const {
      search,
      category,
      timeframe, // 'upcoming', 'past', 'all'
      date,
      sortBy = 'date',
      sortOrder = 'ASC',
      status, // admin filter
      page = 1,
      limit = 12,
    } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const conditions = [];
    const params = [];

    // Filter by status: normal students only see published / completed
    if (status && ['super_admin', 'event_admin'].includes(req.user?.role)) {
      params.push(status);
      conditions.push(`s.status = $${params.length}`);
    } else {
      // By default students only see active or completed seminars, not drafts
      conditions.push(`s.status IN ('published', 'completed', 'closed')`);
    }

    // Search query
    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      conditions.push(`(
        s.title ILIKE $${params.length} OR
        s.description ILIKE $${params.length} OR
        s.speaker ILIKE $${params.length} OR
        s.venue ILIKE $${params.length} OR
        s.category ILIKE $${params.length}
      )`);
    }

    // Category filter
    if (category && category !== 'All') {
      params.push(category);
      conditions.push(`s.category = $${params.length}`);
    }

    // Date filter
    if (date) {
      params.push(date);
      conditions.push(`s.date = $${params.length}`);
    }

    // Timeframe filter (upcoming vs past)
    const currentDate = new Date().toISOString().split('T')[0];
    if (timeframe === 'past') {
      params.push(currentDate);
      conditions.push(`s.date < $${params.length}`);
    } else if (timeframe === 'upcoming' || !timeframe) {
      params.push(currentDate);
      conditions.push(`s.date >= $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Sort order validation
    const allowedSortFields = ['date', 'title', 'capacity', 'created_at'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? `s.${sortBy}` : 's.date';
    const safeSortOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // Count query
    const countSql = `SELECT COUNT(*) AS total FROM seminars s ${whereClause}`;
    const countRes = await db.query(countSql, params);
    const totalSeminars = parseInt(countRes.rows[0].total, 10);

    // Main data query with aggregation of registrations and user status
    const currentUserId = req.user?.id || 0;
    params.push(currentUserId);
    const userIdParam = params.length;

    params.push(parseInt(limit, 10));
    const limitParam = params.length;

    params.push(offset);
    const offsetParam = params.length;

    const dataSql = `
      SELECT 
        s.*,
        COALESCE(r_count.confirmed_registrations, 0) AS registered_count,
        GREATEST(0, s.capacity - COALESCE(r_count.confirmed_registrations, 0)) AS remaining_seats,
        COALESCE(w_count.waitlist_count, 0) AS waitlist_count,
        ur.status AS user_registration_status,
        ur.registration_id AS user_registration_id,
        ur.id AS user_reg_record_id,
        uw.status AS user_waitlist_status,
        uw.position AS user_waitlist_position
      FROM seminars s
      LEFT JOIN (
        SELECT seminar_id, COUNT(*) AS confirmed_registrations
        FROM registrations
        WHERE status = 'confirmed'
        GROUP BY seminar_id
      ) r_count ON s.id = r_count.seminar_id
      LEFT JOIN (
        SELECT seminar_id, COUNT(*) AS waitlist_count
        FROM waitlist
        WHERE status = 'waiting'
        GROUP BY seminar_id
      ) w_count ON s.id = w_count.seminar_id
      LEFT JOIN (
        SELECT id, seminar_id, registration_id, status
        FROM registrations
        WHERE user_id = $${userIdParam} AND status = 'confirmed'
      ) ur ON s.id = ur.seminar_id
      LEFT JOIN (
        SELECT seminar_id, position, status
        FROM waitlist
        WHERE user_id = $${userIdParam} AND status = 'waiting'
      ) uw ON s.id = uw.seminar_id
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;

    const dataRes = await db.query(dataSql, params);

    // Compute distinct categories for frontend filter pill bar
    const catRes = await db.query('SELECT DISTINCT category FROM seminars ORDER BY category ASC');
    const categories = catRes.rows.map((r) => r.category);

    return res.json({
      success: true,
      total: totalSeminars,
      page: parseInt(page, 10),
      totalPages: Math.ceil(totalSeminars / parseInt(limit, 10)),
      categories,
      seminars: dataRes.rows,
    });
  } catch (error) {
    next(error);
  }
}

// 2. Get single seminar details
async function getSeminarById(req, res, next) {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id || 0;

    const sql = `
      SELECT 
        s.*,
        COALESCE(r_count.confirmed_registrations, 0) AS registered_count,
        GREATEST(0, s.capacity - COALESCE(r_count.confirmed_registrations, 0)) AS remaining_seats,
        COALESCE(w_count.waitlist_count, 0) AS waitlist_count,
        ur.status AS user_registration_status,
        ur.registration_id AS user_registration_id,
        ur.qr_code_token AS user_qr_token,
        ur.id AS user_reg_record_id,
        uw.status AS user_waitlist_status,
        uw.position AS user_waitlist_position,
        att.status AS user_attendance_status,
        att.check_in_time AS user_check_in_time,
        cert.certificate_id AS user_certificate_id
      FROM seminars s
      LEFT JOIN (
        SELECT seminar_id, COUNT(*) AS confirmed_registrations
        FROM registrations
        WHERE status = 'confirmed'
        GROUP BY seminar_id
      ) r_count ON s.id = r_count.seminar_id
      LEFT JOIN (
        SELECT seminar_id, COUNT(*) AS waitlist_count
        FROM waitlist
        WHERE status = 'waiting'
        GROUP BY seminar_id
      ) w_count ON s.id = w_count.seminar_id
      LEFT JOIN (
        SELECT id, seminar_id, registration_id, qr_code_token, status
        FROM registrations
        WHERE user_id = $2 AND status = 'confirmed'
      ) ur ON s.id = ur.seminar_id
      LEFT JOIN (
        SELECT seminar_id, position, status
        FROM waitlist
        WHERE user_id = $2 AND status = 'waiting'
      ) uw ON s.id = uw.seminar_id
      LEFT JOIN (
        SELECT a.registration_id, a.status, a.check_in_time, r.seminar_id
        FROM attendance a
        JOIN registrations r ON a.registration_id = r.id
        WHERE r.user_id = $2
      ) att ON s.id = att.seminar_id
      LEFT JOIN (
        SELECT c.certificate_id, r.seminar_id
        FROM certificates c
        JOIN registrations r ON c.registration_id = r.id
        WHERE r.user_id = $2
      ) cert ON s.id = cert.seminar_id
      WHERE s.id = $1
    `;

    const result = await db.query(sql, [id, currentUserId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Seminar not found.',
      });
    }

    return res.json({
      success: true,
      seminar: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

// 3. Create Seminar (Admin only)
async function createSeminar(req, res, next) {
  try {
    const {
      title,
      description,
      category,
      speaker,
      speaker_designation,
      speaker_image,
      banner_image,
      date,
      start_time,
      end_time,
      venue,
      capacity,
      registration_deadline,
      requirements,
      topics,
      organizer_info,
      status = 'published',
    } = req.body;

    if (!title || !description || !category || !speaker || !date || !start_time || !end_time || !venue || !capacity || !registration_deadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all mandatory seminar details including title, speaker, date, time, venue, capacity, and deadline.',
      });
    }

    const topicsArray = Array.isArray(topics)
      ? topics
      : typeof topics === 'string'
      ? topics.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const insertSql = `
      INSERT INTO seminars (
        title, description, category, speaker, speaker_designation,
        speaker_image, banner_image, date, start_time, end_time,
        venue, capacity, registration_deadline, requirements,
        topics, organizer_info, status, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `;

    const result = await db.query(insertSql, [
      title.trim(),
      description.trim(),
      category.trim(),
      speaker.trim(),
      speaker_designation ? speaker_designation.trim() : null,
      speaker_image || null,
      banner_image || null,
      date,
      start_time,
      end_time,
      venue.trim(),
      parseInt(capacity, 10),
      registration_deadline,
      requirements ? requirements.trim() : null,
      topicsArray,
      organizer_info ? organizer_info.trim() : null,
      status,
      req.user.id,
    ]);

    return res.status(201).json({
      success: true,
      message: 'Seminar created successfully.',
      seminar: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

// 4. Update Seminar (Admin only)
async function updateSeminar(req, res, next) {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      speaker,
      speaker_designation,
      speaker_image,
      banner_image,
      date,
      start_time,
      end_time,
      venue,
      capacity,
      registration_deadline,
      requirements,
      topics,
      organizer_info,
      status,
    } = req.body;

    const topicsArray = Array.isArray(topics)
      ? topics
      : typeof topics === 'string'
      ? topics.split(',').map((t) => t.trim()).filter(Boolean)
      : null;

    const updateSql = `
      UPDATE seminars
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          category = COALESCE($3, category),
          speaker = COALESCE($4, speaker),
          speaker_designation = COALESCE($5, speaker_designation),
          speaker_image = COALESCE($6, speaker_image),
          banner_image = COALESCE($7, banner_image),
          date = COALESCE($8, date),
          start_time = COALESCE($9, start_time),
          end_time = COALESCE($10, end_time),
          venue = COALESCE($11, venue),
          capacity = COALESCE($12, capacity),
          registration_deadline = COALESCE($13, registration_deadline),
          requirements = COALESCE($14, requirements),
          topics = COALESCE($15, topics),
          organizer_info = COALESCE($16, organizer_info),
          status = COALESCE($17, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $18
      RETURNING *
    `;

    const result = await db.query(updateSql, [
      title ? title.trim() : null,
      description ? description.trim() : null,
      category ? category.trim() : null,
      speaker ? speaker.trim() : null,
      speaker_designation ? speaker_designation.trim() : null,
      speaker_image || null,
      banner_image || null,
      date || null,
      start_time || null,
      end_time || null,
      venue ? venue.trim() : null,
      capacity ? parseInt(capacity, 10) : null,
      registration_deadline || null,
      requirements ? requirements.trim() : null,
      topicsArray,
      organizer_info ? organizer_info.trim() : null,
      status || null,
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Seminar not found.',
      });
    }

    return res.json({
      success: true,
      message: 'Seminar updated successfully.',
      seminar: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

// 5. Delete Seminar (Admin only)
async function deleteSeminar(req, res, next) {
  try {
    const { id } = req.params;

    const result = await db.query('DELETE FROM seminars WHERE id = $1 RETURNING id, title', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Seminar not found.',
      });
    }

    return res.json({
      success: true,
      message: `Seminar "${result.rows[0].title}" deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
}

// 6. Update Seminar Status (Admin only)
async function updateSeminarStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['draft', 'published', 'closed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid seminar status.',
      });
    }

    const result = await db.query(
      'UPDATE seminars SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Seminar not found.',
      });
    }

    return res.json({
      success: true,
      message: `Seminar status changed to ${status}.`,
      seminar: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSeminars,
  getSeminarById,
  createSeminar,
  updateSeminar,
  deleteSeminar,
  updateSeminarStatus,
};
