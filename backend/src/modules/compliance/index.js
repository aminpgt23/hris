const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../../middleware/auth');
const db = require('../../config/database');

router.use(authMiddleware);

// ===== BPJS Health config =====

router.get('/bpjs-health', authorize('Administrator', 'HR Staff'), async (req, res, next) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const [rows] = await db.execute(
      'SELECT * FROM bpjs_health_config WHERE year = ? ORDER BY effective_from DESC', [year]
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
});

router.post('/bpjs-health', authorize('Administrator', 'HR Staff'), async (req, res, next) => {
  try {
    const year = req.body.year || new Date().getFullYear();
    const company_id = req.body.company_id || 1;
    const employee_percentage = req.body.employee_percentage ?? 1.0;
    const employer_percentage = req.body.employer_percentage ?? 4.0;
    const min_base_salary = req.body.min_base_salary ?? null;
    const max_base_salary = req.body.max_base_salary ?? null;
    const effective_from = req.body.effective_from || new Date().toISOString().slice(0, 10);

    await db.execute(
      `INSERT INTO bpjs_health_config
         (company_id, year, employee_percentage, employer_percentage, min_base_salary, max_base_salary, is_active, effective_from)
       VALUES (?, ?, ?, ?, ?, ?, TRUE, ?)
       ON DUPLICATE KEY UPDATE
         employee_percentage = VALUES(employee_percentage),
         employer_percentage = VALUES(employer_percentage),
         min_base_salary = VALUES(min_base_salary),
         max_base_salary = VALUES(max_base_salary),
         is_active = TRUE,
         effective_from = VALUES(effective_from)`,
      [company_id, year, employee_percentage, employer_percentage, min_base_salary, max_base_salary, effective_from]
    );
    res.json({ success: true, message: `BPJS Kesehatan config saved for ${year}` });
  } catch (error) { next(error); }
});

// ===== BPJS Employment config =====

router.get('/bpjs-employment', authorize('Administrator', 'HR Staff'), async (req, res, next) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const [rows] = await db.execute(
      'SELECT * FROM bpjs_employment_config WHERE year = ? ORDER BY effective_from DESC', [year]
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
});

router.post('/bpjs-employment', authorize('Administrator', 'HR Staff'), async (req, res, next) => {
  try {
    const year = req.body.year || new Date().getFullYear();
    const company_id = req.body.company_id || 1;
    const jht_employee_percentage = req.body.jht_employee_percentage ?? 2.0;
    const jht_employer_percentage = req.body.jht_employer_percentage ?? 3.7;
    const jp_employee_percentage = req.body.jp_employee_percentage ?? 1.0;
    const jp_employer_percentage = req.body.jp_employer_percentage ?? 2.0;
    const jkk_percentage = req.body.jkk_percentage ?? 0.24;
    const jkm_percentage = req.body.jkm_percentage ?? 0.30;
    const min_base_salary = req.body.min_base_salary ?? null;
    const max_base_salary = req.body.max_base_salary ?? null;
    const effective_from = req.body.effective_from || new Date().toISOString().slice(0, 10);

    await db.execute(
      `INSERT INTO bpjs_employment_config
         (company_id, year, jht_employee_percentage, jht_employer_percentage, jp_employee_percentage,
          jp_employer_percentage, jkk_percentage, jkm_percentage, min_base_salary, max_base_salary,
          is_active, effective_from)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?)
       ON DUPLICATE KEY UPDATE
         jht_employee_percentage = VALUES(jht_employee_percentage),
         jht_employer_percentage = VALUES(jht_employer_percentage),
         jp_employee_percentage = VALUES(jp_employee_percentage),
         jp_employer_percentage = VALUES(jp_employer_percentage),
         jkk_percentage = VALUES(jkk_percentage),
         jkm_percentage = VALUES(jkm_percentage),
         min_base_salary = VALUES(min_base_salary),
         max_base_salary = VALUES(max_base_salary),
         is_active = TRUE,
         effective_from = VALUES(effective_from)`,
      [company_id, year, jht_employee_percentage, jht_employer_percentage, jp_employee_percentage,
       jp_employer_percentage, jkk_percentage, jkm_percentage, min_base_salary, max_base_salary, effective_from]
    );
    res.json({ success: true, message: `BPJS Ketenagakerjaan config saved for ${year}` });
  } catch (error) { next(error); }
});

// ===== Pension config =====

router.get('/pension', authorize('Administrator', 'HR Staff'), async (req, res, next) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const [rows] = await db.execute(
      'SELECT * FROM pension_config WHERE year = ? ORDER BY effective_from DESC', [year]
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
});

router.post('/pension', authorize('Administrator', 'HR Staff'), async (req, res, next) => {
  try {
    const year = req.body.year || new Date().getFullYear();
    const company_id = req.body.company_id || 1;
    const employee_percentage = req.body.employee_percentage ?? 1.0;
    const employer_percentage = req.body.employer_percentage ?? 2.0;
    const fund_name = req.body.fund_name || 'DPLK';
    const min_base_salary = req.body.min_base_salary ?? null;
    const max_base_salary = req.body.max_base_salary ?? null;
    const effective_from = req.body.effective_from || new Date().toISOString().slice(0, 10);

    await db.execute(
      `INSERT INTO pension_config
         (company_id, year, employee_percentage, employer_percentage, fund_name, min_base_salary, max_base_salary, is_active, effective_from)
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, ?)
       ON DUPLICATE KEY UPDATE
         employee_percentage = VALUES(employee_percentage),
         employer_percentage = VALUES(employer_percentage),
         fund_name = VALUES(fund_name),
         min_base_salary = VALUES(min_base_salary),
         max_base_salary = VALUES(max_base_salary),
         is_active = TRUE,
         effective_from = VALUES(effective_from)`,
      [company_id, year, employee_percentage, employer_percentage, fund_name, min_base_salary, max_base_salary, effective_from]
    );
    res.json({ success: true, message: `Pension config saved for ${year}` });
  } catch (error) { next(error); }
});

// ===== Tax rates (PPh21) =====

router.get('/tax-rates', authorize('Administrator', 'HR Staff', 'Finance'), async (req, res, next) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const [rows] = await db.execute(
      'SELECT * FROM tax_rates WHERE year = ? AND is_active = TRUE ORDER BY layer_number', [year]
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
});

// Replace all layers for a year (transactional: deactivate old, insert new)
router.post('/tax-rates', authorize('Administrator', 'HR Staff', 'Finance'), async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    const year = req.body.year || new Date().getFullYear();
    const layers = Array.isArray(req.body.layers) ? req.body.layers : [];
    if (!layers.length) return res.status(400).json({ success: false, message: 'layers array required' });

    await conn.beginTransaction();
    await conn.execute('UPDATE tax_rates SET is_active = FALSE WHERE year = ?', [year]);
    for (const [i, l] of layers.entries()) {
      await conn.execute(
        `INSERT INTO tax_rates (year, layer_number, min_income, max_income, tax_rate, is_active)
         VALUES (?, ?, ?, ?, ?, TRUE)
         ON DUPLICATE KEY UPDATE min_income = VALUES(min_income), max_income = VALUES(max_income),
           tax_rate = VALUES(tax_rate), is_active = TRUE`,
        [year, l.layer_number || i + 1, l.min_income ?? 0, l.max_income ?? null, l.tax_rate ?? 5]
      );
    }
    await conn.commit();
    res.json({ success: true, message: `${layers.length} PPh21 tax layers saved for ${year}` });
  } catch (error) {
    await conn.rollback().catch(() => {});
    next(error);
  } finally {
    conn.release();
  }
});

module.exports = router;
