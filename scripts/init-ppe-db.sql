-- PPE DB init script (optional). EF Core will create tables at runtime.
-- You can add seed data here if desired.
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET collation_connection = 'utf8mb4_general_ci';

-- Ensure we're using the correct database
USE ppe_db;

-- Create tables (no seed data)

CREATE TABLE IF NOT EXISTS `ppe_items` (
  `Id` INT NOT NULL AUTO_INCREMENT,
  `Name` VARCHAR(200) NOT NULL,
  `Category` VARCHAR(120) NULL,
  `Standard` VARCHAR(120) NULL,
  `Size` VARCHAR(40) NULL,
  `IsActive` TINYINT(1) NOT NULL DEFAULT 1,
  `StockQuantity` INT NOT NULL DEFAULT 0,
  `CreatedAt` DATETIME(6) NOT NULL,
  `UpdatedAt` DATETIME(6) NOT NULL,
  PRIMARY KEY (`Id`),
  INDEX `IX_ppe_items_Name_Size` (`Name`, `Size`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Ensure unique constraint for idempotent seeds (drop non-unique/old unique if exists)
DROP INDEX IF EXISTS `IX_ppe_items_Name_Size` ON `ppe_items`;
DROP INDEX IF EXISTS `UX_ppe_items_Name_Size` ON `ppe_items`;
CREATE UNIQUE INDEX `UX_ppe_items_Name_Size_Category_Standard` ON `ppe_items` (`Name`, `Size`, `Category`, `Standard`);

CREATE TABLE IF NOT EXISTS `ppe_assignments` (
  `Id` INT NOT NULL AUTO_INCREMENT,
  `PersonnelId` INT NOT NULL,
  `PpeItemId` INT NOT NULL,
  `Quantity` INT NOT NULL DEFAULT 1,
  `AssignedAt` DATETIME(6) NOT NULL,
  `AssignedBy` VARCHAR(120) NULL,
  `Status` VARCHAR(32) NOT NULL DEFAULT 'assigned',
  `DueDate` DATETIME(6) NULL,
  `ReturnedAt` DATETIME(6) NULL,
  PRIMARY KEY (`Id`),
  INDEX `IX_ppe_assignments_PersonnelId_PpeItemId` (`PersonnelId`, `PpeItemId`),
  CONSTRAINT `FK_ppe_assignments_ppe_items_PpeItemId`
    FOREIGN KEY (`PpeItemId`) REFERENCES `ppe_items`(`Id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `ppe_issues` (
  `Id` INT NOT NULL AUTO_INCREMENT,
  `AssignmentId` INT NOT NULL,
  `Type` VARCHAR(32) NOT NULL DEFAULT 'lost',
  `Notes` VARCHAR(500) NULL,
  `ReportedAt` DATETIME(6) NOT NULL,
  `ReportedBy` VARCHAR(120) NULL,
  PRIMARY KEY (`Id`),
  INDEX `IX_ppe_issues_AssignmentId` (`AssignmentId`),
  CONSTRAINT `FK_ppe_issues_ppe_assignments_AssignmentId`
    FOREIGN KEY (`AssignmentId`) REFERENCES `ppe_assignments`(`Id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed basic PPE items idempotently (ignore duplicates by unique index)
INSERT IGNORE INTO `ppe_items` (`Name`, `Category`, `Standard`, `Size`, `IsActive`, `CreatedAt`, `UpdatedAt`) VALUES
-- Baş Koruyucu
('Baret', 'Baş Koruyucu', 'EN397', 'M', 1, NOW(6), NOW(6)),
('Baret', 'Baş Koruyucu', 'EN397', 'L', 1, NOW(6), NOW(6)),
('Yüz Siperliği', 'Yüz Koruyucu', 'EN166', 'STD', 1, NOW(6), NOW(6)),
-- Göz Koruyucu
('Koruyucu Gözlük', 'Göz Koruyucu', 'EN166', 'STD', 1, NOW(6), NOW(6)),
('Kaynakçı Gözlüğü', 'Göz Koruyucu', 'EN175', 'STD', 1, NOW(6), NOW(6)),
-- Solunum Koruyucu
('Toz Maskesi (FFP2)', 'Solunum Koruyucu', 'EN149 FFP2', 'STD', 1, NOW(6), NOW(6)),
('Toz Maskesi (FFP3)', 'Solunum Koruyucu', 'EN149 FFP3', 'STD', 1, NOW(6), NOW(6)),
('Yarım Yüz Maskesi', 'Solunum Koruyucu', 'EN140 + EN143', 'M', 1, NOW(6), NOW(6)),
('Tam Yüz Maskesi', 'Solunum Koruyucu', 'EN136 + EN143', 'STD', 1, NOW(6), NOW(6)),
-- Kulak Koruyucu
('Kulak Tıkacı', 'Kulak Koruyucu', 'EN352', 'STD', 1, NOW(6), NOW(6)),
('Kulaklık (Kulak Koruyucu)', 'Kulak Koruyucu', 'EN352', 'STD', 1, NOW(6), NOW(6)),
-- El Koruyucu
('İş Eldiveni (Genel)', 'El Koruyucu', 'EN388', 'L', 1, NOW(6), NOW(6)),
('Kesilmeye Dayanıklı Eldiven', 'El Koruyucu', 'EN388 Level C', 'L', 1, NOW(6), NOW(6)),
('Kimyasal Eldiven (Nitril)', 'El Koruyucu', 'EN374', 'L', 1, NOW(6), NOW(6)),
('Isıya Dayanıklı Eldiven', 'El Koruyucu', 'EN407', 'L', 1, NOW(6), NOW(6)),
-- Ayak Koruyucu
('İş Ayakkabısı', 'Ayak Koruyucu', 'EN ISO 20345 S3', '42', 1, NOW(6), NOW(6)),
('Çelik Burunlu Ayakkabı', 'Ayak Koruyucu', 'EN ISO 20345 S1P', '43', 1, NOW(6), NOW(6)),
('Dielektrik Çizme', 'Ayak Koruyucu', 'EN50321', '44', 1, NOW(6), NOW(6)),
-- Vücut/Gövde Koruyucu
('Reflektif Yelek', 'Vücut Koruyucu', 'EN ISO 20471', 'L', 1, NOW(6), NOW(6)),
('Kaynakçı Önlüğü', 'Vücut Koruyucu', 'EN ISO 11611', 'STD', 1, NOW(6), NOW(6)),
('Kimyasal Önlük', 'Vücut Koruyucu', 'EN14605', 'STD', 1, NOW(6), NOW(6)),
('Yağmurluk', 'Vücut Koruyucu', 'EN343', 'L', 1, NOW(6), NOW(6)),
-- Düşmeye Karşı Koruma
('Emniyet Kemeri (Düşüş Durdurucu)', 'Düşme Koruyucu', 'EN361', 'STD', 1, NOW(6), NOW(6)),
('Lanyard (Şok Emicili)', 'Düşme Koruyucu', 'EN355', 'STD', 1, NOW(6), NOW(6));
