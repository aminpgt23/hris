const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth');
const db = require('../../config/database');

router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM notifications WHERE user_id = ? AND status != ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id, 'Failed']
    );
    const unread = rows.filter(n => n.status !== 'Read' && n.status !== 'Failed').length;
    res.json({ success: true, data: rows, unreadCount: unread });
  } catch (error) { next(error); }
});

router.put('/:id/read', async (req, res, next) => {
  try {
    await db.execute(
      "UPDATE notifications SET status='Read', read_at=NOW() WHERE id=? AND user_id=?",
      [req.params.id, req.user.id]
    );
    res.json({ success: true, message: 'Marked as read' });
  } catch (error) { next(error); }
});

router.put('/read-all', async (req, res, next) => {
  try {
    await db.execute(
      "UPDATE notifications SET status='Read', read_at=NOW() WHERE user_id=? AND status='Sent'",
      [req.user.id]
    );
    res.json({ success: true, message: 'All marked as read' });
  } catch (error) { next(error); }
});

module.exports = router;
