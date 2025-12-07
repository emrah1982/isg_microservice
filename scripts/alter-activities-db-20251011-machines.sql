-- Migration: Makine Varlığı Sistemi
-- Tarih: 2025-10-11
-- Açıklama: Machine tablosu oluşturma ve ControlForm ilişkilendirme

-- 1. Machines tablosunu oluştur
CREATE TABLE IF NOT EXISTS Machines (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    MachineType VARCHAR(100) NOT NULL COMMENT 'Makine tipi (Forklift, Ekskavatör, vb.)',
    Name VARCHAR(200) NOT NULL COMMENT 'Makine adı/tanımı',
    Model VARCHAR(100) NULL COMMENT 'Model bilgisi',
    SerialNumber VARCHAR(100) NULL UNIQUE COMMENT 'Seri numarası - benzersiz',
    Location VARCHAR(200) NULL COMMENT 'Makine lokasyonu',
    ManufactureYear INT NULL COMMENT 'Üretim yılı',
    Status VARCHAR(50) NOT NULL DEFAULT 'Active' COMMENT 'Active, Maintenance, Retired',
    CustomChecklistJson TEXT NULL COMMENT 'Makineye özel kontrol listesi JSON',
    Notes TEXT NULL COMMENT 'Notlar',
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NULL,
    INDEX idx_machine_type (MachineType),
    INDEX idx_serial_number (SerialNumber),
    INDEX idx_status (Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. ControlForms tablosuna MachineId kolonu ekle
ALTER TABLE ControlForms 
ADD COLUMN MachineId INT NULL AFTER FormNumber,
ADD INDEX idx_machine_id (MachineId);

-- 3. Foreign key ilişkisi ekle
ALTER TABLE ControlForms
ADD CONSTRAINT fk_controlforms_machine
FOREIGN KEY (MachineId) REFERENCES Machines(Id)
ON DELETE SET NULL;

-- 4. Eski alanları nullable yap (geriye dönük uyumluluk)
ALTER TABLE ControlForms
MODIFY COLUMN MachineName VARCHAR(200) NULL,
MODIFY COLUMN MachineModel VARCHAR(100) NULL,
MODIFY COLUMN MachineSerialNumber VARCHAR(100) NULL,
MODIFY COLUMN Location VARCHAR(200) NULL;

-- 5. Mevcut verilerden makineleri oluştur (unique kombinasyonlar)
INSERT INTO Machines (MachineType, Name, Model, SerialNumber, Location, Status, CreatedAt)
SELECT DISTINCT
    COALESCE(MachineName, 'Bilinmeyen') as MachineType,
    COALESCE(MachineName, 'Bilinmeyen') as Name,
    MachineModel,
    MachineSerialNumber,
    Location,
    'Active',
    NOW()
FROM ControlForms
WHERE MachineName IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM Machines m 
      WHERE m.Name = ControlForms.MachineName 
        AND (m.Model = ControlForms.MachineModel OR (m.Model IS NULL AND ControlForms.MachineModel IS NULL))
        AND (m.SerialNumber = ControlForms.MachineSerialNumber OR (m.SerialNumber IS NULL AND ControlForms.MachineSerialNumber IS NULL))
  )
GROUP BY MachineName, MachineModel, MachineSerialNumber, Location;

-- 6. Mevcut ControlForms kayıtlarını Machines ile ilişkilendir
UPDATE ControlForms cf
INNER JOIN Machines m ON (
    cf.MachineName = m.Name
    AND (cf.MachineModel = m.Model OR (cf.MachineModel IS NULL AND m.Model IS NULL))
    AND (cf.MachineSerialNumber = m.SerialNumber OR (cf.MachineSerialNumber IS NULL AND m.SerialNumber IS NULL))
)
SET cf.MachineId = m.Id
WHERE cf.MachineId IS NULL;

-- 7. Örnek makine verileri ekle (test için)
INSERT INTO Machines (MachineType, Name, Model, SerialNumber, Location, Status, CreatedAt)
VALUES
('Forklift', 'Forklift 1', 'Toyota 8FD25', 'SN123456', 'Depo A', 'Active', NOW()),
('Forklift', 'Forklift 2', 'Toyota 7FB20', 'SN789012', 'Depo B', 'Active', NOW()),
('Ekskavatör', 'Ekskavatör 1', 'CAT 320D', 'EX001234', 'Şantiye 1', 'Active', NOW()),
('Roc', 'Roc Delici 1', 'Atlas Copco ROC D7', 'ROC456789', 'Maden Sahası', 'Active', NOW()),
('Kompresör', 'Kompresör 1', 'Atlas Copco GA55', 'COMP123', 'Üretim Alanı', 'Active', NOW())
ON DUPLICATE KEY UPDATE Id=Id;

-- 8. Sonuç kontrolü
SELECT 
    'Machines' as TableName,
    COUNT(*) as RecordCount,
    COUNT(DISTINCT MachineType) as UniqueMachineTypes
FROM Machines
UNION ALL
SELECT 
    'ControlForms with MachineId' as TableName,
    COUNT(*) as RecordCount,
    COUNT(DISTINCT MachineId) as UniqueMachines
FROM ControlForms
WHERE MachineId IS NOT NULL;

-- 9. Makine tiplerine göre özet
SELECT 
    MachineType,
    COUNT(*) as MachineCount,
    SUM(CASE WHEN Status = 'Active' THEN 1 ELSE 0 END) as ActiveCount,
    SUM(CASE WHEN Status = 'Maintenance' THEN 1 ELSE 0 END) as MaintenanceCount,
    SUM(CASE WHEN Status = 'Retired' THEN 1 ELSE 0 END) as RetiredCount
FROM Machines
GROUP BY MachineType
ORDER BY MachineType;
