const db = require('../../config/database');

exports.request = async (req, res, next) => {
  try {
    const employeeId = req.user.employeeId || req.body.employee_id;
    const { date, start_time, end_time, reason, project_code } = req.body;

    if (!date || !start_time || !end_time || !reason) {
      return res.status(400).json({ success: false, message: 'Required: date, start_time, end_time, reason' });
    }

    // Calculate hours
    const [sh, sm] = start_time.split(':').map(Number);
    const [eh, em] = end_time.split(':').map(Number);
    const hours = Math.round(((eh * 60 + em) - (sh * 60 + sm)) / 60 * 100) / 100;

    if (hours <= 0) return res.status(400).json({ success: false, message: 'Invalid time range' });

    const [result] = await db.execute(
      `INSERT INTO overtime_requests (employee_id, date, start_time, end_time, requested_hours, reason, project_code)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [employeeId, date, start_time, end_time, hours, reason, project_code || null]
    );

    res.status(201).json({ success: true, data: { id: result.insertId, hours } });
  } catch (error) { next(error); }
};

exports.approve = async (req, res, next) => {
  try {
    const { approved_hours } = req.body;
    const [result] = await db.execute(
      `UPDATE overtime_requests SET status='Approved', approved_hours=?, approved_by=?, approved_at=NOW()
       WHERE id=? AND status='Pending'`,
      [approved_hours || null, req.user.id, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Request not found or already processed' });
    res.json({ success: true, message: 'Overtime approved' });
  } catch (error) { next(error); }
};

exports.reject = async (req, res, next) => {
  try {
    const { rejection_reason } = req.body;
    const [result] = await db.execute(
      `UPDATE overtime_requests SET status='Rejected', approved_by=?, approved_at=NOW(), rejection_reason=?
       WHERE id=? AND status='Pending'`,
      [req.user.id, rejection_reason || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Request not found or already processed' });
    res.json({ success: true, message: 'Overtime rejected' });
  } catch (error) { next(error); }
};

exports.getAll = async (req, res, next) => {
  try {
    const { status, employee_id, date_from, date_to } = req.query;
    let where = 'WHERE 1=1';
    const params = [];

    if (status) { where += ' AND o.status = ?'; params.push(status); }
    if (employee_id) { where += ' AND o.employee_id = ?'; params.push(employee_id); }
    if (date_from) { where += ' AND o.date >= ?'; params.push(date_from); }
    if (date_to) { where += ' AND o.date <= ?'; params.push(date_to); }

    // Employee sees only own
    if (req.user.roleName === 'Employee') {
      where += ' AND o.employee_id = ?';
      params.push(req.user.employeeId);
    }

    const [rows] = await db.execute(
      `SELECT o.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.employee_number
       FROM overtime_requests o
       JOIN employees e ON o.employee_id = e.id
       ${where}
       ORDER BY o.created_at DESC`, params
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};
