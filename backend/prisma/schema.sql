

-- ============================================
-- SYSTEM & AUTHENTICATION TABLES
-- ============================================

-- Companies table (multi-company support)
CREATE TABLE companies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    legal_name VARCHAR(200),
    tax_id VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Indonesia',
    postal_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(100),
    logo_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Branches table (multi-branch support)
CREATE TABLE branches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE KEY unique_branch_code (company_id, code)
);

-- Departments table
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    parent_id INT,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    cost_center VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- Positions/Job Roles table
CREATE TABLE positions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    department_id INT,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    level INT DEFAULT 1,
    reports_to_position_id INT,
    job_description TEXT,
    requirements TEXT,
    min_salary DECIMAL(15,2),
    max_salary DECIMAL(15,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (reports_to_position_id) REFERENCES positions(id) ON DELETE SET NULL
);

-- Grades/Salary Structure table
CREATE TABLE grades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    level INT NOT NULL,
    min_salary DECIMAL(15,2) NOT NULL,
    mid_salary DECIMAL(15,2),
    max_salary DECIMAL(15,2) NOT NULL,
    allowance_percentage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE KEY unique_grade_code (company_id, code)
);

-- Roles table (for RBAC)
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    description TEXT,
    permissions JSON,
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT,
    role_id INT NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL,
    must_change_password BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

-- Audit Log table
CREATE TABLE audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_user_action (user_id, action),
    INDEX idx_created_at (created_at)
);

-- ============================================
-- EMPLOYEE MASTER DATA (CORE HR)
-- ============================================

-- Employees table
CREATE TABLE employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    branch_id INT,
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100),
    preferred_name VARCHAR(100),
    gender ENUM('M', 'F') NOT NULL,
    place_of_birth VARCHAR(100),
    date_of_birth DATE,
    religion VARCHAR(50),
    marital_status ENUM('Single', 'Married', 'Divorced', 'Widowed') DEFAULT 'Single',
    nationality VARCHAR(50) DEFAULT 'Indonesian',
    id_card_number VARCHAR(50),
    id_card_address TEXT,
    npwp VARCHAR(20),
    bpjs_health_number VARCHAR(50),
    bpjs_employment_number VARCHAR(50),
    position_id INT,
    department_id INT,
    grade_id INT,
    employment_status ENUM('Permanent', 'Contract', 'Probation', 'Intern', 'Outsource') NOT NULL,
    hire_date DATE NOT NULL,
    start_date DATE,
    end_date DATE,
    probation_end_date DATE,
    contract_end_date DATE,
    termination_date DATE,
    termination_reason TEXT,
    is_rehireable BOOLEAN DEFAULT TRUE,
    email_personal VARCHAR(100),
    email_company VARCHAR(100),
    phone_personal VARCHAR(20),
    phone_emergency VARCHAR(20),
    emergency_contact_name VARCHAR(100),
    emergency_contact_relation VARCHAR(50),
    address_current TEXT,
    address_permanent TEXT,
    postal_code VARCHAR(20),
    city VARCHAR(100),
    province VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Indonesia',
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(50),
    bank_account_name VARCHAR(100),
    photo_url VARCHAR(255),
    resume_url VARCHAR(255),
    contract_url VARCHAR(255),
    other_documents JSON,
    supervisor_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
    FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (grade_id) REFERENCES grades(id) ON DELETE SET NULL,
    FOREIGN KEY (supervisor_id) REFERENCES employees(id) ON DELETE SET NULL,
    INDEX idx_employee_number (employee_number),
    INDEX idx_company (company_id),
    INDEX idx_department (department_id),
    INDEX idx_position (position_id),
    INDEX idx_status (employment_status, is_active)
);

-- Employee Dependents table
CREATE TABLE employee_dependents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    gender ENUM('M', 'F'),
    is_covered_bpjs BOOLEAN DEFAULT FALSE,
    is_covered_insurance BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Employee Education History table
