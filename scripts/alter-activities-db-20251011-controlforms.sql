-- Control Forms Tables
-- MySQL compatible

USE activities_db;

-- ControlForms table
CREATE TABLE IF NOT EXISTS ControlForms (
  Id INT NOT NULL AUTO_INCREMENT,
  FormNumber VARCHAR(50) NOT NULL,
  MachineName VARCHAR(200) NOT NULL,
  MachineModel VARCHAR(100) NULL,
  MachineSerialNumber VARCHAR(100) NULL,
  Location VARCHAR(200) NULL,
  ControlDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ControlledByPersonName VARCHAR(100) NULL,
  ControlledByPersonnelId INT NULL,
  Status VARCHAR(20) NOT NULL DEFAULT 'Pending',
  Notes VARCHAR(2000) NULL,
  ChecklistItemsJson TEXT NULL,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (Id),
  UNIQUE KEY UX_ControlForms_FormNumber (FormNumber),
  KEY IX_ControlForms_ControlDate (ControlDate),
  KEY IX_ControlForms_Status (Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ControlFormAttachments table
CREATE TABLE IF NOT EXISTS ControlFormAttachments (
  Id INT NOT NULL AUTO_INCREMENT,
  ControlFormId INT NOT NULL,
  FileName VARCHAR(255) NOT NULL,
  StoredPath VARCHAR(500) NOT NULL,
  ContentType VARCHAR(100) NULL,
  FileSize BIGINT NOT NULL,
  FileType VARCHAR(20) NOT NULL DEFAULT 'Document',
  UploadedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (Id),
  KEY IX_ControlFormAttachments_ControlFormId (ControlFormId),
  CONSTRAINT FK_ControlFormAttachments_ControlForms FOREIGN KEY (ControlFormId) 
    REFERENCES ControlForms(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Example data
INSERT IGNORE INTO ControlForms (Id, FormNumber, MachineName, MachineModel, Location, ControlDate, ControlledByPersonName, Status, Notes, ChecklistItemsJson)
VALUES
  (1, 'KF-2025-001', 'Forklift', 'Toyota 8FD25', 'Depo A', '2025-01-10 09:00:00', 'Ahmet Yılmaz', 'Completed', 'Tüm kontroller tamamlandı.', '[{"item":"Fren sistemi","status":"OK","notes":""},{"item":"Hidrolik sistem","status":"OK","notes":""},{"item":"Lastikler","status":"Warning","notes":"Ön sol lastik aşınmış"}]'),
  (2, 'KF-2025-002', 'Vinç', 'Liebherr LTM 1100', 'Şantiye B', '2025-01-11 14:30:00', 'Mehmet Demir', 'Completed', 'Küçük bakım gerekli.', '[{"item":"Kablo sistemi","status":"OK","notes":""},{"item":"Motor","status":"OK","notes":""},{"item":"Güvenlik kilitleri","status":"OK","notes":""}]'),
  (3, 'KF-2025-003', 'Kompresör', 'Atlas Copco GA55', 'Üretim C', '2025-01-12 08:15:00', 'Ayşe Kaya', 'Pending', 'Kontrol devam ediyor.', '[{"item":"Basınç göstergesi","status":"OK","notes":""},{"item":"Yağ seviyesi","status":"Warning","notes":"Yağ eklenecek"}]');
