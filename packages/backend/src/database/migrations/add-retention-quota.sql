-- Add retention and quota fields to ingestion_sources table
-- Run this migration after upgrading to the fork version

ALTER TABLE ingestion_sources
ADD COLUMN IF NOT EXISTS retention_days INTEGER,
ADD COLUMN IF NOT EXISTS quota_limit_bytes BIGINT;

-- Optional: Add comments
COMMENT ON COLUMN ingestion_sources.retention_days IS 'Retention period in days; NULL means unlimited';
COMMENT ON COLUMN ingestion_sources.quota_limit_bytes IS 'Disk quota limit in bytes; NULL means unlimited';