CREATE TABLE employee_education (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    institution_name VARCHAR(200) NOT NULL,
    degree VARCHAR(100),
    major VARCHAR(100),
    start_date DATE,
    end_date DATE,
    gpa DECIMAL(3,2),
    certificate_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Employee Work Experience table
CREATE TABLE employee_work_experience (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    position VARCHAR(100),
    department VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    responsibilities TEXT,
    salary_last_drawn DECIMAL(15,2),
    supervisor_name VARCHAR(100),
    supervisor_contact VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Employee Documents table
CREATE TABLE employee_documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    document_name VARCHAR(200) NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    file_size INT,
    mime_type VARCHAR(50),
    issue_date DATE,
    expiry_date DATE,
    issuing_authority VARCHAR(100),
    document_number VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by INT,
    verified_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Employee Salary History table
CREATE TABLE employee_salary_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    effective_date DATE NOT NULL,
    basic_salary DECIMAL(15,2) NOT NULL,
    allowances JSON,
    deductions JSON,
    grade_id INT,
    position_id INT,
    reason VARCHAR(200),
    approved_by INT,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (grade_id) REFERENCES grades(id) ON DELETE SET NULL,
    FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_employee_date (employee_id, effective_date)
);

-- ============================================
-- ATTENDANCE MODULE
-- ============================================

-- Shifts table
CREATE TABLE shifts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_start TIME,
    break_end TIME,
    break_duration_minutes INT DEFAULT 60,
    work_hours DECIMAL(5,2) NOT NULL,
    is_paid_overtime BOOLEAN DEFAULT TRUE,
    overtime_start_after_minutes INT DEFAULT 0,
    color_code VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE KEY unique_shift_code (company_id, code)
);

-- Holidays table
CREATE TABLE holidays (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    date DATE NOT NULL,
    type ENUM('National', 'Company', 'Religious', 'Optional') DEFAULT 'National',
    description TEXT,
    is_paid BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE KEY unique_holiday_date (company_id, date)
);

-- Schedules table
CREATE TABLE schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    shift_id INT NOT NULL,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    is_off BOOLEAN DEFAULT FALSE,
    is_holiday BOOLEAN DEFAULT FALSE,
    holiday_id INT,
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE,
    FOREIGN KEY (holiday_id) REFERENCES holidays(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_employee_date (employee_id, date),
    INDEX idx_date_range (date)
);

-- Attendance Records table
CREATE TABLE attendance_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    schedule_id INT,
    date DATE NOT NULL,
    check_in_time DATETIME,
    check_out_time DATETIME,
    check_in_location_lat DECIMAL(10,8),
    check_in_location_lng DECIMAL(11,8),
    check_in_location_name VARCHAR(200),
    check_out_location_lat DECIMAL(10,8),
    check_out_location_lng DECIMAL(11,8),
    check_out_location_name VARCHAR(200),
    check_in_method ENUM('Biometric', 'Mobile', 'Web', 'API') DEFAULT 'Web',
    check_out_method ENUM('Biometric', 'Mobile', 'Web', 'API') DEFAULT 'Web',
    check_in_device_id VARCHAR(100),
    check_out_device_id VARCHAR(100),
    work_hours DECIMAL(5,2) DEFAULT 0,
    overtime_hours DECIMAL(5,2) DEFAULT 0,
    late_minutes INT DEFAULT 0,
    early_departure_minutes INT DEFAULT 0,
    status ENUM('Present', 'Absent', 'Late', 'Half Day', 'On Duty', 'Work From Home') DEFAULT 'Present',
    notes TEXT,
    approval_status ENUM('Pending', 'Approved', 'Rejected', 'Revision') DEFAULT 'Approved',
    approved_by INT,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_employee_date (employee_id, date),
    INDEX idx_date_status (date, status)
);

