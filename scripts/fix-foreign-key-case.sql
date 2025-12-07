-- Foreign key constraint'i düzelt - tablo adı case sensitivity sorunu
USE personnel_db;

-- Önce mevcut constraint'i kaldır
SET FOREIGN_KEY_CHECKS = 0;

-- Mevcut FK constraint'i bul ve kaldır
SELECT CONCAT('ALTER TABLE Personnel DROP FOREIGN KEY ', CONSTRAINT_NAME, ';') as drop_command
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_NAME = 'Personnel' 
AND CONSTRAINT_NAME LIKE 'FK_%'
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Manuel olarak kaldır (yukarıdaki sorgudan çıkan komutu kullan)
ALTER TABLE Personnel DROP FOREIGN KEY FK_Personnel_Companies_CompanyId;

-- Doğru tablo adı ile yeniden oluştur
ALTER TABLE Personnel
ADD CONSTRAINT FK_Personnel_Companies_CompanyId
FOREIGN KEY (CompanyId) REFERENCES Companies(Id)
ON DELETE SET NULL
ON UPDATE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;

-- Kontrol et
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_NAME = 'Personnel' 
AND CONSTRAINT_NAME LIKE 'FK_%';

-- Test et
SELECT 'Personnel tablosu:' as Info, COUNT(*) as Count FROM Personnel;
SELECT 'Companies tablosu:' as Info, COUNT(*) as Count FROM Companies;
