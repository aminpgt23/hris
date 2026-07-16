const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../../middleware/auth');
const db = require('../../config/database');

router.use(authMiddleware);

// ========== DASHBOARD STATS ==========

router.get('/dashboard/stats', authorize('Administrator', 'HR Staff', 'Manager', 'Finance', 'Director'), async (req, res, next) => {
  try {
    const [employeeCount] = await db.execute('SELECT COUNT(*) as total FROM employees WHERE is_active = TRUE');

    const today = new Date().toISOString().split('T')[0];
    const [attendance] = await db.execute(
      "SELECT COUNT(*) as present FROM attendance_records WHERE date = ? AND status = 'Present'", [today]
    );
    const [pendingLeave] = await db.execute(
      "SELECT COUNT(*) as count FROM leave_requests WHERE status IN ('Pending Manager', 'Pending HR')"
    );

    res.json({
      success: true,
      data: {
        totalEmployees: employeeCount[0].total,
        presentToday: attendance[0].present,
        pendingApprovals: pendingLeave[0].count
      }
    });
  } catch (error) { next(error); }
});

router.get('/dashboard/headcount', authorize('Administrator', 'HR Staff', 'Manager'), async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT DATE_FORMAT(hire_date, '%Y-%m') as month, COUNT(*) as hires
       FROM employees WHERE hire_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(hire_date, '%Y-%m') ORDER BY month`
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
});

router.get('/dashboard/payroll-cost', authorize('Administrator', 'HR Staff', 'Finance', 'Director'), async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT pp.name, SUM(pt.net_salary) as total_net, SUM(pt.gross_salary) as total_gross
       FROM payroll_transactions pt
       JOIN payroll_periods pp ON pt.payroll_period_id = pp.id
       WHERE pp.status = 'Paid'
       GROUP BY pp.id, pp.name
       ORDER BY pp.start_date DESC LIMIT 6`
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
});

// ========== REPORT GENERATORS ==========

router.get('/generate/employee-summary', authorize('Administrator', 'HR Staff', 'Manager'), async (req, res, next) => {
  try {
    const { department_id, status } = req.query;
    let query = `SELECT e.id, e.employee_number, CONCAT(e.first_name, ' ', e.last_name) as full_name,
                        e.email_company as email, e.phone_personal as phone, e.gender, d.name as department, p.name as position,
                        e.hire_date, e.employment_status
                 FROM employees e
                 LEFT JOIN departments d ON e.department_id = d.id
                 LEFT JOIN positions p ON e.position_id = p.id
                 WHERE e.is_active = TRUE`;
    const params = [];
    if (department_id) { query += ' AND e.department_id = ?'; params.push(department_id); }
    if (status) { query += ' AND e.employment_status = ?'; params.push(status); }
    query += ' ORDER BY e.employee_number';
    const [rows] = await db.execute(query, params);
    res.json({ success: true, data: rows, total: rows.length, type: 'employee-summary' });
  } catch (error) { next(error); }
});

router.get('/generate/payroll-summary', authorize('Administrator', 'Finance', 'HR Staff'), async (req, res, next) => {
  try {
    const { period_id } = req.query;
    let query = `SELECT pp.name as period, d.name as department,
                        COUNT(pt.id) as employees, SUM(pt.gross_salary) as total_gross,
                        SUM(pt.deductions) as total_deductions, SUM(pt.net_salary) as total_net
                 FROM payroll_transactions pt
                 JOIN payroll_periods pp ON pt.payroll_period_id = pp.id
                 JOIN employees e ON pt.employee_id = e.id
                 JOIN departments d ON e.department_id = d.id`;
    const params = [];
    if (period_id) { query += ' WHERE pp.id = ?'; params.push(period_id); }
    query += ' GROUP BY pp.id, pp.name, d.name ORDER BY MIN(pp.start_date) DESC, d.name';
    const [rows] = await db.execute(query, params);
    res.json({ success: true, data: rows, type: 'payroll-summary' });
  } catch (error) { next(error); }
});

router.get('/generate/attendance', authorize('Administrator', 'HR Staff', 'Manager'), async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const m = month || new Date().getMonth() + 1;
    const y = year || new Date().getFullYear();
    const [rows] = await db.execute(
      `SELECT CONCAT(e.first_name, ' ', e.last_name) as employee_name,
              COUNT(ar.id) as total_days,
              SUM(CASE WHEN ar.status = 'Present' THEN 1 ELSE 0 END) as present,
              SUM(CASE WHEN ar.status = 'Late' THEN 1 ELSE 0 END) as late,
              SUM(CASE WHEN ar.status = 'Absent' THEN 1 ELSE 0 END) as absent,
              SUM(CASE WHEN ar.status = 'On Leave' THEN 1 ELSE 0 END) as on_leave
       FROM employees e
       JOIN attendance_records ar ON e.id = ar.employee_id
       WHERE MONTH(ar.date) = ? AND YEAR(ar.date) = ?
       GROUP BY e.id, e.first_name, e.last_name
       ORDER BY e.first_name`, [m, y]
    );
    res.json({ success: true, data: rows, type: 'attendance', month: m, year: y });
  } catch (error) { next(error); }
});

