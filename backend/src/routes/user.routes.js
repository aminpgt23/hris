const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/auth');
const db = require('../config/database');

router.use(authMiddleware);

router.get('/', authorize('Administrator', 'HR Staff'), async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT u.id, u.username, u.email, u.phone, u.is_active, u.role_id,
              r.name as role_name,
              CONCAT(e.first_name, ' ', e.last_name) as employee_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       LEFT JOIN employees e ON u.employee_id = e.id
       ORDER BY u.username`
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
});

router.get('/:id', authorize('Administrator', 'HR Staff'), async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT id, username, email, phone, is_active, role_id FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
});

module.exports = router;
