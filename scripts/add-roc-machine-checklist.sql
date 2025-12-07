-- Roc makinesine kontrol listesi maddeleri ekleme
-- Önce Roc makinesinin ID'sini bulalım (eğer yoksa oluşturalım)

-- Roc makine şablonunu kontrol et, yoksa ekle
INSERT INTO MachineTemplates (MachineType, Description, IsActive, CreatedAt)
SELECT 'Roc', 'Roc tipi makine kontrol şablonu', 1, NOW()
WHERE NOT EXISTS (SELECT 1 FROM MachineTemplates WHERE MachineType = 'Roc');

-- Roc makinesinin ID'sini al
SET @rocId = (SELECT Id FROM MachineTemplates WHERE MachineType = 'Roc' LIMIT 1);

-- Mevcut maddeleri temizle (isterseniz bu satırı kaldırabilirsiniz)
DELETE FROM MachineChecklistItems WHERE MachineTemplateId = @rocId;

-- Roc makinesine kontrol listesi maddeleri ekle
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

-- Sonuç kontrolü
SELECT 
    mt.Id,
    mt.MachineType,
    COUNT(mci.Id) as ChecklistItemCount
FROM MachineTemplates mt
LEFT JOIN MachineChecklistItems mci ON mt.Id = mci.MachineTemplateId
WHERE mt.MachineType = 'Roc'
GROUP BY mt.Id, mt.MachineType;