router.get('/generate/leave-analysis', authorize('Administrator', 'HR Staff', 'Manager'), async (req, res, next) => {
  try {
    const { year } = req.query;
    const y = year || new Date().getFullYear();
    const [rows] = await db.execute(
      `SELECT lt.name as leave_type,
              COUNT(lr.id) as total_requests,
              SUM(lr.total_days) as total_days,
              SUM(CASE WHEN lr.status = 'Approved' THEN 1 ELSE 0 END) as approved,
              SUM(CASE WHEN lr.status IN ('Pending Manager','Pending HR') THEN 1 ELSE 0 END) as pending
       FROM leave_requests lr
       JOIN leave_types lt ON lr.leave_type_id = lt.id
       WHERE YEAR(lr.created_at) = ?
       GROUP BY lt.name ORDER BY total_requests DESC`, [y]
    );
    res.json({ success: true, data: rows, type: 'leave-analysis', year: y });
  } catch (error) { next(error); }
});

router.get('/generate/headcount', authorize('Administrator', 'HR Staff', 'Manager', 'Director'), async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT d.name as department,
              COUNT(e.id) as total,
              SUM(CASE WHEN e.employment_status = 'Permanent' THEN 1 ELSE 0 END) as permanent,
              SUM(CASE WHEN e.employment_status = 'Contract' THEN 1 ELSE 0 END) as contract,
              SUM(CASE WHEN e.employment_status = 'Probation' THEN 1 ELSE 0 END) as probation,
              SUM(CASE WHEN e.employment_status = 'Intern' THEN 1 ELSE 0 END) as intern
       FROM departments d
       LEFT JOIN employees e ON e.department_id = d.id AND e.is_active = TRUE
       GROUP BY d.name ORDER BY total DESC`
    );
    res.json({ success: true, data: rows, type: 'headcount' });
  } catch (error) { next(error); }
});

router.get('/generate/bpjs', authorize('Administrator', 'Finance', 'HR Staff'), async (req, res, next) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const [health] = await db.execute(
      `SELECT 'Kesehatan' as bpjs_type, employee_percentage, employer_percentage,
              min_base_salary, max_base_salary, is_active, effective_from
       FROM bpjs_health_config WHERE year = ? AND is_active = TRUE LIMIT 1`, [year]
    );
    const [employment] = await db.execute(
      `SELECT 'Ketenagakerjaan' as bpjs_type, jht_employee_percentage, jht_employer_percentage,
              jp_employee_percentage, jp_employer_percentage, jkk_percentage, jkm_percentage,
              min_base_salary, max_base_salary, is_active, effective_from
       FROM bpjs_employment_config WHERE year = ? AND is_active = TRUE LIMIT 1`, [year]
    );
    const rows = [];
    if (health.length) rows.push(health[0]);
    if (employment.length) rows.push(employment[0]);
    res.json({ success: true, data: rows, type: 'bpjs', year });
  } catch (error) { next(error); }
});

router.get('/generate/pph21', authorize('Administrator', 'Finance'), async (req, res, next) => {
  try {
    const { year } = req.query;
    const y = year || new Date().getFullYear();
    const [rows] = await db.execute(
      `SELECT CONCAT(e.first_name, ' ', e.last_name) as employee_name,
              e.employee_number, pc.gross_annual_income as gross_income,
              pc.total_deductions as total_deductions,
              pc.taxable_income_annual as taxable_income,
              pc.pph21_annual as tax_paid, pc.pph21_monthly as tax_monthly,
              pc.tax_category, pc.ptkp_amount
       FROM pph21_calculations pc
       JOIN employees e ON pc.employee_id = e.id
       JOIN payroll_periods pp ON pc.payroll_period_id = pp.id
       WHERE YEAR(pp.end_date) = ?
       ORDER BY e.first_name`, [y]
    );
    res.json({ success: true, data: rows, type: 'pph21', year: y });
  } catch (error) { next(error); }
});

router.get('/generate/overtime', authorize('Administrator', 'HR Staff', 'Manager'), async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const m = month || new Date().getMonth() + 1;
    const y = year || new Date().getFullYear();
    const [rows] = await db.execute(
      `SELECT d.name as department,
              COUNT(ot.id) as total_overtime,
              COALESCE(SUM(COALESCE(ot.approved_hours, 0)), 0) as total_hours,
              COALESCE(SUM(COALESCE(ot.calculated_amount, 0)), 0) as total_cost
       FROM overtime_requests ot
       JOIN employees e ON ot.employee_id = e.id
       JOIN departments d ON e.department_id = d.id
       WHERE MONTH(ot.date) = ? AND YEAR(ot.date) = ? AND ot.status = 'Approved'
       GROUP BY d.name ORDER BY total_cost DESC`, [m, y]
    );
    res.json({ success: true, data: rows, type: 'overtime', month: m, year: y });
  } catch (error) { next(error); }
});

// ========== SAVED REPORTS CRUD ==========

router.get('/saved', authorize('Administrator', 'HR Staff', 'Manager', 'Finance', 'Director'), async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM saved_reports WHERE created_by = ? ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    // Table may not exist — return empty
    res.json({ success: true, data: [] });
  }
});

router.post('/saved', authorize('Administrator', 'HR Staff', 'Manager', 'Finance', 'Director'), async (req, res, next) => {
  try {
    const { name, type, parameters } = req.body;
    if (!name || !type) return res.status(400).json({ success: false, message: 'Required: name, type' });
    const [result] = await db.execute(
      'INSERT INTO saved_reports (name, type, parameters, created_by) VALUES (?, ?, ?, ?)',
      [name, type, parameters ? JSON.stringify(parameters) : null, req.user.userId]
    );
    res.status(201).json({ success: true, message: 'Report saved', data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/saved/:id', authorize('Administrator', 'HR Staff'), async (req, res, next) => {
  try {
    await db.execute('DELETE FROM saved_reports WHERE id = ? AND created_by = ?', [req.params.id, req.user.userId]);
    res.json({ success: true, message: 'Saved report deleted' });
  } catch { res.json({ success: true }); }
});

module.exports = router;
