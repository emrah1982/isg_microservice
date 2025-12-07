-- İSG Incidents Database Initialization Script
USE incidents_db;

-- Database charset ve collation ayarları
ALTER DATABASE incidents_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Incidents tablosu oluştur
CREATE TABLE IF NOT EXISTS Incidents (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(200) NOT NULL,
    Description TEXT,
    IncidentDate DATETIME NOT NULL,
    Location VARCHAR(200),
    Severity ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    Status ENUM('Open', 'InProgress', 'Resolved', 'Closed') DEFAULT 'Open',
    ReportedBy INT NOT NULL,
    AssignedTo INT,
    InjuryCount INT DEFAULT 0,
    PropertyDamage DECIMAL(10,2) DEFAULT 0,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- IncidentActions tablosu oluştur
CREATE TABLE IF NOT EXISTS IncidentActions (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    IncidentId INT NOT NULL,
    ActionDescription TEXT NOT NULL,
    ActionBy INT NOT NULL,
    ActionDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IncidentId) REFERENCES Incidents(Id)
);

-- Örnek kazalar ekle
INSERT IGNORE INTO Incidents (Title, Description, IncidentDate, Location, Severity, Status, ReportedBy, AssignedTo, InjuryCount, PropertyDamage) VALUES
('Makine Operatörü Parmak Yaralanması', 'Torna tezgahında çalışırken operatörün parmağı sıkıştı', '2024-01-10 14:30:00', 'Üretim Atölyesi A-1', 'Medium', 'Resolved', 4, 2, 1, 500.00),
('Kimyasal Sızıntı', 'Depo alanında kimyasal madde konteyneri çatladı', '2024-01-15 09:15:00', 'Kimyasal Depo B-3', 'High', 'Closed', 3, 2, 0, 2500.00),
('Düşme Kazası', 'Merdiven çıkarken çalışan düştü', '2024-01-22 11:45:00', 'Ofis Binası 2. Kat', 'Low', 'InProgress', 5, 3, 1, 150.00),
('Elektrik Çarpması', 'Bakım sırasında elektrik çarpması meydana geldi', '2024-02-01 16:20:00', 'Elektrik Panosu C-2', 'Critical', 'Open', 6, 2, 1, 800.00),
('Yangın Tehlikesi', 'Sigara izmariti nedeniyle küçük yangın başladı', '2024-02-05 13:10:00', 'Dinlenme Alanı', 'Medium', 'Resolved', 4, 3, 0, 300.00);

-- Örnek aksiyonlar ekle
INSERT IGNORE INTO IncidentActions (IncidentId, ActionDescription, ActionBy) VALUES
(1, 'Yaralı çalışan sağlık merkezine sevk edildi', 2),
(1, 'Makine güvenlik sistemleri kontrol edildi', 2),
(2, 'Sızıntı temizlendi ve alan karantinaya alındı', 2),
(2, 'Tüm kimyasal konteynerler kontrol edildi', 3),
(3, 'Merdiven güvenlik bantları yenilendi', 3),
(4, 'Elektrik paneli bakımı yapıldı', 2),
(5, 'Sigara yasağı hatırlatma levhaları asıldı', 3);

-- Set timezone
SET time_zone = '+00:00';

-- Sample incident data (commented out - will be created by EF Core)
-- INSERT INTO Incidents (Title, Description, IncidentDate, Type, Severity, Location, Status, CreatedAt, UpdatedAt, IsDeleted) VALUES
-- ('Makine Kazası', 'Torna tezgahında parmak yaralanması', '2024-01-15 14:30:00', 'Kaza', 'Orta', 'Üretim Atölyesi', 'Investigating', NOW(), NOW(), 0),
-- ('Kimyasal Sızıntı', 'Temizlik kimyasalı zemine döküldü', '2024-01-20 09:15:00', 'Ramak Kala', 'Hafif', 'Temizlik Odası', 'Closed', NOW(), NOW(), 0);