-- Overtime Requests table
CREATE TABLE overtime_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    requested_hours DECIMAL(5,2) NOT NULL,
    approved_hours DECIMAL(5,2),
    reason TEXT NOT NULL,
    project_code VARCHAR(50),
    cost_center VARCHAR(50),
    status ENUM('Pending', 'Approved', 'Rejected', 'Revision') DEFAULT 'Pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by INT,
    approved_at TIMESTAMP NULL,
    rejection_reason TEXT,
    payment_rate DECIMAL(5,2) DEFAULT 1.0,
    calculated_amount DECIMAL(15,2),
    paid_in_payroll_period VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_employee_date (employee_id, date),
    INDEX idx_status (status)
);

-- ============================================
-- LEAVE MANAGEMENT MODULE
-- ============================================

-- Leave Types table
CREATE TABLE leave_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    type ENUM('Annual', 'Sick', 'Personal', 'Maternity', 'Paternity', 'Unpaid', 'Compassionate', 'Medical', 'Other') DEFAULT 'Other',
    default_days_per_year INT DEFAULT 0,
    max_days_per_request INT,
    min_days_per_request INT DEFAULT 1,
    requires_document BOOLEAN DEFAULT FALSE,
    is_paid BOOLEAN DEFAULT TRUE,
    accrual_type ENUM('Yearly', 'Monthly', 'PerPeriod') DEFAULT 'Yearly',
    carry_over_max_days INT DEFAULT 0,
    expiry_months INT DEFAULT 12,
    color_code VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE KEY unique_leave_type_code (company_id, code)
);

-- Leave Balances table
CREATE TABLE leave_balances (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    year INT NOT NULL,
    opening_balance DECIMAL(10,2) DEFAULT 0,
    accrued DECIMAL(10,2) DEFAULT 0,
    taken DECIMAL(10,2) DEFAULT 0,
    adjusted DECIMAL(10,2) DEFAULT 0,
    closing_balance DECIMAL(10,2) DEFAULT 0,
    expires_at DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
    UNIQUE KEY unique_employee_leave_year (employee_id, leave_type_id, year)
);

