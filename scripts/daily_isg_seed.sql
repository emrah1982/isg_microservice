-- Daily ISG schema and seed data
-- Target DB: activities_db (MySQL)

-- 1) Tables
CREATE TABLE IF NOT EXISTS `DailyIsgReports` (
  `Id` INT NOT NULL AUTO_INCREMENT,
  `ReportDate` DATE NOT NULL,
  `Shift` VARCHAR(20) NOT NULL,
  `WeatherCondition` VARCHAR(200) NULL,
  `CreatedBy` VARCHAR(100) NULL,
  `Highlights` VARCHAR(2000) NULL,
  `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `UpdatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`Id`),
  INDEX `IX_DailyIsgReports_ReportDate` (`ReportDate`),
  INDEX `IX_DailyIsgReports_ReportDate_Shift` (`ReportDate`,`Shift`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `DailyReportTasks` (
  `Id` INT NOT NULL AUTO_INCREMENT,
  `DailyIsgReportId` INT NOT NULL,
  `TaskType` VARCHAR(20) NOT NULL,
  `Description` VARCHAR(2000) NOT NULL,
  `StartTime` VARCHAR(10) NULL,
  `EndTime` VARCHAR(10) NULL,
  `Responsible` VARCHAR(100) NULL,
  `Status` VARCHAR(20) NULL,
  `Priority` VARCHAR(20) NULL,
  `Category` VARCHAR(50) NULL,
  PRIMARY KEY (`Id`),
  INDEX `IX_DailyReportTasks_Report_TaskType`(`DailyIsgReportId`,`TaskType`),
  CONSTRAINT `FK_DailyReportTasks_Report` FOREIGN KEY (`DailyIsgReportId`) REFERENCES `DailyIsgReports`(`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `DailyReportProductions` (
  `Id` INT NOT NULL AUTO_INCREMENT,
  `DailyIsgReportId` INT NOT NULL,
  `Description` VARCHAR(2000) NOT NULL,
  `Location` VARCHAR(200) NULL,
  `SafetyMeasures` VARCHAR(2000) NULL,
  `RiskLevel` VARCHAR(20) NULL,
  `EquipmentUsed` VARCHAR(500) NULL,
  `PersonnelCount` INT NULL,
  PRIMARY KEY (`Id`),
  INDEX `IX_DailyReportProductions_Report`(`DailyIsgReportId`),
  CONSTRAINT `FK_DailyReportProductions_Report` FOREIGN KEY (`DailyIsgReportId`) REFERENCES `DailyIsgReports`(`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2) Seed data
DELETE FROM `DailyReportProductions`;
DELETE FROM `DailyReportTasks`;
DELETE FROM `DailyIsgReports`;

INSERT INTO `DailyIsgReports`
(`ReportDate`,`Shift`,`WeatherCondition`,`CreatedBy`,`Highlights`,`CreatedAt`,`UpdatedAt`)
VALUES
(CURDATE(), 'morning', 'Açık, 22°C', 'İSG Uzmanı', 'Test raporu - sistem çalışıyor', NOW(), NOW()),
(DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'afternoon', 'Parçalı bulutlu, 24°C', 'İSG Uzmanı', 'Planlı bakım tespitleri eklendi', NOW(), NOW());

-- Capture IDs
SET @r1 = (SELECT Id FROM `DailyIsgReports` ORDER BY Id DESC LIMIT 1);
SET @r0 = (SELECT Id FROM `DailyIsgReports` ORDER BY Id DESC LIMIT 1 OFFSET 1);

-- Tasks for latest report (@r1)
INSERT INTO `DailyReportTasks`
(`DailyIsgReportId`,`TaskType`,`Description`,`StartTime`,`EndTime`,`Responsible`,`Status`,`Priority`,`Category`)
VALUES
(@r1, 'completed', 'Güvenlik kontrolü yapıldı', '08:00', '09:00', 'Ali Veli', 'completed', 'high', 'safety_training'),
(@r1, 'planned', 'A blokta iskele kontrolü', '10:00', '11:00', 'Ayşe Demir', 'planned', 'medium', 'inspection');

-- Productions for latest report (@r1)
INSERT INTO `DailyReportProductions`
(`DailyIsgReportId`,`Description`,`Location`,`SafetyMeasures`,`RiskLevel`,`EquipmentUsed`,`PersonnelCount`)
VALUES
(@r1, 'Korkuluk montajı', 'A Blok 3. Kat', 'Baret, emniyet kemeri, güvenlik ağı', 'medium', 'İskele', 6);

-- Tasks for previous report (@r0)
INSERT INTO `DailyReportTasks`
(`DailyIsgReportId`,`TaskType`,`Description`,`StartTime`,`EndTime`,`Responsible`,`Status`,`Priority`,`Category`)
VALUES
(@r0, 'completed', 'Yangın tatbikatı gerçekleştirildi', '13:00', '14:00', 'Mehmet Kaya', 'completed', 'medium', 'emergency_drill');

-- Productions for previous report (@r0)
INSERT INTO `DailyReportProductions`
(`DailyIsgReportId`,`Description`,`Location`,`SafetyMeasures`,`RiskLevel`,`EquipmentUsed`,`PersonnelCount`)
VALUES
(@r0, 'Yaya yolu bariyeri montajı', 'Şantiye girişi', 'Alan şerit ile çevrildi', 'low', 'Barikat', 3);
