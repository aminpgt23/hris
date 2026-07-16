-- --------------------------------------------------------
-- Host:                         itjobs-mukhammadsyafiqulamin-69d7.h.aivencloud.com
-- Server version:               8.0.45 - Source distribution
-- Server OS:                    Linux
-- HeidiSQL Version:             12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table hris_payroll_db.approval_history
CREATE TABLE IF NOT EXISTS `approval_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `workflow_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` int NOT NULL,
  `step_number` int NOT NULL,
  `approver_id` int NOT NULL,
  `action` enum('Approved','Rejected','Revision Requested','Delegated') COLLATE utf8mb4_unicode_ci NOT NULL,
  `comments` text COLLATE utf8mb4_unicode_ci,
  `delegated_to` int DEFAULT NULL,
  `action_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `approver_id` (`approver_id`),
  KEY `delegated_to` (`delegated_to`),
  KEY `idx_entity` (`entity_type`,`entity_id`),
  CONSTRAINT `approval_history_ibfk_1` FOREIGN KEY (`approver_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `approval_history_ibfk_2` FOREIGN KEY (`delegated_to`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.approval_history: ~0 rows (approximately)

-- Dumping structure for table hris_payroll_db.approval_workflows
CREATE TABLE IF NOT EXISTS `approval_workflows` (
  `id` int NOT NULL AUTO_INCREMENT,
  `workflow_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_id` int DEFAULT NULL,
  `steps` json NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `company_id` (`company_id`),
  CONSTRAINT `approval_workflows_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.approval_workflows: ~0 rows (approximately)

-- Dumping structure for table hris_payroll_db.assets
CREATE TABLE IF NOT EXISTS `assets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `asset_category_id` int NOT NULL,
  `asset_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `serial_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `manufacturer` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `model` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `purchase_cost` decimal(15,2) NOT NULL,
  `vendor_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vendor_contact` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `warranty_expiry` date DEFAULT NULL,
  `location` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `condition` enum('New','Good_Condition','Fair','Poor','Damaged','Disposed') COLLATE utf8mb4_unicode_ci DEFAULT 'New',
  `assigned_to_employee_id` int DEFAULT NULL,
  `assigned_date` date DEFAULT NULL,
  `returned_date` date DEFAULT NULL,
  `assigned_by` int DEFAULT NULL,
  `depreciation_start_date` date DEFAULT NULL,
  `accumulated_depreciation` decimal(15,2) DEFAULT '0.00',
  `net_book_value` decimal(15,2) DEFAULT NULL,
  `disposal_date` date DEFAULT NULL,
  `disposal_reason` text COLLATE utf8mb4_unicode_ci,
  `disposal_proceeds` decimal(15,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `asset_number` (`asset_number`),
  KEY `company_id` (`company_id`),
  KEY `asset_category_id` (`asset_category_id`),
  KEY `assigned_to_employee_id` (`assigned_to_employee_id`),
  KEY `assigned_by` (`assigned_by`),
  CONSTRAINT `assets_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `assets_ibfk_2` FOREIGN KEY (`asset_category_id`) REFERENCES `asset_categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `assets_ibfk_3` FOREIGN KEY (`assigned_to_employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  CONSTRAINT `assets_ibfk_4` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.assets: ~0 rows (approximately)

-- Dumping structure for table hris_payroll_db.asset_categories
CREATE TABLE IF NOT EXISTS `asset_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `depreciation_method` enum('Straight Line','Declining Balance','Units of Production') COLLATE utf8mb4_unicode_ci DEFAULT 'Straight Line',
  `useful_life_years` int DEFAULT NULL,
  `salvage_value_percentage` decimal(5,2) DEFAULT '0.00',
  `is_depreciable` tinyint(1) DEFAULT '1',
  `gl_account_asset` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gl_account_depreciation` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gl_account_expense` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_asset_category_code` (`company_id`,`code`),
  CONSTRAINT `asset_categories_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.asset_categories: ~0 rows (approximately)
INSERT IGNORE INTO `asset_categories` (`id`, `company_id`, `code`, `name`, `depreciation_method`, `useful_life_years`, `salvage_value_percentage`, `is_depreciable`, `gl_account_asset`, `gl_account_depreciation`, `gl_account_expense`, `is_active`, `created_at`, `updated_at`) VALUES
	(1, 1, 'IT-EQP', 'IT Equipment', 'Straight Line', 4, 0.00, 1, NULL, NULL, NULL, 1, '2026-07-16 13:40:11', '2026-07-16 13:40:11'),
	(2, 1, 'FURN', 'Furniture', 'Straight Line', 5, 0.00, 1, NULL, NULL, NULL, 1, '2026-07-16 13:40:11', '2026-07-16 13:40:11'),
	(3, 1, 'VEH', 'Vehicle', 'Declining Balance', 8, 0.00, 1, NULL, NULL, NULL, 1, '2026-07-16 13:40:11', '2026-07-16 13:40:11'),
	(4, 1, 'ELEC', 'Electronics', 'Straight Line', 3, 0.00, 1, NULL, NULL, NULL, 1, '2026-07-16 13:40:11', '2026-07-16 13:40:11'),
	(5, 1, 'SOFT', 'Software License', 'Straight Line', 1, 0.00, 1, NULL, NULL, NULL, 1, '2026-07-16 13:40:11', '2026-07-16 13:40:11');

-- Dumping structure for table hris_payroll_db.asset_maintenance
CREATE TABLE IF NOT EXISTS `asset_maintenance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `asset_id` int NOT NULL,
  `maintenance_type` enum('Preventive','Corrective','Inspection','Repair') COLLATE utf8mb4_unicode_ci NOT NULL,
  `scheduled_date` date DEFAULT NULL,
  `completed_date` date DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `vendor_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cost` decimal(15,2) DEFAULT '0.00',
  `next_maintenance_date` date DEFAULT NULL,
  `status` enum('Scheduled','In Progress','Completed','Cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'Scheduled',
  `performed_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_asset_scheduled` (`asset_id`,`scheduled_date`),
  CONSTRAINT `asset_maintenance_ibfk_1` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asset_maintenance_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.asset_maintenance: ~0 rows (approximately)

-- Dumping structure for table hris_payroll_db.attendance_records
CREATE TABLE IF NOT EXISTS `attendance_records` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `schedule_id` int DEFAULT NULL,
  `date` date NOT NULL,
  `check_in_time` datetime DEFAULT NULL,
  `check_out_time` datetime DEFAULT NULL,
  `check_in_location_lat` decimal(10,8) DEFAULT NULL,
  `check_in_location_lng` decimal(11,8) DEFAULT NULL,
  `check_in_location_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `check_out_location_lat` decimal(10,8) DEFAULT NULL,
  `check_out_location_lng` decimal(11,8) DEFAULT NULL,
  `check_out_location_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `check_in_method` enum('Biometric','Mobile','Web','API') COLLATE utf8mb4_unicode_ci DEFAULT 'Web',
  `check_out_method` enum('Biometric','Mobile','Web','API') COLLATE utf8mb4_unicode_ci DEFAULT 'Web',
  `check_in_device_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `check_out_device_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `work_hours` decimal(5,2) DEFAULT '0.00',
  `overtime_hours` decimal(5,2) DEFAULT '0.00',
  `late_minutes` int DEFAULT '0',
  `early_departure_minutes` int DEFAULT '0',
  `status` enum('Present','Absent','Late','Half Day','On Duty','Work From Home') COLLATE utf8mb4_unicode_ci DEFAULT 'Present',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `approval_status` enum('Pending','Approved','Rejected','Revision') COLLATE utf8mb4_unicode_ci DEFAULT 'Approved',
  `approved_by` int DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `schedule_id` (`schedule_id`),
  KEY `approved_by` (`approved_by`),
  KEY `idx_employee_date` (`employee_id`,`date`),
  KEY `idx_date_status` (`date`,`status`),
  CONSTRAINT `attendance_records_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attendance_records_ibfk_2` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`id`) ON DELETE SET NULL,
  CONSTRAINT `attendance_records_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.attendance_records: ~0 rows (approximately)

-- Dumping structure for table hris_payroll_db.audit_logs
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_id` int DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `request_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_entity` (`entity_type`,`entity_id`),
  KEY `idx_user_action` (`user_id`,`action`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.audit_logs: ~0 rows (approximately)
INSERT IGNORE INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address`, `user_agent`, `request_id`, `created_at`) VALUES
	(1, 7, 'LOGIN', 'user', NULL, NULL, NULL, '::1', NULL, '4f9a2d99-6982-4627-b480-f3fc2b05ae3e', '2026-07-16 13:43:43');

-- Dumping structure for table hris_payroll_db.bpjs_employment_config
CREATE TABLE IF NOT EXISTS `bpjs_employment_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `year` int NOT NULL,
  `jht_employee_percentage` decimal(5,2) DEFAULT '2.00',
  `jht_employer_percentage` decimal(5,2) DEFAULT '3.70',
  `jp_employee_percentage` decimal(5,2) DEFAULT '1.00',
  `jp_employer_percentage` decimal(5,2) DEFAULT '2.00',
  `jkk_percentage` decimal(5,2) DEFAULT '0.24',
  `jkm_percentage` decimal(5,2) DEFAULT '0.30',
  `min_base_salary` decimal(15,2) DEFAULT NULL,
  `max_base_salary` decimal(15,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `effective_from` date NOT NULL,
  `effective_to` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_bpjs_employment_year` (`company_id`,`year`),
  CONSTRAINT `bpjs_employment_config_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.bpjs_employment_config: ~0 rows (approximately)

-- Dumping structure for table hris_payroll_db.bpjs_health_config
CREATE TABLE IF NOT EXISTS `bpjs_health_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `year` int NOT NULL,
  `employee_percentage` decimal(5,2) DEFAULT '1.00',
  `employer_percentage` decimal(5,2) DEFAULT '4.00',
  `min_base_salary` decimal(15,2) DEFAULT NULL,
  `max_base_salary` decimal(15,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `effective_from` date NOT NULL,
  `effective_to` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_bpjs_health_year` (`company_id`,`year`),
  CONSTRAINT `bpjs_health_config_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.bpjs_health_config: ~0 rows (approximately)

-- Dumping structure for table hris_payroll_db.branches
CREATE TABLE IF NOT EXISTS `branches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_branch_code` (`company_id`,`code`),
  CONSTRAINT `branches_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.branches: ~0 rows (approximately)
INSERT IGNORE INTO `branches` (`id`, `company_id`, `code`, `name`, `address`, `city`, `phone`, `email`, `is_active`, `created_at`, `updated_at`) VALUES
	(1, 1, 'HQ', 'Headquarters', 'Jl. Sudirman No. 88', 'Jakarta', '021-12345678', 'hq@karyatkn.co.id', 1, '2026-07-16 13:40:02', '2026-07-16 13:40:02'),
	(2, 1, 'BDG', 'Bandung Branch', 'Jl. Raya Kopo No. 120', 'Bandung', '022-11122233', 'bdg@karyatkn.co.id', 1, '2026-07-16 13:40:02', '2026-07-16 13:40:02'),
	(3, 1, 'SBY', 'Surabaya Branch', 'Jl. Tunjungan No. 55', 'Surabaya', '031-44455566', 'sby@karyatkn.co.id', 1, '2026-07-16 13:40:02', '2026-07-16 13:40:02'),
	(4, 2, 'BDG', 'Bandung Office', 'Jl. Ahmad Yani No. 45', 'Bandung', '022-87654321', 'office@mandiriabadi.co.id', 1, '2026-07-16 13:40:02', '2026-07-16 13:40:02');

-- Dumping structure for table hris_payroll_db.companies
CREATE TABLE IF NOT EXISTS `companies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `legal_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tax_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `province` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Indonesia',
  `postal_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.companies: ~0 rows (approximately)
INSERT IGNORE INTO `companies` (`id`, `code`, `name`, `legal_name`, `tax_id`, `address`, `city`, `province`, `country`, `postal_code`, `phone`, `email`, `website`, `logo_url`, `is_active`, `created_at`, `updated_at`) VALUES
	(1, 'PTK', 'PT Karya Teknologi', 'PT Karya Teknologi Indonesia Tbk', '01.234.567.8-901.000', 'Jl. Sudirman No. 88', 'Jakarta', 'DKI Jakarta', 'Indonesia', NULL, '021-12345678', 'corp@karyatkn.co.id', NULL, NULL, 1, '2026-07-16 13:40:02', '2026-07-16 13:40:02'),
	(2, 'MDA', 'Mandiri Abadi', 'PT Mandiri Abadi Sejahtera', '02.345.678.9-012.000', 'Jl. Ahmad Yani No. 45', 'Bandung', 'Jawa Barat', 'Indonesia', NULL, '022-87654321', 'admin@mandiriabadi.co.id', NULL, NULL, 1, '2026-07-16 13:40:02', '2026-07-16 13:40:02');

-- Dumping structure for table hris_payroll_db.compliance_reports
CREATE TABLE IF NOT EXISTS `compliance_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `report_type` enum('BPJS Health','BPJS Employment','PPh21 Massal','Pension') COLLATE utf8mb4_unicode_ci NOT NULL,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `generated_by` int NOT NULL,
  `generated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('Generated','Submitted','Approved','Rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'Generated',
  `submission_date` date DEFAULT NULL,
  `reference_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `company_id` (`company_id`),
  KEY `generated_by` (`generated_by`),
  CONSTRAINT `compliance_reports_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `compliance_reports_ibfk_2` FOREIGN KEY (`generated_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.compliance_reports: ~0 rows (approximately)

-- Dumping structure for table hris_payroll_db.departments
CREATE TABLE IF NOT EXISTS `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `parent_id` int DEFAULT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `cost_center` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `company_id` (`company_id`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `departments_ibfk_2` FOREIGN KEY (`parent_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.departments: ~0 rows (approximately)
INSERT IGNORE INTO `departments` (`id`, `company_id`, `parent_id`, `code`, `name`, `description`, `cost_center`, `is_active`, `created_at`, `updated_at`) VALUES
	(1, 1, NULL, 'DIR', 'Directorate', 'Board of Directors', 'CC-001', 1, '2026-07-16 13:40:03', '2026-07-16 13:40:03'),
	(2, 1, 1, 'ENG', 'Engineering', 'Software Engineering & IT', 'CC-010', 1, '2026-07-16 13:40:03', '2026-07-16 13:40:03'),
	(3, 1, 1, 'MKT', 'Marketing', 'Marketing & Communications', 'CC-020', 1, '2026-07-16 13:40:03', '2026-07-16 13:40:03'),
	(4, 1, 1, 'FIN', 'Finance', 'Finance & Accounting', 'CC-030', 1, '2026-07-16 13:40:03', '2026-07-16 13:40:03'),
	(5, 1, 1, 'HRD', 'Human Resources', 'HR & People Operations', 'CC-040', 1, '2026-07-16 13:40:03', '2026-07-16 13:40:03'),
	(6, 1, 1, 'OPS', 'Operations', 'Business Operations', 'CC-050', 1, '2026-07-16 13:40:03', '2026-07-16 13:40:03'),
	(7, 1, 1, 'SLS', 'Sales', 'Sales & Business Development', 'CC-060', 1, '2026-07-16 13:40:03', '2026-07-16 13:40:03'),
	(8, 2, NULL, 'DIR', 'Directorate', 'Board of Directors', 'CC-MDA-001', 1, '2026-07-16 13:40:03', '2026-07-16 13:40:03'),
	(9, 2, 8, 'FIN', 'Finance', 'Finance & Accounting', 'CC-MDA-030', 1, '2026-07-16 13:40:03', '2026-07-16 13:40:03'),
	(10, 2, 8, 'HRD', 'Human Resources', 'HR & People Operations', 'CC-MDA-040', 1, '2026-07-16 13:40:03', '2026-07-16 13:40:03');

-- Dumping structure for table hris_payroll_db.employees
CREATE TABLE IF NOT EXISTS `employees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `branch_id` int DEFAULT NULL,
  `employee_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `middle_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `preferred_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` enum('M','F') COLLATE utf8mb4_unicode_ci NOT NULL,
  `place_of_birth` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `religion` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `marital_status` enum('Single','Married','Divorced','Widowed') COLLATE utf8mb4_unicode_ci DEFAULT 'Single',
  `nationality` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Indonesian',
  `id_card_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_card_address` text COLLATE utf8mb4_unicode_ci,
  `npwp` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bpjs_health_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bpjs_employment_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position_id` int DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `grade_id` int DEFAULT NULL,
  `employment_status` enum('Permanent','Contract','Probation','Intern','Outsource') COLLATE utf8mb4_unicode_ci NOT NULL,
  `hire_date` date NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `probation_end_date` date DEFAULT NULL,
  `contract_end_date` date DEFAULT NULL,
  `termination_date` date DEFAULT NULL,
  `termination_reason` text COLLATE utf8mb4_unicode_ci,
  `is_rehireable` tinyint(1) DEFAULT '1',
  `email_personal` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_company` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_personal` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_emergency` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergency_contact_relation` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address_current` text COLLATE utf8mb4_unicode_ci,
  `address_permanent` text COLLATE utf8mb4_unicode_ci,
  `postal_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `province` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Indonesia',
  `bank_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_account_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_account_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resume_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contract_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `other_documents` json DEFAULT NULL,
  `supervisor_id` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_number` (`employee_number`),
  KEY `branch_id` (`branch_id`),
  KEY `grade_id` (`grade_id`),
  KEY `supervisor_id` (`supervisor_id`),
  KEY `idx_employee_number` (`employee_number`),
  KEY `idx_company` (`company_id`),
  KEY `idx_department` (`department_id`),
  KEY `idx_position` (`position_id`),
  KEY `idx_status` (`employment_status`,`is_active`),
  CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `employees_ibfk_2` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `employees_ibfk_3` FOREIGN KEY (`position_id`) REFERENCES `positions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `employees_ibfk_4` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `employees_ibfk_5` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`) ON DELETE SET NULL,
  CONSTRAINT `employees_ibfk_6` FOREIGN KEY (`supervisor_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.employees: ~0 rows (approximately)
INSERT IGNORE INTO `employees` (`id`, `company_id`, `branch_id`, `employee_number`, `first_name`, `middle_name`, `last_name`, `preferred_name`, `gender`, `place_of_birth`, `date_of_birth`, `religion`, `marital_status`, `nationality`, `id_card_number`, `id_card_address`, `npwp`, `bpjs_health_number`, `bpjs_employment_number`, `position_id`, `department_id`, `grade_id`, `employment_status`, `hire_date`, `start_date`, `end_date`, `probation_end_date`, `contract_end_date`, `termination_date`, `termination_reason`, `is_rehireable`, `email_personal`, `email_company`, `phone_personal`, `phone_emergency`, `emergency_contact_name`, `emergency_contact_relation`, `address_current`, `address_permanent`, `postal_code`, `city`, `province`, `country`, `bank_name`, `bank_account_number`, `bank_account_name`, `photo_url`, `resume_url`, `contract_url`, `other_documents`, `supervisor_id`, `is_active`, `created_at`, `updated_at`) VALUES
	(1, 1, 1, 'EMP001', 'Budi', NULL, 'Santoso', NULL, 'M', NULL, '1975-03-15', 'Islam', 'Married', 'Indonesian', '3174011503750001', NULL, '01.234.567.8-901.000', 'BPJS-K-001', 'BPJS-T-001', 1, 1, 1, 'Permanent', '2020-01-01', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 'budi.santoso@karyatkn.co.id', '081234567801', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Indonesia', 'BCA', '1234567890', 'Budi Santoso', NULL, NULL, NULL, NULL, NULL, 1, '2026-07-16 13:40:05', '2026-07-16 13:40:05'),
	(2, 1, 1, 'EMP002', 'Siti', NULL, 'Rahmawati', NULL, 'F', NULL, '1980-07-22', 'Islam', 'Married', 'Indonesian', '3174022207800002', NULL, '02.345.678.9-012.000', 'BPJS-K-002', 'BPJS-T-002', 2, 2, 1, 'Permanent', '2020-06-01', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 'siti.rahmawati@karyatkn.co.id', '081234567802', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Indonesia', 'BCA', '1234567891', 'Siti Rahmawati', NULL, NULL, NULL, NULL, 1, 1, '2026-07-16 13:40:05', '2026-07-16 13:40:05'),
	(3, 1, 1, 'EMP003', 'Ahmad', NULL, 'Fauzi', NULL, 'M', NULL, '1985-11-08', 'Islam', 'Married', 'Indonesian', '317408118500003', NULL, '03.456.789.0-123.000', 'BPJS-K-003', 'BPJS-T-003', 3, 2, 2, 'Permanent', '2021-03-15', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 'ahmad.fauzi@karyatkn.co.id', '081234567803', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Indonesia', 'Mandiri', '1234567892', 'Ahmad Fauzi', NULL, NULL, NULL, NULL, 2, 1, '2026-07-16 13:40:05', '2026-07-16 13:40:05'),
	(4, 1, 2, 'EMP004', 'Dewi', NULL, 'Kusuma', NULL, 'F', NULL, '1990-05-12', 'Kristen', 'Married', 'Indonesian', '3274051205900004', NULL, '04.567.890.1-234.000', 'BPJS-K-004', 'BPJS-T-004', 4, 2, 3, 'Permanent', '2021-07-01', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 'dewi.kusuma@karyatkn.co.id', '081234567804', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Indonesia', 'BNI', '1234567893', 'Dewi Kusuma', NULL, NULL, NULL, NULL, 3, 1, '2026-07-16 13:40:05', '2026-07-16 13:40:05'),
	(5, 1, 1, 'EMP005', 'Rudi', NULL, 'Hartono', NULL, 'M', NULL, '1992-09-30', 'Islam', 'Single', 'Indonesian', '3174093009920005', NULL, '05.678.901.2-345.000', 'BPJS-K-005', 'BPJS-T-005', 5, 2, 3, 'Permanent', '2022-01-10', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 'rudi.hartono@karyatkn.co.id', '081234567805', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Indonesia', 'BCA', '1234567894', 'Rudi Hartono', NULL, NULL, NULL, NULL, 4, 1, '2026-07-16 13:40:05', '2026-07-16 13:40:05'),
	(6, 1, 3, 'EMP006', 'Rina', NULL, 'Fitriani', NULL, 'F', NULL, '1994-12-20', 'Islam', 'Single', 'Indonesian', '3578062012940006', NULL, '06.789.012.3-456.000', 'BPJS-K-006', 'BPJS-T-006', 5, 2, 3, 'Permanent', '2022-06-15', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 'rina.fitriani@karyatkn.co.id', '081234567806', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Indonesia', 'BRI', '1234567895', 'Rina Fitriani', NULL, NULL, NULL, NULL, 4, 1, '2026-07-16 13:40:05', '2026-07-16 13:40:05'),
	(7, 1, 1, 'EMP007', 'Agus', NULL, 'Prasetyo', NULL, 'M', NULL, '1996-04-18', 'Islam', 'Single', 'Indonesian', '3174011804960007', NULL, '07.890.123.4-567.000', 'BPJS-K-007', 'BPJS-T-007', 6, 2, 4, 'Probation', '2025-01-15', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 'agus.prasetyo@karyatkn.co.id', '081234567807', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Indonesia', 'Mandiri', '1234567896', 'Agus Prasetyo', NULL, NULL, NULL, NULL, 4, 1, '2026-07-16 13:40:05', '2026-07-16 13:40:05'),
	(8, 1, 1, 'EMP008', 'Maya', NULL, 'Anggraini', NULL, 'F', NULL, '1988-08-25', 'Hindu', 'Married', 'Indonesian', '3174022508880008', NULL, '08.901.234.5-678.000', 'BPJS-K-008', 'BPJS-T-008', 7, 3, 2, 'Permanent', '2021-02-01', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 'maya.anggraini@karyatkn.co.id', '081234567808', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Indonesia', 'BCA', '1234567897', 'Maya Anggraini', NULL, NULL, NULL, NULL, 1, 1, '2026-07-16 13:40:05', '2026-07-16 13:40:05'),
	(9, 1, 1, 'EMP009', 'Hendra', NULL, 'Gunawan', NULL, 'M', NULL, '1983-06-14', 'Kristen', 'Married', 'Indonesian', '3174011406830009', NULL, '09.012.345.6-789.000', 'BPJS-K-009', 'BPJS-T-009', 8, 4, 2, 'Permanent', '2020-08-01', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 'hendra.gunawan@karyatkn.co.id', '081234567809', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Indonesia', 'BNI', '1234567898', 'Hendra Gunawan', NULL, NULL, NULL, NULL, 1, 1, '2026-07-16 13:40:05', '2026-07-16 13:40:05'),
	(10, 1, 1, 'EMP010', 'Lina', NULL, 'Wati', NULL, 'F', NULL, '1991-03-05', 'Islam', 'Married', 'Indonesian', '3174030503910010', NULL, '10.123.456.7-890.000', 'BPJS-K-010', 'BPJS-T-010', 9, 4, 3, 'Permanent', '2022-09-01', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 'lina.wati@karyatkn.co.id', '081234567810', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Indonesia', 'BRI', '1234567899', 'Lina Wati', NULL, NULL, NULL, NULL, 9, 1, '2026-07-16 13:40:05', '2026-07-16 13:40:05'),
	(11, 1, 1, 'EMP011', 'Dian', NULL, 'Permata', NULL, 'F', NULL, '1986-10-20', 'Islam', 'Married', 'Indonesian', '3174022010860011', NULL, '11.234.567.8-901.000', 'BPJS-K-011', 'BPJS-T-011', 10, 5, 2, 'Permanent', '2021-05-15', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 'dian.permata@karyatkn.co.id', '081234567811', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Indonesia', 'BCA', '1234567900', 'Dian Permata', NULL, NULL, NULL, NULL, 1, 1, '2026-07-16 13:40:05', '2026-07-16 13:40:05'),
	(12, 1, 1, 'EMP012', 'Fajar', NULL, 'Nugroho', NULL, 'M', NULL, '1993-02-28', 'Islam', 'Single', 'Indonesian', '3174022802930012', NULL, '12.345.678.9-012.000', 'BPJS-K-012', 'BPJS-T-012', 11, 5, 3, 'Permanent', '2023-01-01', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 'fajar.nugroho@karyatkn.co.id', '081234567812', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Indonesia', 'Mandiri', '1234567901', 'Fajar Nugroho', NULL, NULL, NULL, NULL, 11, 1, '2026-07-16 13:40:05', '2026-07-16 13:40:05'),
	(13, 1, 1, 'EMP013', 'Tina', NULL, 'Susanti', NULL, 'F', NULL, '1995-07-15', 'Islam', 'Single', 'Indonesian', '3174011507950013', NULL, '13.456.789.0-123.000', 'BPJS-K-013', 'BPJS-T-013', 12, 7, 2, 'Permanent', '2023-06-01', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 'tina.susanti@karyatkn.co.id', '081234567813', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Indonesia', 'BNI', '1234567902', 'Tina Susanti', NULL, NULL, NULL, NULL, 1, 1, '2026-07-16 13:40:05', '2026-07-16 13:40:05'),
	(14, 1, 1, 'EMP014', 'Bayu', NULL, 'Pamungkas', NULL, 'M', NULL, '1997-11-08', 'Islam', 'Single', 'Indonesian', '3174010811970014', NULL, '14.567.890.1-234.000', 'BPJS-K-014', 'BPJS-T-014', 13, 7, 4, 'Contract', '2024-07-01', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 'bayu.pamungkas@karyatkn.co.id', '081234567814', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Indonesia', 'BRI', '1234567903', 'Bayu Pamungkas', NULL, NULL, NULL, NULL, 13, 1, '2026-07-16 13:40:05', '2026-07-16 13:40:05'),
	(15, 1, 1, 'EMP015', 'Indah', NULL, 'Pertiwi', NULL, 'F', NULL, '1990-01-25', 'Islam', 'Married', 'Indonesian', '3174012501900015', NULL, '15.678.901.2-345.000', 'BPJS-K-015', 'BPJS-T-015', 14, 6, 2, 'Permanent', '2022-03-01', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 'indah.pertiwi@karyatkn.co.id', '081234567815', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Indonesia', 'BCA', '1234567904', 'Indah Pertiwi', NULL, NULL, NULL, NULL, 1, 1, '2026-07-16 13:40:05', '2026-07-16 13:40:05'),
	(16, 1, 2, 'EMP016', 'Rizky', NULL, 'Ramadhan', NULL, 'M', NULL, '1998-05-20', 'Islam', 'Single', 'Indonesian', '3274052005980016', NULL, '16.789.012.3-456.000', 'BPJS-K-016', 'BPJS-T-016', 5, 2, 3, 'Permanent', '2024-01-10', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 'rizky.ramadhan@karyatkn.co.id', '081234567816', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Indonesia', 'Mandiri', '1234567905', 'Rizky Ramadhan', NULL, NULL, NULL, NULL, 4, 1, '2026-07-16 13:40:05', '2026-07-16 13:40:05'),
	(17, 1, 1, 'EMP017', 'Sari', NULL, 'Puspita', NULL, 'F', NULL, '1989-09-12', 'Islam', 'Married', 'Indonesian', '3174011209890017', NULL, '17.890.123.4-567.000', 'BPJS-K-017', 'BPJS-T-017', 5, 2, 3, 'Permanent', '2022-11-01', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 'sari.puspita@karyatkn.co.id', '081234567817', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Indonesia', 'BCA', '1234567906', 'Sari Puspita', NULL, NULL, NULL, NULL, 4, 1, '2026-07-16 13:40:05', '2026-07-16 13:40:05'),
	(18, 1, 3, 'EMP018', 'Doni', NULL, 'Lesmana', NULL, 'M', NULL, '1994-12-01', 'Kristen', 'Single', 'Indonesian', '3578010112940018', NULL, '18.901.234.5-678.000', 'BPJS-K-018', 'BPJS-T-018', 6, 2, 4, 'Contract', '2024-06-01', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 'doni.lesmana@karyatkn.co.id', '081234567818', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Indonesia', 'BRI', '1234567907', 'Doni Lesmana', NULL, NULL, NULL, NULL, 4, 1, '2026-07-16 13:40:05', '2026-07-16 13:40:05'),
	(19, 1, 1, 'EMP019', 'Nina', NULL, 'Zahra', NULL, 'F', NULL, '1999-04-03', 'Islam', 'Single', 'Indonesian', '3174010304990019', NULL, '19.012.345.6-789.000', 'BPJS-K-019', 'BPJS-T-019', 6, 2, 4, 'Probation', '2025-02-01', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 'nina.zahra@karyatkn.co.id', '081234567819', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Indonesia', 'Mandiri', '1234567908', 'Nina Zahra', NULL, NULL, NULL, NULL, 4, 1, '2026-07-16 13:40:05', '2026-07-16 13:40:05'),
	(20, 1, 1, 'EMP020', 'Eko', NULL, 'Wahyudi', NULL, 'M', NULL, '1987-06-30', 'Islam', 'Married', 'Indonesian', '3174013006870020', NULL, '20.123.456.7-890.000', 'BPJS-K-020', 'BPJS-T-020', 13, 7, 3, 'Permanent', '2023-09-01', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 'eko.wahyudi@karyatkn.co.id', '081234567820', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Indonesia', 'BNI', '1234567909', 'Eko Wahyudi', NULL, NULL, NULL, NULL, 13, 1, '2026-07-16 13:40:05', '2026-07-16 13:40:05');

-- Dumping structure for table hris_payroll_db.employee_dependents
CREATE TABLE IF NOT EXISTS `employee_dependents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `relationship` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('M','F') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_covered_bpjs` tinyint(1) DEFAULT '0',
  `is_covered_insurance` tinyint(1) DEFAULT '0',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `employee_dependents_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.employee_dependents: ~0 rows (approximately)
INSERT IGNORE INTO `employee_dependents` (`id`, `employee_id`, `name`, `relationship`, `date_of_birth`, `gender`, `is_covered_bpjs`, `is_covered_insurance`, `notes`, `created_at`, `updated_at`) VALUES
	(1, 1, 'Sari Santoso', 'Spouse', '1980-05-10', 'F', 1, 0, NULL, '2026-07-16 13:40:08', '2026-07-16 13:40:08'),
	(2, 1, 'Adi Santoso', 'Child', '2010-08-15', 'M', 1, 0, NULL, '2026-07-16 13:40:08', '2026-07-16 13:40:08'),
	(3, 1, 'Ani Santoso', 'Child', '2013-12-20', 'F', 1, 0, NULL, '2026-07-16 13:40:08', '2026-07-16 13:40:08'),
	(4, 2, 'Rizki Rahmawati', 'Spouse', '1983-11-22', 'M', 1, 0, NULL, '2026-07-16 13:40:08', '2026-07-16 13:40:08'),
	(5, 2, 'Naura Rahmawati', 'Child', '2015-03-10', 'F', 1, 0, NULL, '2026-07-16 13:40:08', '2026-07-16 13:40:08'),
	(6, 3, 'Nurul Fauzi', 'Spouse', '1988-05-18', 'F', 1, 0, NULL, '2026-07-16 13:40:08', '2026-07-16 13:40:08'),
	(7, 3, 'Rafi Fauzi', 'Child', '2016-09-25', 'M', 1, 0, NULL, '2026-07-16 13:40:08', '2026-07-16 13:40:08'),
	(8, 8, 'Aditya Anggraini', 'Spouse', '1985-12-01', 'M', 1, 0, NULL, '2026-07-16 13:40:08', '2026-07-16 13:40:08'),
	(9, 8, 'Kinan Anggraini', 'Child', '2017-07-14', 'F', 1, 0, NULL, '2026-07-16 13:40:08', '2026-07-16 13:40:08'),
	(10, 9, 'Rina Gunawan', 'Spouse', '1986-04-08', 'F', 1, 0, NULL, '2026-07-16 13:40:08', '2026-07-16 13:40:08'),
	(11, 9, 'Bima Gunawan', 'Child', '2018-01-20', 'M', 1, 0, NULL, '2026-07-16 13:40:08', '2026-07-16 13:40:08');

-- Dumping structure for table hris_payroll_db.employee_documents
CREATE TABLE IF NOT EXISTS `employee_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `document_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` int DEFAULT NULL,
  `mime_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `issuing_authority` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `document_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `verified_by` int DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  KEY `verified_by` (`verified_by`),
  CONSTRAINT `employee_documents_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `employee_documents_ibfk_2` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.employee_documents: ~0 rows (approximately)

-- Dumping structure for table hris_payroll_db.employee_education
CREATE TABLE IF NOT EXISTS `employee_education` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `institution_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `degree` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `major` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `gpa` decimal(3,2) DEFAULT NULL,
  `certificate_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `employee_education_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.employee_education: ~0 rows (approximately)

-- Dumping structure for table hris_payroll_db.employee_loans
CREATE TABLE IF NOT EXISTS `employee_loans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `loan_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `principal_amount` decimal(15,2) NOT NULL,
  `interest_rate` decimal(5,2) DEFAULT '0.00',
  `total_amount` decimal(15,2) NOT NULL,
  `installment_amount` decimal(15,2) NOT NULL,
  `total_installments` int NOT NULL,
  `paid_installments` int DEFAULT '0',
  `remaining_balance` decimal(15,2) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `next_installment_date` date DEFAULT NULL,
  `status` enum('Pending','Approved','Active','Completed','Defaulted') COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `purpose` text COLLATE utf8mb4_unicode_ci,
  `approved_by` int DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `disbursed_at` timestamp NULL DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `approved_by` (`approved_by`),
  KEY `created_by` (`created_by`),
  KEY `idx_employee_status` (`employee_id`,`status`),
  CONSTRAINT `employee_loans_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `employee_loans_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `employee_loans_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.employee_loans: ~0 rows (approximately)

-- Dumping structure for table hris_payroll_db.employee_salary_assignments
CREATE TABLE IF NOT EXISTS `employee_salary_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `payroll_period_id` int DEFAULT NULL,
  `basic_salary` decimal(15,2) NOT NULL,
  `fixed_allowances` json DEFAULT NULL,
  `fixed_deductions` json DEFAULT NULL,
  `tax_category` enum('TK0','TK1','TK2','TK3','K0','K1','K2','K3') COLLATE utf8mb4_unicode_ci DEFAULT 'TK0',
  `bpjs_health_percentage` decimal(5,2) DEFAULT '1.00',
  `bpjs_employment_percentage` decimal(5,2) DEFAULT '2.00',
  `pension_percentage` decimal(5,2) DEFAULT '1.00',
  `is_eligible_payroll` tinyint(1) DEFAULT '1',
  `bank_transfer` tinyint(1) DEFAULT '1',
  `effective_from` date NOT NULL,
  `effective_to` date DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `payroll_period_id` (`payroll_period_id`),
  KEY `created_by` (`created_by`),
  KEY `idx_employee_effective` (`employee_id`,`effective_from`),
  CONSTRAINT `employee_salary_assignments_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `employee_salary_assignments_ibfk_2` FOREIGN KEY (`payroll_period_id`) REFERENCES `payroll_periods` (`id`) ON DELETE SET NULL,
  CONSTRAINT `employee_salary_assignments_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.employee_salary_assignments: ~0 rows (approximately)

-- Dumping structure for table hris_payroll_db.employee_salary_history
CREATE TABLE IF NOT EXISTS `employee_salary_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `effective_date` date NOT NULL,
  `basic_salary` decimal(15,2) NOT NULL,
  `allowances` json DEFAULT NULL,
  `deductions` json DEFAULT NULL,
  `grade_id` int DEFAULT NULL,
  `position_id` int DEFAULT NULL,
  `reason` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approved_by` int DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `grade_id` (`grade_id`),
  KEY `position_id` (`position_id`),
  KEY `approved_by` (`approved_by`),
  KEY `idx_employee_date` (`employee_id`,`effective_date`),
  CONSTRAINT `employee_salary_history_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `employee_salary_history_ibfk_2` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`) ON DELETE SET NULL,
  CONSTRAINT `employee_salary_history_ibfk_3` FOREIGN KEY (`position_id`) REFERENCES `positions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `employee_salary_history_ibfk_4` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.employee_salary_history: ~0 rows (approximately)

-- Dumping structure for table hris_payroll_db.employee_work_experience
CREATE TABLE IF NOT EXISTS `employee_work_experience` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `company_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `position` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `is_current` tinyint(1) DEFAULT '0',
  `responsibilities` text COLLATE utf8mb4_unicode_ci,
  `salary_last_drawn` decimal(15,2) DEFAULT NULL,
  `supervisor_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supervisor_contact` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `employee_work_experience_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.employee_work_experience: ~0 rows (approximately)

-- Dumping structure for table hris_payroll_db.grades
CREATE TABLE IF NOT EXISTS `grades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `level` int NOT NULL,
  `min_salary` decimal(15,2) NOT NULL,
  `mid_salary` decimal(15,2) DEFAULT NULL,
  `max_salary` decimal(15,2) NOT NULL,
  `allowance_percentage` decimal(5,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_grade_code` (`company_id`,`code`),
  CONSTRAINT `grades_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.grades: ~0 rows (approximately)
INSERT IGNORE INTO `grades` (`id`, `company_id`, `code`, `name`, `level`, `min_salary`, `mid_salary`, `max_salary`, `allowance_percentage`, `created_at`, `updated_at`) VALUES
	(1, 1, 'GRD-A', 'Grade A - Executive', 10, 80000000.00, 120000000.00, 200000000.00, 25.00, '2026-07-16 13:40:04', '2026-07-16 13:40:04'),
	(2, 1, 'GRD-B', 'Grade B - Senior Management', 7, 30000000.00, 50000000.00, 80000000.00, 20.00, '2026-07-16 13:40:04', '2026-07-16 13:40:04'),
	(3, 1, 'GRD-C', 'Grade C - Mid Level', 4, 12000000.00, 20000000.00, 35000000.00, 15.00, '2026-07-16 13:40:04', '2026-07-16 13:40:04'),
	(4, 1, 'GRD-D', 'Grade D - Entry Level', 1, 6000000.00, 10000000.00, 15000000.00, 10.00, '2026-07-16 13:40:04', '2026-07-16 13:40:04');

-- Dumping structure for table hris_payroll_db.holidays
CREATE TABLE IF NOT EXISTS `holidays` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `type` enum('National','Company','Religious','Optional') COLLATE utf8mb4_unicode_ci DEFAULT 'National',
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_paid` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_holiday_date` (`company_id`,`date`),
  CONSTRAINT `holidays_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.holidays: ~0 rows (approximately)
INSERT IGNORE INTO `holidays` (`id`, `company_id`, `name`, `date`, `type`, `description`, `is_paid`, `created_at`, `updated_at`) VALUES
	(1, 1, 'Tahun Baru 2026', '2026-01-01', 'National', NULL, 1, '2026-07-16 13:40:09', '2026-07-16 13:40:09'),
	(2, 1, 'Tahun Baru Imlek 2577', '2026-02-17', 'National', NULL, 1, '2026-07-16 13:40:09', '2026-07-16 13:40:09'),
	(3, 1, 'Hari Raya Nyepi', '2026-03-29', 'National', NULL, 1, '2026-07-16 13:40:09', '2026-07-16 13:40:09'),
	(4, 1, 'Idul Fitri 1447 H', '2026-04-01', 'National', NULL, 1, '2026-07-16 13:40:09', '2026-07-16 13:40:09'),
	(5, 1, 'Idul Fitri 1447 H (Hari 2)', '2026-04-02', 'National', NULL, 1, '2026-07-16 13:40:09', '2026-07-16 13:40:09'),
	(6, 1, 'Hari Buruh', '2026-05-01', 'National', NULL, 1, '2026-07-16 13:40:09', '2026-07-16 13:40:09'),
	(7, 1, 'Kenaikan Yesus Kristus', '2026-05-21', 'National', NULL, 1, '2026-07-16 13:40:09', '2026-07-16 13:40:09'),
	(8, 1, 'Hari Lahir Pancasila', '2026-06-01', 'National', NULL, 1, '2026-07-16 13:40:09', '2026-07-16 13:40:09'),
	(9, 1, 'Idul Adha 1447 H', '2026-06-08', 'National', NULL, 1, '2026-07-16 13:40:09', '2026-07-16 13:40:09'),
	(10, 1, 'Tahun Baru Islam 1448 H', '2026-06-28', 'National', NULL, 1, '2026-07-16 13:40:09', '2026-07-16 13:40:09'),
	(11, 1, 'Hari Kemerdekaan', '2026-08-17', 'National', NULL, 1, '2026-07-16 13:40:09', '2026-07-16 13:40:09'),
	(12, 1, 'Maulid Nabi Muhammad SAW', '2026-09-05', 'National', NULL, 1, '2026-07-16 13:40:09', '2026-07-16 13:40:09'),
	(13, 1, 'Natal', '2026-12-25', 'National', NULL, 1, '2026-07-16 13:40:09', '2026-07-16 13:40:09');

-- Dumping structure for table hris_payroll_db.leave_adjustments
CREATE TABLE IF NOT EXISTS `leave_adjustments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `leave_type_id` int NOT NULL,
  `adjustment_type` enum('Add','Deduct') COLLATE utf8mb4_unicode_ci NOT NULL,
  `days` decimal(10,2) NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `effective_date` date NOT NULL,
  `reference_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approved_by` int NOT NULL,
  `approved_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  KEY `leave_type_id` (`leave_type_id`),
  KEY `approved_by` (`approved_by`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `leave_adjustments_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `leave_adjustments_ibfk_2` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`) ON DELETE CASCADE,
  CONSTRAINT `leave_adjustments_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `leave_adjustments_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.leave_adjustments: ~0 rows (approximately)

-- Dumping structure for table hris_payroll_db.leave_balances
CREATE TABLE IF NOT EXISTS `leave_balances` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `leave_type_id` int NOT NULL,
  `year` int NOT NULL,
  `opening_balance` decimal(10,2) DEFAULT '0.00',
  `accrued` decimal(10,2) DEFAULT '0.00',
  `taken` decimal(10,2) DEFAULT '0.00',
  `adjusted` decimal(10,2) DEFAULT '0.00',
  `closing_balance` decimal(10,2) DEFAULT '0.00',
  `expires_at` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_employee_leave_year` (`employee_id`,`leave_type_id`,`year`),
  KEY `leave_type_id` (`leave_type_id`),
  CONSTRAINT `leave_balances_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `leave_balances_ibfk_2` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.leave_balances: ~0 rows (approximately)
INSERT IGNORE INTO `leave_balances` (`id`, `employee_id`, `leave_type_id`, `year`, `opening_balance`, `accrued`, `taken`, `adjusted`, `closing_balance`, `expires_at`, `created_at`, `updated_at`) VALUES
	(1, 1, 1, 2026, 12.00, 0.00, 3.00, 0.00, 9.00, NULL, '2026-07-16 13:40:10', '2026-07-16 13:40:10'),
	(2, 2, 1, 2026, 12.00, 0.00, 2.00, 0.00, 10.00, NULL, '2026-07-16 13:40:10', '2026-07-16 13:40:10'),
	(3, 3, 1, 2026, 12.00, 0.00, 5.00, 0.00, 7.00, NULL, '2026-07-16 13:40:10', '2026-07-16 13:40:10'),
	(4, 4, 1, 2026, 12.00, 0.00, 1.00, 0.00, 11.00, NULL, '2026-07-16 13:40:10', '2026-07-16 13:40:10'),
	(5, 5, 1, 2026, 12.00, 0.00, 4.00, 0.00, 8.00, NULL, '2026-07-16 13:40:10', '2026-07-16 13:40:10'),
	(6, 6, 1, 2026, 12.00, 0.00, 2.00, 0.00, 10.00, NULL, '2026-07-16 13:40:10', '2026-07-16 13:40:10'),
	(7, 7, 1, 2026, 12.00, 0.00, 0.00, 0.00, 12.00, NULL, '2026-07-16 13:40:10', '2026-07-16 13:40:10'),
	(8, 8, 1, 2026, 12.00, 0.00, 3.00, 0.00, 9.00, NULL, '2026-07-16 13:40:10', '2026-07-16 13:40:10'),
	(9, 9, 1, 2026, 12.00, 0.00, 1.00, 0.00, 11.00, NULL, '2026-07-16 13:40:10', '2026-07-16 13:40:10'),
	(10, 10, 1, 2026, 12.00, 0.00, 2.00, 0.00, 10.00, NULL, '2026-07-16 13:40:10', '2026-07-16 13:40:10'),
	(11, 11, 1, 2026, 12.00, 0.00, 0.00, 0.00, 12.00, NULL, '2026-07-16 13:40:10', '2026-07-16 13:40:10'),
	(12, 12, 1, 2026, 12.00, 0.00, 3.00, 0.00, 9.00, NULL, '2026-07-16 13:40:10', '2026-07-16 13:40:10'),
	(13, 13, 1, 2026, 12.00, 0.00, 4.00, 0.00, 8.00, NULL, '2026-07-16 13:40:10', '2026-07-16 13:40:10'),
	(14, 14, 1, 2026, 12.00, 0.00, 1.00, 0.00, 11.00, NULL, '2026-07-16 13:40:10', '2026-07-16 13:40:10'),
	(15, 15, 1, 2026, 12.00, 0.00, 2.00, 0.00, 10.00, NULL, '2026-07-16 13:40:10', '2026-07-16 13:40:10');

-- Dumping structure for table hris_payroll_db.leave_requests
CREATE TABLE IF NOT EXISTS `leave_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `leave_type_id` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_days` decimal(10,2) NOT NULL,
  `working_days` decimal(10,2) NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `replacement_employee_id` int DEFAULT NULL,
  `document_urls` json DEFAULT NULL,
  `contact_during_leave` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address_during_leave` text COLLATE utf8mb4_unicode_ci,
  `status` enum('Pending Manager','Pending HR','Approved','Rejected','Revision','Cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'Pending Manager',
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `manager_approved_by` int DEFAULT NULL,
  `manager_approved_at` timestamp NULL DEFAULT NULL,
  `hr_approved_by` int DEFAULT NULL,
  `hr_approved_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `cancelled_by` int DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `leave_type_id` (`leave_type_id`),
  KEY `replacement_employee_id` (`replacement_employee_id`),
  KEY `manager_approved_by` (`manager_approved_by`),
  KEY `hr_approved_by` (`hr_approved_by`),
  KEY `cancelled_by` (`cancelled_by`),
  KEY `idx_employee_status` (`employee_id`,`status`),
  KEY `idx_date_range` (`start_date`,`end_date`),
  KEY `idx_status` (`status`),
  CONSTRAINT `leave_requests_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `leave_requests_ibfk_2` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`) ON DELETE CASCADE,
  CONSTRAINT `leave_requests_ibfk_3` FOREIGN KEY (`replacement_employee_id`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  CONSTRAINT `leave_requests_ibfk_4` FOREIGN KEY (`manager_approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `leave_requests_ibfk_5` FOREIGN KEY (`hr_approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `leave_requests_ibfk_6` FOREIGN KEY (`cancelled_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.leave_requests: ~0 rows (approximately)

-- Dumping structure for table hris_payroll_db.leave_types
CREATE TABLE IF NOT EXISTS `leave_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('Annual','Sick','Personal','Maternity','Paternity','Unpaid','Compassionate','Medical','Other') COLLATE utf8mb4_unicode_ci DEFAULT 'Other',
  `default_days_per_year` int DEFAULT '0',
  `max_days_per_request` int DEFAULT NULL,
  `min_days_per_request` int DEFAULT '1',
  `requires_document` tinyint(1) DEFAULT '0',
  `is_paid` tinyint(1) DEFAULT '1',
  `accrual_type` enum('Yearly','Monthly','PerPeriod') COLLATE utf8mb4_unicode_ci DEFAULT 'Yearly',
  `carry_over_max_days` int DEFAULT '0',
  `expiry_months` int DEFAULT '12',
  `color_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_leave_type_code` (`company_id`,`code`),
  CONSTRAINT `leave_types_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.leave_types: ~0 rows (approximately)
INSERT IGNORE INTO `leave_types` (`id`, `company_id`, `code`, `name`, `type`, `default_days_per_year`, `max_days_per_request`, `min_days_per_request`, `requires_document`, `is_paid`, `accrual_type`, `carry_over_max_days`, `expiry_months`, `color_code`, `is_active`, `created_at`, `updated_at`) VALUES
	(1, 1, 'ANNUAL', 'Annual Leave', 'Annual', 12, 5, 1, 0, 1, 'Yearly', 0, 12, '#2F4B7C', 1, '2026-07-16 13:40:10', '2026-07-16 13:40:10'),
	(2, 1, 'SICK', 'Sick Leave', 'Sick', 14, 7, 1, 1, 1, 'Yearly', 0, 12, '#4E8B6F', 1, '2026-07-16 13:40:10', '2026-07-16 13:40:10'),
	(3, 1, 'MATERNITY', 'Maternity Leave', 'Maternity', 90, 90, 1, 1, 1, 'Yearly', 0, 12, '#C08552', 1, '2026-07-16 13:40:10', '2026-07-16 13:40:10'),
	(4, 1, 'UNPAID', 'Unpaid Leave', 'Unpaid', 30, 10, 1, 0, 0, 'Yearly', 0, 12, '#B54B4B', 1, '2026-07-16 13:40:10', '2026-07-16 13:40:10'),
	(5, 1, 'COMPASSIONATE', 'Compassionate Leave', 'Compassionate', 3, 3, 1, 0, 1, 'Yearly', 0, 12, '#5D6675', 1, '2026-07-16 13:40:10', '2026-07-16 13:40:10');

-- Dumping structure for table hris_payroll_db.loan_installments
CREATE TABLE IF NOT EXISTS `loan_installments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `loan_id` int NOT NULL,
  `payroll_period_id` int DEFAULT NULL,
  `installment_number` int NOT NULL,
  `due_date` date NOT NULL,
  `principal_amount` decimal(15,2) NOT NULL,
  `interest_amount` decimal(15,2) DEFAULT '0.00',
  `total_amount` decimal(15,2) NOT NULL,
  `paid_amount` decimal(15,2) DEFAULT '0.00',
  `paid_at` timestamp NULL DEFAULT NULL,
  `status` enum('Pending','Paid','Partial','Overdue','Waived') COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `payroll_period_id` (`payroll_period_id`),
  KEY `idx_loan_due` (`loan_id`,`due_date`),
  CONSTRAINT `loan_installments_ibfk_1` FOREIGN KEY (`loan_id`) REFERENCES `employee_loans` (`id`) ON DELETE CASCADE,
  CONSTRAINT `loan_installments_ibfk_2` FOREIGN KEY (`payroll_period_id`) REFERENCES `payroll_periods` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.loan_installments: ~0 rows (approximately)

-- Dumping structure for table hris_payroll_db.notifications
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `notification_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `channel` enum('Email','SMS','WhatsApp','Push','In-App') COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` enum('Low','Normal','High','Urgent') COLLATE utf8mb4_unicode_ci DEFAULT 'Normal',
  `status` enum('Pending','Sent','Delivered','Read','Failed') COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `sent_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `retry_count` int DEFAULT '0',
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_status` (`user_id`,`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.notifications: ~0 rows (approximately)

-- Dumping structure for table hris_payroll_db.notification_templates
CREATE TABLE IF NOT EXISTS `notification_templates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `channel` enum('Email','SMS','WhatsApp','Push','In-App') COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject_template` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `body_template` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `variables` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.notification_templates: ~2 rows (approximately)
INSERT IGNORE INTO `notification_templates` (`id`, `code`, `name`, `channel`, `subject_template`, `body_template`, `variables`, `is_active`, `created_at`, `updated_at`) VALUES
	(1, 'LEAVE_REQUEST', 'Leave Request Submission', 'Email', 'Leave Request: {employee_name}', 'Dear {approver_name},\n\n{employee_name} has submitted a leave request:\nType: {leave_type}\nDates: {start_date} to {end_date}\nReason: {reason}\n\nPlease review and approve/reject.', '["employee_name", "approver_name", "leave_type", "start_date", "end_date", "reason"]', 1, '2026-07-15 14:11:39', '2026-07-15 14:11:39'),
	(2, 'LEAVE_APPROVED', 'Leave Request Approved', 'Email', 'Leave Request Approved', 'Dear {employee_name},\n\nYour leave request has been approved.\nType: {leave_type}\nDates: {start_date} to {end_date}\n\nThank you.', '["employee_name", "leave_type", "start_date", "end_date"]', 1, '2026-07-15 14:11:39', '2026-07-15 14:11:39'),
	(3, 'PAYROLL_CREATED', 'Payslip Available', 'Email', 'Payslip Available - {period_name}', 'Dear {employee_name},\n\nYour payslip for {period_name} is now available.\nNet Salary: {net_salary}\n\nPlease login to view details.', '["employee_name", "period_name", "net_salary"]', 1, '2026-07-15 14:11:39', '2026-07-15 14:11:39');

-- Dumping structure for table hris_payroll_db.overtime_requests
CREATE TABLE IF NOT EXISTS `overtime_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `requested_hours` decimal(5,2) NOT NULL,
  `approved_hours` decimal(5,2) DEFAULT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cost_center` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected','Revision') COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `approved_by` int DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `payment_rate` decimal(5,2) DEFAULT '1.00',
  `calculated_amount` decimal(15,2) DEFAULT NULL,
  `paid_in_payroll_period` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `approved_by` (`approved_by`),
  KEY `idx_employee_date` (`employee_id`,`date`),
  KEY `idx_status` (`status`),
  CONSTRAINT `overtime_requests_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `overtime_requests_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.overtime_requests: ~0 rows (approximately)

-- Dumping structure for table hris_payroll_db.payroll_periods
CREATE TABLE IF NOT EXISTS `payroll_periods` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `period_type` enum('Monthly','Bi-weekly','Weekly','Daily') COLLATE utf8mb4_unicode_ci DEFAULT 'Monthly',
  `payment_day` int DEFAULT '25',
  `cutoff_day` int DEFAULT '20',
  `fiscal_year` int NOT NULL,
  `period_number` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `payment_date` date DEFAULT NULL,
  `status` enum('Draft','Initialized','Processing','Simulated','Approved','Paid','Closed') COLLATE utf8mb4_unicode_ci DEFAULT 'Draft',
  `initialized_by` int DEFAULT NULL,
  `initialized_at` timestamp NULL DEFAULT NULL,
  `approved_by` int DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `closed_by` int DEFAULT NULL,
  `closed_at` timestamp NULL DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_period` (`company_id`,`fiscal_year`,`period_number`),
  KEY `initialized_by` (`initialized_by`),
  KEY `approved_by` (`approved_by`),
  KEY `closed_by` (`closed_by`),
  CONSTRAINT `payroll_periods_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payroll_periods_ibfk_2` FOREIGN KEY (`initialized_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `payroll_periods_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `payroll_periods_ibfk_4` FOREIGN KEY (`closed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.payroll_periods: ~0 rows (approximately)

-- Dumping structure for table hris_payroll_db.payroll_transactions
CREATE TABLE IF NOT EXISTS `payroll_transactions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `payroll_period_id` int NOT NULL,
  `employee_id` int NOT NULL,
  `employee_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department_id` int DEFAULT NULL,
  `position_id` int DEFAULT NULL,
  `working_days` int DEFAULT '0',
  `present_days` int DEFAULT '0',
  `leave_days` int DEFAULT '0',
  `absent_days` int DEFAULT '0',
  `overtime_hours` decimal(5,2) DEFAULT '0.00',
  `basic_salary` decimal(15,2) DEFAULT '0.00',
  `gross_salary` decimal(15,2) DEFAULT '0.00',
  `earnings` json DEFAULT NULL,
  `deductions` json DEFAULT NULL,
  `bpjs_health_employee` decimal(15,2) DEFAULT '0.00',
  `bpjs_employment_employee` decimal(15,2) DEFAULT '0.00',
  `pension_employee` decimal(15,2) DEFAULT '0.00',
  `taxable_income` decimal(15,2) DEFAULT '0.00',
  `pph21_employee` decimal(15,2) DEFAULT '0.00',
  `net_salary` decimal(15,2) DEFAULT '0.00',
  `payment_method` enum('Bank Transfer','Cash','Check') COLLATE utf8mb4_unicode_ci DEFAULT 'Bank Transfer',
  `bank_account_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_status` enum('Pending','Paid','Failed','On Hold') COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `paid_at` timestamp NULL DEFAULT NULL,
  `payslip_generated` tinyint(1) DEFAULT '0',
  `payslip_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `journal_entry_id` int DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  KEY `department_id` (`department_id`),
  KEY `position_id` (`position_id`),
  KEY `idx_period_employee` (`payroll_period_id`,`employee_id`),
  KEY `idx_payment_status` (`payment_status`),
  CONSTRAINT `payroll_transactions_ibfk_1` FOREIGN KEY (`payroll_period_id`) REFERENCES `payroll_periods` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payroll_transactions_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payroll_transactions_ibfk_3` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `payroll_transactions_ibfk_4` FOREIGN KEY (`position_id`) REFERENCES `positions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.payroll_transactions: ~0 rows (approximately)

-- Dumping structure for table hris_payroll_db.payroll_variable_items
CREATE TABLE IF NOT EXISTS `payroll_variable_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `payroll_period_id` int NOT NULL,
  `employee_id` int NOT NULL,
  `salary_component_id` int NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `quantity` decimal(10,2) DEFAULT '1.00',
  `rate` decimal(15,2) DEFAULT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `reference_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` int DEFAULT NULL,
  `is_recurring` tinyint(1) DEFAULT '0',
  `approved_by` int DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `payroll_period_id` (`payroll_period_id`),
  KEY `employee_id` (`employee_id`),
  KEY `salary_component_id` (`salary_component_id`),
  KEY `approved_by` (`approved_by`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `payroll_variable_items_ibfk_1` FOREIGN KEY (`payroll_period_id`) REFERENCES `payroll_periods` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payroll_variable_items_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payroll_variable_items_ibfk_3` FOREIGN KEY (`salary_component_id`) REFERENCES `salary_components` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payroll_variable_items_ibfk_4` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `payroll_variable_items_ibfk_5` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.payroll_variable_items: ~0 rows (approximately)

-- Dumping structure for table hris_payroll_db.positions
CREATE TABLE IF NOT EXISTS `positions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `department_id` int DEFAULT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `level` int DEFAULT '1',
  `reports_to_position_id` int DEFAULT NULL,
  `job_description` text COLLATE utf8mb4_unicode_ci,
  `requirements` text COLLATE utf8mb4_unicode_ci,
  `min_salary` decimal(15,2) DEFAULT NULL,
  `max_salary` decimal(15,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `company_id` (`company_id`),
  KEY `department_id` (`department_id`),
  KEY `reports_to_position_id` (`reports_to_position_id`),
  CONSTRAINT `positions_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `positions_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `positions_ibfk_3` FOREIGN KEY (`reports_to_position_id`) REFERENCES `positions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.positions: ~0 rows (approximately)
INSERT IGNORE INTO `positions` (`id`, `company_id`, `department_id`, `code`, `name`, `level`, `reports_to_position_id`, `job_description`, `requirements`, `min_salary`, `max_salary`, `is_active`, `created_at`, `updated_at`) VALUES
	(1, 1, 1, 'DIR-CEO', 'Chief Executive Officer', 10, NULL, NULL, NULL, 100000000.00, 200000000.00, 1, '2026-07-16 13:40:03', '2026-07-16 13:40:03'),
	(2, 1, 1, 'DIR-CTO', 'Chief Technology Officer', 9, NULL, NULL, NULL, 80000000.00, 150000000.00, 1, '2026-07-16 13:40:03', '2026-07-16 13:40:03'),
	(3, 1, 2, 'MGR-ENG', 'Engineering Manager', 7, NULL, NULL, NULL, 40000000.00, 70000000.00, 1, '2026-07-16 13:40:03', '2026-07-16 13:40:03'),
	(4, 1, 2, 'SR-DEV', 'Senior Developer', 5, NULL, NULL, NULL, 25000000.00, 45000000.00, 1, '2026-07-16 13:40:03', '2026-07-16 13:40:03'),
	(5, 1, 2, 'DEV', 'Developer', 3, NULL, NULL, NULL, 12000000.00, 25000000.00, 1, '2026-07-16 13:40:03', '2026-07-16 13:40:03'),
	(6, 1, 2, 'JR-DEV', 'Junior Developer', 2, NULL, NULL, NULL, 8000000.00, 15000000.00, 1, '2026-07-16 13:40:03', '2026-07-16 13:40:03'),
	(7, 1, 3, 'MGR-MKT', 'Marketing Manager', 6, NULL, NULL, NULL, 30000000.00, 55000000.00, 1, '2026-07-16 13:40:03', '2026-07-16 13:40:03'),
	(8, 1, 4, 'MGR-FIN', 'Finance Manager', 6, NULL, NULL, NULL, 30000000.00, 55000000.00, 1, '2026-07-16 13:40:03', '2026-07-16 13:40:03'),
	(9, 1, 4, 'ACC', 'Accountant', 3, NULL, NULL, NULL, 10000000.00, 20000000.00, 1, '2026-07-16 13:40:03', '2026-07-16 13:40:03'),
	(10, 1, 5, 'MGR-HR', 'HR Manager', 6, NULL, NULL, NULL, 30000000.00, 55000000.00, 1, '2026-07-16 13:40:03', '2026-07-16 13:40:03'),
	(11, 1, 5, 'HRC', 'HR Coordinator', 3, NULL, NULL, NULL, 10000000.00, 20000000.00, 1, '2026-07-16 13:40:03', '2026-07-16 13:40:03'),
	(12, 1, 7, 'MGR-SLS', 'Sales Manager', 6, NULL, NULL, NULL, 30000000.00, 55000000.00, 1, '2026-07-16 13:40:03', '2026-07-16 13:40:03'),
	(13, 1, 7, 'SALES', 'Sales Executive', 3, NULL, NULL, NULL, 10000000.00, 20000000.00, 1, '2026-07-16 13:40:03', '2026-07-16 13:40:03'),
	(14, 1, 6, 'MGR-OPS', 'Operations Manager', 6, NULL, NULL, NULL, 30000000.00, 55000000.00, 1, '2026-07-16 13:40:03', '2026-07-16 13:40:03');

-- Dumping structure for table hris_payroll_db.pph21_calculations
CREATE TABLE IF NOT EXISTS `pph21_calculations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `payroll_period_id` int NOT NULL,
  `employee_id` int NOT NULL,
  `gross_annual_income` decimal(15,2) DEFAULT '0.00',
  `deductible_expenses` decimal(15,2) DEFAULT '0.00',
  `jabatan_expense` decimal(15,2) DEFAULT '0.00',
  `pension_expense` decimal(15,2) DEFAULT '0.00',
  `total_deductions` decimal(15,2) DEFAULT '0.00',
  `taxable_income_annual` decimal(15,2) DEFAULT '0.00',
  `pph21_annual` decimal(15,2) DEFAULT '0.00',
  `pph21_monthly` decimal(15,2) DEFAULT '0.00',
  `tax_category` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ptkp_amount` decimal(15,2) DEFAULT '0.00',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `employee_id` (`employee_id`),
  KEY `idx_period_employee` (`payroll_period_id`,`employee_id`),
  CONSTRAINT `pph21_calculations_ibfk_1` FOREIGN KEY (`payroll_period_id`) REFERENCES `payroll_periods` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pph21_calculations_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.pph21_calculations: ~0 rows (approximately)

-- Dumping structure for table hris_payroll_db.roles
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `permissions` json DEFAULT NULL,
  `is_system_role` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.roles: ~6 rows (approximately)
INSERT IGNORE INTO `roles` (`id`, `name`, `display_name`, `description`, `permissions`, `is_system_role`, `created_at`, `updated_at`) VALUES
	(1, 'Administrator', 'System Administrator', 'Full system access', '["all"]', 1, '2026-07-16 13:40:04', '2026-07-16 13:40:04'),
	(2, 'HR Staff', 'HR Staff', 'HR operations and employee management', '["view_employees", "edit_employees", "view_attendance", "edit_attendance", "view_leave", "approve_leave", "view_payroll", "edit_payroll"]', 1, '2026-07-16 13:40:04', '2026-07-16 13:40:04'),
	(3, 'Manager', 'Manager', 'Department manager with approval rights', '["view_employees", "view_attendance", "approve_attendance", "view_leave", "approve_leave", "view_payroll_own_dept"]', 1, '2026-07-16 13:40:04', '2026-07-16 13:40:04'),
	(4, 'Employee', 'Employee', 'Basic employee self-service access', '["view_profile", "edit_profile", "view_attendance_own", "apply_leave", "view_leave_own", "view_payslip"]', 1, '2026-07-16 13:40:04', '2026-07-16 13:40:04'),
	(5, 'Finance', 'Finance/Payroll', 'Payroll processing and finance', '["view_employees", "view_payroll", "edit_payroll", "approve_payroll", "view_compliance", "export_payroll"]', 1, '2026-07-16 13:40:04', '2026-07-16 13:40:04'),
	(6, 'Director', 'Director', 'Executive access with full approvals', '["view_all", "approve_payroll", "approve_high_value"]', 1, '2026-07-16 13:40:04', '2026-07-16 13:40:04');

-- Dumping structure for table hris_payroll_db.salary_components
CREATE TABLE IF NOT EXISTS `salary_components` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('Earning','Deduction','Tax','Benefit') COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('Fixed','Variable','Reimbursement','Loan','Tax','BPJS') COLLATE utf8mb4_unicode_ci NOT NULL,
  `calculation_type` enum('Fixed Amount','Percentage of Basic','Percentage of Gross','Formula','Tiered') COLLATE utf8mb4_unicode_ci DEFAULT 'Fixed Amount',
  `formula` text COLLATE utf8mb4_unicode_ci,
  `is_taxable` tinyint(1) DEFAULT '1',
  `is_pensionable` tinyint(1) DEFAULT '0',
  `is_bpjs_base` tinyint(1) DEFAULT '0',
  `display_on_payslip` tinyint(1) DEFAULT '1',
  `sequence_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `effective_from` date DEFAULT NULL,
  `effective_to` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_component_code` (`company_id`,`code`),
  CONSTRAINT `salary_components_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.salary_components: ~0 rows (approximately)
INSERT IGNORE INTO `salary_components` (`id`, `company_id`, `code`, `name`, `type`, `category`, `calculation_type`, `formula`, `is_taxable`, `is_pensionable`, `is_bpjs_base`, `display_on_payslip`, `sequence_order`, `is_active`, `effective_from`, `effective_to`, `created_at`, `updated_at`) VALUES
	(1, 1, 'BASIC', 'Basic Salary', 'Earning', 'Fixed', 'Fixed Amount', NULL, 1, 1, 0, 1, 1, 1, NULL, NULL, '2026-07-16 13:40:11', '2026-07-16 13:40:11'),
	(2, 1, 'TRANSPORT', 'Transport Allowance', 'Earning', 'Fixed', 'Fixed Amount', NULL, 0, 0, 0, 1, 2, 1, NULL, NULL, '2026-07-16 13:40:11', '2026-07-16 13:40:11'),
	(3, 1, 'MEAL', 'Meal Allowance', 'Earning', 'Fixed', 'Fixed Amount', NULL, 0, 0, 0, 1, 3, 1, NULL, NULL, '2026-07-16 13:40:11', '2026-07-16 13:40:11'),
	(4, 1, 'HEALTH', 'BPJS Kesehatan', 'Deduction', 'BPJS', 'Percentage of Basic', NULL, 0, 0, 0, 1, 10, 1, NULL, NULL, '2026-07-16 13:40:11', '2026-07-16 13:40:11'),
	(5, 1, 'JHT', 'BPJS JHT', 'Deduction', 'BPJS', 'Percentage of Basic', NULL, 0, 1, 0, 1, 11, 1, NULL, NULL, '2026-07-16 13:40:11', '2026-07-16 13:40:11'),
	(6, 1, 'JP', 'BPJS JP', 'Deduction', 'BPJS', 'Percentage of Basic', NULL, 0, 1, 0, 1, 12, 1, NULL, NULL, '2026-07-16 13:40:11', '2026-07-16 13:40:11'),
	(7, 1, 'PENSION', 'Pension Contribution', 'Deduction', 'Tax', 'Percentage of Basic', NULL, 0, 1, 0, 1, 13, 1, NULL, NULL, '2026-07-16 13:40:11', '2026-07-16 13:40:11'),
	(8, 1, 'PPH21', 'PPh 21 Income Tax', 'Tax', 'Tax', 'Tiered', NULL, 0, 0, 0, 1, 14, 1, NULL, NULL, '2026-07-16 13:40:11', '2026-07-16 13:40:11'),
	(9, 1, 'OVERTIME', 'Overtime Pay', 'Earning', 'Variable', 'Formula', NULL, 1, 0, 0, 1, 4, 1, NULL, NULL, '2026-07-16 13:40:11', '2026-07-16 13:40:11'),
	(10, 1, 'BONUS', 'Bonus', 'Earning', 'Variable', 'Fixed Amount', NULL, 1, 0, 0, 1, 5, 1, NULL, NULL, '2026-07-16 13:40:11', '2026-07-16 13:40:11');

-- Dumping structure for table hris_payroll_db.schedules
CREATE TABLE IF NOT EXISTS `schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `shift_id` int NOT NULL,
  `date` date NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `is_off` tinyint(1) DEFAULT '0',
  `is_holiday` tinyint(1) DEFAULT '0',
  `holiday_id` int DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_employee_date` (`employee_id`,`date`),
  KEY `shift_id` (`shift_id`),
  KEY `holiday_id` (`holiday_id`),
  KEY `created_by` (`created_by`),
  KEY `idx_date_range` (`date`),
  CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `schedules_ibfk_2` FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `schedules_ibfk_3` FOREIGN KEY (`holiday_id`) REFERENCES `holidays` (`id`) ON DELETE SET NULL,
  CONSTRAINT `schedules_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.schedules: ~0 rows (approximately)

-- Dumping structure for table hris_payroll_db.shifts
CREATE TABLE IF NOT EXISTS `shifts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `break_start` time DEFAULT NULL,
  `break_end` time DEFAULT NULL,
  `break_duration_minutes` int DEFAULT '60',
  `work_hours` decimal(5,2) NOT NULL,
  `is_paid_overtime` tinyint(1) DEFAULT '1',
  `overtime_start_after_minutes` int DEFAULT '0',
  `color_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_shift_code` (`company_id`,`code`),
  CONSTRAINT `shifts_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.shifts: ~0 rows (approximately)
INSERT IGNORE INTO `shifts` (`id`, `company_id`, `code`, `name`, `start_time`, `end_time`, `break_start`, `break_end`, `break_duration_minutes`, `work_hours`, `is_paid_overtime`, `overtime_start_after_minutes`, `color_code`, `is_active`, `created_at`, `updated_at`) VALUES
	(1, 1, 'SHF-MRN', 'Morning Shift', '08:00:00', '17:00:00', '12:00:00', '13:00:00', 60, 8.00, 1, 0, '#2F4B7C', 1, '2026-07-16 13:40:09', '2026-07-16 13:40:09'),
	(2, 1, 'SHF-AFT', 'Afternoon Shift', '13:00:00', '22:00:00', '18:00:00', '19:00:00', 60, 8.00, 1, 0, '#C08552', 1, '2026-07-16 13:40:09', '2026-07-16 13:40:09'),
	(3, 1, 'SHF-NGT', 'Night Shift', '22:00:00', '07:00:00', '02:00:00', '03:00:00', 60, 8.00, 1, 0, '#4E8B6F', 1, '2026-07-16 13:40:09', '2026-07-16 13:40:09'),
	(4, 1, 'SHF-FLX', 'Flexible', '08:00:00', '17:00:00', '12:00:00', '13:00:00', 60, 8.00, 1, 0, '#4A7BB5', 1, '2026-07-16 13:40:09', '2026-07-16 13:40:09');

-- Dumping structure for table hris_payroll_db.tax_rates
CREATE TABLE IF NOT EXISTS `tax_rates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `year` int NOT NULL,
  `layer_number` int NOT NULL,
  `min_income` decimal(15,2) NOT NULL,
  `max_income` decimal(15,2) DEFAULT NULL,
  `tax_rate` decimal(5,2) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_tax_layer` (`year`,`layer_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.tax_rates: ~0 rows (approximately)

-- Dumping structure for table hris_payroll_db.training_enrollments
CREATE TABLE IF NOT EXISTS `training_enrollments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `training_session_id` int NOT NULL,
  `employee_id` int NOT NULL,
  `enrollment_status` enum('Nominated','Registered','Confirmed','Completed','No Show','Withdrawn') COLLATE utf8mb4_unicode_ci DEFAULT 'Nominated',
  `nominated_by` int DEFAULT NULL,
  `nominated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `confirmed_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `withdrawal_reason` text COLLATE utf8mb4_unicode_ci,
  `pre_test_score` decimal(5,2) DEFAULT NULL,
  `post_test_score` decimal(5,2) DEFAULT NULL,
  `evaluation_score` decimal(5,2) DEFAULT NULL,
  `feedback` text COLLATE utf8mb4_unicode_ci,
  `certificate_issued` tinyint(1) DEFAULT '0',
  `certificate_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `certificate_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_enrollment` (`training_session_id`,`employee_id`),
  KEY `employee_id` (`employee_id`),
  KEY `nominated_by` (`nominated_by`),
  CONSTRAINT `training_enrollments_ibfk_1` FOREIGN KEY (`training_session_id`) REFERENCES `training_sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `training_enrollments_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `training_enrollments_ibfk_3` FOREIGN KEY (`nominated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.training_enrollments: ~0 rows (approximately)

-- Dumping structure for table hris_payroll_db.training_programs
CREATE TABLE IF NOT EXISTS `training_programs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('Internal','External','Online','Workshop','Seminar','Certification') COLLATE utf8mb4_unicode_ci DEFAULT 'Internal',
  `objective` text COLLATE utf8mb4_unicode_ci,
  `target_audience` text COLLATE utf8mb4_unicode_ci,
  `prerequisites` text COLLATE utf8mb4_unicode_ci,
  `duration_hours` decimal(5,2) DEFAULT NULL,
  `cost_estimate` decimal(15,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_training_code` (`company_id`,`code`),
  CONSTRAINT `training_programs_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.training_programs: ~0 rows (approximately)

-- Dumping structure for table hris_payroll_db.training_sessions
CREATE TABLE IF NOT EXISTS `training_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `training_program_id` int NOT NULL,
  `session_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `trainer_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `trainer_organization` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `venue` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_datetime` datetime NOT NULL,
  `end_datetime` datetime NOT NULL,
  `max_participants` int DEFAULT NULL,
  `enrolled_count` int DEFAULT '0',
  `status` enum('Planned','Open','Full','InProgress','Completed','Cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'Planned',
  `cost_actual` decimal(15,2) DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_session_code` (`session_code`),
  KEY `training_program_id` (`training_program_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `training_sessions_ibfk_1` FOREIGN KEY (`training_program_id`) REFERENCES `training_programs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `training_sessions_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.training_sessions: ~0 rows (approximately)

-- Dumping structure for table hris_payroll_db.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int DEFAULT NULL,
  `role_id` int NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `last_login_at` timestamp NULL DEFAULT NULL,
  `failed_login_attempts` int DEFAULT '0',
  `locked_until` timestamp NULL DEFAULT NULL,
  `must_change_password` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table hris_payroll_db.users: ~6 rows (approximately)
INSERT IGNORE INTO `users` (`id`, `employee_id`, `role_id`, `username`, `password_hash`, `email`, `phone`, `is_active`, `last_login_at`, `failed_login_attempts`, `locked_until`, `must_change_password`, `created_at`, `updated_at`) VALUES
	(2, 8, 2, 'hrstaff', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'hr@hris.com', '081234567891', 1, NULL, 0, NULL, 0, '2026-07-16 13:40:04', '2026-07-16 13:40:06'),
	(3, 3, 3, 'manager', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'manager@hris.com', '081234567892', 1, NULL, 0, NULL, 0, '2026-07-16 13:40:04', '2026-07-16 13:40:06'),
	(4, 5, 4, 'employee', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'employee@hris.com', '081234567893', 1, NULL, 0, NULL, 0, '2026-07-16 13:40:04', '2026-07-16 13:40:07'),
	(5, 9, 5, 'finance', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'finance@hris.com', '081234567894', 1, NULL, 0, NULL, 0, '2026-07-16 13:40:04', '2026-07-16 13:40:07'),
	(6, 1, 6, 'director', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'director@hris.com', '081234567895', 1, NULL, 0, NULL, 0, '2026-07-16 13:40:04', '2026-07-16 13:40:08'),
	(7, NULL, 1, 'admin', '$2b$10$9s4Bn0bZkZSEqfcJERs.p.Q864jTrF3z63w8GtDDg3BPwq51D3ivy', 'admin@hris.com', NULL, 1, '2026-07-16 13:43:42', 0, NULL, 0, '2026-07-16 13:43:03', '2026-07-16 13:43:42');

-- Dumping structure for view hris_payroll_db.v_attendance_daily_summary
-- Creating temporary table to overcome VIEW dependency errors
CREATE TABLE `v_attendance_daily_summary` (
	`date` DATE NOT NULL,
	`total_employees` BIGINT(19) NOT NULL,
	`present_count` DECIMAL(23,0) NULL,
	`absent_count` DECIMAL(23,0) NULL,
	`late_count` DECIMAL(23,0) NULL,
	`total_late_minutes` DECIMAL(32,0) NULL,
	`total_overtime_hours` DECIMAL(27,2) NULL,
	`avg_work_hours` DECIMAL(9,6) NULL
) ENGINE=MyISAM;

-- Dumping structure for view hris_payroll_db.v_employee_summary
-- Creating temporary table to overcome VIEW dependency errors
CREATE TABLE `v_employee_summary` (
	`id` INT(10) NOT NULL,
	`employee_number` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`full_name` VARCHAR(302) NULL COLLATE 'utf8mb4_unicode_ci',
	`gender` ENUM('M','F') NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`date_of_birth` DATE NULL,
	`employment_status` ENUM('Permanent','Contract','Probation','Intern','Outsource') NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`hire_date` DATE NOT NULL,
	`company_name` VARCHAR(200) NULL COLLATE 'utf8mb4_unicode_ci',
	`branch_name` VARCHAR(200) NULL COLLATE 'utf8mb4_unicode_ci',
	`department_name` VARCHAR(200) NULL COLLATE 'utf8mb4_unicode_ci',
	`position_name` VARCHAR(200) NULL COLLATE 'utf8mb4_unicode_ci',
	`grade_name` VARCHAR(100) NULL COLLATE 'utf8mb4_unicode_ci',
	`supervisor_number` VARCHAR(50) NULL COLLATE 'utf8mb4_unicode_ci',
	`supervisor_name` VARCHAR(201) NULL COLLATE 'utf8mb4_unicode_ci',
	`is_active` TINYINT(1) NULL
) ENGINE=MyISAM;

-- Dumping structure for view hris_payroll_db.v_leave_balance_current
-- Creating temporary table to overcome VIEW dependency errors
CREATE TABLE `v_leave_balance_current` (
	`employee_number` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`employee_name` VARCHAR(201) NULL COLLATE 'utf8mb4_unicode_ci',
	`leave_type` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`year` INT(10) NOT NULL,
	`opening_balance` DECIMAL(10,2) NULL,
	`accrued` DECIMAL(10,2) NULL,
	`taken` DECIMAL(10,2) NULL,
	`adjusted` DECIMAL(10,2) NULL,
	`current_balance` DECIMAL(10,2) NULL,
	`expires_at` DATE NULL
) ENGINE=MyISAM;

-- Dumping structure for view hris_payroll_db.v_payroll_period_summary
-- Creating temporary table to overcome VIEW dependency errors
CREATE TABLE `v_payroll_period_summary` (
	`period_code` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`period_name` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`status` ENUM('Draft','Initialized','Processing','Simulated','Approved','Paid','Closed') NULL COLLATE 'utf8mb4_unicode_ci',
	`employee_count` BIGINT(19) NOT NULL,
	`total_basic` DECIMAL(37,2) NULL,
	`total_gross` DECIMAL(37,2) NULL,
	`total_earnings` DOUBLE NULL,
	`total_deductions` DOUBLE NULL,
	`total_net` DECIMAL(37,2) NULL,
	`payment_date` DATE NULL
) ENGINE=MyISAM;

-- Dumping structure for view hris_payroll_db.v_attendance_daily_summary
-- Removing temporary table and create final VIEW structure
DROP TABLE IF EXISTS `v_attendance_daily_summary`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `v_attendance_daily_summary` AS select `ar`.`date` AS `date`,count(distinct `ar`.`employee_id`) AS `total_employees`,sum((case when (`ar`.`status` = 'Present') then 1 else 0 end)) AS `present_count`,sum((case when (`ar`.`status` = 'Absent') then 1 else 0 end)) AS `absent_count`,sum((case when (`ar`.`status` = 'Late') then 1 else 0 end)) AS `late_count`,sum(`ar`.`late_minutes`) AS `total_late_minutes`,sum(`ar`.`overtime_hours`) AS `total_overtime_hours`,avg(`ar`.`work_hours`) AS `avg_work_hours` from `attendance_records` `ar` group by `ar`.`date`;

-- Dumping structure for view hris_payroll_db.v_employee_summary
-- Removing temporary table and create final VIEW structure
DROP TABLE IF EXISTS `v_employee_summary`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `v_employee_summary` AS select `e`.`id` AS `id`,`e`.`employee_number` AS `employee_number`,concat(`e`.`first_name`,' ',ifnull(`e`.`middle_name`,''),' ',`e`.`last_name`) AS `full_name`,`e`.`gender` AS `gender`,`e`.`date_of_birth` AS `date_of_birth`,`e`.`employment_status` AS `employment_status`,`e`.`hire_date` AS `hire_date`,`c`.`name` AS `company_name`,`br`.`name` AS `branch_name`,`d`.`name` AS `department_name`,`p`.`name` AS `position_name`,`g`.`name` AS `grade_name`,`sup`.`employee_number` AS `supervisor_number`,concat(`sup`.`first_name`,' ',`sup`.`last_name`) AS `supervisor_name`,`e`.`is_active` AS `is_active` from ((((((`employees` `e` left join `companies` `c` on((`e`.`company_id` = `c`.`id`))) left join `branches` `br` on((`e`.`branch_id` = `br`.`id`))) left join `departments` `d` on((`e`.`department_id` = `d`.`id`))) left join `positions` `p` on((`e`.`position_id` = `p`.`id`))) left join `grades` `g` on((`e`.`grade_id` = `g`.`id`))) left join `employees` `sup` on((`e`.`supervisor_id` = `sup`.`id`)));

-- Dumping structure for view hris_payroll_db.v_leave_balance_current
-- Removing temporary table and create final VIEW structure
DROP TABLE IF EXISTS `v_leave_balance_current`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `v_leave_balance_current` AS select `e`.`employee_number` AS `employee_number`,concat(`e`.`first_name`,' ',`e`.`last_name`) AS `employee_name`,`lt`.`name` AS `leave_type`,`lb`.`year` AS `year`,`lb`.`opening_balance` AS `opening_balance`,`lb`.`accrued` AS `accrued`,`lb`.`taken` AS `taken`,`lb`.`adjusted` AS `adjusted`,`lb`.`closing_balance` AS `current_balance`,`lb`.`expires_at` AS `expires_at` from ((`leave_balances` `lb` join `employees` `e` on((`lb`.`employee_id` = `e`.`id`))) join `leave_types` `lt` on((`lb`.`leave_type_id` = `lt`.`id`))) where (`lb`.`year` = year(curdate()));

-- Dumping structure for view hris_payroll_db.v_payroll_period_summary
-- Removing temporary table and create final VIEW structure
DROP TABLE IF EXISTS `v_payroll_period_summary`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `v_payroll_period_summary` AS select `pp`.`code` AS `period_code`,`pp`.`name` AS `period_name`,`pp`.`status` AS `status`,count(`pt`.`id`) AS `employee_count`,sum(`pt`.`basic_salary`) AS `total_basic`,sum(`pt`.`gross_salary`) AS `total_gross`,sum(`pt`.`earnings`) AS `total_earnings`,sum(`pt`.`deductions`) AS `total_deductions`,sum(`pt`.`net_salary`) AS `total_net`,`pp`.`payment_date` AS `payment_date` from (`payroll_periods` `pp` left join `payroll_transactions` `pt` on((`pp`.`id` = `pt`.`payroll_period_id`))) group by `pp`.`id`;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