-- Leave Requests table
CREATE TABLE leave_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(10,2) NOT NULL,
    working_days DECIMAL(10,2) NOT NULL,
    reason TEXT NOT NULL,
    replacement_employee_id INT,
    document_urls JSON,
    contact_during_leave VARCHAR(100),
    address_during_leave TEXT,
    status ENUM('Pending Manager', 'Pending HR', 'Approved', 'Rejected', 'Revision', 'Cancelled') DEFAULT 'Pending Manager',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    manager_approved_by INT,
    manager_approved_at TIMESTAMP NULL,
    hr_approved_by INT,
    hr_approved_at TIMESTAMP NULL,
    rejection_reason TEXT,
    cancelled_by INT,
    cancelled_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
    FOREIGN KEY (replacement_employee_id) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (manager_approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (hr_approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (cancelled_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_employee_status (employee_id, status),
    INDEX idx_date_range (start_date, end_date),
    INDEX idx_status (status)
);

-- Leave Adjustments table (for manual balance adjustments)
CREATE TABLE leave_adjustments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    adjustment_type ENUM('Add', 'Deduct') NOT NULL,
    days DECIMAL(10,2) NOT NULL,
    reason TEXT NOT NULL,
    effective_date DATE NOT NULL,
    reference_number VARCHAR(50),
    approved_by INT NOT NULL,
    approved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- ============================================
-- PAYROLL MODULE
-- ============================================

-- Salary Components table
CREATE TABLE salary_components (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    type ENUM('Earning', 'Deduction', 'Tax', 'Benefit') NOT NULL,
    category ENUM('Fixed', 'Variable', 'Reimbursement', 'Loan', 'Tax', 'BPJS') NOT NULL,
    calculation_type ENUM('Fixed Amount', 'Percentage of Basic', 'Percentage of Gross', 'Formula', 'Tiered') DEFAULT 'Fixed Amount',
    formula TEXT,
    is_taxable BOOLEAN DEFAULT TRUE,
    is_pensionable BOOLEAN DEFAULT FALSE,
    is_bpjs_base BOOLEAN DEFAULT FALSE,
    display_on_payslip BOOLEAN DEFAULT TRUE,
    sequence_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    effective_from DATE,
    effective_to DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE KEY unique_component_code (company_id, code)
);

-- Payroll Periods table
CREATE TABLE payroll_periods (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    period_type ENUM('Monthly', 'Bi-weekly', 'Weekly', 'Daily') DEFAULT 'Monthly',
    payment_day INT DEFAULT 25,
    cutoff_day INT DEFAULT 20,
    fiscal_year INT NOT NULL,
    period_number INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    payment_date DATE,
    status ENUM('Draft', 'Initialized', 'Processing', 'Simulated', 'Approved', 'Paid', 'Closed') DEFAULT 'Draft',
    initialized_by INT,
    initialized_at TIMESTAMP NULL,
    approved_by INT,
    approved_at TIMESTAMP NULL,
    paid_at TIMESTAMP NULL,
    closed_by INT,
    closed_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (initialized_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (closed_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_period (company_id, fiscal_year, period_number)
);

-- Employee Salary Assignments table
CREATE TABLE employee_salary_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    payroll_period_id INT,
    basic_salary DECIMAL(15,2) NOT NULL,
    fixed_allowances JSON,
    fixed_deductions JSON,
    tax_category ENUM('TK0', 'TK1', 'TK2', 'TK3', 'K0', 'K1', 'K2', 'K3') DEFAULT 'TK0',
    bpjs_health_percentage DECIMAL(5,2) DEFAULT 1.0,
    bpjs_employment_percentage DECIMAL(5,2) DEFAULT 2.0,
    pension_percentage DECIMAL(5,2) DEFAULT 1.0,
    is_eligible_payroll BOOLEAN DEFAULT TRUE,
    bank_transfer BOOLEAN DEFAULT TRUE,
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (payroll_period_id) REFERENCES payroll_periods(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_employee_effective (employee_id, effective_from)
);

-- Payroll Transactions table
CREATE TABLE payroll_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    payroll_period_id INT NOT NULL,
    employee_id INT NOT NULL,
    employee_number VARCHAR(50) NOT NULL,
    employee_name VARCHAR(200) NOT NULL,
    department_id INT,
    position_id INT,
    working_days INT DEFAULT 0,
    present_days INT DEFAULT 0,
    leave_days INT DEFAULT 0,
    absent_days INT DEFAULT 0,
    overtime_hours DECIMAL(5,2) DEFAULT 0,
    basic_salary DECIMAL(15,2) DEFAULT 0,
    gross_salary DECIMAL(15,2) DEFAULT 0,
    earnings JSON,
    deductions JSON,
    bpjs_health_employee DECIMAL(15,2) DEFAULT 0,
    bpjs_employment_employee DECIMAL(15,2) DEFAULT 0,
    pension_employee DECIMAL(15,2) DEFAULT 0,
    taxable_income DECIMAL(15,2) DEFAULT 0,
    pph21_employee DECIMAL(15,2) DEFAULT 0,
    net_salary DECIMAL(15,2) DEFAULT 0,
    payment_method ENUM('Bank Transfer', 'Cash', 'Check') DEFAULT 'Bank Transfer',
    bank_account_number VARCHAR(50),
    payment_status ENUM('Pending', 'Paid', 'Failed', 'On Hold') DEFAULT 'Pending',
    paid_at TIMESTAMP NULL,
    payslip_generated BOOLEAN DEFAULT FALSE,
    payslip_url VARCHAR(255),
    journal_entry_id INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (payroll_period_id) REFERENCES payroll_periods(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL,
    INDEX idx_period_employee (payroll_period_id, employee_id),
    INDEX idx_payment_status (payment_status)
);

-- Payroll Allowances/Deductions (variable) table
CREATE TABLE payroll_variable_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payroll_period_id INT NOT NULL,
    employee_id INT NOT NULL,
    salary_component_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 1,
    rate DECIMAL(15,2),
    reason TEXT,
    reference_type VARCHAR(50),
    reference_id INT,
    is_recurring BOOLEAN DEFAULT FALSE,
    approved_by INT,
    approved_at TIMESTAMP NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payroll_period_id) REFERENCES payroll_periods(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (salary_component_id) REFERENCES salary_components(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- Loans/Advances table
CREATE TABLE employee_loans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    loan_type VARCHAR(50) NOT NULL,
    principal_amount DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    installment_amount DECIMAL(15,2) NOT NULL,
    total_installments INT NOT NULL,
    paid_installments INT DEFAULT 0,
    remaining_balance DECIMAL(15,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    next_installment_date DATE,
    status ENUM('Pending', 'Approved', 'Active', 'Completed', 'Defaulted') DEFAULT 'Pending',
    purpose TEXT,
    approved_by INT,
    approved_at TIMESTAMP NULL,
    disbursed_at TIMESTAMP NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_employee_status (employee_id, status)
);

-- Loan Installments table
CREATE TABLE loan_installments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    loan_id INT NOT NULL,
    payroll_period_id INT,
    installment_number INT NOT NULL,
    due_date DATE NOT NULL,
    principal_amount DECIMAL(15,2) NOT NULL,
    interest_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    paid_at TIMESTAMP NULL,
    status ENUM('Pending', 'Paid', 'Partial', 'Overdue', 'Waived') DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_id) REFERENCES employee_loans(id) ON DELETE CASCADE,
    FOREIGN KEY (payroll_period_id) REFERENCES payroll_periods(id) ON DELETE SET NULL,
    INDEX idx_loan_due (loan_id, due_date)
);

-- ============================================
-- COMPLIANCE MODULE (BPJS, PPh21, Pension)
-- ============================================

-- BPJS Health Configurations table
CREATE TABLE bpjs_health_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    year INT NOT NULL,
    employee_percentage DECIMAL(5,2) DEFAULT 1.0,
    employer_percentage DECIMAL(5,2) DEFAULT 4.0,
    min_base_salary DECIMAL(15,2),
    max_base_salary DECIMAL(15,2),
    is_active BOOLEAN DEFAULT TRUE,
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE KEY unique_bpjs_health_year (company_id, year)
);

-- BPJS Employment Configurations table
CREATE TABLE bpjs_employment_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    year INT NOT NULL,
    jht_employee_percentage DECIMAL(5,2) DEFAULT 2.0,
    jht_employer_percentage DECIMAL(5,2) DEFAULT 3.7,
    jp_employee_percentage DECIMAL(5,2) DEFAULT 1.0,
    jp_employer_percentage DECIMAL(5,2) DEFAULT 2.0,
    jkk_percentage DECIMAL(5,2) DEFAULT 0.24,
    jkm_percentage DECIMAL(5,2) DEFAULT 0.3,
    min_base_salary DECIMAL(15,2),
    max_base_salary DECIMAL(15,2),
    is_active BOOLEAN DEFAULT TRUE,
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE KEY unique_bpjs_employment_year (company_id, year)
);

-- Tax Rates (PPh21) table
CREATE TABLE tax_rates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    year INT NOT NULL,
    layer_number INT NOT NULL,
    min_income DECIMAL(15,2) NOT NULL,
    max_income DECIMAL(15,2),
    tax_rate DECIMAL(5,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_tax_layer (year, layer_number)
);

-- PPh21 Calculations table
CREATE TABLE pph21_calculations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    payroll_period_id INT NOT NULL,
    employee_id INT NOT NULL,
    gross_annual_income DECIMAL(15,2) DEFAULT 0,
    deductible_expenses DECIMAL(15,2) DEFAULT 0,
    jabatan_expense DECIMAL(15,2) DEFAULT 0,
    pension_expense DECIMAL(15,2) DEFAULT 0,
    total_deductions DECIMAL(15,2) DEFAULT 0,
    taxable_income_annual DECIMAL(15,2) DEFAULT 0,
    pph21_annual DECIMAL(15,2) DEFAULT 0,
    pph21_monthly DECIMAL(15,2) DEFAULT 0,
    tax_category VARCHAR(10),
    ptkp_amount DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (payroll_period_id) REFERENCES payroll_periods(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_period_employee (payroll_period_id, employee_id)
);

-- Compliance Reports table
CREATE TABLE compliance_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    report_type ENUM('BPJS Health', 'BPJS Employment', 'PPh21 Massal', 'Pension') NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    generated_by INT NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Generated', 'Submitted', 'Approved', 'Rejected') DEFAULT 'Generated',
    submission_date DATE,
    reference_number VARCHAR(100),
    file_url VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- ============================================
-- ASSET MANAGEMENT MODULE
-- ============================================

-- Asset Categories table
CREATE TABLE asset_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    depreciation_method ENUM('Straight Line', 'Declining Balance', 'Units of Production') DEFAULT 'Straight Line',
    useful_life_years INT,
    salvage_value_percentage DECIMAL(5,2) DEFAULT 0,
    is_depreciable BOOLEAN DEFAULT TRUE,
    gl_account_asset VARCHAR(50),
    gl_account_depreciation VARCHAR(50),
    gl_account_expense VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE KEY unique_asset_category_code (company_id, code)
);

