const db = require('../config/db');
const { generateRegistrationId, generateRegistrationToken } = require('./qrService');
const { sendWaitlistPromotionEmail } = require('./emailService');

/**
 * Automatically check if a waitlist user can be promoted into a confirmed registration
 */
async function promoteNextInWaitlist(seminarId) {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // 1. Get seminar details and check capacity
    const seminarRes = await client.query('SELECT * FROM seminars WHERE id = $1 FOR UPDATE', [seminarId]);
    if (seminarRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }
    const seminar = seminarRes.rows[0];

    // 2. Count active confirmed registrations
    const regCountRes = await client.query(
      "SELECT COUNT(*) AS count FROM registrations WHERE seminar_id = $1 AND status = 'confirmed'",
      [seminarId]
    );
    const confirmedCount = parseInt(regCountRes.rows[0].count, 10);

    if (confirmedCount >= seminar.capacity) {
      await client.query('ROLLBACK');
      return null;
    }

    // 3. Find the first student in the waitlist
    const waitlistRes = await client.query(
      "SELECT * FROM waitlist WHERE seminar_id = $1 AND status = 'waiting' ORDER BY position ASC LIMIT 1 FOR UPDATE",
      [seminarId]
    );

    if (waitlistRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    const waitlistEntry = waitlistRes.rows[0];

    // 4. Generate registration credentials
    let registrationId = generateRegistrationId();
    let qrToken = generateRegistrationToken();

    // Insert registration
    const regInsertRes = await client.query(
      `INSERT INTO registrations (registration_id, user_id, seminar_id, qr_code_token, status)
       VALUES ($1, $2, $3, $4, 'confirmed')
       RETURNING *`,
      [registrationId, waitlistEntry.user_id, seminarId, qrToken]
    );
    const newRegistration = regInsertRes.rows[0];

    // Update waitlist entry to promoted
    await client.query(
      "UPDATE waitlist SET status = 'promoted' WHERE id = $1",
      [waitlistEntry.id]
    );

    // Reorder remaining waitlist entries
    await client.query(
      "UPDATE waitlist SET position = position - 1 WHERE seminar_id = $1 AND status = 'waiting' AND position > $2",
      [seminarId, waitlistEntry.position]
    );

    // Fetch user details for notification & email
    const userRes = await client.query('SELECT * FROM users WHERE id = $1', [waitlistEntry.user_id]);
    const user = userRes.rows[0];

    // Add in-app notification
    await client.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, 'success')`,
      [
        user.id,
        'Off the Waitlist! Registration Confirmed',
        `A seat opened up for "${seminar.title}" and your registration (${registrationId}) has been confirmed!`,
      ]
    );

    await client.query('COMMIT');

    // Send email asynchronously
    sendWaitlistPromotionEmail(user, seminar, newRegistration).catch((err) => {
      console.error('Error sending waitlist promotion email:', err);
    });

    console.log(`🎉 Waitlist promotion: User ${user.email} promoted for Seminar ${seminar.title}`);
    return { promoted: true, user, registration: newRegistration };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during waitlist promotion:', error);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  promoteNextInWaitlist,
};
