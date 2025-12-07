-- Non-destructive schema update for hierarchical categories in Documents
-- Adds MainCategory and SubCategory columns and indexes

USE documents_db;

ALTER TABLE Documents
  ADD COLUMN IF NOT EXISTS MainCategory VARCHAR(100) NULL AFTER Category,
  ADD COLUMN IF NOT EXISTS SubCategory VARCHAR(100) NULL AFTER MainCategory;

-- Helpful indexes for filtering/grouping
CREATE INDEX IF NOT EXISTS idx_main_category ON Documents (MainCategory);
CREATE INDEX IF NOT EXISTS idx_sub_category ON Documents (SubCategory);
