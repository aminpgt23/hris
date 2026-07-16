const db = require('../../config/database');

exports.getAll = async (req, res, next) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const { employee_id, department_id } = req.query;

    let where = 'WHERE lb.year = ?';
    const params = [year];
    if (employee_id) { where += ' AND lb.employee_id = ?'; params.push(employee_id); }
    if (department_id) { where += ' AND e.department_id = ?'; params.push(department_id); }

    const [rows] = await db.execute(
      `SELECT lb.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.employee_number,
              lt.name as leave_type_name, lt.color_code
       FROM leave_balances lb
       JOIN employees e ON lb.employee_id = e.id
       JOIN leave_types lt ON lb.leave_type_id = lt.id
       ${where}
       ORDER BY e.first_name, lt.name`, params
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.adjust = async (req, res, next) => {
  try {
    const { employee_id, leave_type_id, adjustment_type, days, reason } = req.body;
    if (!employee_id || !leave_type_id || !days || !reason) {
      return res.status(400).json({ success: false, message: 'Required: employee_id, leave_type_id, days, reason' });
    }

    const year = new Date().getFullYear();
    const sign = adjustment_type === 'Add' ? 1 : -1;

    // Create adjustment record
    await db.execute(
      `INSERT INTO leave_adjustments (employee_id, leave_type_id, adjustment_type, days, reason, effective_date, approved_by, created_by)
       VALUES (?, ?, ?, ?, ?, CURDATE(), ?, ?)`,
      [employee_id, leave_type_id, adjustment_type, days, reason, req.user.id, req.user.id]
    );

    // Update balance
    const [existing] = await db.execute(
      'SELECT id FROM leave_balances WHERE employee_id = ? AND leave_type_id = ? AND year = ?',
      [employee_id, leave_type_id, year]
    );

    if (existing.length > 0) {
      await db.execute(
        `UPDATE leave_balances SET adjusted = adjusted + (? * ?), closing_balance = closing_balance + (? * ?)
         WHERE employee_id = ? AND leave_type_id = ? AND year = ?`,
        [sign, days, sign, days, employee_id, leave_type_id, year]
      );
    }

    res.json({ success: true, message: `Balance ${adjustment_type === 'Add' ? 'increased' : 'decreased'} by ${days} days` });
  } catch (error) { next(error); }
};
