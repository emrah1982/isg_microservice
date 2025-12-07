-- Kontrol Formu Uygulamaları için veritabanı tabloları
-- Tarih: 2025-10-13
-- Açıklama: Kontrol formlarının uygulanması/doldurulması için yeni tablolar

USE activities_db;

-- ControlFormExecutions tablosu
CREATE TABLE IF NOT EXISTS ControlFormExecutions (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    ControlFormTemplateId INT NOT NULL,
    ExecutionNumber VARCHAR(50) NOT NULL UNIQUE,
    MachineId INT NULL,
    MachineName VARCHAR(200) NULL,
    MachineModel VARCHAR(100) NULL,
    MachineSerialNumber VARCHAR(100) NULL,
    Location VARCHAR(200) NULL,
    ExecutionDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ExecutedByPersonnelId INT NULL,
    ExecutedByPersonName VARCHAR(100) NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'InProgress',
    Notes TEXT NULL,
    ChecklistResponsesJson TEXT NOT NULL,
    TotalScore DECIMAL(18,2) NULL,
    MaxScore DECIMAL(18,2) NULL,
    SuccessPercentage DECIMAL(5,2) NULL,
    HasCriticalIssues BOOLEAN NOT NULL DEFAULT FALSE,
    CompletedAt DATETIME NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NULL,
    
    -- Foreign Key Constraints
    CONSTRAINT FK_ControlFormExecutions_ControlFormTemplate 
        FOREIGN KEY (ControlFormTemplateId) REFERENCES ControlFormTemplates(Id) ON DELETE RESTRICT,
    
    -- Indexes
    INDEX IX_ControlFormExecutions_ExecutionNumber (ExecutionNumber),
    INDEX IX_ControlFormExecutions_ExecutionDate (ExecutionDate),
    INDEX IX_ControlFormExecutions_Status (Status),
    INDEX IX_ControlFormExecutions_TemplateId_ExecutionDate (ControlFormTemplateId, ExecutionDate),
    INDEX IX_ControlFormExecutions_MachineId (MachineId),
    INDEX IX_ControlFormExecutions_PersonnelId (ExecutedByPersonnelId)
);

-- ControlFormExecutionAttachments tablosu
CREATE TABLE IF NOT EXISTS ControlFormExecutionAttachments (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    ControlFormExecutionId INT NOT NULL,
    FileName VARCHAR(255) NOT NULL,
    StoredPath VARCHAR(500) NOT NULL,
    ContentType VARCHAR(100) NULL,
    FileSize BIGINT NOT NULL DEFAULT 0,
    FileType VARCHAR(20) NOT NULL DEFAULT 'Document',
    Description VARCHAR(500) NULL,
    UploadedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraints
    CONSTRAINT FK_ControlFormExecutionAttachments_ControlFormExecution 
        FOREIGN KEY (ControlFormExecutionId) REFERENCES ControlFormExecutions(Id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX IX_ControlFormExecutionAttachments_ExecutionId (ControlFormExecutionId)
);

-- Örnek veri ekleme (test amaçlı)
INSERT INTO ControlFormExecutions (
    ControlFormTemplateId, ExecutionNumber, MachineName, MachineModel, 
    Location, ExecutedByPersonName, Status, Notes, ChecklistResponsesJson
) 
SELECT 
    1 as ControlFormTemplateId,
    CONCAT('EXE-', DATE_FORMAT(NOW(), '%Y%m%d'), '-001') as ExecutionNumber,
    'Test Makinesi' as MachineName,
    'Model-X1' as MachineModel,
    'Üretim Sahası A' as Location,
    'Test Personeli' as ExecutedByPersonName,
    'InProgress' as Status,
    'Test kontrol uygulaması' as Notes,
    '[]' as ChecklistResponsesJson
WHERE EXISTS (SELECT 1 FROM ControlFormTemplates WHERE Id = 1)
AND NOT EXISTS (SELECT 1 FROM ControlFormExecutions WHERE ExecutionNumber LIKE 'EXE-%');

-- Trigger: UpdatedAt alanını otomatik güncelleme
DELIMITER $$

CREATE TRIGGER IF NOT EXISTS tr_ControlFormExecutions_UpdatedAt
    BEFORE UPDATE ON ControlFormExecutions
    FOR EACH ROW
BEGIN
    SET NEW.UpdatedAt = CURRENT_TIMESTAMP;
END$$

DELIMITER ;

-- Status değerleri için check constraint (MySQL 8.0.16+)
-- ALTER TABLE ControlFormExecutions 
-- ADD CONSTRAINT chk_ControlFormExecutions_Status 
-- CHECK (Status IN ('InProgress', 'Completed', 'Cancelled'));

-- FileType değerleri için check constraint (MySQL 8.0.16+)
-- ALTER TABLE ControlFormExecutionAttachments 
-- ADD CONSTRAINT chk_ControlFormExecutionAttachments_FileType 
-- CHECK (FileType IN ('Document', 'Image', 'Video'));

-- Veritabanı istatistikleri
SELECT 
    'ControlFormExecutions' as TableName,
    COUNT(*) as RecordCount
FROM ControlFormExecutions
UNION ALL
SELECT 
    'ControlFormExecutionAttachments' as TableName,
    COUNT(*) as RecordCount
FROM ControlFormExecutionAttachments;

COMMIT;
