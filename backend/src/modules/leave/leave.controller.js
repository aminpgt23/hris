const db = require('../../config/database');

exports.createRequest = async (req, res, next) => {
  try {
    const employeeId = req.user.employeeId || req.body.employee_id;
    const { leave_type_id, start_date, end_date, reason, replacement_employee_id } = req.body;

    if (!leave_type_id || !start_date || !end_date || !reason) {
      return res.status(400).json({ success: false, message: 'Required: leave_type_id, start_date, end_date, reason' });
    }

    // Calculate days
    const start = new Date(start_date);
    const end = new Date(end_date);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Get leave type info
    const [leaveTypes] = await db.execute(
      'SELECT * FROM leave_types WHERE id = ? AND is_active = TRUE', [leave_type_id]
    );
    if (leaveTypes.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid leave type' });
    }

    const leaveType = leaveTypes[0];
    if (leaveType.max_days_per_request && diffDays > leaveType.max_days_per_request) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${leaveType.max_days_per_request} days per request for ${leaveType.name}`
      });
    }

    // Check overlapping dates
    const [overlap] = await db.execute(
      `SELECT id FROM leave_requests WHERE employee_id = ? AND status NOT IN ('Rejected', 'Cancelled')
       AND start_date <= ? AND end_date >= ?`,
      [employeeId, end_date, start_date]
    );
    if (overlap.length > 0) {
      return res.status(409).json({ success: false, message: 'Leave dates overlap with existing request' });
    }

    // Check balance
    const year = new Date().getFullYear();
    const [balances] = await db.execute(
      'SELECT closing_balance FROM leave_balances WHERE employee_id = ? AND leave_type_id = ? AND year = ?',
      [employeeId, leave_type_id, year]
    );

    if (balances.length > 0 && balances[0].closing_balance < diffDays) {
      return res.status(400).json({ success: false, message: 'Insufficient leave balance' });
    }

    const [result] = await db.execute(
      `INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, working_days, reason, replacement_employee_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending Manager')`,
      [employeeId, leave_type_id, start_date, end_date, diffDays, diffDays, reason,
       replacement_employee_id || null]
    );

    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) { next(error); }
};

exports.getAll = async (req, res, next) => {
  try {
    const { status, employee_id, date_from, date_to, department_id } = req.query;
    let where = 'WHERE 1=1';
    const params = [];

    if (status) { where += ' AND lr.status = ?'; params.push(status); }
    if (employee_id) { where += ' AND lr.employee_id = ?'; params.push(employee_id); }
    if (date_from) { where += ' AND lr.start_date >= ?'; params.push(date_from); }
    if (date_to) { where += ' AND lr.end_date <= ?'; params.push(date_to); }
    if (department_id) { where += ' AND e.department_id = ?'; params.push(department_id); }

    if (req.user.roleName === 'Employee') {
      where += ' AND lr.employee_id = ?';
      params.push(req.user.employeeId);
    }

    const [rows] = await db.execute(
      `SELECT lr.*, lt.name as leave_type_name, lt.color_code,
              CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.employee_number,
              d.name as department_name,
              CONCAT(rep.first_name, ' ', rep.last_name) as replacement_name
       FROM leave_requests lr
       JOIN leave_types lt ON lr.leave_type_id = lt.id
       JOIN employees e ON lr.employee_id = e.id
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN employees rep ON lr.replacement_employee_id = rep.id
       ${where}
       ORDER BY lr.created_at DESC`, params
    );

    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.approveManager = async (req, res, next) => {
  try {
    const { comments } = req.body;
    const [result] = await db.execute(
      `UPDATE leave_requests SET status='Pending HR', manager_approved_by=?, manager_approved_at=NOW(), notes=?
       WHERE id=? AND status='Pending Manager'`,
      [req.user.id, comments || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Request not found or wrong status' });
    res.json({ success: true, message: 'Approved (pending HR)' });
  } catch (error) { next(error); }
};

exports.approveHR = async (req, res, next) => {
  try {
    const { comments } = req.body;
    const [request] = await db.execute(
      'SELECT * FROM leave_requests WHERE id = ? AND status IN (\'Pending HR\', \'Pending Manager\')',
      [req.params.id]
    );
    if (request.length === 0) return res.status(404).json({ success: false, message: 'Request not found or wrong status' });

    const lr = request[0];

    // Update status
    await db.execute(
      `UPDATE leave_requests SET status='Approved', hr_approved_by=?, hr_approved_at=NOW(), notes=CONCAT(IFNULL(notes,''), ?)
       WHERE id=?`,
      [req.user.id, comments ? ` | ${comments}` : '', req.params.id]
    );

    // Update balance
    const year = new Date().getFullYear();
    await db.execute(
      `UPDATE leave_balances SET taken = taken + ?, closing_balance = closing_balance - ?
       WHERE employee_id = ? AND leave_type_id = ? AND year = ? AND closing_balance >= ?`,
      [lr.total_days, lr.total_days, lr.employee_id, lr.leave_type_id, year, lr.total_days]
    );

    res.json({ success: true, message: 'Leave approved' });
  } catch (error) { next(error); }
};

exports.reject = async (req, res, next) => {
  try {
    const { rejection_reason } = req.body;
    const [result] = await db.execute(
      `UPDATE leave_requests SET status='Rejected', rejection_reason=?, hr_approved_by=?, hr_approved_at=NOW()
       WHERE id=? AND status IN ('Pending Manager', 'Pending HR')`,
      [rejection_reason || null, req.user.id, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Request not found or already processed' });
    res.json({ success: true, message: 'Leave rejected' });
  } catch (error) { next(error); }
};

exports.cancel = async (req, res, next) => {
  try {
    const [result] = await db.execute(
      `UPDATE leave_requests SET status='Cancelled', cancelled_by=?, cancelled_at=NOW()
       WHERE id=? AND employee_id=? AND status NOT IN ('Approved', 'Rejected', 'Cancelled')`,
      [req.user.id, req.params.id, req.user.employeeId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Cannot cancel this request' });
    res.json({ success: true, message: 'Cancelled' });
  } catch (error) { next(error); }
};

exports.getBalances = async (req, res, next) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const employeeId = req.user.employeeId || req.query.employee_id;

    if (!employeeId) return res.status(400).json({ success: false, message: 'No employee specified' });

    const [rows] = await db.execute(
      `SELECT lb.*, lt.name as leave_type_name, lt.code as leave_type_code, lt.color_code
       FROM leave_balances lb
       JOIN leave_types lt ON lb.leave_type_id = lt.id
       WHERE lb.employee_id = ? AND lb.year = ?
       ORDER BY lt.name`, [employeeId, year]
    );

    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.getLeaveTypes = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM leave_types WHERE is_active = TRUE ORDER BY name'
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};
