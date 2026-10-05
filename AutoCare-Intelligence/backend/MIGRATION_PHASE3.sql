-- Run this once against an existing AutoCare MySQL database.
-- The existing schema may already have service_parts without a cost column.
ALTER TABLE service_parts ADD COLUMN cost DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Customer and notification features use the notifications table already present
-- in schema.mysql.sql. Do not run this migration more than once.
