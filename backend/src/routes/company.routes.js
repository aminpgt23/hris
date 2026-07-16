const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/auth');
const db = require('../config/database');

router.use(authMiddleware);

router.get('/', authorize('Administrator', 'HR Staff'), async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, code, name, legal_name, tax_id, address, city, province, phone, email, logo_url, website, is_active, created_at, updated_at FROM companies WHERE is_active = TRUE ORDER BY name'
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
});

router.get('/:id', authorize('Administrator', 'HR Staff'), async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT * FROM companies WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Company not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
});

router.post('/', authorize('Administrator'), async (req, res, next) => {
  try {
    const { code, name, legal_name, tax_id, address, city, province, phone, email, website } = req.body;
    if (!code || !name) return res.status(400).json({ success: false, message: 'Required: code, name' });

    const [existing] = await db.execute('SELECT id FROM companies WHERE code = ?', [code]);
    if (existing.length > 0) return res.status(409).json({ success: false, message: 'Company code already exists' });

    const [result] = await db.execute(
      `INSERT INTO companies (code, name, legal_name, tax_id, address, city, province, phone, email, website, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [code, name, legal_name || null, tax_id || null, address || null, city || null, province || null, phone || null, email || null, website || null]
    );
    res.status(201).json({ success: true, message: 'Company created', data: { id: result.insertId } });
  } catch (error) { next(error); }
});

router.put('/:id', authorize('Administrator'), async (req, res, next) => {
  try {
    const { code, name, legal_name, tax_id, address, city, province, phone, email, website, is_active } = req.body;
    const [result] = await db.execute(
      `UPDATE companies SET code=?, name=?, legal_name=?, tax_id=?, address=?, city=?, province=?, phone=?, email=?, website=?, is_active=? WHERE id=?`,
      [code, name, legal_name, tax_id, address, city, province, phone, email, website, is_active ?? true, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Company not found' });
    res.json({ success: true, message: 'Company updated' });
  } catch (error) { next(error); }
});

router.delete('/:id', authorize('Administrator'), async (req, res, next) => {
  try {
    const [result] = await db.execute('UPDATE companies SET is_active = FALSE WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Company not found' });
    res.json({ success: true, message: 'Company deactivated' });
  } catch (error) { next(error); }
});

module.exports = router;
