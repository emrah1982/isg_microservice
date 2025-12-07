-- Alter script for Activities DB on 2025-10-06
-- Adds DfiCode and AttachmentPath columns and creates index on DfiCode
-- Safe (idempotent-ish) operations using IF NOT EXISTS where supported

USE activities_db;

-- Ensure DailyIsgReports table exists (idempotent)
CREATE TABLE IF NOT EXISTS DailyIsgReports (
  Id INT NOT NULL AUTO_INCREMENT,
  ReportDate DATETIME NOT NULL,
  Shift VARCHAR(20) NOT NULL,
  WeatherCondition VARCHAR(200) NULL,
  CreatedBy VARCHAR(100) NULL,
  Highlights VARCHAR(2000) NULL,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (Id),
  KEY IX_DailyIsgReports_ReportDate (ReportDate),
  KEY IX_DailyIsgReports_ReportDate_Shift (ReportDate, Shift)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add DfiCode column if missing
SET @col := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'NonConformityFollowUps'
    AND COLUMN_NAME = 'DfiCode'
);
SET @sql := IF(@col = 0,
  'ALTER TABLE NonConformityFollowUps ADD COLUMN DfiCode VARCHAR(50) NULL AFTER AssignedToPersonName',
  'SELECT 1');
PREPARE s1 FROM @sql; EXECUTE s1; DEALLOCATE PREPARE s1;

-- Add AttachmentPath column if missing
SET @col := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'NonConformityFollowUps'
    AND COLUMN_NAME = 'AttachmentPath'
);
SET @sql := IF(@col = 0,
  'ALTER TABLE NonConformityFollowUps ADD COLUMN AttachmentPath VARCHAR(500) NULL AFTER DfiCode',
  'SELECT 1');
PREPARE s2 FROM @sql; EXECUTE s2; DEALLOCATE PREPARE s2;

-- Add RootCauseCategoriesCsv column if missing
SET @col := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'NonConformityFollowUps'
    AND COLUMN_NAME = 'RootCauseCategoriesCsv'
);
SET @sql := IF(@col = 0,
  'ALTER TABLE NonConformityFollowUps ADD COLUMN RootCauseCategoriesCsv VARCHAR(200) NULL AFTER RootCauseDetails',
  'SELECT 1');
PREPARE s3 FROM @sql; EXECUTE s3; DEALLOCATE PREPARE s3;

-- Create index on DfiCode if not exists
SET @idx := (
  SELECT COUNT(1) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'NonConformityFollowUps'
);
SET @sql := IF(@idx = 0,
  'CREATE INDEX IX_NonConformityFollowUps_DfiCode ON NonConformityFollowUps (DfiCode)',
  'SELECT 1');
PREPARE s4 FROM @sql; EXECUTE s4; DEALLOCATE PREPARE s4;

-- =============================================
-- SAMPLE DATA FOR DailyIsgReports
-- =============================================
SET @count := (SELECT COUNT(*) FROM DailyIsgReports);