-- Assets table
CREATE TABLE assets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    asset_category_id INT NOT NULL,
    asset_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    serial_number VARCHAR(100),
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    purchase_date DATE,
    purchase_cost DECIMAL(15,2) NOT NULL,
    vendor_name VARCHAR(200),
    vendor_contact VARCHAR(100),
    warranty_expiry DATE,
    location VARCHAR(200),
    condition ENUM('New', 'Good', 'Fair', 'Poor', 'Damaged', 'Disposed') DEFAULT 'New',
    assigned_to_employee_id INT,
    assigned_date DATE,
    returned_date DATE,
    assigned_by INT,
    depreciation_start_date DATE,
    accumulated_depreciation DECIMAL(15,2) DEFAULT 0,
    net_book_value DECIMAL(15,2),
    disposal_date DATE,
    disposal_reason TEXT,
    disposal_proceeds DECIMAL(15,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (asset_category_id) REFERENCES asset_categories(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to_employee_id) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Asset Maintenance table
CREATE TABLE asset_maintenance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    asset_id INT NOT NULL,
    maintenance_type ENUM('Preventive', 'Corrective', 'Inspection', 'Repair') NOT NULL,
    scheduled_date DATE,
    completed_date DATE,
    description TEXT NOT NULL,
    vendor_name VARCHAR(200),
    cost DECIMAL(15,2) DEFAULT 0,
    next_maintenance_date DATE,
    status ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    performed_by VARCHAR(100),
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_asset_scheduled (asset_id, scheduled_date)
);

