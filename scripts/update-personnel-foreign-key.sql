-- Personnel tablosuna Company foreign key constraint'i ekle
-- Önce mevcut geçersiz CompanyId'leri temizle

USE personnel_db;

-- Geçersiz CompanyId'leri NULL yap
UPDATE Personnel 
SET CompanyId = NULL 
WHERE CompanyId IS NOT NULL 
AND CompanyId NOT IN (SELECT Id FROM Companies);

-- Foreign key constraint ekle
ALTER TABLE Personnel
ADD CONSTRAINT FK_Personnel_Companies_CompanyId
FOREIGN KEY (CompanyId) REFERENCES Companies(Id)
ON DELETE SET NULL;

-- Index varsa tekrar oluşturmaya gerek yok, ama emin olmak için kontrol et
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Personnel_CompanyId')
BEGIN
    CREATE INDEX IX_Personnel_CompanyId ON Personnel(CompanyId);
END

-- Kontrol sorguları
SELECT 'Personnel tablosundaki toplam kayıt sayısı:' as Info, COUNT(*) as Count FROM Personnel;
SELECT 'Geçerli CompanyId olan personel sayısı:' as Info, COUNT(*) as Count FROM Personnel WHERE CompanyId IS NOT NULL;
SELECT 'Companies tablosundaki toplam firma sayısı:' as Info, COUNT(*) as Count FROM Companies;

-- Foreign key constraint'in eklendiğini kontrol et
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_NAME = 'Personnel' 
AND CONSTRAINT_NAME LIKE 'FK_%';
