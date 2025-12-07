-- FK constraint'i tamamen kaldır ve doğru şekilde yeniden oluştur
USE personnel_db;

-- Mevcut FK constraint'leri göster
SELECT 'Mevcut FK Constraints:' as Info;
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

-- Foreign key checks'i kapat
SET FOREIGN_KEY_CHECKS = 0;

-- Mevcut FK constraint'i kaldır
ALTER TABLE Personnel DROP FOREIGN KEY FK_Personnel_Companies_CompanyId;

-- Index'i de kaldır (varsa)
DROP INDEX FK_Personnel_Companies_CompanyId ON Personnel;

-- Foreign key checks'i aç
SET FOREIGN_KEY_CHECKS = 1;

-- Şimdi doğru tablo adıyla yeniden oluştur
ALTER TABLE Personnel
ADD CONSTRAINT FK_Personnel_Companies_CompanyId
FOREIGN KEY (CompanyId) REFERENCES Companies(Id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Sonucu kontrol et
SELECT 'Yeni FK Constraint:' as Info;
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

-- Test için basit bir update dene
SELECT 'Test Update:' as Info;
UPDATE Personnel SET UpdatedAt = NOW() WHERE Id = 1 LIMIT 1;
