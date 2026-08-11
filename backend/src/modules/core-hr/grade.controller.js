const db = require('../../config/database');

exports.getAll = async (req, res, next) => {
  try {
    const { company_id } = req.query;
    let query = `SELECT g.*, c.name as company_name
                 FROM grades g
                 LEFT JOIN companies c ON g.company_id = c.id`;
    const params = [];
    if (company_id) {
      query += ' WHERE g.company_id = ?';
      params.push(company_id);
    }
    query += ' ORDER BY g.level, g.name';
    const [rows] = await db.execute(query, params);
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT g.*, c.name as company_name
       FROM grades g LEFT JOIN companies c ON g.company_id = c.id
       WHERE g.id = ?`, [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Grade not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const { company_id, code, name, level, min_salary, mid_salary, max_salary, allowance_percentage } = req.body;
    if (!company_id || !code || !name || !level || min_salary === undefined || max_salary === undefined) {
      return res.status(400).json({ success: false, message: 'Required: company_id, code, name, level, min_salary, max_salary' });
    }
    const [result] = await db.execute(
      `INSERT INTO grades (company_id, code, name, level, min_salary, mid_salary, max_salary, allowance_percentage)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [company_id, code, name, level, min_salary, mid_salary || null, max_salary, allowance_percentage ?? 0]
    );
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const { code, name, level, min_salary, mid_salary, max_salary, allowance_percentage, is_active } = req.body;
    const [result] = await db.execute(
      `UPDATE grades SET code=?, name=?, level=?, min_salary=?, mid_salary=?, max_salary=?, allowance_percentage=?, is_active=?
       WHERE id=?`,
      [code, name, level, min_salary, mid_salary || null, max_salary, allowance_percentage ?? 0, is_active ?? true, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Grade not found' });
    res.json({ success: true, message: 'Updated' });
  } catch (error) { next(error); }
};

exports.remove = async (req, res, next) => {
  try {
    const [result] = await db.execute('DELETE FROM grades WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Grade not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { next(error); }
};