-- ============================================
-- TRAINING MODULE
-- ============================================

-- Training Programs table
CREATE TABLE training_programs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    code VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    type ENUM('Internal', 'External', 'Online', 'Workshop', 'Seminar', 'Certification') DEFAULT 'Internal',
    objective TEXT,
    target_audience TEXT,
    prerequisites TEXT,
    duration_hours DECIMAL(5,2),
    cost_estimate DECIMAL(15,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE KEY unique_training_code (company_id, code)
);

-- Training Sessions table
CREATE TABLE training_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    training_program_id INT NOT NULL,
    session_code VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    trainer_name VARCHAR(100),
    trainer_organization VARCHAR(200),
    venue VARCHAR(200),
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    max_participants INT,
    enrolled_count INT DEFAULT 0,
    status ENUM('Planned', 'Open', 'Full', 'InProgress', 'Completed', 'Cancelled') DEFAULT 'Planned',
    cost_actual DECIMAL(15,2),
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (training_program_id) REFERENCES training_programs(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_session_code (session_code)
);

-- Training Enrollments table
CREATE TABLE training_enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    training_session_id INT NOT NULL,
    employee_id INT NOT NULL,
    enrollment_status ENUM('Nominated', 'Registered', 'Confirmed', 'Completed', 'No Show', 'Withdrawn') DEFAULT 'Nominated',
    nominated_by INT,
    nominated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    withdrawal_reason TEXT,
    pre_test_score DECIMAL(5,2),
    post_test_score DECIMAL(5,2),
    evaluation_score DECIMAL(5,2),
    feedback TEXT,
    certificate_issued BOOLEAN DEFAULT FALSE,
    certificate_url VARCHAR(255),
    certificate_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (training_session_id) REFERENCES training_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (nominated_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_enrollment (training_session_id, employee_id)
);

