const db = require('../../config/database');

exports.getChart = async (req, res, next) => {
  try {
    const { company_id } = req.query;
    const coId = company_id || 1;

    const [depts] = await db.execute(
      'SELECT id, name, code, parent_id FROM departments WHERE company_id = ? AND is_active = TRUE ORDER BY name',
      [coId]
    );

    const [positions] = await db.execute(
      `SELECT p.id, p.name, p.code, p.department_id, p.level, p.reports_to_position_id,
              COUNT(e.id) as headcount
       FROM positions p
       LEFT JOIN employees e ON p.id = e.position_id AND e.is_active = TRUE
       WHERE p.company_id = ? AND p.is_active = TRUE
       GROUP BY p.id
       ORDER BY p.level, p.name`,
      [coId]
    );

    const [employees] = await db.execute(
      `SELECT e.id, e.employee_number, CONCAT(e.first_name, ' ', e.last_name) as name,
              e.position_id, e.department_id, e.supervisor_id
       FROM employees e WHERE e.company_id = ? AND e.is_active = TRUE`,
      [coId]
    );

    res.json({
      success: true,
      data: { departments: depts, positions, employees }
    });
  } catch (error) { next(error); }
};

exports.getStats = async (req, res, next) => {
  try {
    const { company_id } = req.query;
    const coId = company_id || 1;

    const [deptStats] = await db.execute(
      `SELECT d.id, d.name, d.code,
              COUNT(CASE WHEN e.is_active = TRUE THEN 1 END) as headcount,
              COUNT(CASE WHEN e.employment_status = 'Permanent' AND e.is_active = TRUE THEN 1 END) as permanent,
              COUNT(CASE WHEN e.employment_status = 'Contract' AND e.is_active = TRUE THEN 1 END) as contract,
              COUNT(CASE WHEN e.employment_status = 'Probation' AND e.is_active = TRUE THEN 1 END) as probation
       FROM departments d
       LEFT JOIN employees e ON d.id = e.department_id
       WHERE d.company_id = ? AND d.is_active = TRUE
       GROUP BY d.id, d.name, d.code
       ORDER BY d.name`,
      [coId]
    );

    const [total] = await db.execute(
      'SELECT COUNT(*) as total FROM employees WHERE company_id = ? AND is_active = TRUE',
      [coId]
    );

    res.json({
      success: true,
      data: {
        totalEmployees: total[0].total,
        departments: deptStats
      }
    });
  } catch (error) { next(error); }
};
