const db = require('../../config/database');

exports.getAll = async (req, res, next) => {
  try {
    const { date_from, date_to, employee_id, department_id } = req.query;
    let where = 'WHERE 1=1';
    const params = [];

    if (date_from) { where += ' AND s.date >= ?'; params.push(date_from); }
    if (date_to) { where += ' AND s.date <= ?'; params.push(date_to); }
    if (employee_id) { where += ' AND s.employee_id = ?'; params.push(employee_id); }
    if (department_id) { where += ' AND e.department_id = ?'; params.push(department_id); }

    const [rows] = await db.execute(
      `SELECT s.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.employee_number,
              sh.name as shift_name, sh.start_time, sh.end_time
       FROM schedules s
       JOIN employees e ON s.employee_id = e.id
       JOIN shifts sh ON s.shift_id = sh.id
       ${where}
       ORDER BY s.date, e.first_name`, params
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.bulkAssign = async (req, res, next) => {
  try {
    const { employee_ids, shift_id, date_from, date_to } = req.body;
    if (!employee_ids?.length || !shift_id || !date_from || !date_to) {
      return res.status(400).json({ success: false, message: 'Required: employee_ids[], shift_id, date_from, date_to' });
    }

    const values = [];
    const placeholders = [];
    const start = new Date(date_from);
    const end = new Date(date_to);

    for (const empId of employee_ids) {
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        placeholders.push('(?, ?, ?, ?)');
        values.push(empId, shift_id, dateStr, req.user.id);
      }
    }

    // Use INSERT IGNORE to skip duplicates
    await db.execute(
      `INSERT IGNORE INTO schedules (employee_id, shift_id, date, created_by)
       VALUES ${placeholders.join(', ')}`,
      values
    );

    res.json({ success: true, message: `Assigned ${employee_ids.length} employees from ${date_from} to ${date_to}` });
  } catch (error) { next(error); }
};
