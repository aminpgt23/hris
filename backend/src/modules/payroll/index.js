const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../../middleware/auth');
const db = require('../../config/database');
const { calculatePph21, progressiveFromDb } = require('./pph21');

router.use(authMiddleware);

// ===== Payroll Calculation (PPH21) =====

const PERSEN = 100;
const DEFAULT_BPJS_HEALTH_EMPLOYEE = 0.01;
const DEFAULT_BPJS_JHT_EMPLOYEE = 0.02;
const DEFAULT_BPJS_JP_EMPLOYEE = 0.01;
const DEFAULT_BPJS_HEALTH_EMPLOYER = 0.04;
const DEFAULT_BPJS_JHT_EMPLOYER = 0.037;
const DEFAULT_BPJS_JKM_EMPLOYER = 0.003;
const DEFAULT_BPJS_JP_EMPLOYER = 0.02;
const DEFAULT_JKK_EMPLOYER = 0.0024;
const DEFAULT_PENSION_EMPLOYEE = 0.01;
const DEFAULT_PENSION_EMPLOYER = 0.02;

// Load BPJS + tax config from Compliance tables for a year (fallback to defaults).
async function loadComplianceConfig(year = new Date().getFullYear()) {
  const cfg = { health: {}, employment: {}, pension: {}, taxLayers: null };
  try {
    const [health] = await db.execute(
      'SELECT * FROM bpjs_health_config WHERE year = ? AND is_active = TRUE ORDER BY effective_from DESC LIMIT 1',
      [year]
    );
    if (health[0]) cfg.health = health[0];
    const [employment] = await db.execute(
      'SELECT * FROM bpjs_employment_config WHERE year = ? AND is_active = TRUE ORDER BY effective_from DESC LIMIT 1',
      [year]
    );
    if (employment[0]) cfg.employment = employment[0];
    const [pension] = await db.execute(
      'SELECT * FROM pension_config WHERE year = ? AND is_active = TRUE ORDER BY effective_from DESC LIMIT 1',
      [year]
    );
    if (pension[0]) cfg.pension = pension[0];
    const [tax] = await db.execute(
      'SELECT min_income, max_income, tax_rate FROM tax_rates WHERE year = ? AND is_active = TRUE ORDER BY layer_number',
      [year]
    );
    if (tax.length) cfg.taxLayers = tax;
  } catch { /* keep defaults */ }
  return cfg;
}

const pct = (v, fallback) => (v != null && !isNaN(Number(v))) ? Number(v) / PERSEN : fallback;

function parseFixedComponents(json) {
  if (!json) return {};
  try {
    const parsed = typeof json === 'string' ? JSON.parse(json) : json;
    if (Array.isArray(parsed)) {
      return parsed.reduce((acc, item) => {
        if (item && item.code) acc[item.code] = Number(item.amount || item.value || 0);
        return acc;
      }, {});
    }
    if (parsed && typeof parsed === 'object') {
      const out = {};
      for (const [k, v] of Object.entries(parsed)) out[k] = Number(v || 0);
      return out;
    }
    return {};
  } catch { return {}; }
}

