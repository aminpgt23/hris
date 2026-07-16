const db = require('../../config/database');

// Get all employees with pagination, search, filters
exports.getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const { department_id, status, company_id } = req.query;

    let where = 'WHERE 1=1';
    const params = [];

    if (search) {
      where += ' AND (e.first_name LIKE ? OR e.last_name LIKE ? OR e.employee_number LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (department_id) { where += ' AND e.department_id = ?'; params.push(department_id); }
    if (status) { where += ' AND e.employment_status = ?'; params.push(status); }
    if (company_id) { where += ' AND e.company_id = ?'; params.push(company_id); }

    const [countResult] = await db.execute(
      `SELECT COUNT(*) as total FROM employees e ${where}`, params
    );
    const total = countResult[0].total;

    const [rows] = await db.execute(
      `SELECT e.*, d.name as department_name, p.name as position_name, 
              g.name as grade_name, CONCAT(s.first_name, ' ', s.last_name) as supervisor_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN positions p ON e.position_id = p.id
       LEFT JOIN grades g ON e.grade_id = g.id
       LEFT JOIN employees s ON e.supervisor_id = s.id
       ${where}
       ORDER BY e.first_name
       LIMIT ? OFFSET ?`,
      [...params, String(limit), String(offset)]
    );

    res.json({
      success: true,
      data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) { next(error); }
};

// Get single employee with all relations
exports.getById = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT e.*, d.name as department_name, p.name as position_name,
              g.name as grade_name, g.code as grade_code,
              CONCAT(s.first_name, ' ', s.last_name) as supervisor_name,
              c.name as company_name, b.name as branch_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN positions p ON e.position_id = p.id
       LEFT JOIN grades g ON e.grade_id = g.id
       LEFT JOIN employees s ON e.supervisor_id = s.id
       LEFT JOIN companies c ON e.company_id = c.id
       LEFT JOIN branches b ON e.branch_id = b.id
       WHERE e.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Get related data
    const [dependents] = await db.execute(
      'SELECT * FROM employee_dependents WHERE employee_id = ?', [req.params.id]
    );
    const [education] = await db.execute(
      'SELECT * FROM employee_education WHERE employee_id = ? ORDER BY end_date DESC', [req.params.id]
    );
    const [experience] = await db.execute(
      'SELECT * FROM employee_work_experience WHERE employee_id = ? ORDER BY start_date DESC', [req.params.id]
    );
    const [documents] = await db.execute(
      'SELECT * FROM employee_documents WHERE employee_id = ?', [req.params.id]
    );

    res.json({
      success: true,
      data: {
        ...rows[0],
        dependents,
        education,
        workExperience: experience,
        documents
      }
    });
  } catch (error) { next(error); }
};

// Create employee
exports.create = async (req, res, next) => {
  try {
    const {
      company_id, branch_id, employee_number, first_name, last_name,
      gender, date_of_birth, marital_status, employment_status, hire_date,
      position_id, department_id, grade_id, supervisor_id,
      email_company, phone_personal, bank_name, bank_account_number,
      npwp, bpjs_health_number, bpjs_employment_number,
      address_current, city, province, religion, nationality, id_card_number
    } = req.body;

    if (!company_id || !employee_number || !first_name || !gender || !employment_status || !hire_date) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: company_id, employee_number, first_name, gender, employment_status, hire_date'
      });
    }

    // Check duplicate employee_number
    const [existing] = await db.execute(
      'SELECT id FROM employees WHERE employee_number = ?', [employee_number]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Employee number already exists' });
    }

    const [result] = await db.execute(
      `INSERT INTO employees 
       (company_id, branch_id, employee_number, first_name, last_name, gender, date_of_birth,
        marital_status, religion, nationality, id_card_number, npwp, bpjs_health_number, bpjs_employment_number,
        employment_status, hire_date, position_id, department_id, grade_id, supervisor_id,
        email_company, phone_personal, bank_name, bank_account_number, address_current, city, province)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [company_id, branch_id || null, employee_number, first_name, last_name || '',
       gender, date_of_birth || null, marital_status || 'Single',
       religion || null, nationality || 'Indonesian', id_card_number || null,
       npwp || null, bpjs_health_number || null, bpjs_employment_number || null,
       employment_status, hire_date, position_id || null, department_id || null,
       grade_id || null, supervisor_id || null, email_company || null,
       phone_personal || null, bank_name || null, bank_account_number || null,
       address_current || null, city || null, province || null]
    );

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: { id: result.insertId, employee_number }
    });
  } catch (error) { next(error); }
};

// Update employee
exports.update = async (req, res, next) => {
  try {
    const [existing] = await db.execute('SELECT id FROM employees WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const fields = [];
    const values = [];
    const allowed = [
      'first_name', 'last_name', 'middle_name', 'preferred_name', 'gender',
      'date_of_birth', 'place_of_birth', 'religion', 'marital_status', 'nationality',
      'id_card_number', 'id_card_address', 'npwp', 'bpjs_health_number', 'bpjs_employment_number',
      'position_id', 'department_id', 'grade_id', 'supervisor_id', 'branch_id',
      'employment_status', 'hire_date', 'end_date', 'probation_end_date', 'contract_end_date',
      'email_personal', 'email_company', 'phone_personal', 'phone_emergency',
      'emergency_contact_name', 'emergency_contact_relation',
      'address_current', 'address_permanent', 'city', 'province', 'country', 'postal_code',
      'bank_name', 'bank_account_number', 'bank_account_name',
      'photo_url', 'is_active'
    ];

    for (const field of allowed) {
      if (req.body[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(req.params.id);
    await db.execute(
      `UPDATE employees SET ${fields.join(', ')} WHERE id = ?`, values
    );

    res.json({ success: true, message: 'Employee updated successfully' });
  } catch (error) { next(error); }
};

// Soft delete
exports.delete = async (req, res, next) => {
  try {
    const [result] = await db.execute(
      'UPDATE employees SET is_active = FALSE, termination_date = CURDATE() WHERE id = ? AND is_active = TRUE',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found or already inactive' });
    }
    res.json({ success: true, message: 'Employee deactivated successfully' });
  } catch (error) { next(error); }
};

// Get employees by department
exports.getByDepartment = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, employee_number, first_name, last_name, position_id, employment_status, 
              CONCAT(first_name, ' ', last_name) as full_name
       FROM employees WHERE department_id = ? AND is_active = TRUE ORDER BY first_name`,
      [req.params.deptId]
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

// Get salary history
exports.getHistory = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM employee_salary_history WHERE employee_id = ? ORDER BY effective_date DESC`,
      [req.params.id]
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

// Get employee documents
exports.getDocuments = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM employee_documents WHERE employee_id = ?`, [req.params.id]
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};
