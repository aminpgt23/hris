-- ============================================
-- HRIS System Enterprise — Idempotent Migration
-- ============================================
-- Based on production dump (payrol.sql)
-- Safe to run multiple times (INSERT IGNORE)
-- Run: mysql -u root -p hris_payroll_db < migration.sql
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;
SET UNIQUE_CHECKS = 0;
SET SESSION sql_mode = '';

USE hris_payroll_db;

-- ============================================
-- Clear all data (child tables first)
-- ============================================
DELETE FROM approval_history;
DELETE FROM approval_workflows;
DELETE FROM audit_logs;
DELETE FROM loan_installments;
DELETE FROM employee_loans;
DELETE FROM payroll_variable_items;
DELETE FROM pph21_calculations;
DELETE FROM compliance_reports;
DELETE FROM employee_salary_history;
DELETE FROM employee_salary_assignments;
DELETE FROM training_enrollments;
DELETE FROM training_sessions;
DELETE FROM training_programs;
DELETE FROM overtime_requests;
DELETE FROM schedules;
DELETE FROM leave_adjustments;
DELETE FROM leave_requests;
DELETE FROM leave_balances;
DELETE FROM attendance_records;
DELETE FROM employee_documents;
DELETE FROM employee_education;
DELETE FROM employee_work_experience;
DELETE FROM notifications;
DELETE FROM notification_templates;
DELETE FROM payroll_transactions;
DELETE FROM payroll_periods;
DELETE FROM bpjs_employment_config;
DELETE FROM bpjs_health_config;
DELETE FROM tax_rates;
DELETE FROM salary_components;
DELETE FROM asset_maintenance;
DELETE FROM assets;
DELETE FROM asset_categories;
DELETE FROM employee_dependents;
DELETE FROM holidays;
DELETE FROM shifts;
DELETE FROM leave_types;
DELETE FROM grades;
DELETE FROM positions;
DELETE FROM departments;
DELETE FROM branches;
DELETE FROM employees;
DELETE FROM users;
DELETE FROM roles;
DELETE FROM companies;

-- Reset auto-increment
ALTER TABLE companies AUTO_INCREMENT = 1;
ALTER TABLE branches AUTO_INCREMENT = 1;
ALTER TABLE departments AUTO_INCREMENT = 1;
ALTER TABLE positions AUTO_INCREMENT = 1;
ALTER TABLE grades AUTO_INCREMENT = 1;
ALTER TABLE roles AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE employees AUTO_INCREMENT = 1;
ALTER TABLE employee_dependents AUTO_INCREMENT = 1;
ALTER TABLE employee_documents AUTO_INCREMENT = 1;
ALTER TABLE employee_education AUTO_INCREMENT = 1;
ALTER TABLE employee_work_experience AUTO_INCREMENT = 1;
ALTER TABLE employee_salary_history AUTO_INCREMENT = 1;
ALTER TABLE employee_salary_assignments AUTO_INCREMENT = 1;
ALTER TABLE employee_loans AUTO_INCREMENT = 1;
ALTER TABLE loan_installments AUTO_INCREMENT = 1;
ALTER TABLE shifts AUTO_INCREMENT = 1;
ALTER TABLE holidays AUTO_INCREMENT = 1;
ALTER TABLE leave_types AUTO_INCREMENT = 1;
ALTER TABLE leave_balances AUTO_INCREMENT = 1;
ALTER TABLE leave_adjustments AUTO_INCREMENT = 1;
ALTER TABLE leave_requests AUTO_INCREMENT = 1;
ALTER TABLE salary_components AUTO_INCREMENT = 1;
ALTER TABLE payroll_periods AUTO_INCREMENT = 1;
ALTER TABLE payroll_transactions AUTO_INCREMENT = 1;
ALTER TABLE payroll_variable_items AUTO_INCREMENT = 1;
ALTER TABLE pph21_calculations AUTO_INCREMENT = 1;
ALTER TABLE bpjs_health_config AUTO_INCREMENT = 1;
ALTER TABLE bpjs_employment_config AUTO_INCREMENT = 1;
ALTER TABLE tax_rates AUTO_INCREMENT = 1;
ALTER TABLE asset_categories AUTO_INCREMENT = 1;
ALTER TABLE assets AUTO_INCREMENT = 1;
ALTER TABLE asset_maintenance AUTO_INCREMENT = 1;
ALTER TABLE training_programs AUTO_INCREMENT = 1;
ALTER TABLE training_sessions AUTO_INCREMENT = 1;
ALTER TABLE training_enrollments AUTO_INCREMENT = 1;
ALTER TABLE notifications AUTO_INCREMENT = 1;
ALTER TABLE notification_templates AUTO_INCREMENT = 1;
ALTER TABLE overtime_requests AUTO_INCREMENT = 1;
ALTER TABLE schedules AUTO_INCREMENT = 1;
ALTER TABLE attendance_records AUTO_INCREMENT = 1;
ALTER TABLE approval_workflows AUTO_INCREMENT = 1;
ALTER TABLE approval_history AUTO_INCREMENT = 1;
ALTER TABLE compliance_reports AUTO_INCREMENT = 1;
ALTER TABLE audit_logs AUTO_INCREMENT = 1;

-- ============================================
-- 1. COMPANIES
-- ============================================
INSERT IGNORE INTO companies (id, code, name, legal_name, tax_id, address, city, province, country, postal_code, phone, email, website, is_active) VALUES
(1, 'PTK', 'PT Karya Teknologi', 'PT Karya Teknologi Indonesia Tbk', '01.234.567.8-901.000', 'Jl. Sudirman No. 88', 'Jakarta', 'DKI Jakarta', 'Indonesia', '10210', '021-12345678', 'corp@karyatkn.co.id', NULL, TRUE),
(2, 'MDA', 'Mandiri Abadi', 'PT Mandiri Abadi Sejahtera', '02.345.678.9-012.000', 'Jl. Ahmad Yani No. 45', 'Bandung', 'Jawa Barat', 'Indonesia', '40112', '022-87654321', 'admin@mandiriabadi.co.id', NULL, TRUE);

-- ============================================
-- 2. BRANCHES
-- ============================================
INSERT IGNORE INTO branches (id, company_id, code, name, address, city, phone, email, is_active) VALUES
(1, 1, 'HQ', 'Headquarters', 'Jl. Sudirman No. 88', 'Jakarta', '021-12345678', 'hq@karyatkn.co.id', TRUE),
(2, 1, 'BDG', 'Bandung Branch', 'Jl. Raya Kopo No. 120', 'Bandung', '022-11122233', 'bdg@karyatkn.co.id', TRUE),
(3, 1, 'SBY', 'Surabaya Branch', 'Jl. Tunjungan No. 55', 'Surabaya', '031-44455566', 'sby@karyatkn.co.id', TRUE),
(4, 2, 'BDG', 'Bandung Office', 'Jl. Ahmad Yani No. 45', 'Bandung', '022-87654321', 'office@mandiriabadi.co.id', TRUE);

