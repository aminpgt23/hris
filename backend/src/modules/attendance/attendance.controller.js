const db = require('../../config/database');

exports.checkIn = async (req, res, next) => {
  try {
    const employeeId = req.user.employeeId;
    if (!employeeId) return res.status(400).json({ success: false, message: 'No employee profile linked' });

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    // Check if already checked in today
    const [existing] = await db.execute(
      'SELECT id FROM attendance_records WHERE employee_id = ? AND date = ?',
      [employeeId, today]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Already checked in today' });
    }

    // Get today's schedule
    const [schedule] = await db.execute(
      `SELECT s.id, sh.start_time FROM schedules s
       JOIN shifts sh ON s.shift_id = sh.id
       WHERE s.employee_id = ? AND s.date = ? AND s.is_off = FALSE`,
      [employeeId, today]
    );

    let status = 'Present';
    let lateMinutes = 0;
    if (schedule.length > 0) {
      const scheduledStart = schedule[0].start_time;
      if (scheduledStart) {
        const [sh, sm] = scheduledStart.split(':').map(Number);
        const scheduledDate = new Date(); scheduledDate.setHours(sh, sm, 0);
        if (now > scheduledDate) {
          lateMinutes = Math.round((now - scheduledDate) / 60000);
          if (lateMinutes > 15) status = 'Late';
        }
      }
    }

    const { location_lat, location_lng, location_name, method, device_id } = req.body;

    const [result] = await db.execute(
      `INSERT INTO attendance_records 
       (employee_id, schedule_id, date, check_in_time, check_in_location_lat, check_in_location_lng,
        check_in_location_name, check_in_method, check_in_device_id, status, late_minutes)
       VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?)`,
      [employeeId, schedule[0]?.id || null, today,
       location_lat || null, location_lng || null, location_name || null,
       method || 'Web', device_id || null, status, lateMinutes]
    );

    res.json({ success: true, message: 'Check-in recorded', data: { id: result.insertId, status, time: now } });
  } catch (error) { next(error); }
};

exports.checkOut = async (req, res, next) => {
  try {
    const employeeId = req.user.employeeId;
    if (!employeeId) return res.status(400).json({ success: false, message: 'No employee profile linked' });

    const today = new Date().toISOString().split('T')[0];

    const [records] = await db.execute(
      'SELECT id, check_in_time FROM attendance_records WHERE employee_id = ? AND date = ? AND check_out_time IS NULL',
      [employeeId, today]
    );
    if (records.length === 0) {
      return res.status(400).json({ success: false, message: 'No check-in record found for today' });
    }

    const record = records[0];
    const checkIn = new Date(record.check_in_time);
    const checkOut = new Date();
    const workMs = checkOut - checkIn;
    const workHours = Math.round((workMs / 3600000) * 100) / 100;

    const { location_lat, location_lng, location_name, method, device_id } = req.body;

    await db.execute(
      `UPDATE attendance_records SET 
       check_out_time = NOW(), work_hours = ?,
       check_out_location_lat = ?, check_out_location_lng = ?, check_out_location_name = ?,
       check_out_method = ?, check_out_device_id = ?
       WHERE id = ?`,
      [workHours, location_lat || null, location_lng || null, location_name || null,
       method || 'Web', device_id || null, record.id]
    );

    res.json({ success: true, message: 'Check-out recorded', data: { workHours } });
  } catch (error) { next(error); }
};

exports.getRecords = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;
    const { date_from, date_to, employee_id, department_id, status: attStatus } = req.query;

    let where = 'WHERE 1=1';
    const params = [];

    if (date_from) { where += ' AND ar.date >= ?'; params.push(date_from); }
    if (date_to) { where += ' AND ar.date <= ?'; params.push(date_to); }
    if (employee_id) { where += ' AND ar.employee_id = ?'; params.push(employee_id); }
    if (department_id) { where += ' AND e.department_id = ?'; params.push(department_id); }
    if (attStatus) { where += ' AND ar.status = ?'; params.push(attStatus); }

    // Employee role sees only own records
    if (req.user.roleName === 'Employee') {
      where += ' AND ar.employee_id = ?';
      params.push(req.user.employeeId);
    }

    const [countResult] = await db.execute(
      `SELECT COUNT(*) as total FROM attendance_records ar
       JOIN employees e ON ar.employee_id = e.id ${where}`, params
    );

    const [rows] = await db.execute(
      `SELECT ar.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.employee_number,
              d.name as department_name
       FROM attendance_records ar
       JOIN employees e ON ar.employee_id = e.id
       LEFT JOIN departments d ON e.department_id = d.id
       ${where}
       ORDER BY ar.date DESC, ar.check_in_time DESC
       LIMIT ? OFFSET ?`,
      [...params, String(limit), String(offset)]
    );

    res.json({
      success: true,
      data: rows,
      pagination: { page, limit, total: countResult[0].total, totalPages: Math.ceil(countResult[0].total / limit) }
    });
  } catch (error) { next(error); }
};

exports.getDailySummary = async (req, res, next) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const { company_id } = req.query;

    let where = 'WHERE ar.date = ?';
    const params = [date];
    if (company_id) { where += ' AND e.company_id = ?'; params.push(company_id); }

    const [rows] = await db.execute(
      `SELECT ar.status, COUNT(*) as count
       FROM attendance_records ar
       JOIN employees e ON ar.employee_id = e.id
       ${where}
       GROUP BY ar.status`, params
    );

    const summary = { present: 0, absent: 0, late: 0, 'half-day': 0, 'work-from-home': 0 };
    rows.forEach(r => { summary[r.status.toLowerCase()] = r.count; });

    const [total] = await db.execute(
      `SELECT COUNT(*) as total FROM employees e ${company_id ? 'WHERE e.company_id = ?' : ''}`,
      company_id ? [company_id] : []
    );

    res.json({ success: true, data: { date, ...summary, totalEmployees: total[0].total } });
  } catch (error) { next(error); }
};

exports.getMonthlyReport = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || (new Date().getMonth() + 1);
    const { department_id } = req.query;

    let where = 'WHERE YEAR(ar.date) = ? AND MONTH(ar.date) = ?';
    const params = [year, month];
    if (department_id) { where += ' AND e.department_id = ?'; params.push(department_id); }

    const [rows] = await db.execute(
      `SELECT e.id, e.employee_number, CONCAT(e.first_name, ' ', e.last_name) as employee_name,
              d.name as department_name,
              COUNT(CASE WHEN ar.status = 'Present' THEN 1 END) as present_days,
              COUNT(CASE WHEN ar.status = 'Absent' THEN 1 END) as absent_days,
              COUNT(CASE WHEN ar.status = 'Late' THEN 1 END) as late_days,
              SUM(ar.work_hours) as total_hours,
              SUM(ar.overtime_hours) as total_overtime,
              SUM(ar.late_minutes) as total_late_minutes
       FROM employees e
       LEFT JOIN attendance_records ar ON e.id = ar.employee_id ${where}
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE e.is_active = TRUE
       GROUP BY e.id, e.employee_number, e.first_name, e.last_name, d.name
       ORDER BY e.first_name`, params
    );

    res.json({ success: true, data: { year, month, records: rows } });
  } catch (error) { next(error); }
};
