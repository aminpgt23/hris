-- Migration: Face Recognition + Geolocation attendance support
-- Adds photo proof columns and extends method ENUM with 'Face'
-- Idempotent: safe to run multiple times (checks information_schema before ALTER)
-- Run: mysql -u root -p hris < backend/prisma/migration_facelocation.sql

-- 1. Extend method ENUMs (MODIFY is idempotent)
ALTER TABLE attendance_records
  MODIFY COLUMN check_in_method ENUM('Biometric', 'Mobile', 'Web', 'Face', 'API') DEFAULT 'Web',
  MODIFY COLUMN check_out_method ENUM('Biometric', 'Mobile', 'Web', 'Face', 'API') DEFAULT 'Web';

-- 2. Add photo columns only if they do not exist yet
SET @col_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'attendance_records'
    AND COLUMN_NAME IN ('check_in_photo', 'check_out_photo')
);

SET @sql := IF(@col_exists = 2,
  'SELECT 1',
  'ALTER TABLE attendance_records
     ADD COLUMN check_in_photo LONGTEXT NULL AFTER check_in_device_id,
     ADD COLUMN check_out_photo LONGTEXT NULL AFTER check_out_device_id'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Verify
SELECT COLUMN_NAME, COLUMN_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'attendance_records'
  AND COLUMN_NAME IN ('check_in_method', 'check_out_method', 'check_in_photo', 'check_out_photo')
ORDER BY ORDINAL_POSITION;