-- ============================================
-- 3. DEPARTMENTS
-- ============================================
INSERT IGNORE INTO departments (id, company_id, parent_id, code, name, description, cost_center, is_active) VALUES
(1, 1, NULL, 'DIR', 'Directorate', 'Board of Directors', 'CC-001', TRUE),
(2, 1, 1, 'ENG', 'Engineering', 'Software Engineering & IT', 'CC-010', TRUE),
(3, 1, 1, 'MKT', 'Marketing', 'Marketing & Communications', 'CC-020', TRUE),
(4, 1, 1, 'FIN', 'Finance', 'Finance & Accounting', 'CC-030', TRUE),
(5, 1, 1, 'HRD', 'Human Resources', 'HR & People Operations', 'CC-040', TRUE),
(6, 1, 1, 'OPS', 'Operations', 'Business Operations', 'CC-050', TRUE),
(7, 1, 1, 'SLS', 'Sales', 'Sales & Business Development', 'CC-060', TRUE),
(8, 2, NULL, 'DIR', 'Directorate', 'Board of Directors', 'CC-MDA-001', TRUE),
(9, 2, 8, 'FIN', 'Finance', 'Finance & Accounting', 'CC-MDA-030', TRUE),
(10, 2, 8, 'HRD', 'Human Resources', 'HR & People Operations', 'CC-MDA-040', TRUE);

-- ============================================
-- 4. POSITIONS
-- ============================================
INSERT IGNORE INTO positions (id, company_id, department_id, code, name, level, min_salary, max_salary, is_active) VALUES
(1, 1, 1, 'DIR-CEO', 'Chief Executive Officer', 10, 100000000, 200000000, TRUE),
(2, 1, 1, 'DIR-CTO', 'Chief Technology Officer', 9, 80000000, 150000000, TRUE),
(3, 1, 2, 'MGR-ENG', 'Engineering Manager', 7, 40000000, 70000000, TRUE),
(4, 1, 2, 'SR-DEV', 'Senior Developer', 5, 25000000, 45000000, TRUE),
(5, 1, 2, 'DEV', 'Developer', 3, 12000000, 25000000, TRUE),
(6, 1, 2, 'JR-DEV', 'Junior Developer', 2, 8000000, 15000000, TRUE),
(7, 1, 3, 'MGR-MKT', 'Marketing Manager', 6, 30000000, 55000000, TRUE),
(8, 1, 4, 'MGR-FIN', 'Finance Manager', 6, 30000000, 55000000, TRUE),
(9, 1, 4, 'ACC', 'Accountant', 3, 10000000, 20000000, TRUE),
(10, 1, 5, 'MGR-HR', 'HR Manager', 6, 30000000, 55000000, TRUE),
(11, 1, 5, 'HRC', 'HR Coordinator', 3, 10000000, 20000000, TRUE),
(12, 1, 7, 'MGR-SLS', 'Sales Manager', 6, 30000000, 55000000, TRUE),
(13, 1, 7, 'SALES', 'Sales Executive', 3, 10000000, 20000000, TRUE),
(14, 1, 6, 'MGR-OPS', 'Operations Manager', 6, 30000000, 55000000, TRUE);

-- ============================================
-- 5. GRADES
-- ============================================
INSERT IGNORE INTO grades (id, company_id, code, name, level, min_salary, mid_salary, max_salary, allowance_percentage) VALUES
(1, 1, 'GRD-A', 'Grade A - Executive', 10, 80000000, 120000000, 200000000, 25.00),
(2, 1, 'GRD-B', 'Grade B - Senior Management', 7, 30000000, 50000000, 80000000, 20.00),
(3, 1, 'GRD-C', 'Grade C - Mid Level', 4, 12000000, 20000000, 35000000, 15.00),
(4, 1, 'GRD-D', 'Grade D - Entry Level', 1, 6000000, 10000000, 15000000, 10.00);

-- ============================================
-- 6. ROLES
-- ============================================
INSERT IGNORE INTO roles (id, name, display_name, description, permissions, is_system_role) VALUES
(1, 'Administrator', 'System Administrator', 'Full system access', '["all"]', TRUE),
(2, 'HR Staff', 'HR Staff', 'HR operations and employee management', '["view_employees","edit_employees","view_attendance","edit_attendance","view_leave","approve_leave","view_payroll","edit_payroll"]', TRUE),
(3, 'Manager', 'Manager', 'Department manager with approval rights', '["view_employees","view_attendance","approve_attendance","view_leave","approve_leave","view_payroll_own_dept"]', TRUE),
(4, 'Employee', 'Employee', 'Basic employee self-service access', '["view_profile","edit_profile","view_attendance_own","apply_leave","view_leave_own","view_payslip"]', TRUE),
(5, 'Finance', 'Finance/Payroll', 'Payroll processing and finance', '["view_employees","view_payroll","edit_payroll","approve_payroll","view_compliance","export_payroll"]', TRUE),
(6, 'Director', 'Director', 'Executive access with full approvals', '["view_all","approve_payroll","approve_high_value"]', TRUE);

-- ============================================
-- 7. USERS
-- ============================================
-- employee_id matches payrol.sql production mapping:
-- hrstaff→Maya(8), manager→Ahmad(3), employee→Rudi(5),
-- finance→Hendra(9), director→Budi(1), admin→no employee link
INSERT IGNORE INTO users (id, employee_id, role_id, username, password_hash, email, phone, is_active) VALUES
(1, NULL, 1, 'admin', '$2b$10$9s4Bn0bZkZSEqfcJERs.p.Q864jTrF3z63w8GtDDg3BPwq51D3ivy', 'admin@hris.com', NULL, TRUE),
(2, 8, 2, 'hrstaff', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'hr@hris.com', '081234567891', TRUE),
(3, 3, 3, 'manager', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'manager@hris.com', '081234567892', TRUE),
(4, 5, 4, 'employee', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'employee@hris.com', '081234567893', TRUE),
(5, 9, 5, 'finance', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'finance@hris.com', '081234567894', TRUE),
(6, 1, 6, 'director', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'director@hris.com', '081234567895', TRUE);

