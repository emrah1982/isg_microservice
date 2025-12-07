USE personnel_db;

-- Add NationalId column if not exists
ALTER TABLE Personnel
  ADD COLUMN IF NOT EXISTS NationalId VARCHAR(11) NULL AFTER UserId,
  ADD INDEX IF NOT EXISTS idx_personnel_national_phone (NationalId, Phone);

-- Backfill demo data if empty NationalId
UPDATE Personnel SET NationalId = '11111111111' WHERE NationalId IS NULL AND FirstName='Ahmet' AND LastName='Yılmaz';
UPDATE Personnel SET NationalId = '22222222222' WHERE NationalId IS NULL AND FirstName='Ayşe' AND LastName='Demir';
