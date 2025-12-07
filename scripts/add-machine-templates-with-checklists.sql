-- Tüm makine tipleri için kontrol listesi şablonları
-- Bu script çalıştırıldığında yaygın makine tipleri için örnek kontrol listeleri oluşturulur

-- 1. Ekskavatör
INSERT INTO MachineTemplates (MachineType, Description, IsActive, CreatedAt)
SELECT 'Ekskavatör', 'Ekskavatör tipi makine kontrol şablonu', 1, NOW()
WHERE NOT EXISTS (SELECT 1 FROM MachineTemplates WHERE MachineType = 'Ekskavatör');

SET @excavatorId = (SELECT Id FROM MachineTemplates WHERE MachineType = 'Ekskavatör' LIMIT 1);
DELETE FROM MachineChecklistItems WHERE MachineTemplateId = @excavatorId;

INSERT INTO MachineChecklistItems (MachineTemplateId, ItemText, Category, DisplayOrder, IsRequired, CreatedAt)
VALUES
(@excavatorId, 'Motor yağ seviyesi kontrolü', 'Bakım', 0, 1, NOW()),
(@excavatorId, 'Hidrolik yağ seviyesi ve sızıntı kontrolü', 'Hidrolik', 1, 1, NOW()),
(@excavatorId, 'Paletler ve zincir gerginliği kontrolü', 'Mekanik', 2, 1, NOW()),
(@excavatorId, 'Kova ve dişler kontrolü', 'Mekanik', 3, 1, NOW()),
(@excavatorId, 'Boom, arm ve silindir kontrolü', 'Hidrolik', 4, 1, NOW()),
(@excavatorId, 'Fren sistemi testi', 'Güvenlik', 5, 1, NOW()),
(@excavatorId, 'Acil durdurma sistemi testi', 'Güvenlik', 6, 1, NOW()),
(@excavatorId, 'Kabin içi kontroller ve göstergeler', 'Genel', 7, 1, NOW()),
(@excavatorId, 'Işıklandırma ve sinyal sistemi', 'Elektrik', 8, 0, NOW()),
(@excavatorId, 'Genel temizlik', 'Genel', 9, 0, NOW());

-- 2. Forklift
INSERT INTO MachineTemplates (MachineType, Description, IsActive, CreatedAt)
SELECT 'Forklift', 'Forklift tipi makine kontrol şablonu', 1, NOW()
WHERE NOT EXISTS (SELECT 1 FROM MachineTemplates WHERE MachineType = 'Forklift');

SET @forkliftId = (SELECT Id FROM MachineTemplates WHERE MachineType = 'Forklift' LIMIT 1);
DELETE FROM MachineChecklistItems WHERE MachineTemplateId = @forkliftId;

INSERT INTO MachineChecklistItems (MachineTemplateId, ItemText, Category, DisplayOrder, IsRequired, CreatedAt)
VALUES
(@forkliftId, 'Fren sistemi kontrolü', 'Güvenlik', 0, 1, NOW()),
(@forkliftId, 'Direksiyon ve kumanda kontrolü', 'Mekanik', 1, 1, NOW()),
(@forkliftId, 'Hidrolik sistem ve çatal kontrolü', 'Hidrolik', 2, 1, NOW()),
(@forkliftId, 'Lastik basıncı ve aşınma kontrolü', 'Mekanik', 3, 1, NOW()),
(@forkliftId, 'Akü seviyesi ve şarj durumu', 'Elektrik', 4, 1, NOW()),
(@forkliftId, 'Korna ve geri vites sesi testi', 'Güvenlik', 5, 1, NOW()),
(@forkliftId, 'Farlar ve sinyal lambaları kontrolü', 'Elektrik', 6, 1, NOW()),
(@forkliftId, 'Emniyet kemeri ve kabin kontrolü', 'Güvenlik', 7, 1, NOW()),
(@forkliftId, 'Yağ sızıntısı kontrolü', 'Bakım', 8, 0, NOW()),
(@forkliftId, 'Genel temizlik ve bakım', 'Genel', 9, 0, NOW());

-- 3. Roc
INSERT INTO MachineTemplates (MachineType, Description, IsActive, CreatedAt)
SELECT 'Roc', 'Roc tipi makine kontrol şablonu', 1, NOW()
WHERE NOT EXISTS (SELECT 1 FROM MachineTemplates WHERE MachineType = 'Roc');

SET @rocId = (SELECT Id FROM MachineTemplates WHERE MachineType = 'Roc' LIMIT 1);
DELETE FROM MachineChecklistItems WHERE MachineTemplateId = @rocId;