-- ============================================
-- 8. EMPLOYEES
-- ============================================
INSERT IGNORE INTO employees (id, company_id, branch_id, employee_number, first_name, last_name, gender, date_of_birth, religion, marital_status, id_card_number, npwp, bpjs_health_number, bpjs_employment_number, position_id, department_id, grade_id, employment_status, hire_date, email_company, phone_personal, bank_name, bank_account_number, bank_account_name, supervisor_id, is_active) VALUES
(1, 1, 1, 'EMP001', 'Budi', 'Santoso', 'M', '1975-03-15', 'Islam', 'Married', '3174011503750001', '01.234.567.8-901.000', 'BPJS-K-001', 'BPJS-T-001', 1, 1, 1, 'Permanent', '2020-01-01', 'budi.santoso@karyatkn.co.id', '081234567801', 'BCA', '1234567890', 'Budi Santoso', NULL, TRUE),
(2, 1, 1, 'EMP002', 'Siti', 'Rahmawati', 'F', '1980-07-22', 'Islam', 'Married', '3174022207800002', '02.345.678.9-012.000', 'BPJS-K-002', 'BPJS-T-002', 2, 2, 1, 'Permanent', '2020-06-01', 'siti.rahmawati@karyatkn.co.id', '081234567802', 'BCA', '1234567891', 'Siti Rahmawati', 1, TRUE),
(3, 1, 1, 'EMP003', 'Ahmad', 'Fauzi', 'M', '1985-11-08', 'Islam', 'Married', '317408118500003', '03.456.789.0-123.000', 'BPJS-K-003', 'BPJS-T-003', 3, 2, 2, 'Permanent', '2021-03-15', 'ahmad.fauzi@karyatkn.co.id', '081234567803', 'Mandiri', '1234567892', 'Ahmad Fauzi', 2, TRUE),
(4, 1, 2, 'EMP004', 'Dewi', 'Kusuma', 'F', '1990-05-12', 'Kristen', 'Married', '3274051205900004', '04.567.890.1-234.000', 'BPJS-K-004', 'BPJS-T-004', 4, 2, 3, 'Permanent', '2021-07-01', 'dewi.kusuma@karyatkn.co.id', '081234567804', 'BNI', '1234567893', 'Dewi Kusuma', 3, TRUE),
(5, 1, 1, 'EMP005', 'Rudi', 'Hartono', 'M', '1992-09-30', 'Islam', 'Single', '3174093009920005', '05.678.901.2-345.000', 'BPJS-K-005', 'BPJS-T-005', 5, 2, 3, 'Permanent', '2022-01-10', 'rudi.hartono@karyatkn.co.id', '081234567805', 'BCA', '1234567894', 'Rudi Hartono', 4, TRUE),
(6, 1, 3, 'EMP006', 'Rina', 'Fitriani', 'F', '1994-12-20', 'Islam', 'Single', '3578062012940006', '06.789.012.3-456.000', 'BPJS-K-006', 'BPJS-T-006', 5, 2, 3, 'Permanent', '2022-06-15', 'rina.fitriani@karyatkn.co.id', '081234567806', 'BRI', '1234567895', 'Rina Fitriani', 4, TRUE),
(7, 1, 1, 'EMP007', 'Agus', 'Prasetyo', 'M', '1996-04-18', 'Islam', 'Single', '3174011804960007', '07.890.123.4-567.000', 'BPJS-K-007', 'BPJS-T-007', 6, 2, 4, 'Probation', '2025-01-15', 'agus.prasetyo@karyatkn.co.id', '081234567807', 'Mandiri', '1234567896', 'Agus Prasetyo', 4, TRUE),
(8, 1, 1, 'EMP008', 'Maya', 'Anggraini', 'F', '1988-08-25', 'Hindu', 'Married', '3174022508880008', '08.901.234.5-678.000', 'BPJS-K-008', 'BPJS-T-008', 7, 3, 2, 'Permanent', '2021-02-01', 'maya.anggraini@karyatkn.co.id', '081234567808', 'BCA', '1234567897', 'Maya Anggraini', 1, TRUE),
(9, 1, 1, 'EMP009', 'Hendra', 'Gunawan', 'M', '1983-06-14', 'Kristen', 'Married', '3174011406830009', '09.012.345.6-789.000', 'BPJS-K-009', 'BPJS-T-009', 8, 4, 2, 'Permanent', '2020-08-01', 'hendra.gunawan@karyatkn.co.id', '081234567809', 'BNI', '1234567898', 'Hendra Gunawan', 1, TRUE),
(10, 1, 1, 'EMP010', 'Lina', 'Wati', 'F', '1991-03-05', 'Islam', 'Married', '3174030503910010', '10.123.456.7-890.000', 'BPJS-K-010', 'BPJS-T-010', 9, 4, 3, 'Permanent', '2022-09-01', 'lina.wati@karyatkn.co.id', '081234567810', 'BRI', '1234567899', 'Lina Wati', 9, TRUE),
(11, 1, 1, 'EMP011', 'Dian', 'Permata', 'F', '1986-10-20', 'Islam', 'Married', '3174022010860011', '11.234.567.8-901.000', 'BPJS-K-011', 'BPJS-T-011', 10, 5, 2, 'Permanent', '2021-05-15', 'dian.permata@karyatkn.co.id', '081234567811', 'BCA', '1234567900', 'Dian Permata', 1, TRUE),
(12, 1, 1, 'EMP012', 'Fajar', 'Nugroho', 'M', '1993-02-28', 'Islam', 'Single', '3174022802930012', '12.345.678.9-012.000', 'BPJS-K-012', 'BPJS-T-012', 11, 5, 3, 'Permanent', '2023-01-01', 'fajar.nugroho@karyatkn.co.id', '081234567812', 'Mandiri', '1234567901', 'Fajar Nugroho', 11, TRUE),
(13, 1, 1, 'EMP013', 'Tina', 'Susanti', 'F', '1995-07-15', 'Islam', 'Single', '3174011507950013', '13.456.789.0-123.000', 'BPJS-K-013', 'BPJS-T-013', 12, 7, 2, 'Permanent', '2023-06-01', 'tina.susanti@karyatkn.co.id', '081234567813', 'BNI', '1234567902', 'Tina Susanti', 1, TRUE),
(14, 1, 1, 'EMP014', 'Bayu', 'Pamungkas', 'M', '1997-11-08', 'Islam', 'Single', '3174010811970014', '14.567.890.1-234.000', 'BPJS-K-014', 'BPJS-T-014', 13, 7, 4, 'Contract', '2024-07-01', 'bayu.pamungkas@karyatkn.co.id', '081234567814', 'BRI', '1234567903', 'Bayu Pamungkas', 13, TRUE),
(15, 1, 1, 'EMP015', 'Indah', 'Pertiwi', 'F', '1990-01-25', 'Islam', 'Married', '3174012501900015', '15.678.901.2-345.000', 'BPJS-K-015', 'BPJS-T-015', 14, 6, 2, 'Permanent', '2022-03-01', 'indah.pertiwi@karyatkn.co.id', '081234567815', 'BCA', '1234567904', 'Indah Pertiwi', 1, TRUE),
(16, 1, 2, 'EMP016', 'Rizky', 'Ramadhan', 'M', '1998-05-20', 'Islam', 'Single', '3274052005980016', '16.789.012.3-456.000', 'BPJS-K-016', 'BPJS-T-016', 5, 2, 3, 'Permanent', '2024-01-10', 'rizky.ramadhan@karyatkn.co.id', '081234567816', 'Mandiri', '1234567905', 'Rizky Ramadhan', 4, TRUE),
(17, 1, 1, 'EMP017', 'Sari', 'Puspita', 'F', '1989-09-12', 'Islam', 'Married', '3174011209890017', '17.890.123.4-567.000', 'BPJS-K-017', 'BPJS-T-017', 5, 2, 3, 'Permanent', '2022-11-01', 'sari.puspita@karyatkn.co.id', '081234567817', 'BCA', '1234567906', 'Sari Puspita', 4, TRUE),
(18, 1, 3, 'EMP018', 'Doni', 'Lesmana', 'M', '1994-12-01', 'Kristen', 'Single', '3578010112940018', '18.901.234.5-678.000', 'BPJS-K-018', 'BPJS-T-018', 6, 2, 4, 'Contract', '2024-06-01', 'doni.lesmana@karyatkn.co.id', '081234567818', 'BRI', '1234567907', 'Doni Lesmana', 4, TRUE),
(19, 1, 1, 'EMP019', 'Nina', 'Zahra', 'F', '1999-04-03', 'Islam', 'Single', '3174010304990019', '19.012.345.6-789.000', 'BPJS-K-019', 'BPJS-T-019', 6, 2, 4, 'Probation', '2025-02-01', 'nina.zahra@karyatkn.co.id', '081234567819', 'Mandiri', '1234567908', 'Nina Zahra', 4, TRUE),
(20, 1, 1, 'EMP020', 'Eko', 'Wahyudi', 'M', '1987-06-30', 'Islam', 'Married', '3174013006870020', '20.123.456.7-890.000', 'BPJS-K-020', 'BPJS-T-020', 13, 7, 3, 'Permanent', '2023-09-01', 'eko.wahyudi@karyatkn.co.id', '081234567820', 'BNI', '1234567909', 'Eko Wahyudi', 13, TRUE);