-- ============================================
-- NOTIFICATION MODULE
-- ============================================

-- Notification Templates table
CREATE TABLE notification_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    channel ENUM('Email', 'SMS', 'WhatsApp', 'Push', 'In-App') NOT NULL,
    subject_template VARCHAR(255),
    body_template TEXT NOT NULL,
    variables JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    channel ENUM('Email', 'SMS', 'WhatsApp', 'Push', 'In-App') NOT NULL,
    priority ENUM('Low', 'Normal', 'High', 'Urgent') DEFAULT 'Normal',
    status ENUM('Pending', 'Sent', 'Delivered', 'Read', 'Failed') DEFAULT 'Pending',
    sent_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    read_at TIMESTAMP NULL,
    error_message TEXT,
    retry_count INT DEFAULT 0,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_status (user_id, status),
    INDEX idx_created_at (created_at)
);

-- Approval Workflows table
CREATE TABLE approval_workflows (
    id INT PRIMARY KEY AUTO_INCREMENT,
    workflow_type VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    company_id INT,
    steps JSON NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Approval History table
CREATE TABLE approval_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    workflow_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NOT NULL,
    step_number INT NOT NULL,
    approver_id INT NOT NULL,
    action ENUM('Approved', 'Rejected', 'Revision Requested', 'Delegated') NOT NULL,
    comments TEXT,
    delegated_to INT,
    action_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (delegated_to) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_entity (entity_type, entity_id)
);

-- ============================================
-- INITIAL DATA SEEDING
-- ============================================

-- Insert default roles
INSERT INTO roles (name, display_name, description, permissions, is_system_role) VALUES
('Administrator', 'System Administrator', 'Full system access', 
 '["all"]', TRUE),
('HR Staff', 'HR Staff', 'HR operations and employee management', 
 '["view_employees", "edit_employees", "view_attendance", "edit_attendance", "view_leave", "approve_leave", "view_payroll", "edit_payroll"]', TRUE),
('Manager', 'Manager', 'Department manager with approval rights', 
 '["view_employees", "view_attendance", "approve_attendance", "view_leave", "approve_leave", "view_payroll_own_dept"]', TRUE),
('Employee', 'Employee', 'Basic employee self-service access', 
 '["view_profile", "edit_profile", "view_attendance_own", "apply_leave", "view_leave_own", "view_payslip"]', TRUE),
('Finance', 'Finance/Payroll', 'Payroll processing and finance', 
 '["view_employees", "view_payroll", "edit_payroll", "approve_payroll", "view_compliance", "export_payroll"]', TRUE),
('Director', 'Director', 'Executive access with full approvals', 
 '["view_all", "approve_payroll", "approve_high_value"]', TRUE);

-- Insert default company
INSERT INTO companies (code, name, legal_name, country, is_active) VALUES
('CORP', 'Corporate Entity', 'Corporate Entity PT', 'Indonesia', TRUE);

-- Insert default notification templates
INSERT INTO notification_templates (code, name, channel, subject_template, body_template, variables) VALUES
('LEAVE_REQUEST', 'Leave Request Submission', 'Email', 
 'Leave Request: {employee_name}', 
 'Dear {approver_name},\n\n{employee_name} has submitted a leave request:\nType: {leave_type}\nDates: {start_date} to {end_date}\nReason: {reason}\n\nPlease review and approve/reject.', 
 '["employee_name", "approver_name", "leave_type", "start_date", "end_date", "reason"]'),
