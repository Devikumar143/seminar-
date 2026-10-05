const db = require('../config/db');

// 1. Get user notifications
async function getNotifications(req, res, next) {
  try {
    const userId = req.user.id;

    const sql = `
      SELECT id, title, message, type, is_read, created_at
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 30
    `;
    const result = await db.query(sql, [userId]);

    const countRes = await db.query(
      'SELECT COUNT(*) AS unread FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );

    return res.json({
      success: true,
      unread_count: parseInt(countRes.rows[0].unread, 10),
      notifications: result.rows,
    });
  } catch (error) {
    next(error);
  }
}

// 2. Mark single notification as read
async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await db.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    return res.json({
      success: true,
      message: 'Notification marked as read.',
    });
  } catch (error) {
    next(error);
  }
}

// 3. Mark all notifications as read
async function markAllAsRead(req, res, next) {
  try {
    const userId = req.user.id;

    await db.query('UPDATE notifications SET is_read = true WHERE user_id = $1', [userId]);

    return res.json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
