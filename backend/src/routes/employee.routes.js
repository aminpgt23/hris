const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/auth');
const db = require('../config/database');

router.use(authMiddleware);

router.get('/', authorize('Administrator', 'HR Staff', 'Manager'), async (req, res, next) => {
  try {
    const { department_id, status, search } = req.query;
    let where = 'WHERE e.is_active = TRUE';
    const params = [];
    if (department_id) { where += ' AND e.department_id = ?'; params.push(department_id); }
    if (status) { where += ' AND e.employment_status = ?'; params.push(status); }
    if (search) { where += ' AND (e.first_name LIKE ? OR e.last_name LIKE ? OR e.employee_number LIKE ?)'; const s = `%${search}%`; params.push(s, s, s); }
    const [rows] = await db.execute(
      `SELECT e.*, d.name as department_name, p.title as position_title, g.name as grade_name,
              CONCAT(e.first_name, ' ', e.last_name) as full_name,
              sup.first_name as supervisor_first_name, sup.last_name as supervisor_last_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN positions p ON e.position_id = p.id
       LEFT JOIN grades g ON e.grade_id = g.id
       LEFT JOIN employees sup ON e.supervisor_id = sup.id
       ${where}
       ORDER BY e.employee_number`, params
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
});

router.get('/:id', authorize('Administrator', 'HR Staff', 'Manager', 'Employee'), async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT e.*, d.name as department_name, p.title as position_title,
              CONCAT(e.first_name, ' ', e.last_name) as full_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN positions p ON e.position_id = p.id
       WHERE e.id = ?`, [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
});

router.post('/', authorize('Administrator', 'HR Staff'), async (req, res, next) => {
  try {
    const { company_id, branch_id, employee_number, first_name, last_name, email_company, position_id, department_id, hire_date, employment_status } = req.body;
    if (!company_id || !employee_number || !first_name || !last_name) {
      return res.status(400).json({ success: false, message: 'Required: company_id, employee_number, first_name, last_name' });
    }
    const [existing] = await db.execute('SELECT id FROM employees WHERE employee_number = ?', [employee_number]);
    if (existing.length > 0) return res.status(409).json({ success: false, message: 'Employee number already exists' });
    const [result] = await db.execute(
      `INSERT INTO employees (company_id, branch_id, employee_number, first_name, last_name, email_company, position_id, department_id, hire_date, employment_status, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [company_id, branch_id || null, employee_number, first_name, last_name, email_company || null, position_id || null, department_id || null, hire_date || null, employment_status || 'Permanent']
    );
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) { next(error); }
});

router.put('/:id', authorize('Administrator', 'HR Staff'), async (req, res, next) => {
  try {
    const { first_name, last_name, email_company, phone_personal, position_id, department_id, employment_status, is_active } = req.body;
    await db.execute(
      `UPDATE employees SET first_name=?, last_name=?, email_company=?, phone_personal=?, position_id=?, department_id=?, employment_status=?, is_active=? WHERE id=?`,
      [first_name, last_name, email_company, phone_personal, position_id, department_id, employment_status, is_active ?? true, req.params.id]
    );
    res.json({ success: true, message: 'Employee updated' });
  } catch (error) { next(error); }
});

module.exports = router;