-- Only insert sample data if the table is empty
SET @sql := IF(@count = 0, '
  -- Sample Daily ISG Report 1
  INSERT INTO DailyIsgReports (ReportDate, Shift, WeatherCondition, Highlights, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy)
  VALUES (
    CURDATE() - INTERVAL 1 DAY, 
    "Gündüz", 
    "Güneşli", 
    "Günlük rutin kontroller yapıldı. Herhangi bir olumsuzluk tespit edilmedi.",
    NOW(),
    "Sistem Yöneticisi",
    NOW(),
    "Sistem Yöneticisi"
  );
  
  -- Sample Daily ISG Report 2
  INSERT INTO DailyIsgReports (ReportDate, Shift, WeatherCondition, Highlights, CreatedAt, CreatedBy, UpdatedAt, UpdatedBy)
  VALUES (
    CURDATE(), 
    "Gece", 
    "Yağmurlu", 
    "Aşırı yağış nedeniyle açık alan çalışmalarına ara verildi.",
    NOW(),
    "Sistem Yöneticisi",
    NOW(),
    "Sistem Yöneticisi"
  );
  
  -- Sample Tasks for Report 1
  INSERT INTO DailyReportTasks (DailyReportId, TaskType, Description, Status, AssignedTo, DueDate, CreatedAt, CreatedBy)
  VALUES 
  (1, 1, "Acil çıkış yollarının kontrolü", "Tamamlandı", "Ahmet Yılmaz", CURDATE(), NOW(), "Sistem Yöneticisi"),
  (1, 1, "Yangın söndürme cihazlarının kontrolü", "Devam Ediyor", "Mehmet Demir", CURDATE() + INTERVAL 1 DAY, NOW(), "Sistem Yöneticisi"),
  (1, 0, "İlk yardım dolabı malzeme kontrolü", "Planlandı", "Ayşe Kaya", CURDATE() + INTERVAL 2 DAY, NOW(), "Sistem Yöneticisi");
  
  -- Sample Tasks for Report 2
  INSERT INTO DailyReportTasks (DailyReportId, TaskType, Description, Status, AssignedTo, DueDate, CreatedAt, CreatedBy)
  VALUES 
  (2, 1, "Yağmur suyu drenaj kontrolü", "Devam Ediyor", "Ali Veli", CURDATE() + INTERVAL 1 DAY, NOW(), "Sistem Yöneticisi"),
  (2, 0, "Çalışan eğitimleri planlaması", "Planlandı", "Zeynep Yıldız", CURDATE() + INTERVAL 3 DAY, NOW(), "Sistem Yöneticisi");
  
  -- Sample Productions for Report 1
  INSERT INTO DailyReportProductions (DailyReportId, Activity, Description, Location, ResponsiblePerson, CreatedAt, CreatedBy)
  VALUES 
  (1, "Güvenlik Turu", "Tüm alanlarda güvenlik turu gerçekleştirildi.", "Tüm Tesis", "Güvenlik Ekibi", NOW(), "Sistem Yöneticisi"),
  (1, "Ekipman Kontrolü", "Vinç ve forklift kontrolleri yapıldı.", "Depo Alanı", "Bakım Ekibi", NOW(), "Sistem Yöneticisi");
  
  -- Sample Productions for Report 2
  INSERT INTO DailyReportProductions (DailyReportId, Activity, Description, Location, ResponsiblePerson, CreatedAt, CreatedBy)
  VALUES 
  (2, "Acil Durum Tatbikatı", "Yangın tatbikatı gerçekleştirildi.", "Toplanma Alanı", "İSG Ekibi", NOW(), "Sistem Yöneticisi");
', 
  'SELECT "Sample data already exists in DailyIsgReports" AS Message');

PREPARE s5 FROM @sql; 
EXECUTE s5; 
DEALLOCATE PREPARE s5;

-- =============================================
-- END OF SAMPLE DATA
-- =============================================

-- Create Communications table if not exists
CREATE TABLE IF NOT EXISTS Communications (
  Id INT NOT NULL AUTO_INCREMENT,
  LetterNumber VARCHAR(50) NULL,
  PersonnelId INT NULL,
  PersonnelName VARCHAR(100) NULL,
  CompanyId INT NULL,
  CompanyName VARCHAR(200) NULL,
  SenderName VARCHAR(100) NULL,
  ReceiverName VARCHAR(100) NULL,
  SentDate DATETIME NOT NULL,
  Medium VARCHAR(50) NULL,
  Subject VARCHAR(200) NULL,
  Content VARCHAR(4000) NULL,
  Status VARCHAR(20) NOT NULL DEFAULT 'Open',
  AttachmentPath VARCHAR(500) NULL,
  UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (Id),
  KEY IX_Communications_SentDate (SentDate),
  KEY IX_Communications_Personnel_Status (PersonnelId, Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Drop PersonnelName column from Communications if exists
SET @col := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'Communications'
    AND COLUMN_NAME = 'PersonnelName'
);
SET @sql := IF(@col = 1,
  'ALTER TABLE Communications DROP COLUMN PersonnelName',
  'SELECT 1');
PREPARE s5 FROM @sql; EXECUTE s5; DEALLOCATE PREPARE s5;
