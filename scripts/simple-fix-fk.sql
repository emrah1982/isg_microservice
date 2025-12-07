-- Basit FK constraint düzeltmesi
USE personnel_db;

-- Foreign key checks'i kapat
SET FOREIGN_KEY_CHECKS = 0;

-- Personnel tablosunu yeniden oluştur (FK constraint olmadan)
CREATE TABLE Personnel_temp LIKE Personnel;
INSERT INTO Personnel_temp SELECT * FROM Personnel;
DROP TABLE Personnel;
RENAME TABLE Personnel_temp TO Personnel;

-- Foreign key checks'i aç
SET FOREIGN_KEY_CHECKS = 1;

-- Şimdi doğru FK constraint'i ekle
ALTER TABLE Personnel
ADD CONSTRAINT FK_Personnel_Companies_CompanyId
FOREIGN KEY (CompanyId) REFERENCES Companies(Id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Sonucu kontrol et
SELECT 'FK Constraint oluşturuldu:' as Info;
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'personnel_db'
AND TABLE_NAME = 'Personnel'
AND REFERENCED_TABLE_NAME IS NOT NULL;