INSERT INTO MachineChecklistItems (MachineTemplateId, ItemText, Category, DisplayOrder, IsRequired, CreatedAt)
VALUES
(@rocId, 'Motor çalışma durumu kontrolü', 'Mekanik', 0, 1, NOW()),
(@rocId, 'Yağ seviyesi kontrolü', 'Bakım', 1, 1, NOW()),
(@rocId, 'Hidrolik sistem basınç kontrolü', 'Hidrolik', 2, 1, NOW()),
(@rocId, 'Güvenlik kilidi ve acil durdurma butonu testi', 'Güvenlik', 3, 1, NOW()),
(@rocId, 'Elektrik bağlantıları ve kablo kontrolü', 'Elektrik', 4, 1, NOW()),
(@rocId, 'Hortum ve boru bağlantıları sızıntı kontrolü', 'Hidrolik', 5, 1, NOW()),
(@rocId, 'Fren sistemi kontrolü', 'Güvenlik', 6, 1, NOW()),
(@rocId, 'Kumanda paneli ve gösterge kontrolü', 'Elektrik', 7, 1, NOW()),
(@rocId, 'Temizlik ve genel görünüm', 'Genel', 8, 0, NOW()),
(@rocId, 'Operatör el kitabı ve dokümantasyon kontrolü', 'Genel', 9, 0, NOW());

-- 4. Kompresör
INSERT INTO MachineTemplates (MachineType, Description, IsActive, CreatedAt)
SELECT 'Kompresör', 'Kompresör tipi makine kontrol şablonu', 1, NOW()
WHERE NOT EXISTS (SELECT 1 FROM MachineTemplates WHERE MachineType = 'Kompresör');

SET @compressorId = (SELECT Id FROM MachineTemplates WHERE MachineType = 'Kompresör' LIMIT 1);
DELETE FROM MachineChecklistItems WHERE MachineTemplateId = @compressorId;

INSERT INTO MachineChecklistItems (MachineTemplateId, ItemText, Category, DisplayOrder, IsRequired, CreatedAt)
VALUES
(@compressorId, 'Hava basıncı kontrolü', 'Mekanik', 0, 1, NOW()),
(@compressorId, 'Yağ seviyesi kontrolü', 'Bakım', 1, 1, NOW()),
(@compressorId, 'Hava filtresi kontrolü', 'Bakım', 2, 1, NOW()),
(@compressorId, 'Emniyet valfi testi', 'Güvenlik', 3, 1, NOW()),
(@compressorId, 'Motor ve kayış kontrolü', 'Mekanik', 4, 1, NOW()),
(@compressorId, 'Elektrik bağlantıları kontrolü', 'Elektrik', 5, 1, NOW()),
(@compressorId, 'Hortum ve bağlantı kontrolü', 'Mekanik', 6, 1, NOW()),
(@compressorId, 'Su drenaj kontrolü', 'Bakım', 7, 0, NOW()),
(@compressorId, 'Gürültü seviyesi kontrolü', 'Genel', 8, 0, NOW()),
(@compressorId, 'Genel temizlik', 'Genel', 9, 0, NOW());

-- 5. Jeneratör
INSERT INTO MachineTemplates (MachineType, Description, IsActive, CreatedAt)
SELECT 'Jeneratör', 'Jeneratör tipi makine kontrol şablonu', 1, NOW()
WHERE NOT EXISTS (SELECT 1 FROM MachineTemplates WHERE MachineType = 'Jeneratör');

SET @generatorId = (SELECT Id FROM MachineTemplates WHERE MachineType = 'Jeneratör' LIMIT 1);
DELETE FROM MachineChecklistItems WHERE MachineTemplateId = @generatorId;

INSERT INTO MachineChecklistItems (MachineTemplateId, ItemText, Category, DisplayOrder, IsRequired, CreatedAt)
VALUES
(@generatorId, 'Motor yağ seviyesi kontrolü', 'Bakım', 0, 1, NOW()),
(@generatorId, 'Soğutma suyu seviyesi kontrolü', 'Bakım', 1, 1, NOW()),
(@generatorId, 'Akü seviyesi ve şarj durumu', 'Elektrik', 2, 1, NOW()),
(@generatorId, 'Yakıt seviyesi ve sızıntı kontrolü', 'Bakım', 3, 1, NOW()),
(@generatorId, 'Hava filtresi kontrolü', 'Bakım', 4, 1, NOW()),
(@generatorId, 'Elektrik çıkış voltaj kontrolü', 'Elektrik', 5, 1, NOW()),
(@generatorId, 'Acil durdurma butonu testi', 'Güvenlik', 6, 1, NOW()),
(@generatorId, 'Egzoz sistemi kontrolü', 'Genel', 7, 0, NOW()),
(@generatorId, 'Ses izolasyonu kontrolü', 'Genel', 8, 0, NOW()),
(@generatorId, 'Genel temizlik', 'Genel', 9, 0, NOW());

-- Sonuç özeti
SELECT 
    mt.MachineType,
    mt.Description,
    COUNT(mci.Id) as ChecklistItemCount,
    mt.IsActive
FROM MachineTemplates mt
LEFT JOIN MachineChecklistItems mci ON mt.Id = mci.MachineTemplateId
GROUP BY mt.Id, mt.MachineType, mt.Description, mt.IsActive
ORDER BY mt.MachineType;