-- ============================================
-- 9. EMPLOYEE DEPENDENTS
-- ============================================
INSERT IGNORE INTO employee_dependents (employee_id, name, relationship, date_of_birth, gender, is_covered_bpjs) VALUES
(1, 'Sari Santoso', 'Spouse', '1980-05-10', 'F', TRUE),
(1, 'Adi Santoso', 'Child', '2010-08-15', 'M', TRUE),
(1, 'Ani Santoso', 'Child', '2013-12-20', 'F', TRUE),
(2, 'Rizki Rahmawati', 'Spouse', '1983-11-22', 'M', TRUE),
(2, 'Naura Rahmawati', 'Child', '2015-03-10', 'F', TRUE),
(3, 'Nurul Fauzi', 'Spouse', '1988-05-18', 'F', TRUE),
(3, 'Rafi Fauzi', 'Child', '2016-09-25', 'M', TRUE),
(8, 'Aditya Anggraini', 'Spouse', '1985-12-01', 'M', TRUE),
(8, 'Kinan Anggraini', 'Child', '2017-07-14', 'F', TRUE),
(9, 'Rina Gunawan', 'Spouse', '1986-04-08', 'F', TRUE),
(9, 'Bima Gunawan', 'Child', '2018-01-20', 'M', TRUE);

-- ============================================
-- 10. SHIFTS
-- ============================================
INSERT IGNORE INTO shifts (id, company_id, code, name, start_time, end_time, break_start, break_end, break_duration_minutes, work_hours, color_code, is_active) VALUES
(1, 1, 'SHF-MRN', 'Morning Shift', '08:00:00', '17:00:00', '12:00:00', '13:00:00', 60, 8.0, '#2F4B7C', TRUE),
(2, 1, 'SHF-AFT', 'Afternoon Shift', '13:00:00', '22:00:00', '18:00:00', '19:00:00', 60, 8.0, '#C08552', TRUE),
(3, 1, 'SHF-NGT', 'Night Shift', '22:00:00', '07:00:00', '02:00:00', '03:00:00', 60, 8.0, '#4E8B6F', TRUE),
(4, 1, 'SHF-FLX', 'Flexible', '08:00:00', '17:00:00', '12:00:00', '13:00:00', 60, 8.0, '#4A7BB5', TRUE);

-- ============================================
-- 11. HOLIDAYS
-- ============================================
INSERT IGNORE INTO holidays (id, company_id, name, date, type, is_paid) VALUES
(1, 1, 'Tahun Baru 2026', '2026-01-01', 'National', TRUE),
(2, 1, 'Tahun Baru Imlek 2577', '2026-02-17', 'National', TRUE),
(3, 1, 'Hari Raya Nyepi', '2026-03-29', 'National', TRUE),
(4, 1, 'Idul Fitri 1447 H', '2026-04-01', 'National', TRUE),
(5, 1, 'Idul Fitri 1447 H (Hari 2)', '2026-04-02', 'National', TRUE),
(6, 1, 'Hari Buruh', '2026-05-01', 'National', TRUE),
(7, 1, 'Kenaikan Yesus Kristus', '2026-05-21', 'National', TRUE),
(8, 1, 'Hari Lahir Pancasila', '2026-06-01', 'National', TRUE),
(9, 1, 'Idul Adha 1447 H', '2026-06-08', 'National', TRUE),
(10, 1, 'Tahun Baru Islam 1448 H', '2026-06-28', 'National', TRUE),
(11, 1, 'Hari Kemerdekaan', '2026-08-17', 'National', TRUE),
(12, 1, 'Maulid Nabi Muhammad SAW', '2026-09-05', 'National', TRUE),
(13, 1, 'Natal', '2026-12-25', 'National', TRUE);

-- ============================================
-- 12. LEAVE TYPES
-- ============================================
INSERT IGNORE INTO leave_types (id, company_id, code, name, type, default_days_per_year, max_days_per_request, requires_document, is_paid, accrual_type, color_code, is_active) VALUES
(1, 1, 'ANNUAL', 'Annual Leave', 'Annual', 12, 5, FALSE, TRUE, 'Yearly', '#2F4B7C', TRUE),
(2, 1, 'SICK', 'Sick Leave', 'Sick', 14, 7, TRUE, TRUE, 'Yearly', '#4E8B6F', TRUE),
(3, 1, 'MATERNITY', 'Maternity Leave', 'Maternity', 90, 90, TRUE, TRUE, 'Yearly', '#C08552', TRUE),
(4, 1, 'UNPAID', 'Unpaid Leave', 'Unpaid', 30, 10, FALSE, FALSE, 'Yearly', '#B54B4B', TRUE),
(5, 1, 'COMPASSIONATE', 'Compassionate Leave', 'Compassionate', 3, 3, FALSE, TRUE, 'Yearly', '#5D6675', TRUE);

