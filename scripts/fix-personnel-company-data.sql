-- Personnel-Company veri uyumsuzluğunu düzelt
USE personnel_db;

-- Önce mevcut durumu kontrol et
SELECT 'Personnel tablosundaki CompanyId değerleri:' as Info;
SELECT DISTINCT CompanyId, COUNT(*) as PersonelSayisi 
FROM Personnel 
WHERE CompanyId IS NOT NULL 
GROUP BY CompanyId;

SELECT 'Companies tablosundaki Id değerleri:' as Info;
SELECT Id, Name FROM Companies ORDER BY Id;

-- Geçersiz CompanyId'leri bul
SELECT 'Geçersiz CompanyId olan personeller:' as Info;
SELECT p.Id, p.FirstName, p.LastName, p.CompanyId
FROM Personnel p
LEFT JOIN Companies c ON p.CompanyId = c.Id
WHERE p.CompanyId IS NOT NULL AND c.Id IS NULL;

-- Geçersiz CompanyId'leri NULL yap
UPDATE Personnel 
SET CompanyId = NULL 
WHERE CompanyId IS NOT NULL 
AND CompanyId NOT IN (SELECT Id FROM Companies);

-- Sonucu kontrol et
SELECT 'Düzeltme sonrası Personnel CompanyId durumu:' as Info;
SELECT 
    CASE 
        WHEN CompanyId IS NULL THEN 'NULL'
        ELSE CAST(CompanyId AS CHAR)
    END as CompanyId,
    COUNT(*) as PersonelSayisi
FROM Personnel 
GROUP BY CompanyId
ORDER BY CompanyId;

-- Şimdi FK constraint'i yeniden dene
-- Önce mevcut constraint'i kaldır
SET FOREIGN_KEY_CHECKS = 0;

-- Mevcut FK constraint'leri kontrol et
SELECT CONSTRAINT_NAME 
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_NAME = 'Personnel' 
AND CONSTRAINT_NAME LIKE 'FK_%'
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Varsa kaldır
DROP INDEX FK_Personnel_Companies_CompanyId ON Personnel;

-- Yeniden oluştur
ALTER TABLE Personnel
ADD CONSTRAINT FK_Personnel_Companies_CompanyId
FOREIGN KEY (CompanyId) REFERENCES Companies(Id)
ON DELETE SET NULL
ON UPDATE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;

-- Final kontrol
SELECT 'FK Constraint oluşturuldu:' as Info;
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_NAME = 'Personnel' 
AND CONSTRAINT_NAME LIKE 'FK_%';
