-- Activities DB Init Script
-- MySQL compatible

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS activities_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE activities_db;

-- Create user and grant privileges
CREATE USER IF NOT EXISTS 'isg_user'@'%' IDENTIFIED BY 'isg_password_2024';
GRANT ALL PRIVILEGES ON activities_db.* TO 'isg_user'@'%';
FLUSH PRIVILEGES;

-- ISG Reports
CREATE TABLE IF NOT EXISTS IsgReports (
  Id INT NOT NULL AUTO_INCREMENT,
  ReportNumber VARCHAR(50) NOT NULL,
  ReportDate DATETIME NOT NULL,
  SiteName VARCHAR(200) NOT NULL,
  Location VARCHAR(200) NULL,
  PersonnelId INT NULL,
  PreparedBy VARCHAR(100) NULL,
  WeatherCondition VARCHAR(100) NULL,
  WorkingConditions VARCHAR(500) NULL,
  Notes VARCHAR(2000) NULL,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (Id),
  UNIQUE KEY UX_IsgReports_ReportNumber (ReportNumber),
  KEY IX_IsgReports_ReportDate (ReportDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Observations
CREATE TABLE IF NOT EXISTS IsgObservations (
  Id INT NOT NULL AUTO_INCREMENT,
  IsgReportId INT NOT NULL,
  ObservationType VARCHAR(50) NULL,
  Description VARCHAR(1000) NULL,
  Location VARCHAR(200) NULL,
  RiskLevel VARCHAR(20) NULL,
  Status VARCHAR(20) NOT NULL DEFAULT 'Open',
  ResponsiblePersonnelId INT NULL,
  ResponsiblePersonName VARCHAR(100) NULL,
  DueDate DATETIME NULL,
  CompletedDate DATETIME NULL,
  CompletionNotes VARCHAR(1000) NULL,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (Id),
  KEY IX_IsgObservations_Status (Status),
  KEY IX_IsgObservations_RiskLevel (RiskLevel),
  CONSTRAINT FK_IsgObservations_IsgReports_IsgReportId FOREIGN KEY (IsgReportId) REFERENCES IsgReports(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Incidents
CREATE TABLE IF NOT EXISTS IsgIncidents (
  Id INT NOT NULL AUTO_INCREMENT,
  IsgReportId INT NOT NULL,
  IncidentType VARCHAR(50) NULL,
  Severity VARCHAR(20) NULL,
  Description VARCHAR(2000) NULL,
  Location VARCHAR(200) NULL,
  IncidentDateTime DATETIME NOT NULL,
  AffectedPersonnelId INT NULL,
  AffectedPersonName VARCHAR(100) NULL,
  InjuryType VARCHAR(100) NULL,
  ImmediateActions VARCHAR(1000) NULL,
  RootCause VARCHAR(1000) NULL,
  Status VARCHAR(20) NOT NULL DEFAULT 'Open',
  InvestigatorId INT NULL,
  InvestigatorName VARCHAR(100) NULL,
  InvestigationCompletedDate DATETIME NULL,
  FinalReport VARCHAR(2000) NULL,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (Id),
  KEY IX_IsgIncidents_Status (Status),
  KEY IX_IsgIncidents_Severity (Severity),
  KEY IX_IsgIncidents_IncidentDateTime (IncidentDateTime),
  CONSTRAINT FK_IsgIncidents_IsgReports_IsgReportId FOREIGN KEY (IsgReportId) REFERENCES IsgReports(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- CorrectiveActions (Duzeltici)
CREATE TABLE IF NOT EXISTS CorrectiveActions (
  Id INT NOT NULL AUTO_INCREMENT,
  IsgReportId INT NULL,
  ObservationId INT NULL,
  IncidentId INT NULL,
  ActionType VARCHAR(20) NOT NULL DEFAULT 'Corrective',
  Title VARCHAR(200) NOT NULL,
  Description VARCHAR(2000) NULL,
  Priority VARCHAR(20) NOT NULL DEFAULT 'Medium',
  Status VARCHAR(20) NOT NULL DEFAULT 'Planned',
  AssignedToPersonnelId INT NULL,
  AssignedToPersonName VARCHAR(100) NULL,
  CreatedByPersonnelId INT NULL,
  CreatedByPersonName VARCHAR(100) NULL,
  PlannedStartDate DATETIME NULL,
  PlannedCompletionDate DATETIME NULL,
  ActualStartDate DATETIME NULL,
  ActualCompletionDate DATETIME NULL,
  EstimatedCost DECIMAL(18,2) NULL,
  ActualCost DECIMAL(18,2) NULL,
  Resources VARCHAR(1000) NULL,
  CompletionNotes VARCHAR(1000) NULL,
  EffectivenessEvaluation VARCHAR(1000) NULL,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (Id),
  KEY IX_CorrectiveActions_Status (Status),
  KEY IX_CorrectiveActions_Priority (Priority),
  CONSTRAINT FK_CorrectiveActions_IsgReports_IsgReportId FOREIGN KEY (IsgReportId) REFERENCES IsgReports(Id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- PreventiveActions (Onleyici)
CREATE TABLE IF NOT EXISTS PreventiveActions (
  Id INT NOT NULL AUTO_INCREMENT,
  IsgReportId INT NULL,
  ActionType VARCHAR(20) NOT NULL DEFAULT 'Preventive',
  Category VARCHAR(50) NULL,
  Title VARCHAR(200) NOT NULL,
  Description VARCHAR(2000) NULL,
  Objective VARCHAR(500) NULL,
  Priority VARCHAR(20) NOT NULL DEFAULT 'Medium',
  Status VARCHAR(20) NOT NULL DEFAULT 'Planned',
  AssignedToPersonnelId INT NULL,
  AssignedToPersonName VARCHAR(100) NULL,
  CreatedByPersonnelId INT NULL,
  CreatedByPersonName VARCHAR(100) NULL,
  PlannedStartDate DATETIME NULL,
  PlannedCompletionDate DATETIME NULL,
  ActualStartDate DATETIME NULL,
  ActualCompletionDate DATETIME NULL,
  EstimatedCost DECIMAL(18,2) NULL,
  ActualCost DECIMAL(18,2) NULL,
  Resources VARCHAR(1000) NULL,
  SuccessMetrics VARCHAR(500) NULL,
  CompletionNotes VARCHAR(1000) NULL,
  EffectivenessEvaluation VARCHAR(1000) NULL,
  IsRecurring BOOLEAN NOT NULL DEFAULT FALSE,
  RecurrencePattern VARCHAR(50) NULL,
  NextScheduledDate DATETIME NULL,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (Id),
  KEY IX_PreventiveActions_Status (Status),
  KEY IX_PreventiveActions_Priority (Priority),
  CONSTRAINT FK_PreventiveActions_IsgReports_IsgReportId FOREIGN KEY (IsgReportId) REFERENCES IsgReports(Id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Warnings (Uyari)
CREATE TABLE IF NOT EXISTS Warnings (
  Id INT NOT NULL AUTO_INCREMENT,
  WarningNumber VARCHAR(50) NULL,
  PersonnelId INT NULL,
  PersonnelName VARCHAR(100) NULL,
  IssuedByPersonnelId INT NULL,
  IssuedByPersonName VARCHAR(100) NULL,
  WarningDate DATETIME NOT NULL,
  WarningType VARCHAR(50) NULL,
  Category VARCHAR(50) NULL,
  ViolationType VARCHAR(100) NULL,
  Description VARCHAR(2000) NULL,
  Location VARCHAR(200) NULL,
  IncidentDateTime DATETIME NULL,
  Witnesses VARCHAR(500) NULL,
  ImmediateActions VARCHAR(1000) NULL,
  ExpectedImprovement VARCHAR(500) NULL,
  FollowUpDate DATETIME NULL,
  FollowUpNotes VARCHAR(1000) NULL,
  Status VARCHAR(20) NOT NULL DEFAULT 'Active',
  IsAcknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  AcknowledgedDate DATETIME NULL,
  PersonnelResponse VARCHAR(2000) NULL,
  AttachmentPath VARCHAR(500) NULL,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (Id),
  KEY IX_Warnings_WarningDate (WarningDate),
  KEY IX_Warnings_Personnel_Status (PersonnelId, Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Penalties (Ceza)
CREATE TABLE IF NOT EXISTS Penalties (
  Id INT NOT NULL AUTO_INCREMENT,
  PenaltyNumber VARCHAR(50) NULL,
  PersonnelId INT NULL,
  PersonnelName VARCHAR(100) NULL,
  IssuedByPersonnelId INT NULL,
  IssuedByPersonName VARCHAR(100) NULL,
  PenaltyDate DATETIME NOT NULL,
  PenaltyType VARCHAR(100) NULL,
  Category VARCHAR(50) NULL,
  ViolationType VARCHAR(100) NULL,
  Description VARCHAR(2000) NULL,
  Location VARCHAR(200) NULL,
  IncidentDateTime DATETIME NULL,
  Severity VARCHAR(20) NULL,
  FinancialPenalty DECIMAL(18,2) NULL,
  SuspensionDays INT NULL,
  SuspensionStartDate DATETIME NULL,
  SuspensionEndDate DATETIME NULL,
  LegalBasis VARCHAR(500) NULL,
  Witnesses VARCHAR(500) NULL,
  Evidence VARCHAR(1000) NULL,
  DefenseStatement VARCHAR(2000) NULL,
  DefenseDate DATETIME NULL,
  DecisionReason VARCHAR(1000) NULL,
  Status VARCHAR(20) NOT NULL DEFAULT 'Active',
  IsAppealed BOOLEAN NOT NULL DEFAULT FALSE,
  AppealDate DATETIME NULL,
  AppealReason VARCHAR(1000) NULL,
  AppealDecision VARCHAR(1000) NULL,
  AppealDecisionDate DATETIME NULL,
  AttachmentPath VARCHAR(500) NULL,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (Id),
  KEY IX_Penalties_PenaltyDate (PenaltyDate),
  KEY IX_Penalties_Personnel_Status (PersonnelId, Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ActivityPhotos
CREATE TABLE IF NOT EXISTS ActivityPhotos (
  Id INT NOT NULL AUTO_INCREMENT,
  EntityType VARCHAR(50) NOT NULL,
  EntityId INT NOT NULL,
  FileName VARCHAR(255) NOT NULL,
  StoredPath VARCHAR(500) NOT NULL,
  ContentType VARCHAR(100) NULL,
  FileSize BIGINT NOT NULL,
  Caption VARCHAR(255) NULL,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (Id),
  KEY IX_ActivityPhotos_TypeId (EntityType, EntityId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- NonConformityFollowUps (DÖF)
CREATE TABLE IF NOT EXISTS NonConformityFollowUps (
  Id INT NOT NULL AUTO_INCREMENT,
  IsgReportId INT NULL,
  ObservationId INT NULL,
  IncidentId INT NULL,
  NonConformityDescription VARCHAR(2000) NOT NULL,
  RootCauseCategory VARCHAR(20) NULL,
  RootCauseDetails VARCHAR(2000) NULL,
  RootCauseCategoriesCsv VARCHAR(200) NULL,
  PlannedCorrectiveActions VARCHAR(3000) NULL,
  PreventiveImprovements VARCHAR(3000) NULL,
  TrackingRequired BOOLEAN NOT NULL DEFAULT FALSE,
  TrackingExplanation VARCHAR(1000) NULL,
  Status VARCHAR(20) NOT NULL DEFAULT 'Open',
  TargetDate DATETIME NULL,
  AssignedToPersonName VARCHAR(100) NULL,
  DfiCode VARCHAR(50) NULL,
  AttachmentPath VARCHAR(500) NULL,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (Id),
  KEY IX_NonConformityFollowUps_Status (Status),
  KEY IX_NonConformityFollowUps_TargetDate (TargetDate),
  KEY IX_NonConformityFollowUps_ReportObsInc (IsgReportId, ObservationId, IncidentId),
  KEY IX_NonConformityFollowUps_DfiCode (DfiCode),
  CONSTRAINT FK_NonConformityFollowUps_IsgReports_IsgReportId FOREIGN KEY (IsgReportId) REFERENCES IsgReports(Id) ON DELETE SET NULL,
  CONSTRAINT FK_NonConformityFollowUps_IsgObservations_ObservationId FOREIGN KEY (ObservationId) REFERENCES IsgObservations(Id) ON DELETE SET NULL,
  CONSTRAINT FK_NonConformityFollowUps_IsgIncidents_IncidentId FOREIGN KEY (IncidentId) REFERENCES IsgIncidents(Id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed sample data
INSERT IGNORE INTO IsgReports (ReportNumber, ReportDate, SiteName, Location, PreparedBy, WeatherCondition, WorkingConditions, Notes)
VALUES
 ('RPT-2025-0001', NOW(), 'Palladium Tower Şantiyesi', 'İstanbul', 'İsmail Atas', 'Güneşli', 'Normal', 'Açılış raporu'),
 ('RPT-2025-0002', NOW(), 'Metro Projesi', 'Ankara', 'Zehra Demir', 'Bulutlu', 'Yoğun', 'Gün sonu raporu');

INSERT IGNORE INTO Warnings (WarningNumber, PersonnelName, IssuedByPersonName, WarningDate, WarningType, Category, ViolationType, Description, Status)
VALUES
 ('WRN-2025-0001', 'Ahmet Yılmaz', 'M. Şef', NOW(), 'Yazılı', 'İSG İhlali', 'KKD Eksikliği', 'Baret kullanılmadı', 'Active');

INSERT IGNORE INTO Penalties (PenaltyNumber, PersonnelName, IssuedByPersonName, PenaltyDate, PenaltyType, Category, ViolationType, Description, Severity, Status)
VALUES
 ('PNL-2025-0001', 'Mehmet Kaya', 'İK Müdürü', NOW(), 'Ücret Kesimi', 'İSG İhlali', 'Yüksekte Emniyet', 'Emniyet kemeri takılmadı', 'Orta', 'Active');

INSERT IGNORE INTO CorrectiveActions (IsgReportId, Title, Description, Priority, Status)
VALUES
 (1, 'Baret Zorunluluğu Denetimi', 'Şantiyede kask denetimi sıklaştırılacak', 'High', 'Planned');

INSERT IGNORE INTO PreventiveActions (IsgReportId, Title, Description, Priority, Status)
VALUES
 (1, 'Yüksekte Çalışma Eğitimi', 'Ekip için tekrar eğitim planı', 'High', 'Planned');