router.get('/calculation-inputs/:employeeId', authorize('Administrator', 'HR Staff', 'Finance'), async (req, res, next) => {
  try {
    const employeeId = req.params.employeeId;

    const [emp] = await db.execute(
      `SELECT e.id, CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.position_id,
              p.name as position_title
       FROM employees e
       LEFT JOIN positions p ON e.position_id = p.id
       WHERE e.id = ? AND e.is_active = TRUE`,
      [employeeId]
    );
    if (!emp.length) return res.status(404).json({ success: false, message: 'Employee not found' });

    const [assign] = await db.execute(
      `SELECT basic_salary, fixed_allowances, fixed_deductions, tax_category,
              bpjs_health_percentage, bpjs_employment_percentage, pension_percentage
       FROM employee_salary_assignments
       WHERE employee_id = ? AND (effective_to IS NULL OR effective_to >= CURDATE())
       ORDER BY effective_from DESC LIMIT 1`,
      [employeeId]
    );

    const [att] = await db.execute(
      `SELECT
         COUNT(*) as total_days,
         SUM(CASE WHEN status IN ('Present','Late','Half Day','Work From Home','On Duty') THEN 1 ELSE 0 END) as working_days,
         SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as late_days,
         SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent_days,
         COALESCE(SUM(overtime_hours),0) as overtime_hours
       FROM attendance_records
       WHERE employee_id = ?
         AND DATE_FORMAT(date, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')`,
      [employeeId]
    );

    const attRow = att[0] || {};
    const fixedAllow = assign.length ? parseFixedComponents(assign[0].fixed_allowances) : {};
    const fixedDeduc = assign.length ? parseFixedComponents(assign[0].fixed_deductions) : {};
    const basicSalary = assign.length ? Number(assign[0].basic_salary) : 0;

    res.json({
      success: true,
      data: {
        employee_id: emp[0].id,
        employee_name: emp[0].employee_name,
        position: emp[0].position_title || null,
        tax_category: assign.length ? assign[0].tax_category : 'TK0',
        basic_salary: basicSalary,
        position_allowance: fixedAllow.position_allowance || 0,
        meal_per_day: fixedAllow.meal_per_day || 0,
        transport_per_day: fixedAllow.transport_per_day || 0,
        overtime: Math.round(Number(attRow.overtime_hours || 0) * 25000),
        bonus: 0,
        bpjs_base: basicSalary,
        kasbon: fixedDeduc.kasbon || 0,
        absence_deduction: 0,
        iuran_pensiun_monthly: assign.length ? Math.round(basicSalary * (Number(assign[0].pension_percentage || 1) / PERSEN)) : 0,
        jkk_rate: 0.54,
        attendance: {
          working_days: Number(attRow.working_days || 0),
          late_days: Number(attRow.late_days || 0),
          absent_days: Number(attRow.absent_days || 0),
          overtime_hours: Number(attRow.overtime_hours || 0),
        },
        has_assignment: assign.length > 0,
      },
    });
  } catch (error) { next(error); }
});

