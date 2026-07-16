const db = require('../../config/database');

exports.getAll = async (req, res, next) => {
  try {
    const { company_id, department_id } = req.query;
    let query = `SELECT p.*, d.name as department_name,
                        CONCAT(rp.first_name, ' ', rp.last_name) as reports_to_name
                 FROM positions p
                 LEFT JOIN departments d ON p.department_id = d.id
                 LEFT JOIN positions rp ON p.reports_to_position_id = rp.id`;
    const params = [];
    const wheres = [];
    if (company_id) { wheres.push('p.company_id = ?'); params.push(company_id); }
    if (department_id) { wheres.push('p.department_id = ?'); params.push(department_id); }
    if (wheres.length) query += ' WHERE ' + wheres.join(' AND ');
    query += ' ORDER BY p.name';

    const [rows] = await db.execute(query, params);
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT p.*, d.name as department_name FROM positions p
       LEFT JOIN departments d ON p.department_id = d.id WHERE p.id = ?`, [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Position not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const { company_id, department_id, code, name, level, job_description, min_salary, max_salary } = req.body;
    if (!company_id || !code || !name) {
      return res.status(400).json({ success: false, message: 'Required: company_id, code, name' });
    }
    const [result] = await db.execute(
      `INSERT INTO positions (company_id, department_id, code, name, level, job_description, min_salary, max_salary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [company_id, department_id || null, code, name, level || 1, job_description || null, min_salary || null, max_salary || null]
    );
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const { department_id, code, name, level, job_description, min_salary, max_salary, is_active } = req.body;
    const [result] = await db.execute(
      `UPDATE positions SET department_id=?, code=?, name=?, level=?, job_description=?, min_salary=?, max_salary=?, is_active=?
       WHERE id=?`,
      [department_id || null, code, name, level || 1, job_description || null, min_salary || null, max_salary || null, is_active ?? true, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Position not found' });
    res.json({ success: true, message: 'Updated' });
  } catch (error) { next(error); }
};

exports.remove = async (req, res, next) => {
  try {
    const [result] = await db.execute('DELETE FROM positions WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Position not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { next(error); }
};
