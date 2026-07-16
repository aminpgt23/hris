const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../../middleware/auth');
const db = require('../../config/database');

router.use(authMiddleware);

// ===== Salary Components CRUD =====

router.get('/salary-components', authorize('Administrator', 'HR Staff', 'Finance'), async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM salary_components ORDER BY sequence_order, name'
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
});

router.post('/salary-components', authorize('Administrator', 'HR Staff'), async (req, res, next) => {
  try {
    const { company_id, code, name, type, category, calculation_type, formula, is_taxable, is_pensionable, is_bpjs_base, display_on_payslip, sequence_order, is_active } = req.body;
    if (!company_id || !code || !name || !type || !category) {
      return res.status(400).json({ success: false, message: 'Required: company_id, code, name, type, category' });
    }
    const [result] = await db.execute(
      `INSERT INTO salary_components (company_id, code, name, type, category, calculation_type, formula, is_taxable, is_pensionable, is_bpjs_base, display_on_payslip, sequence_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [company_id, code, name, type, category, calculation_type || 'Fixed Amount', formula || null, is_taxable ?? 1, is_pensionable ?? 0, is_bpjs_base ?? 0, display_on_payslip ?? 1, sequence_order || 0, is_active ?? 1]
    );
    res.status(201).json({ success: true, message: 'Salary component created', data: { id: result.insertId } });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Component code already exists' });
    next(error);
  }
});

router.put('/salary-components/:id', authorize('Administrator', 'HR Staff'), async (req, res, next) => {
  try {
    const fields = ['code','name','type','category','calculation_type','formula','is_taxable','is_pensionable','is_bpjs_base','display_on_payslip','sequence_order','is_active'];
    const sets = fields.filter(f => req.body[f] !== undefined).map(f => `${f} = ?`);
    if (!sets.length) return res.status(400).json({ success: false, message: 'No fields to update' });
    const values = fields.filter(f => req.body[f] !== undefined).map(f => req.body[f]);
    values.push(req.params.id);
    await db.execute(`UPDATE salary_components SET ${sets.join(', ')} WHERE id = ?`, values);
    res.json({ success: true, message: 'Salary component updated' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Component code already exists' });
    next(error);
  }
});

router.delete('/salary-components/:id', authorize('Administrator', 'HR Staff'), async (req, res, next) => {
  try {
    await db.execute('DELETE FROM salary_components WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Salary component deleted' });
  } catch (error) { next(error); }
});

// ===== Employee Salary Assignments CRUD =====

router.get('/assignments', authorize('Administrator', 'HR Staff', 'Finance'), async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT esa.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.employee_number,
              d.name as department_name
       FROM employee_salary_assignments esa
       JOIN employees e ON esa.employee_id = e.id
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE (esa.effective_to IS NULL OR esa.effective_to >= CURDATE())
       ORDER BY e.first_name`
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
});

router.post('/assignments', authorize('Administrator', 'HR Staff'), async (req, res, next) => {
  try {
    const { employee_id, basic_salary, fixed_allowances, fixed_deductions, tax_category, bpjs_health_percentage, bpjs_employment_percentage, pension_percentage, is_eligible_payroll, bank_transfer, effective_from } = req.body;
    if (!employee_id || !basic_salary || !effective_from) {
      return res.status(400).json({ success: false, message: 'Required: employee_id, basic_salary, effective_from' });
    }
    // Expire previous active assignment for this employee
    await db.execute(
      "UPDATE employee_salary_assignments SET effective_to = DATE_SUB(?, INTERVAL 1 DAY) WHERE employee_id = ? AND effective_to IS NULL",
      [effective_from, employee_id]
    );
    const [result] = await db.execute(
      `INSERT INTO employee_salary_assignments (employee_id, basic_salary, fixed_allowances, fixed_deductions, tax_category, bpjs_health_percentage, bpjs_employment_percentage, pension_percentage, is_eligible_payroll, bank_transfer, effective_from, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [employee_id, basic_salary, fixed_allowances ? JSON.stringify(fixed_allowances) : null, fixed_deductions ? JSON.stringify(fixed_deductions) : null, tax_category || 'TK0', bpjs_health_percentage ?? 1.00, bpjs_employment_percentage ?? 2.00, pension_percentage ?? 1.00, is_eligible_payroll ?? 1, bank_transfer ?? 1, effective_from, req.user.userId]
    );
    res.status(201).json({ success: true, message: 'Salary assignment created', data: { id: result.insertId } });
  } catch (error) { next(error); }
});

router.put('/assignments/:id', authorize('Administrator', 'HR Staff'), async (req, res, next) => {
  try {
    const fields = ['basic_salary','fixed_allowances','fixed_deductions','tax_category','bpjs_health_percentage','bpjs_employment_percentage','pension_percentage','is_eligible_payroll','bank_transfer','effective_from','effective_to'];
    const sets = fields.filter(f => req.body[f] !== undefined).map(f => f === 'fixed_allowances' || f === 'fixed_deductions' ? `${f} = ?` : `${f} = ?`);
    const values = fields.filter(f => req.body[f] !== undefined).map(f => {
      if (f === 'fixed_allowances' || f === 'fixed_deductions') return JSON.stringify(req.body[f]);
      return req.body[f];
    });
    if (!sets.length) return res.status(400).json({ success: false, message: 'No fields to update' });
    values.push(req.params.id);
    await db.execute(`UPDATE employee_salary_assignments SET ${sets.join(', ')} WHERE id = ?`, values);
    res.json({ success: true, message: 'Salary assignment updated' });
  } catch (error) { next(error); }
});

router.delete('/assignments/:id', authorize('Administrator', 'HR Staff'), async (req, res, next) => {
  try {
    await db.execute('DELETE FROM employee_salary_assignments WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Salary assignment deleted' });
  } catch (error) { next(error); }
});

// ===== Payroll Periods CRUD =====

router.get('/periods', authorize('Administrator', 'HR Staff', 'Finance'), async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT pp.*,
              (SELECT COUNT(*) FROM payroll_transactions pt WHERE pt.payroll_period_id = pp.id) as total_employees,
              (SELECT COALESCE(SUM(pt.gross_salary),0) FROM payroll_transactions pt WHERE pt.payroll_period_id = pp.id) as total_gross,
              (SELECT COALESCE(SUM(pt.net_salary),0) FROM payroll_transactions pt WHERE pt.payroll_period_id = pp.id) as total_net
       FROM payroll_periods pp ORDER BY pp.fiscal_year DESC, pp.period_number DESC`
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
});

router.post('/periods', authorize('Administrator', 'HR Staff'), async (req, res, next) => {
  try {
    const { company_id, code, name, period_type, payment_day, cutoff_day, fiscal_year, period_number, start_date, end_date, payment_date } = req.body;
    if (!company_id || !code || !name || !fiscal_year || !period_number || !start_date || !end_date) {
      return res.status(400).json({ success: false, message: 'Required: company_id, code, name, fiscal_year, period_number, start_date, end_date' });
    }
    const [result] = await db.execute(
      `INSERT INTO payroll_periods (company_id, code, name, period_type, payment_day, cutoff_day, fiscal_year, period_number, start_date, end_date, payment_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [company_id, code, name, period_type || 'Monthly', payment_day || 25, cutoff_day || 20, fiscal_year, period_number, start_date, end_date, payment_date || null]
    );
    res.status(201).json({ success: true, message: 'Payroll period created', data: { id: result.insertId } });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Period already exists for this year' });
    next(error);
  }
});

router.put('/periods/:id', authorize('Administrator', 'HR Staff'), async (req, res, next) => {
  try {
    const fields = ['code','name','period_type','payment_day','cutoff_day','fiscal_year','period_number','start_date','end_date','payment_date','status','notes'];
    const sets = fields.filter(f => req.body[f] !== undefined).map(f => `${f} = ?`);
    if (!sets.length) return res.status(400).json({ success: false, message: 'No fields to update' });
    const values = fields.filter(f => req.body[f] !== undefined).map(f => req.body[f]);
    values.push(req.params.id);
    await db.execute(`UPDATE payroll_periods SET ${sets.join(', ')} WHERE id = ?`, values);
    res.json({ success: true, message: 'Payroll period updated' });
  } catch (error) { next(error); }
});

router.delete('/periods/:id', authorize('Administrator', 'HR Staff'), async (req, res, next) => {
  try {
    // Only allow delete if Draft
    const [period] = await db.execute('SELECT status FROM payroll_periods WHERE id = ?', [req.params.id]);
    if (!period.length) return res.status(404).json({ success: false, message: 'Period not found' });
    if (period[0].status !== 'Draft') return res.status(400).json({ success: false, message: 'Only Draft periods can be deleted' });
    await db.execute('DELETE FROM payroll_periods WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Payroll period deleted' });
  } catch (error) { next(error); }
});

// ===== Period detail with transactions =====

router.get('/periods/:id/transactions', authorize('Administrator', 'HR Staff', 'Finance'), async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT pt.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, d.name as department_name
       FROM payroll_transactions pt
       JOIN employees e ON pt.employee_id = e.id
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE pt.payroll_period_id = ?
       ORDER BY e.first_name`, [req.params.id]
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
});

// ===== Payroll Employees (for assignment dropdown) =====

router.get('/employees', authorize('Administrator', 'HR Staff', 'Finance'), async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT e.id, e.employee_number, CONCAT(e.first_name, ' ', e.last_name) as employee_name,
              d.name as department_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE e.is_active = TRUE
       ORDER BY e.first_name`
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
});

// ===== Dashboard summary =====

router.get('/summary', authorize('Administrator', 'HR Staff', 'Finance', 'Director'), async (req, res, next) => {
  try {
    const [activeEmp] = await db.execute('SELECT COUNT(*) as total FROM employees WHERE is_active = TRUE');
    const [payrollTotal] = await db.execute(
      "SELECT COALESCE(SUM(net_salary),0) as total_net FROM payroll_transactions WHERE payment_status = 'Paid'"
    );
    const [activePer] = await db.execute(
      "SELECT COUNT(*) as count FROM payroll_periods WHERE status IN ('Draft','Processing','Initialized')"
    );
    const [closed] = await db.execute(
      "SELECT COUNT(*) as count FROM payroll_periods WHERE status IN ('Paid','Closed')"
    );
    res.json({
      success: true,
      data: {
        totalEmployees: activeEmp[0].total,
        totalPayroll: payrollTotal[0].total_net,
        activePeriods: activePer[0].count,
        closedPeriods: closed[0].count
      }
    });
  } catch (error) { next(error); }
});

module.exports = router;
