const db = require('../config/db');
const { generateRegistrationId, generateRegistrationToken, generateQRCodeDataURL } = require('../services/qrService');
const { sendRegistrationEmail, sendCancellationEmail, sendWaitlistEmail } = require('../services/emailService');
const { promoteNextInWaitlist } = require('../services/waitlistService');
const { generatePassPDF } = require('../services/pdfService');

// 1. Register for a seminar (or join waitlist if full)
async function registerForSeminar(req, res, next) {
  const client = await db.getClient();
  try {
    const { seminar_id } = req.body;
    const userId = req.user.id;

    if (!seminar_id) {
      return res.status(400).json({
        success: false,
        message: 'Seminar ID is required.',
      });
    }

    await client.query('BEGIN');

    // Fetch seminar with lock
    const seminarRes = await client.query('SELECT * FROM seminars WHERE id = $1 FOR UPDATE', [seminar_id]);
    if (seminarRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Seminar not found.',
      });
    }

    const seminar = seminarRes.rows[0];

    // Check status
    if (seminar.status !== 'published') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Registration is not available. Seminar status: ${seminar.status}.`,
      });
    }

    // Check registration deadline
    const now = new Date();
    const deadline = new Date(seminar.registration_deadline);
    if (now > deadline) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed for this seminar.',
      });
    }

    // Check if already registered
    const existingRegRes = await client.query(
      "SELECT * FROM registrations WHERE user_id = $1 AND seminar_id = $2 AND status = 'confirmed'",
      [userId, seminar_id]
    );

    if (existingRegRes.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'You have already registered for this seminar.',
      });
    }

    // Check if already in waitlist
    const existingWaitlistRes = await client.query(
      "SELECT * FROM waitlist WHERE user_id = $1 AND seminar_id = $2 AND status = 'waiting'",
      [userId, seminar_id]
    );

    if (existingWaitlistRes.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `You are already on the waitlist for this seminar (Position #${existingWaitlistRes.rows[0].position}).`,
      });
    }

    // Check current capacity
    const regCountRes = await client.query(
      "SELECT COUNT(*) AS count FROM registrations WHERE seminar_id = $1 AND status = 'confirmed'",
      [seminar_id]
    );
    const confirmedCount = parseInt(regCountRes.rows[0].count, 10);

    // If seminar is FULL -> Add to Waitlist
    if (confirmedCount >= seminar.capacity) {
      const waitlistCountRes = await client.query(
        "SELECT COUNT(*) AS count FROM waitlist WHERE seminar_id = $1 AND status = 'waiting'",
        [seminar_id]
      );
      const position = parseInt(waitlistCountRes.rows[0].count, 10) + 1;

      const waitlistInsert = await client.query(
        `INSERT INTO waitlist (user_id, seminar_id, position, status)
         VALUES ($1, $2, $3, 'waiting')
         ON CONFLICT (user_id, seminar_id) 
         DO UPDATE SET position = $3, status = 'waiting', created_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [userId, seminar_id, position]
      );

      // In-app notification
      await client.query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES ($1, $2, $3, 'warning')`,
        [
          userId,
          'Waitlist Placement',
          `"${seminar.title}" is currently at full capacity. You are placed at position #${position} on the waitlist.`,
        ]
      );

      await client.query('COMMIT');

      // Send email
      sendWaitlistEmail(req.user, seminar, position).catch((err) =>
        console.error('Waitlist email error:', err)
      );

      return res.status(200).json({
        success: true,
        waitlisted: true,
        message: `The seminar is full. You have been placed on the waitlist at position #${position}.`,
        waitlist: waitlistInsert.rows[0],
      });
    }

    // Capacity Available -> Confirm Registration
    const registrationId = generateRegistrationId();
    const qrToken = generateRegistrationToken();

    const insertRegRes = await client.query(
      `INSERT INTO registrations (registration_id, user_id, seminar_id, qr_code_token, status)
       VALUES ($1, $2, $3, $4, 'confirmed')
       RETURNING *`,
      [registrationId, userId, seminar_id, qrToken]
    );

    const registration = insertRegRes.rows[0];

    // Notification
    await client.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, 'success')`,
      [
        userId,
        'Registration Confirmed!',
        `You have successfully registered for "${seminar.title}". Pass ID: ${registrationId}.`,
      ]
    );

    await client.query('COMMIT');

    // Generate QR Data URL for immediate response
    const qrDataUrl = await generateQRCodeDataURL(qrToken);

    // Send confirmation email asynchronously
    sendRegistrationEmail(req.user, seminar, registration).catch((err) =>
      console.error('Registration email error:', err)
    );

    return res.status(201).json({
      success: true,
      message: 'Registration confirmed successfully!',
      registration: {
        ...registration,
        qr_code_image: qrDataUrl,
        seminar_title: seminar.title,
        seminar_date: seminar.date,
        seminar_venue: seminar.venue,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
}

// 2. Get all registrations of logged in student
async function getMyRegistrations(req, res, next) {
  try {
    const userId = req.user.id;

    const sql = `
      SELECT 
        r.id AS id,
        r.registration_id,
        r.qr_code_token,
        r.registered_at,
        r.status AS registration_status,
        s.id AS seminar_id,
        s.title AS seminar_title,
        s.description AS seminar_description,
        s.category,
        s.speaker,
        s.speaker_designation,
        s.banner_image,
        s.speaker_image,
        s.date,
        s.start_time,
        s.end_time,
        s.venue,
        s.status AS seminar_status,
        att.status AS attendance_status,
        att.check_in_time,
        cert.id AS certificate_record_id,
        cert.certificate_id,
        cert.issued_at AS certificate_issued_at
      FROM registrations r
      JOIN seminars s ON r.seminar_id = s.id
      LEFT JOIN attendance att ON r.id = att.registration_id
      LEFT JOIN certificates cert ON r.id = cert.registration_id
      WHERE r.user_id = $1
      ORDER BY s.date DESC, r.registered_at DESC
    `;

    const result = await db.query(sql, [userId]);

    // Attach QR code data URLs
    const registrationsWithQR = await Promise.all(
      result.rows.map(async (row) => {
        const qrDataUrl = await generateQRCodeDataURL(row.qr_code_token);
        return {
          ...row,
          qr_code_image: qrDataUrl,
        };
      })
    );

    return res.json({
      success: true,
      registrations: registrationsWithQR,
    });
  } catch (error) {
    next(error);
  }
}

// 3. Get single registration details
async function getRegistrationById(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const sql = `
      SELECT 
        r.*,
        u.name AS student_name,
        u.student_id,
        u.email,
        u.department,
        u.year,
        s.title AS seminar_title,
        s.speaker,
        s.speaker_designation,
        s.date,
        s.start_time,
        s.end_time,
        s.venue,
        s.category,
        s.banner_image,
        att.status AS attendance_status,
        att.check_in_time,
        cert.certificate_id
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      JOIN seminars s ON r.seminar_id = s.id
      LEFT JOIN attendance att ON r.id = att.registration_id
      LEFT JOIN certificates cert ON r.id = cert.registration_id
      WHERE ${/^\d+$/.test(String(id).trim()) ? 'r.id = $1' : 'r.registration_id = $1'}
    `;

    const result = await db.query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Registration record not found.',
      });
    }

    const reg = result.rows[0];

    // Check ownership if not admin
    if (reg.user_id !== userId && !['super_admin', 'event_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to view this registration.',
      });
    }

    const qrDataUrl = await generateQRCodeDataURL(reg.qr_code_token);

    return res.json({
      success: true,
      registration: {
        ...reg,
        qr_code_image: qrDataUrl,
      },
    });
  } catch (error) {
    next(error);
  }
}

// 4. Download Registration Pass as PDF
async function downloadPassPDF(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const sql = `
      SELECT 
        r.id,
        r.registration_id,
        r.qr_code_token,
        r.user_id,
        u.name AS student_name,
        u.student_id,
        u.department,
        u.year,
        s.title AS seminar_title,
        s.speaker,
        s.speaker_designation,
        s.date,
        s.start_time,
        s.end_time,
        s.venue
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      JOIN seminars s ON r.seminar_id = s.id
      WHERE ${/^\d+$/.test(String(id).trim()) ? 'r.id = $1' : 'r.registration_id = $1'}
    `;

    const result = await db.query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Registration record not found.',
      });
    }

    const reg = result.rows[0];

    // Check ownership if not admin
    if (reg.user_id !== userId && !['super_admin', 'event_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not own this pass.',
      });
    }

    await generatePassPDF(reg, res);
  } catch (error) {
    next(error);
  }
}

// 5. Cancel Registration (Triggers Waitlist Promotion)
async function cancelRegistration(req, res, next) {
  const client = await db.getClient();
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await client.query('BEGIN');

    // Find registration
    const regRes = await client.query(
      `SELECT r.*, s.title AS seminar_title, s.id AS seminar_id 
       FROM registrations r 
       JOIN seminars s ON r.seminar_id = s.id 
       WHERE ${/^\d+$/.test(String(id).trim()) ? 'r.id = $1' : 'r.registration_id = $1'}`,
      [id]
    );

    if (regRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Registration not found.',
      });
    }

    const reg = regRes.rows[0];

    // Permission check
    if (reg.user_id !== userId && !['super_admin', 'event_admin'].includes(req.user.role)) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own registrations.',
      });
    }

    // Delete registration record
    await client.query('DELETE FROM registrations WHERE id = $1', [reg.id]);

    // Create notification
    await client.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, 'info')`,
      [
        reg.user_id,
        'Registration Cancelled',
        `Your registration for "${reg.seminar_title}" has been cancelled.`,
      ]
    );

    await client.query('COMMIT');

    // Send cancellation email
    sendCancellationEmail(req.user, { title: reg.seminar_title }).catch((err) =>
      console.error('Cancellation email error:', err)
    );

    // Trigger Waitlist promotion for the seminar!
    promoteNextInWaitlist(reg.seminar_id).catch((err) =>
      console.error('Error promoting waitlist after cancellation:', err)
    );

    return res.json({
      success: true,
      message: 'Registration cancelled successfully. Any waitlisted participants will be notified.',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
}

// 6. Get Logged in Student's Waitlist Entries
async function getMyWaitlist(req, res, next) {
  try {
    const userId = req.user.id;

    const sql = `
      SELECT 
        w.id,
        w.position,
        w.status AS waitlist_status,
        w.created_at,
        s.id AS seminar_id,
        s.title,
        s.speaker,
        s.speaker_designation,
        s.date,
        s.start_time,
        s.end_time,
        s.venue,
        s.banner_image,
        s.category,
        s.capacity
      FROM waitlist w
      JOIN seminars s ON w.seminar_id = s.id
      WHERE w.user_id = $1 AND w.status = 'waiting'
      ORDER BY w.created_at DESC
    `;

    const result = await db.query(sql, [userId]);

    return res.json({
      success: true,
      waitlist: result.rows,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registerForSeminar,
  getMyRegistrations,
  getRegistrationById,
  downloadPassPDF,
  cancelRegistration,
  getMyWaitlist,
};
