-- İSG Risk Analysis Database Initialization Script
USE risks_db;

-- Database charset ve collation ayarları
ALTER DATABASE risks_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Risks tablosu oluştur
CREATE TABLE IF NOT EXISTS Risks (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(200) NOT NULL,
    Description TEXT,
    Category ENUM('Physical', 'Chemical', 'Biological', 'Ergonomic', 'Psychosocial') DEFAULT 'Physical',
    Probability ENUM('VeryLow', 'Low', 'Medium', 'High', 'VeryHigh') DEFAULT 'Medium',
    Impact ENUM('Negligible', 'Minor', 'Moderate', 'Major', 'Catastrophic') DEFAULT 'Moderate',
    RiskScore INT GENERATED ALWAYS AS (
        CASE Probability
            WHEN 'VeryLow' THEN 1
            WHEN 'Low' THEN 2
            WHEN 'Medium' THEN 3
            WHEN 'High' THEN 4
            WHEN 'VeryHigh' THEN 5
        END *
        CASE Impact
            WHEN 'Negligible' THEN 1
            WHEN 'Minor' THEN 2
            WHEN 'Moderate' THEN 3
            WHEN 'Major' THEN 4
            WHEN 'Catastrophic' THEN 5
        END
    ) STORED,
    Location VARCHAR(200),
    Status ENUM('Active', 'Mitigated', 'Accepted', 'Transferred') DEFAULT 'Active',
    AssignedTo INT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- RiskMitigations tablosu oluştur
CREATE TABLE IF NOT EXISTS RiskMitigations (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    RiskId INT NOT NULL,
    MitigationAction TEXT NOT NULL,
    ResponsiblePerson INT,
    DueDate DATE,
    CompletedDate DATE,
    Status ENUM('Planned', 'InProgress', 'Completed', 'Cancelled') DEFAULT 'Planned',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (RiskId) REFERENCES Risks(Id)
);

-- Örnek riskler ekle
INSERT IGNORE INTO Risks (Title, Description, Category, Probability, Impact, Location, Status, AssignedTo) VALUES
('Makine Koruyucu Eksikliği', 'Torna tezgahında koruyucu kapak bulunmuyor', 'Physical', 'High', 'Major', 'Üretim Atölyesi A-1', 'Active', 2),
('Kimyasal Maruziyeti', 'Havalandırma sistemi yetersizliği nedeniyle kimyasal buhar maruziyeti', 'Chemical', 'Medium', 'Moderate', 'Kimyasal Depo B-3', 'Active', 3),
('Ergonomik Risk', 'Ağır yük kaldırma işlemlerinde bel yaralanması riski', 'Ergonomic', 'High', 'Moderate', 'Depo Alanı C-1', 'Mitigated', 2),
('Elektrik Güvenliği', 'Eski elektrik panellerinde çarpılma riski', 'Physical', 'Medium', 'Major', 'Elektrik Odası D-2', 'Active', 6),
('Yangın Riski', 'Yanıcı madde depolama alanında yangın riski', 'Physical', 'Low', 'Catastrophic', 'Yanıcı Madde Deposu E-1', 'Active', 2);

-- Örnek risk azaltma aksiyonları ekle
INSERT IGNORE INTO RiskMitigations (RiskId, MitigationAction, ResponsiblePerson, DueDate, Status) VALUES
(1, 'Makine koruyucu kapağı temin edilip monte edilecek', 2, '2024-03-15', 'InProgress'),
(1, 'Operatör eğitimi verilecek', 3, '2024-03-20', 'Planned'),
(2, 'Havalandırma sistemi iyileştirilecek', 2, '2024-04-01', 'Planned'),
(3, 'Forklift temin edildi', 2, '2024-02-15', 'Completed'),
(4, 'Elektrik paneli yenilenecek', 6, '2024-05-01', 'Planned'),
(5, 'Yangın söndürme sistemi kurulacak', 2, '2024-04-15', 'InProgress');

-- Set timezone
SET time_zone = '+00:00';

-- Sample risk data (commented out - will be created by EF Core)
-- INSERT INTO RiskItems (Title, Description, Probability, Impact, Status, Category, CreatedAt, UpdatedAt, IsDeleted) VALUES
-- ('Kimyasal Maruziyeti', 'Temizlik kimyasallarına maruz kalma riski', 3, 4, 'Open', 'Kimyasal', NOW(), NOW(), 0),
-- ('Ergonomik Risk', 'Ağır kaldırma işlemlerinde yaralanma riski', 4, 3, 'Open', 'Ergonomik', NOW(), NOW(), 0),
-- ('Elektrik Riski', 'Elektrik panellerinde çalışma riski', 2, 5, 'Mitigating', 'Elektrik', NOW(), NOW(), 0);
