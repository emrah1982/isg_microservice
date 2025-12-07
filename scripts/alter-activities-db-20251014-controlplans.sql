-- ControlPlans and ControlPlanTargets tables
USE activities_db;

CREATE TABLE IF NOT EXISTS ControlPlans (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  ControlFormTemplateId INT NOT NULL,
  Name VARCHAR(200) NOT NULL,
  Period VARCHAR(20) NOT NULL, -- Daily/Weekly/Monthly/Yearly
  IntervalValue INT NOT NULL DEFAULT 1,
  WeekDaysJson TEXT NULL,
  DayOfMonth INT NULL,
  StartRule VARCHAR(50) NOT NULL DEFAULT 'OnFirstApproval',
  StartDate DATETIME NULL,
  EndDate DATETIME NULL,
  NextRunDate DATETIME NULL,
  IsActive BOOLEAN NOT NULL DEFAULT TRUE,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NULL,
  CONSTRAINT FK_ControlPlans_ControlFormTemplate FOREIGN KEY (ControlFormTemplateId)
    REFERENCES ControlFormTemplates(Id) ON DELETE CASCADE,
  INDEX IX_ControlPlans_IsActive (IsActive),
  INDEX IX_ControlPlans_NextRunDate (NextRunDate),
  INDEX IX_ControlPlans_Template_Active (ControlFormTemplateId, IsActive)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ControlPlanTargets (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  ControlPlanId INT NOT NULL,
  MachineId INT NOT NULL,
  CONSTRAINT FK_ControlPlanTargets_ControlPlan FOREIGN KEY (ControlPlanId)
    REFERENCES ControlPlans(Id) ON DELETE CASCADE,
  -- Machine tablosu başka serviste olabilir; FK zorunlu değil. İsterseniz aktive edilebilir:
  -- CONSTRAINT FK_ControlPlanTargets_Machine FOREIGN KEY (MachineId)
  --   REFERENCES Machines(Id) ON DELETE CASCADE,
  UNIQUE KEY UQ_ControlPlanTargets_Plan_Machine (ControlPlanId, MachineId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Smoke test
SELECT COUNT(*) AS ControlPlansCount FROM ControlPlans;
SELECT COUNT(*) AS ControlPlanTargetsCount FROM ControlPlanTargets;

-- ------------------------------------------------------------
-- Machines table (if not exists)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Machines (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  MachineType VARCHAR(100) NOT NULL,
  Name VARCHAR(200) NOT NULL,
  Model VARCHAR(100) NULL,
  SerialNumber VARCHAR(100) NULL,
  Location VARCHAR(200) NULL,
  ManufactureYear INT NULL,
  Status VARCHAR(20) NOT NULL DEFAULT 'Active',
  CustomChecklistJson TEXT NULL,
  Notes VARCHAR(1000) NULL,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NULL,
  INDEX IX_Machines_Type (MachineType),
  INDEX IX_Machines_Status (Status),
  INDEX IX_Machines_Name (Name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Sample data: Machines (Excavator, Roc, Crane) - 5 each
-- Note: Uses INSERT IGNORE to avoid duplicates if already seeded
-- ------------------------------------------------------------

INSERT IGNORE INTO Machines (MachineType, Name, Model, SerialNumber, Location, ManufactureYear, Status, CustomChecklistJson, Notes, CreatedAt)
VALUES
-- Excavators
('Ekskavatör', 'EKS-001', 'CAT 320D', 'EKS-2025-0001', 'Saha A', 2020, 'Active', NULL, 'Örnek ekskavatör 1', NOW()),
('Ekskavatör', 'EKS-002', 'Volvo EC220E', 'EKS-2025-0002', 'Saha B', 2021, 'Active', NULL, 'Örnek ekskavatör 2', NOW()),
('Ekskavatör', 'EKS-003', 'Komatsu PC210LC', 'EKS-2025-0003', 'Saha C', 2019, 'Active', NULL, 'Örnek ekskavatör 3', NOW()),
('Ekskavatör', 'EKS-004', 'Hitachi ZX210LC', 'EKS-2025-0004', 'Saha D', 2018, 'Active', NULL, 'Örnek ekskavatör 4', NOW()),
('Ekskavatör', 'EKS-005', 'Hyundai HX220L', 'EKS-2025-0005', 'Saha E', 2022, 'Active', NULL, 'Örnek ekskavatör 5', NOW()),
-- Roc Drills
('Roc', 'ROC-001', 'Epiroc SmartROC T45', 'ROC-2025-0001', 'Saha A', 2020, 'Active', NULL, 'Örnek roc 1', NOW()),
('Roc', 'ROC-002', 'Sandvik Pantera DP1100i', 'ROC-2025-0002', 'Saha B', 2019, 'Active', NULL, 'Örnek roc 2', NOW()),
('Roc', 'ROC-003', 'Atlas Copco FlexiROC T40', 'ROC-2025-0003', 'Saha C', 2018, 'Active', NULL, 'Örnek roc 3', NOW()),
('Roc', 'ROC-004', 'Epiroc SmartROC C50', 'ROC-2025-0004', 'Saha D', 2021, 'Active', NULL, 'Örnek roc 4', NOW()),
('Roc', 'ROC-005', 'Sandvik Ranger DX800', 'ROC-2025-0005', 'Saha E', 2022, 'Active', NULL, 'Örnek roc 5', NOW()),
-- Cranes (Vinç)
('Vinç', 'VNC-001', 'Liebherr LTM 1030', 'VNC-2025-0001', 'Saha A', 2017, 'Active', NULL, 'Örnek vinç 1', NOW()),
('Vinç', 'VNC-002', 'Grove GMK3060', 'VNC-2025-0002', 'Saha B', 2018, 'Active', NULL, 'Örnek vinç 2', NOW()),
('Vinç', 'VNC-003', 'Demag AC 100', 'VNC-2025-0003', 'Saha C', 2019, 'Active', NULL, 'Örnek vinç 3', NOW()),
('Vinç', 'VNC-004', 'XCMG QY50K', 'VNC-2025-0004', 'Saha D', 2020, 'Active', NULL, 'Örnek vinç 4', NOW()),
('Vinç', 'VNC-005', 'Kobelco RK250', 'VNC-2025-0005', 'Saha E', 2021, 'Active', NULL, 'Örnek vinç 5', NOW());

-- Summary for Machines
SELECT MachineType, COUNT(*) AS CountPerType
FROM Machines
GROUP BY MachineType
ORDER BY MachineType;