('LEAVE_APPROVED', 'Leave Request Approved', 'Email',
 'Leave Request Approved',
 'Dear {employee_name},\n\nYour leave request has been approved.\nType: {leave_type}\nDates: {start_date} to {end_date}\n\nThank you.',
 '["employee_name", "leave_type", "start_date", "end_date"]'),
('PAYROLL_CREATED', 'Payslip Available', 'Email',
 'Payslip Available - {period_name}',
 'Dear {employee_name},\n\nYour payslip for {period_name} is now available.\nNet Salary: {net_salary}\n\nPlease login to view details.',
 '["employee_name", "period_name", "net_salary"]');

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

-- Employee Summary View
CREATE OR REPLACE VIEW v_employee_summary AS
SELECT 
    e.id,
    e.employee_number,
    CONCAT(e.first_name, ' ', IFNULL(e.middle_name, ''), ' ', e.last_name) as full_name,
    e.gender,
    e.date_of_birth,
    e.employment_status,
    e.hire_date,
    c.name as company_name,
    br.name as branch_name,
    d.name as department_name,
    p.name as position_name,
    g.name as grade_name,
    sup.employee_number as supervisor_number,
    CONCAT(sup.first_name, ' ', sup.last_name) as supervisor_name,
    e.is_active
FROM employees e
LEFT JOIN companies c ON e.company_id = c.id
LEFT JOIN branches br ON e.branch_id = br.id
LEFT JOIN departments d ON e.department_id = d.id
LEFT JOIN positions p ON e.position_id = p.id
LEFT JOIN grades g ON e.grade_id = g.id
LEFT JOIN employees sup ON e.supervisor_id = sup.id;

-- Attendance Summary View
CREATE OR REPLACE VIEW v_attendance_daily_summary AS
SELECT 
    ar.date,
    COUNT(DISTINCT ar.employee_id) as total_employees,
    SUM(CASE WHEN ar.status = 'Present' THEN 1 ELSE 0 END) as present_count,
    SUM(CASE WHEN ar.status = 'Absent' THEN 1 ELSE 0 END) as absent_count,
    SUM(CASE WHEN ar.status = 'Late' THEN 1 ELSE 0 END) as late_count,
    SUM(ar.late_minutes) as total_late_minutes,
    SUM(ar.overtime_hours) as total_overtime_hours,
    AVG(ar.work_hours) as avg_work_hours
FROM attendance_records ar
GROUP BY ar.date;

-- Leave Balance View
CREATE OR REPLACE VIEW v_leave_balance_current AS
SELECT 
    e.employee_number,
    CONCAT(e.first_name, ' ', e.last_name) as employee_name,
    lt.name as leave_type,
    lb.year,
    lb.opening_balance,
    lb.accrued,
    lb.taken,
    lb.adjusted,
    lb.closing_balance as current_balance,
    lb.expires_at
FROM leave_balances lb
JOIN employees e ON lb.employee_id = e.id
JOIN leave_types lt ON lb.leave_type_id = lt.id
WHERE lb.year = YEAR(CURDATE());

-- Payroll Summary View
CREATE OR REPLACE VIEW v_payroll_period_summary AS
SELECT 
    pp.code as period_code,
    pp.name as period_name,
    pp.status,
    COUNT(pt.id) as employee_count,
    SUM(pt.basic_salary) as total_basic,
    SUM(pt.gross_salary) as total_gross,
    SUM(pt.earnings) as total_earnings,
    SUM(pt.deductions) as total_deductions,
    SUM(pt.net_salary) as total_net,
    pp.payment_date
FROM payroll_periods pp
LEFT JOIN payroll_transactions pt ON pp.id = pt.payroll_period_id
GROUP BY pp.id;