-- ============================================
-- 13. LEAVE BALANCES
-- ============================================
INSERT IGNORE INTO leave_balances (employee_id, leave_type_id, year, opening_balance, accrued, taken, adjusted, closing_balance) VALUES
(1, 1, 2026, 12, 0, 3, 0, 9), (2, 1, 2026, 12, 0, 2, 0, 10), (3, 1, 2026, 12, 0, 5, 0, 7),
(4, 1, 2026, 12, 0, 1, 0, 11), (5, 1, 2026, 12, 0, 4, 0, 8), (6, 1, 2026, 12, 0, 2, 0, 10),
(7, 1, 2026, 12, 0, 0, 0, 12), (8, 1, 2026, 12, 0, 3, 0, 9), (9, 1, 2026, 12, 0, 1, 0, 11),
(10, 1, 2026, 12, 0, 2, 0, 10), (11, 1, 2026, 12, 0, 0, 0, 12), (12, 1, 2026, 12, 0, 3, 0, 9),
(13, 1, 2026, 12, 0, 4, 0, 8), (14, 1, 2026, 12, 0, 1, 0, 11), (15, 1, 2026, 12, 0, 2, 0, 10);

-- ============================================
-- 14. SALARY COMPONENTS
-- ============================================
INSERT IGNORE INTO salary_components (id, company_id, code, name, type, category, calculation_type, is_taxable, is_pensionable, sequence_order, is_active) VALUES
(1, 1, 'BASIC', 'Basic Salary', 'Earning', 'Fixed', 'Fixed Amount', TRUE, TRUE, 1, TRUE),
(2, 1, 'TRANSPORT', 'Transport Allowance', 'Earning', 'Fixed', 'Fixed Amount', FALSE, FALSE, 2, TRUE),
(3, 1, 'MEAL', 'Meal Allowance', 'Earning', 'Fixed', 'Fixed Amount', FALSE, FALSE, 3, TRUE),
(4, 1, 'HEALTH', 'BPJS Kesehatan', 'Deduction', 'BPJS', 'Percentage of Basic', FALSE, FALSE, 10, TRUE),
(5, 1, 'JHT', 'BPJS JHT', 'Deduction', 'BPJS', 'Percentage of Basic', FALSE, TRUE, 11, TRUE),
(6, 1, 'JP', 'BPJS JP', 'Deduction', 'BPJS', 'Percentage of Basic', FALSE, TRUE, 12, TRUE),
(7, 1, 'PENSION', 'Pension Contribution', 'Deduction', 'Tax', 'Percentage of Basic', FALSE, TRUE, 13, TRUE),
(8, 1, 'PPH21', 'PPh 21 Income Tax', 'Tax', 'Tax', 'Tiered', FALSE, FALSE, 14, TRUE),
(9, 1, 'OVERTIME', 'Overtime Pay', 'Earning', 'Variable', 'Formula', TRUE, FALSE, 4, TRUE),
(10, 1, 'BONUS', 'Bonus', 'Earning', 'Variable', 'Fixed Amount', TRUE, FALSE, 5, TRUE);

-- ============================================
-- 15. NOTIFICATION TEMPLATES
-- ============================================
INSERT IGNORE INTO notification_templates (id, code, name, channel, subject_template, body_template, variables, is_active) VALUES
(1, 'LEAVE_REQUEST', 'Leave Request Submission', 'Email',
 'Leave Request: {employee_name}',
 'Dear {approver_name},\n\n{employee_name} has submitted a leave request:\nType: {leave_type}\nDates: {start_date} to {end_date}\nReason: {reason}\n\nPlease review and approve/reject.',
 '["employee_name", "approver_name", "leave_type", "start_date", "end_date", "reason"]', TRUE),
(2, 'LEAVE_APPROVED', 'Leave Request Approved', 'Email',
 'Leave Request Approved',
 'Dear {employee_name},\n\nYour leave request has been approved.\nType: {leave_type}\nDates: {start_date} to {end_date}\n\nThank you.',
 '["employee_name", "leave_type", "start_date", "end_date"]', TRUE),
(3, 'PAYROLL_CREATED', 'Payslip Available', 'Email',
 'Payslip Available - {period_name}',
 'Dear {employee_name},\n\nYour payslip for {period_name} is now available.\nNet Salary: {net_salary}\n\nPlease login to view details.',
 '["employee_name", "period_name", "net_salary"]', TRUE);

-- ============================================
-- 16. ASSET CATEGORIES
-- ============================================
INSERT IGNORE INTO asset_categories (id, company_id, code, name, depreciation_method, useful_life_years, is_depreciable, is_active) VALUES
(1, 1, 'IT-EQP', 'IT Equipment', 'Straight Line', 4, TRUE, TRUE),
(2, 1, 'FURN', 'Furniture', 'Straight Line', 5, TRUE, TRUE),
(3, 1, 'VEH', 'Vehicle', 'Declining Balance', 8, TRUE, TRUE),
(4, 1, 'ELEC', 'Electronics', 'Straight Line', 3, TRUE, TRUE),
(5, 1, 'SOFT', 'Software License', 'Straight Line', 1, TRUE, TRUE);

-- ============================================
-- 17. ASSETS
-- ============================================
INSERT IGNORE INTO assets (id, company_id, asset_category_id, asset_number, name, description, serial_number, purchase_date, purchase_cost, vendor_name, location, `condition`, assigned_to_employee_id, assigned_date, is_active) VALUES
(1, 1, 1, 'AST-IT-001', 'Laptop Dell Latitude 5440', 'Developer laptop - i7/16GB/512GB', 'SN-DELL-001', '2025-01-15', 18500000, 'PT Techno Jaya', 'Jakarta HQ', 'Good', 4, '2025-01-20', TRUE),
(2, 1, 1, 'AST-IT-002', 'Laptop Dell Latitude 5440', 'Developer laptop - i7/16GB/512GB', 'SN-DELL-002', '2025-01-15', 18500000, 'PT Techno Jaya', 'Jakarta HQ', 'Good', 5, '2025-01-20', TRUE),
(3, 1, 1, 'AST-IT-003', 'Monitor Dell 27-inch', 'External monitor', 'SN-MON-001', '2025-02-01', 4500000, 'PT Techno Jaya', 'Jakarta HQ', 'Good', 4, '2025-02-05', TRUE),
(4, 1, 2, 'AST-FRN-001', 'Standing Desk', 'Adjustable standing desk', 'SN-DSK-001', '2024-06-01', 8500000, 'PT Furniture Indah', 'Jakarta HQ', 'Good', NULL, NULL, TRUE),
(5, 1, 4, 'AST-ELC-001', 'Projector Epson', 'Meeting room projector', 'SN-PRJ-001', '2024-03-01', 12000000, 'PT Elektronik Jaya', 'Jakarta HQ', 'Good', NULL, NULL, TRUE),
(6, 1, 3, 'AST-VEH-001', 'Toyota Innova', 'Company car - 2024', 'SN-VEH-001', '2024-01-15', 450000000, 'PT Toyota Astra', 'Jakarta HQ', 'Good', 1, '2024-02-01', TRUE),
(7, 1, 1, 'AST-IT-004', 'MacBook Pro M3', 'Designer laptop', 'SN-MBP-001', '2025-06-01', 32000000, 'PT Apple Indosystem', 'Jakarta HQ', 'New', NULL, NULL, TRUE),
(8, 1, 5, 'AST-SFT-001', 'Microsoft 365 Business', 'Annual license - 50 users', 'LIC-M365-2025', '2025-01-01', 15000000, 'PT Microsoft Indonesia', 'Jakarta HQ', 'New', NULL, NULL, TRUE);

