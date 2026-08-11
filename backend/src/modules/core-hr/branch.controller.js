const db = require('../../config/database');

exports.getAll = async (req, res, next) => {
  try {
    const { company_id } = req.query;
    let query = `SELECT b.*, c.name as company_name
                 FROM branches b
                 LEFT JOIN companies c ON b.company_id = c.id`;
    const params = [];
    if (company_id) {
      query += ' WHERE b.company_id = ?';
      params.push(company_id);
    }
    query += ' ORDER BY b.name';
    const [rows] = await db.execute(query, params);
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT b.*, c.name as company_name
       FROM branches b LEFT JOIN companies c ON b.company_id = c.id
       WHERE b.id = ?`, [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Branch not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const { company_id, code, name, address, city, phone, email } = req.body;
    if (!company_id || !code || !name) {
      return res.status(400).json({ success: false, message: 'Required: company_id, code, name' });
    }
    const [result] = await db.execute(
      `INSERT INTO branches (company_id, code, name, address, city, phone, email)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [company_id, code, name, address || null, city || null, phone || null, email || null]
    );
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const { code, name, address, city, phone, email, is_active } = req.body;
    const [result] = await db.execute(
      `UPDATE branches SET code=?, name=?, address=?, city=?, phone=?, email=?, is_active=?
       WHERE id=?`,
      [code, name, address || null, city || null, phone || null, email || null, is_active ?? true, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Branch not found' });
    res.json({ success: true, message: 'Updated' });
  } catch (error) { next(error); }
};

exports.remove = async (req, res, next) => {
  try {
    const [result] = await db.execute('DELETE FROM branches WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Branch not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { next(error); }
};
