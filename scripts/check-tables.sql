-- Tablo adlarını ve constraint'leri kontrol et
USE personnel_db;

-- Tablo adlarını göster
SHOW TABLES;

-- Personnel tablosu yapısını göster
DESCRIBE Personnel;

-- Companies tablosu yapısını göster  
DESCRIBE Companies;

-- Mevcut foreign key constraint'leri göster
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'personnel_db'
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Personnel tablosundaki CompanyId değerlerini kontrol et
SELECT DISTINCT CompanyId FROM Personnel WHERE CompanyId IS NOT NULL;

-- Companies tablosundaki Id değerlerini kontrol et
SELECT Id, Name FROM Companies;
