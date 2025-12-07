-- Personnel firma güncelleme testleri
USE personnel_db;

-- Mevcut verileri kontrol et
SELECT 'Mevcut Personnel kayıtları:' as Test;
SELECT Id, FirstName, LastName, CompanyId, Department FROM Personnel LIMIT 5;

SELECT 'Mevcut Company kayıtları:' as Test;
SELECT Id, Name FROM Companies LIMIT 5;

-- Test 1: Geçerli bir firma ile güncelleme
SELECT 'Test 1: Geçerli firma ile güncelleme' as Test;
UPDATE Personnel 
SET CompanyId = (SELECT Id FROM Companies LIMIT 1)
WHERE Id = (SELECT Id FROM Personnel LIMIT 1);

-- Test 2: Geçersiz firma ile güncelleme (hata vermeli)
SELECT 'Test 2: Geçersiz firma ile güncelleme (hata bekleniyor)' as Test;
-- Bu komut hata vermeli
-- UPDATE Personnel SET CompanyId = 99999 WHERE Id = (SELECT Id FROM Personnel LIMIT 1);

-- Test 3: NULL firma ile güncelleme (başarılı olmalı)
SELECT 'Test 3: NULL firma ile güncelleme' as Test;
UPDATE Personnel 
SET CompanyId = NULL
WHERE Id = (SELECT Id FROM Personnel LIMIT 1);

-- Foreign key constraint'in çalıştığını kontrol et
SELECT 'Foreign Key Constraints:' as Test;
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_NAME = 'Personnel' 
AND CONSTRAINT_NAME LIKE 'FK_%';

-- Son durum
SELECT 'Test sonrası Personnel durumu:' as Test;
SELECT Id, FirstName, LastName, CompanyId, Department FROM Personnel LIMIT 5;
