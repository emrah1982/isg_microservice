-- PersonnelDocuments tablosunu oluştur
USE personnel_db;

CREATE TABLE IF NOT EXISTS `PersonnelDocuments` (
  `Id` INT NOT NULL AUTO_INCREMENT,
  `PersonnelId` INT NOT NULL,
  `DocumentType` VARCHAR(100) NOT NULL,
  `FileName` VARCHAR(255) NOT NULL,
  `StoredPath` VARCHAR(500) NOT NULL,
  `FileSize` BIGINT NOT NULL,
  `ContentType` VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
  `IssueDate` DATETIME(6) NULL,
  `ExpiryDate` DATETIME(6) NULL,
  `IssuingAuthority` VARCHAR(200) NULL,
  `DocumentNumber` VARCHAR(100) NULL,
  `Status` VARCHAR(32) NOT NULL DEFAULT 'Active',
  `Notes` VARCHAR(1000) NULL,
  `CreatedAt` DATETIME(6) NOT NULL,
  `UpdatedAt` DATETIME(6) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_PersonnelDocuments_PersonnelId` (`PersonnelId`),
  KEY `IX_PersonnelDocuments_DocumentType` (`DocumentType`),
  KEY `IX_PersonnelDocuments_Status` (`Status`),
  KEY `IX_PersonnelDocuments_PersonnelId_DocumentType` (`PersonnelId`, `DocumentType`),
  CONSTRAINT `FK_PersonnelDocuments_Personnel_PersonnelId` FOREIGN KEY (`PersonnelId`) REFERENCES `Personnel`(`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Test verisi ekle
INSERT INTO `PersonnelDocuments` (`PersonnelId`, `DocumentType`, `FileName`, `StoredPath`, `FileSize`, `ContentType`, `IssueDate`, `ExpiryDate`, `IssuingAuthority`, `DocumentNumber`, `Status`, `Notes`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 'Sabıka Kaydı', 'sabika_kaydi.pdf', 'uploads/documents/test-sabika.pdf', 1024000, 'application/pdf', '2024-01-15', '2025-01-15', 'Emniyet Müdürlüğü', 'SK-2024-001', 'Active', 'Test sabıka kaydı belgesi', NOW(6), NOW(6)),
(1, 'Diploma', 'diploma.pdf', 'uploads/documents/test-diploma.pdf', 2048000, 'application/pdf', '2020-06-30', NULL, 'İstanbul Üniversitesi', 'DIP-2020-123', 'Active', 'Bilgisayar Mühendisliği Diploması', NOW(6), NOW(6));

SELECT 'PersonnelDocuments tablosu oluşturuldu ve test verisi eklendi' as Result;
