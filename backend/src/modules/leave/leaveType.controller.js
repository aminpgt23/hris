const db = require('../../config/database');

exports.getAll = async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT * FROM leave_types WHERE is_active = TRUE ORDER BY name');
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const { company_id, code, name, type, default_days_per_year, is_paid, requires_document } = req.body;
    if (!company_id || !code || !name) {
      return res.status(400).json({ success: false, message: 'Required: company_id, code, name' });
    }
    const [result] = await db.execute(
      `INSERT INTO leave_types (company_id, code, name, type, default_days_per_year, is_paid, requires_document)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [company_id, code, name, type || 'Other', default_days_per_year || 0, is_paid ?? true, requires_document ?? false]
    );
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const { name, type, default_days_per_year, is_paid, requires_document, is_active } = req.body;
    const [result] = await db.execute(
      `UPDATE leave_types SET name=?, type=?, default_days_per_year=?, is_paid=?, requires_document=?, is_active=?
       WHERE id=?`,
      [name, type, default_days_per_year, is_paid ?? true, requires_document ?? false, is_active ?? true, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Leave type not found' });
    res.json({ success: true, message: 'Updated' });
  } catch (error) { next(error); }
};

exports.remove = async (req, res, next) => {
  try {
    const [result] = await db.execute('DELETE FROM leave_types WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Leave type not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { next(error); }
};