router.post('/calculate', authorize('Administrator', 'HR Staff', 'Finance'), async (req, res, next) => {
  try {
    const {
      basic_salary = 0,
      position_allowance = 0,
      meal_days = 0,
      meal_per_day = 0,
      transport_days = 0,
      transport_per_day = 0,
      overtime = 0,
      bonus = 0,
      bpjs_base = 0,
      kasbon = 0,
      absence_deduction = 0,
      tax_category = 'TK0',
      tax_method = 'TER',
      iuran_pensiun_monthly = 0,
      jkk_rate,
      year,
    } = req.body;

    const cfg = await loadComplianceConfig(year);
    const h = cfg.health, e = cfg.employment, p = cfg.pension;

    const bpjs_health_employee = pct(h.employee_percentage, DEFAULT_BPJS_HEALTH_EMPLOYEE);
    const jht_employee = pct(e.jht_employee_percentage, DEFAULT_BPJS_JHT_EMPLOYEE);
    const jp_employee = pct(e.jp_employee_percentage, DEFAULT_BPJS_JP_EMPLOYEE);
    const bpjs_health_employer = pct(h.employer_percentage, DEFAULT_BPJS_HEALTH_EMPLOYER);
    const jht_employer = pct(e.jht_employer_percentage, DEFAULT_BPJS_JHT_EMPLOYER);
    const jkm_employer = pct(e.jkm_percentage, DEFAULT_BPJS_JKM_EMPLOYER);
    const jp_employer = pct(e.jp_employer_percentage, DEFAULT_BPJS_JP_EMPLOYER);
    const jkk_employer = jkk_rate != null ? Number(jkk_rate) / PERSEN : pct(e.jkk_percentage, DEFAULT_JKK_EMPLOYER);
    const pension_employee = pct(p.employee_percentage, DEFAULT_PENSION_EMPLOYEE);
    const pension_employer = pct(p.employer_percentage, DEFAULT_PENSION_EMPLOYER);
    const pension_fund = p.fund_name || 'DPLK';

    const iuranPensiun = Number(iuran_pensiun_monthly) || Math.round(Number(bpjs_base || basic_salary) * pension_employee);

    const meal_allowance = meal_days * meal_per_day;
    const transport_allowance = transport_days * transport_per_day;
    const gross_income =
      Number(basic_salary) +
      Number(position_allowance) +
      meal_allowance +
      transport_allowance +
      Number(overtime) +
      Number(bonus);

    const bpjs_health = bpjs_base ? Math.round(Number(bpjs_base) * bpjs_health_employee) : 0;
    const jht = bpjs_base ? Math.round(Number(bpjs_base) * jht_employee) : 0;
    const jp = bpjs_base ? Math.round(Number(bpjs_base) * jp_employee) : 0;
    const pph21 = calculatePph21({
      grossMonthly: gross_income,
      taxCategory: tax_category,
      method: tax_method,
      iuranPensiunMonthly: iuranPensiun,
      progressiveBands: cfg.taxLayers ? progressiveFromDb(cfg.taxLayers) : undefined,
    });

    const total_deduction =
      bpjs_health + jht + jp + pph21.amount + Number(kasbon) + Number(absence_deduction);

    const take_home_pay = gross_income - total_deduction;

    const employer_bpjs_health = bpjs_base ? Math.round(Number(bpjs_base) * bpjs_health_employer) : 0;
    const employer_jht = bpjs_base ? Math.round(Number(bpjs_base) * jht_employer) : 0;
    const employer_jkk = bpjs_base ? Math.round(Number(bpjs_base) * jkk_employer) : 0;
    const employer_jkm = bpjs_base ? Math.round(Number(bpjs_base) * jkm_employer) : 0;
    const employer_jp = bpjs_base ? Math.round(Number(bpjs_base) * jp_employer) : 0;
    const employer_pension = bpjs_base ? Math.round(Number(bpjs_base) * pension_employer) : 0;

    const total_employer_cost =
      employer_bpjs_health + employer_jht + employer_jkk + employer_jkm + employer_jp + employer_pension;

    const cost_to_company = gross_income + total_employer_cost;

    res.json({
      success: true,
      data: {
        income: {
          basic_salary: Number(basic_salary),
          position_allowance: Number(position_allowance),
          meal_allowance,
          transport_allowance,
          overtime: Number(overtime),
          bonus: Number(bonus),
          gross_income,
        },
        deductions: {
          bpjs_health,
          jht,
          jp,
          pph21: pph21.amount,
          pph21_detail: pph21,
          kasbon: Number(kasbon),
          absence_deduction: Number(absence_deduction),
          iuran_pensiun: iuranPensiun,
          total_deduction,
        },
        take_home_pay,
        employer_cost: {
          bpjs_health: employer_bpjs_health,
          jht: employer_jht,
          jkk: employer_jkk,
          jkm: employer_jkm,
          jp: employer_jp,
          pension: employer_pension,
          total_employer_cost,
        },
        cost_to_company,
        config: {
          bpjs_health_employee,
          jht_employee,
          jp_employee,
          bpjs_health_employer,
          jht_employer,
          jkk_employer,
          jkm_employer,
          jp_employer,
          pension_employee,
          pension_employer,
          pension_fund,
          source: (h.employee_percentage || e.jkk_percentage || p.employee_percentage || cfg.taxLayers) ? 'compliance' : 'default',
        },
      },
    });
  } catch (error) { next(error); }
});

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
      [employee_id, basic_salary, fixed_allowances ? JSON.stringify(fixed_allowances) : null, fixed_deductions ? JSON.stringify(fixed_deductions) : null, tax_category || 'TK0', bpjs_health_percentage ?? 1.00, bpjs_employment_percentage ?? 2.00, pension_percentage ?? 1.00, is_eligible_payroll ?? 1, bank_transfer ?? 1, effective_from, req.user.id]
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