-- ============================================
-- 18. TRAINING PROGRAMS
-- ============================================
INSERT IGNORE INTO training_programs (id, company_id, code, title, description, category, type, duration_hours, cost_estimate, is_active) VALUES
(1, 1, 'TRN-LD-001', 'Leadership Development Program', 'Develop leadership skills for mid-level managers', 'Leadership', 'Workshop', 32, 25000000, TRUE),
(2, 1, 'TRN-TECH-001', 'React & TypeScript Advanced', 'Advanced frontend development patterns', 'Technical', 'Internal', 16, 5000000, TRUE),
(3, 1, 'TRN-FIN-001', 'Financial Analysis & Reporting', 'Advanced financial analysis techniques', 'Finance', 'External', 24, 15000000, TRUE),
(4, 1, 'TRN-SAFETY-001', 'Workplace Safety & Compliance', 'Safety regulations and compliance training', 'Compliance', 'Online', 8, 2000000, TRUE),
(5, 1, 'TRN-SALES-001', 'Sales Excellence Program', 'Advanced sales techniques and negotiation', 'Sales', 'Workshop', 24, 18000000, TRUE),
(6, 1, 'TRN-BPJS-001', 'BPJS & Tax Compliance 2026', 'Update on BPJS and tax regulations', 'Compliance', 'Seminar', 4, 3000000, TRUE);

-- ============================================
-- 19. TRAINING SESSIONS
-- ============================================
INSERT IGNORE INTO training_sessions (id, training_program_id, session_code, title, trainer_name, venue, start_datetime, end_datetime, max_participants, enrolled_count, status) VALUES
(1, 1, 'SES-LD-2026-Q3', 'Leadership Q3 2026', 'Dr. John Maxwell', 'Hotel Borobudur Jakarta', '2026-08-15 09:00:00', '2026-08-19 17:00:00', 20, 12, 'Open'),
(2, 2, 'SES-REACT-2026-07', 'React Advanced July 2026', 'Internal Trainer', 'Training Room A - HQ', '2026-07-20 09:00:00', '2026-07-21 17:00:00', 15, 15, 'Full'),
(3, 3, 'SES-FIN-2026-08', 'Financial Analysis August', 'CFA Society Indonesia', 'Hotel Santika Premiere', '2026-08-10 08:00:00', '2026-08-14 17:00:00', 15, 8, 'Open'),
(4, 4, 'SES-SAFE-2026-ONL', 'Safety Compliance Online Q3', 'Safety Expert Online', 'Online - Zoom', '2026-07-01 08:00:00', '2026-07-31 17:00:00', 100, 45, 'InProgress'),
(5, 5, 'SES-SLS-2026-09', 'Sales Excellence September', 'Brian Tracy International', 'Hotel Aryaduta Jakarta', '2026-09-05 09:00:00', '2026-09-09 17:00:00', 20, 5, 'Open'),
(6, 6, 'SES-BPJS-2026-SEM', 'BPJS Tax Seminar H2 2026', 'DJP Consultant', 'Training Room B - HQ', '2026-08-25 09:00:00', '2026-08-25 16:00:00', 30, 10, 'Open');

-- ============================================
-- 20. PAYROLL PERIODS
-- ============================================
INSERT IGNORE INTO payroll_periods (id, company_id, code, name, period_type, payment_day, cutoff_day, fiscal_year, period_number, start_date, end_date, payment_date, status) VALUES
(1, 1, 'PP-2026-01', 'January 2026', 'Monthly', 25, 20, 2026, 1, '2026-01-01', '2026-01-31', '2026-01-25', 'Closed'),
(2, 1, 'PP-2026-02', 'February 2026', 'Monthly', 25, 20, 2026, 2, '2026-02-01', '2026-02-28', '2026-02-25', 'Closed'),
(3, 1, 'PP-2026-03', 'March 2026', 'Monthly', 25, 20, 2026, 3, '2026-03-01', '2026-03-31', '2026-03-25', 'Closed'),
(4, 1, 'PP-2026-04', 'April 2026', 'Monthly', 25, 20, 2026, 4, '2026-04-01', '2026-04-30', '2026-04-25', 'Closed'),
(5, 1, 'PP-2026-05', 'May 2026', 'Monthly', 25, 20, 2026, 5, '2026-05-01', '2026-05-31', '2026-05-25', 'Closed'),
(6, 1, 'PP-2026-06', 'June 2026', 'Monthly', 25, 20, 2026, 6, '2026-06-01', '2026-06-30', '2026-06-25', 'Paid'),
(7, 1, 'PP-2026-07', 'July 2026', 'Monthly', 25, 20, 2026, 7, '2026-07-01', '2026-07-31', '2026-07-25', 'Draft');

