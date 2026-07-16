const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../../middleware/auth');
const db = require('../../config/database');

router.use(authMiddleware);

router.get('/', authorize('Administrator', 'HR Staff', 'Employee'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;

    let where = 'WHERE a.is_active = TRUE';
    const params = [];

    if (req.query.category_id) { where += ' AND a.asset_category_id = ?'; params.push(req.query.category_id); }
    if (req.query.status) { where += ' AND a.condition = ?'; params.push(req.query.status); }
    if (req.query.search) {
      where += ' AND (a.name LIKE ? OR a.asset_number LIKE ?)';
      const s = `%${req.query.search}%`;
      params.push(s, s);
    }
    if (req.user.roleName === 'Employee') {
      where += ' AND a.assigned_to_employee_id = ?';
      params.push(req.user.employeeId);
    }

    const [count] = await db.execute(`SELECT COUNT(*) as total FROM assets a ${where}`, params);
    const [rows] = await db.execute(
      `SELECT a.*, ac.name as category_name,
              CONCAT(e.first_name, ' ', e.last_name) as assigned_to_name
       FROM assets a
       LEFT JOIN asset_categories ac ON a.asset_category_id = ac.id
       LEFT JOIN employees e ON a.assigned_to_employee_id = e.id
       ${where}
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`, [...params, String(limit), String(offset)]
    );

    res.json({ success: true, data: rows, pagination: { page, limit, total: count[0].total } });
  } catch (error) { next(error); }
});

router.post('/', authorize('Administrator', 'HR Staff'), async (req, res, next) => {
  try {
    const { company_id, asset_category_id, name, asset_number, serial_number, purchase_date, purchase_cost, vendor_name, condition } = req.body;
    if (!company_id || !asset_category_id || !name || !asset_number) {
      return res.status(400).json({ success: false, message: 'Required: company_id, asset_category_id, name, asset_number' });
    }
    const [result] = await db.execute(
      `INSERT INTO assets (company_id, asset_category_id, name, asset_number, serial_number, purchase_date, purchase_cost, vendor_name, condition)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [company_id, asset_category_id, name, asset_number, serial_number || null, purchase_date || null, purchase_cost || 0, vendor_name || null, condition || 'New']
    );
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) { next(error); }
});

router.put('/:id/assign', authorize('Administrator', 'HR Staff'), async (req, res, next) => {
  try {
    const { assigned_to_employee_id } = req.body;
    await db.execute(
      'UPDATE assets SET assigned_to_employee_id=?, assigned_date=CURDATE(), assigned_by=? WHERE id=?',
      [assigned_to_employee_id || null, req.user.id, req.params.id]
    );
    res.json({ success: true, message: 'Asset assigned' });
  } catch (error) { next(error); }
});

module.exports = router;
