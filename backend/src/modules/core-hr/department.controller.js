const db = require('../../config/database');

exports.getAll = async (req, res, next) => {
  try {
    const { company_id } = req.query;
    let query = `SELECT d.*, CONCAT(s.first_name, ' ', s.last_name) as manager_name
                 FROM departments d
                 LEFT JOIN employees s ON d.id = s.department_id AND s.supervisor_id IS NULL`;
    const params = [];
    if (company_id) {
      query += ' WHERE d.company_id = ?';
      params.push(company_id);
    }
    query += ' ORDER BY d.name';
    const [rows] = await db.execute(query, params);

    // Build tree structure
    const map = {};
    const trees = [];
    rows.forEach(item => { map[item.id] = { ...item, children: [] }; });
    rows.forEach(item => {
      if (item.parent_id && map[item.parent_id]) {
        map[item.parent_id].children.push(map[item.id]);
      } else if (!item.parent_id) {
        trees.push(map[item.id]);
      }
    });

    res.json({ success: true, data: rows, tree: trees });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT d.*, CONCAT(s.first_name, ' ', s.last_name) as manager_name
       FROM departments d LEFT JOIN employees s ON d.id = s.department_id AND s.supervisor_id IS NULL
       WHERE d.id = ?`, [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Department not found' });
    res.json({ success: true, data: rows[0] });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const { company_id, name, code, parent_id, description, cost_center } = req.body;
    if (!company_id || !name || !code) {
      return res.status(400).json({ success: false, message: 'Required: company_id, name, code' });
    }
    const [result] = await db.execute(
      'INSERT INTO departments (company_id, name, code, parent_id, description, cost_center) VALUES (?, ?, ?, ?, ?, ?)',
      [company_id, name, code, parent_id || null, description || null, cost_center || null]
    );
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    const { name, code, parent_id, description, cost_center, is_active } = req.body;
    const [result] = await db.execute(
      'UPDATE departments SET name=?, code=?, parent_id=?, description=?, cost_center=?, is_active=? WHERE id=?',
      [name, code, parent_id || null, description || null, cost_center || null, is_active ?? true, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Department not found' });
    res.json({ success: true, message: 'Updated' });
  } catch (error) { next(error); }
};

exports.remove = async (req, res, next) => {
  try {
    const [result] = await db.execute('DELETE FROM departments WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Department not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { next(error); }
};