-- ============================================
-- 21. PAYROLL TRANSACTIONS
-- ============================================
INSERT IGNORE INTO payroll_transactions (payroll_period_id, employee_id, employee_number, employee_name, department_id, position_id, working_days, present_days, basic_salary, gross_salary, earnings, deductions, bpjs_health_employee, bpjs_employment_employee, net_salary, payment_status) VALUES
(6, 1, 'EMP001', 'Budi Santoso', 1, 1, 22, 21, 100000000, 125000000, '{"Basic Salary":100000000,"Transport":2000000,"Meal":1500000,"Overtime":4500000}', '{"BPJS Kesehatan":1000000,"BPJS JHT":2000000,"BPJS JP":500000,"Pension":1000000,"PPh 21":8500000}', 1000000, 2500000, 113000000, 'Paid'),
(6, 3, 'EMP003', 'Ahmad Fauzi', 2, 3, 22, 20, 45000000, 54000000, '{"Basic Salary":45000000,"Transport":1500000,"Meal":1000000,"Overtime":3000000}', '{"BPJS Kesehatan":450000,"BPJS JHT":900000,"BPJS JP":225000,"Pension":450000,"PPh 21":3200000}', 450000, 1125000, 49000000, 'Paid'),
(6, 4, 'EMP004', 'Dewi Kusuma', 2, 4, 22, 22, 25000000, 29500000, '{"Basic Salary":25000000,"Transport":750000,"Meal":750000,"Overtime":1500000}', '{"BPJS Kesehatan":250000,"BPJS JHT":500000,"BPJS JP":125000,"Pension":250000,"PPh 21":1500000}', 250000, 625000, 27000000, 'Paid'),
(6, 5, 'EMP005', 'Rudi Hartono', 2, 5, 22, 20, 15000000, 17250000, '{"Basic Salary":15000000,"Transport":500000,"Meal":750000,"Overtime":1000000}', '{"BPJS Kesehatan":150000,"BPJS JHT":300000,"BPJS JP":75000,"Pension":150000,"PPh 21":750000}', 150000, 375000, 15900000, 'Paid'),
(6, 8, 'EMP008', 'Maya Anggraini', 3, 7, 22, 21, 35000000, 41000000, '{"Basic Salary":35000000,"Transport":1500000,"Meal":1000000,"Overtime":2000000}', '{"BPJS Kesehatan":350000,"BPJS JHT":700000,"BPJS JP":175000,"Pension":350000,"PPh 21":2500000}', 350000, 875000, 37500000, 'Paid'),
(6, 9, 'EMP009', 'Hendra Gunawan', 4, 8, 22, 22, 35000000, 40000000, '{"Basic Salary":35000000,"Transport":1500000,"Meal":1000000,"Overtime":1500000}', '{"BPJS Kesehatan":350000,"BPJS JHT":700000,"BPJS JP":175000,"Pension":350000,"PPh 21":2000000}', 350000, 875000, 37000000, 'Paid'),
(6, 11, 'EMP011', 'Dian Permata', 5, 10, 22, 21, 35000000, 40500000, '{"Basic Salary":35000000,"Transport":1500000,"Meal":1000000,"Overtime":2000000}', '{"BPJS Kesehatan":350000,"BPJS JHT":700000,"BPJS JP":175000,"Pension":350000,"PPh 21":2000000}', 350000, 875000, 37600000, 'Paid'),
(6, 15, 'EMP015', 'Indah Pertiwi', 6, 14, 22, 22, 30000000, 35500000, '{"Basic Salary":30000000,"Transport":1500000,"Meal":1000000,"Overtime":2000000}', '{"BPJS Kesehatan":300000,"BPJS JHT":600000,"BPJS JP":150000,"Pension":300000,"PPh 21":1700000}', 300000, 750000, 32800000, 'Paid');

-- ============================================
-- 22. BPJS CONFIG
-- ============================================
INSERT IGNORE INTO bpjs_health_config (id, company_id, year, employee_percentage, employer_percentage, min_base_salary, max_base_salary, is_active, effective_from) VALUES
(1, 1, 2026, 1.00, 4.00, 1000000, 12000000, TRUE, '2026-01-01');

INSERT IGNORE INTO bpjs_employment_config (id, company_id, year, jht_employee_percentage, jht_employer_percentage, jp_employee_percentage, jp_employer_percentage, jkk_percentage, jkm_percentage, min_base_salary, max_base_salary, is_active, effective_from) VALUES
(1, 1, 2026, 2.00, 3.70, 1.00, 2.00, 0.24, 0.30, 1000000, 14000000, TRUE, '2026-01-01');

-- ============================================
-- 23. TAX RATES
-- ============================================
INSERT IGNORE INTO tax_rates (id, year, layer_number, min_income, max_income, tax_rate, is_active) VALUES
(1, 2026, 1, 0, 60000000, 5.00, TRUE),
(2, 2026, 2, 60000000, 250000000, 15.00, TRUE),
(3, 2026, 3, 250000000, 500000000, 25.00, TRUE),
(4, 2026, 4, 500000000, 5000000000, 30.00, TRUE),
(5, 2026, 5, 5000000000, 999999999999, 35.00, TRUE);

-- ============================================
-- 24. NOTIFICATIONS
-- ============================================
INSERT IGNORE INTO notifications (user_id, notification_type, title, message, channel, priority, status, created_at) VALUES
(1, 'leave', 'Leave Request', 'Rudi Hartono submitted a leave request', 'In-App', 'Normal', 'Delivered', '2026-07-15 09:00:00'),
(1, 'payroll', 'Payroll Ready', 'Payroll for June 2026 is ready for approval', 'In-App', 'High', 'Delivered', '2026-07-14 08:00:00'),
(1, 'attendance', 'Late Check-in', '3 employees have not checked in today', 'In-App', 'Normal', 'Delivered', '2026-07-16 10:30:00'),
(1, 'training', 'Training Session', 'New session opened: Leadership Q3 2026', 'In-App', 'Low', 'Delivered', '2026-07-13 14:00:00'),
(2, 'leave', 'Leave Request', 'Fajar Nugroho submitted sick leave', 'In-App', 'Normal', 'Delivered', '2026-07-15 11:00:00'),
(2, 'onboarding', 'New Employee', 'Nina Zahra has completed onboarding', 'In-App', 'Normal', 'Sent', '2026-07-12 16:00:00'),
(3, 'leave', 'Approval Needed', 'Rudi Hartono leave requires your approval', 'In-App', 'High', 'Delivered', '2026-07-15 09:05:00'),
(3, 'attendance', 'Team Attendance', 'Your team: 2 members on leave today', 'In-App', 'Normal', 'Delivered', '2026-07-16 08:00:00'),
(4, 'leave', 'Leave Approved', 'Your sick leave has been approved', 'In-App', 'Normal', 'Delivered', '2026-07-16 10:00:00'),
(4, 'payroll', 'Payslip Available', 'Your June 2026 payslip is ready', 'In-App', 'Normal', 'Delivered', '2026-07-10 09:00:00'),
(5, 'payroll', 'Payroll Approval', 'June 2026 payroll needs Finance approval', 'In-App', 'High', 'Delivered', '2026-07-14 08:00:00'),
(5, 'compliance', 'BPJS Report', 'June 2026 BPJS report is due', 'In-App', 'Normal', 'Sent', '2026-07-20 07:00:00'),
(6, 'payroll', 'Payroll Approved', 'June 2026 payroll has been finalized', 'In-App', 'Normal', 'Delivered', '2026-07-16 11:00:00');

