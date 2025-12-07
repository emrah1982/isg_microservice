-- NonConformityFollowUps tablosunu oluştur
USE activities_db;

CREATE TABLE IF NOT EXISTS `NonConformityFollowUps` (
  `Id` INT NOT NULL AUTO_INCREMENT,
  
  -- İlişki alanları (opsiyonel FK'lar)
  `IsgReportId` INT NULL,
  `ObservationId` INT NULL,
  `IncidentId` INT NULL,

  -- Uygunsuzluk bilgileri
  `NonConformityDescription` VARCHAR(2000) NOT NULL,

  -- Kök neden bilgileri
  `RootCauseCategory` VARCHAR(20) NULL,
  `RootCauseDetails` VARCHAR(2000) NULL,

  -- Düzeltici faaliyet/düzeltmeler
  `PlannedCorrectiveActions` VARCHAR(3000) NULL,

  -- Tekrarı önleyici iyileştirmeler
  `PreventiveImprovements` VARCHAR(3000) NULL,

  -- Takip gerekliliği
  `TrackingRequired` BOOLEAN NOT NULL DEFAULT 0,
  `TrackingExplanation` VARCHAR(1000) NULL,

  -- Genel durum
  `Status` VARCHAR(20) NOT NULL DEFAULT 'Open',
  `TargetDate` DATETIME NULL,
  `AssignedToPersonName` VARCHAR(100) NULL,

  `CreatedAt` DATETIME NOT NULL,
  `UpdatedAt` DATETIME NOT NULL,

  PRIMARY KEY (`Id`),

  -- İndeksler
  INDEX `IX_NonConformityFollowUps_Status` (`Status`),
  INDEX `IX_NonConformityFollowUps_TargetDate` (`TargetDate`),
  INDEX `IX_NonConformityFollowUps_IsgReportId_ObservationId_IncidentId` (`IsgReportId`, `ObservationId`, `IncidentId`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Mevcut tabloları kontrol et
SHOW TABLES LIKE '%NonConformity%';

-- Tablo yapısını kontrol et
DESCRIBE NonConformityFollowUps;
