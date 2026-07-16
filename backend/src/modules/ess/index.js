const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/auth');
const db = require('../../config/database');

router.use(authMiddleware);

// Get my profile
router.get('/profile', async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT e.*, d.name as department_name, p.name as position_name,
              CONCAT(s.first_name, ' ', s.last_name) as supervisor_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN positions p ON e.position_id = p.id
       LEFT JOIN employees s ON e.supervisor_id = s.id
       WHERE e.id = ?`, [req.user.employeeId]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
});

// Update my profile
router.put('/profile', async (req, res, next) => {
  try {
    const allowed = ['phone_personal', 'email_personal', 'address_current', 'city', 'province', 'bank_name', 'bank_account_number', 'emergency_contact_name', 'emergency_contact_phone'];
    const updates = [];
    const values = [];
    for (const field of allowed) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    }
    if (updates.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });
    values.push(req.user.employeeId);
    await db.execute(`UPDATE employees SET ${updates.join(', ')} WHERE id = ?`, values);
    res.json({ success: true, message: 'Profile updated' });
  } catch (error) { next(error); }
});

// Get my payslip
router.get('/payslips', async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT pt.*, pp.name as period_name
       FROM payroll_transactions pt
       JOIN payroll_periods pp ON pt.payroll_period_id = pp.id
       WHERE pt.employee_id = ? AND pt.payslip_generated = TRUE
       ORDER BY pp.start_date DESC`, [req.user.employeeId]
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
});

// Dashboard stats for employee
router.get('/dashboard', async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [attendance] = await db.execute(
      'SELECT * FROM attendance_records WHERE employee_id = ? AND date = ?', [req.user.employeeId, today]
    );
    const [pendingLeave] = await db.execute(
      "SELECT COUNT(*) as count FROM leave_requests WHERE employee_id = ? AND status IN ('Pending Manager', 'Pending HR')",
      [req.user.employeeId]
    );
    res.json({ success: true, data: { todayAttendance: attendance[0] || null, pendingLeave: pendingLeave[0].count } });
  } catch (error) { next(error); }
});

module.exports = router;