-- ============================================
-- 25. ATTENDANCE RECORDS
-- ============================================
INSERT IGNORE INTO attendance_records (employee_id, date, check_in_time, check_out_time, check_in_method, work_hours, status, created_at) VALUES
(1, '2026-07-16', '2026-07-16 07:55:00', '2026-07-16 17:05:00', 'Biometric', 8.0, 'Present', NOW()),
(3, '2026-07-16', '2026-07-16 08:10:00', '2026-07-16 17:30:00', 'Biometric', 8.0, 'Late', NOW()),
(4, '2026-07-16', '2026-07-16 08:00:00', '2026-07-16 17:00:00', 'Biometric', 8.0, 'Present', NOW()),
(5, '2026-07-16', '2026-07-16 07:50:00', '2026-07-16 17:10:00', 'Mobile', 8.0, 'Present', NOW()),
(6, '2026-07-16', '2026-07-16 07:45:00', '2026-07-16 17:00:00', 'Mobile', 8.0, 'Present', NOW()),
(8, '2026-07-16', '2026-07-16 09:15:00', '2026-07-16 18:00:00', 'Web', 7.5, 'Late', NOW()),
(9, '2026-07-16', '2026-07-16 07:55:00', '2026-07-16 17:05:00', 'Biometric', 8.0, 'Present', NOW()),
(10, '2026-07-16', '2026-07-16 08:00:00', NULL, 'Web', 0, 'Present', NOW()),
(11, '2026-07-16', '2026-07-16 07:58:00', '2026-07-16 17:02:00', 'Biometric', 8.0, 'Present', NOW()),
(12, '2026-07-16', '2026-07-16 08:05:00', '2026-07-16 17:00:00', 'Biometric', 8.0, 'Late', NOW()),
(13, '2026-07-16', '2026-07-16 08:00:00', '2026-07-16 17:15:00', 'Biometric', 8.0, 'Present', NOW()),
(15, '2026-07-16', '2026-07-16 07:50:00', '2026-07-16 17:00:00', 'Mobile', 8.0, 'Present', NOW()),
(16, '2026-07-16', NULL, NULL, 'Web', 0, 'Absent', NOW()),
(17, '2026-07-16', '2026-07-16 07:55:00', '2026-07-16 17:00:00', 'Biometric', 8.0, 'Present', NOW()),
(20, '2026-07-16', '2026-07-16 09:30:00', NULL, 'Mobile', 3.0, 'Late', NOW());

-- ============================================
-- 26. LEAVE REQUESTS
-- ============================================
INSERT IGNORE INTO leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, working_days, reason, status, submitted_at) VALUES
(1, 1, '2026-07-20', '2026-07-21', 2, 2, 'Family gathering', 'Pending Manager', '2026-07-15 10:00:00'),
(4, 1, '2026-08-10', '2026-08-14', 5, 5, 'Vacation to Bali', 'Pending Manager', '2026-07-14 09:00:00'),
(5, 2, '2026-07-17', '2026-07-17', 1, 1, 'Medical checkup', 'Pending HR', '2026-07-16 08:00:00'),
(8, 1, '2026-07-22', '2026-07-23', 2, 2, 'Personal matters', 'Approved', '2026-07-10 14:00:00'),
(10, 2, '2026-07-15', '2026-07-16', 2, 2, 'Sick - fever', 'Approved', '2026-07-14 07:00:00'),
(12, 4, '2026-08-01', '2026-08-05', 5, 5, 'Urgent family matter', 'Pending Manager', '2026-07-16 11:00:00'),
(15, 1, '2026-07-27', '2026-07-28', 2, 2, 'Day off', 'Pending Manager', '2026-07-16 09:30:00');

-- ============================================
-- 27. SCHEDULES
-- ============================================
INSERT IGNORE INTO schedules (employee_id, shift_id, date, is_off) VALUES
(1,1,'2026-07-16',FALSE),(3,1,'2026-07-16',FALSE),(4,1,'2026-07-16',FALSE),
(5,1,'2026-07-16',FALSE),(6,1,'2026-07-16',FALSE),(7,1,'2026-07-16',FALSE),
(8,1,'2026-07-16',FALSE),(9,1,'2026-07-16',FALSE),(10,1,'2026-07-16',FALSE),
(11,1,'2026-07-16',FALSE),(12,1,'2026-07-16',FALSE),(13,1,'2026-07-16',FALSE),
(14,1,'2026-07-16',FALSE),(15,1,'2026-07-16',FALSE),(16,1,'2026-07-16',FALSE),
(17,1,'2026-07-16',FALSE),(18,1,'2026-07-16',FALSE),(19,1,'2026-07-16',FALSE),
(20,2,'2026-07-16',FALSE);

-- ============================================
-- 28. TRAINING ENROLLMENTS
-- ============================================
INSERT IGNORE INTO training_enrollments (training_session_id, employee_id, enrollment_status) VALUES
(1,3,'Registered'),(1,4,'Registered'),(1,5,'Registered'),(1,8,'Registered'),(1,9,'Registered'),
(2,4,'Confirmed'),(2,5,'Confirmed'),(2,6,'Confirmed'),(2,16,'Confirmed'),
(3,9,'Registered'),(3,10,'Registered'),
(4,7,'Completed'),(4,12,'Completed'),(4,14,'Completed'),
(5,20,'Registered'),(5,13,'Registered'),
(6,11,'Registered'),(6,12,'Registered');

-- ============================================
-- 29. EMPLOYEE SALARY HISTORY
-- ============================================
INSERT IGNORE INTO employee_salary_history (employee_id, effective_date, basic_salary, grade_id, position_id, reason, approved_by) VALUES
(1, '2026-01-01', 100000000, 1, 1, 'Annual adjustment', 1),
(3, '2026-01-01', 45000000, 2, 3, 'Annual adjustment', 1),
(4, '2026-01-01', 25000000, 3, 4, 'Annual adjustment', 1),
(4, '2025-07-01', 22000000, 3, 4, 'Promotion', 1),
(5, '2026-01-01', 15000000, 3, 5, 'Annual adjustment', 1),
(8, '2026-01-01', 35000000, 2, 7, 'Annual adjustment', 1),
(9, '2026-01-01', 35000000, 2, 8, 'Annual adjustment', 1),
(11, '2026-01-01', 35000000, 2, 10, 'Annual adjustment', 1);

-- ============================================
-- 30. AUDIT LOGS
-- ============================================
INSERT IGNORE INTO audit_logs (user_id, action, entity_type, entity_id, ip_address) VALUES
(1, 'LOGIN', 'user', 1, '192.168.1.100'),
(1, 'VIEW_REPORT', 'payroll', 6, '192.168.1.100'),
(2, 'UPDATE_EMPLOYEE', 'employee', 7, '192.168.1.101'),
(3, 'APPROVE_LEAVE', 'leave_request', 5, '192.168.1.102');

-- ============================================
-- Re-enable constraints
-- ============================================
SET FOREIGN_KEY_CHECKS = 1;
SET UNIQUE_CHECKS = 1;

SELECT 'Migration completed successfully!' AS result;
