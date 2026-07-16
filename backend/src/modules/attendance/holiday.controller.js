const db = require('../../config/database');

exports.getAll = async (req, res, next) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const [rows] = await db.execute(
      'SELECT * FROM holidays WHERE YEAR(date) = ? ORDER BY date', [year]
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const { company_id, name, date, type, description, is_paid } = req.body;
    if (!company_id || !name || !date) {
      return res.status(400).json({ success: false, message: 'Required: company_id, name, date' });
    }
    const [result] = await db.execute(
      'INSERT INTO holidays (company_id, name, date, type, description, is_paid) VALUES (?, ?, ?, ?, ?, ?)',
      [company_id, name, date, type || 'National', description || null, is_paid ?? true]
    );
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) { next(error); }
};

exports.remove = async (req, res, next) => {
  try {
    const [result] = await db.execute('DELETE FROM holidays WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Holiday not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { next(error); }
};
