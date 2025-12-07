-- İSG Trainings Database Initialization Script
USE trainings_db;

-- Database charset ve collation ayarları
ALTER DATABASE trainings_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Trainings tablosu oluştur
CREATE TABLE IF NOT EXISTS Trainings (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(200) NOT NULL,
    Description TEXT,
    Duration INT NOT NULL, -- dakika cinsinden
    TrainingType ENUM('Safety', 'Health', 'Emergency', 'Equipment', 'General') DEFAULT 'General',
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- UserTrainings tablosu oluştur
CREATE TABLE IF NOT EXISTS UserTrainings (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    TrainingId INT NOT NULL,
    CompletedAt DATETIME,
    Score DECIMAL(5,2),
    CertificateUrl VARCHAR(500),
    IsCompleted BOOLEAN DEFAULT FALSE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (TrainingId) REFERENCES Trainings(Id)
);

-- Örnek eğitimler ekle
INSERT IGNORE INTO Trainings (Title, Description, Duration, TrainingType, IsActive) VALUES
('İş Güvenliği Temel Eğitimi', 'Çalışanlar için temel iş güvenliği kuralları ve uygulamaları', 240, 'Safety', TRUE),
('Yangın Güvenliği ve Acil Durum', 'Yangın önleme, söndürme teknikleri ve acil durum prosedürleri', 180, 'Emergency', TRUE),
('Kişisel Koruyucu Donanım Kullanımı', 'KKD seçimi, kullanımı ve bakımı hakkında detaylı bilgi', 120, 'Equipment', TRUE),
('İş Sağlığı ve Hijyen', 'Çalışma ortamında sağlık korunması ve hijyen kuralları', 150, 'Health', TRUE),
('Yüksekte Çalışma Güvenliği', 'Yüksekte güvenli çalışma teknikleri ve emniyet önlemleri', 300, 'Safety', TRUE),
('Kimyasal Madde Güvenliği', 'Kimyasal maddelerin güvenli kullanımı ve depolanması', 200, 'Safety', TRUE),
('İlk Yardım Eğitimi', 'Temel ilk yardım teknikleri ve acil müdahale', 360, 'Health', TRUE),
('Makine Güvenliği', 'Endüstriyel makinelerin güvenli kullanımı ve bakımı', 180, 'Equipment', TRUE);

-- Örnek kullanıcı eğitim kayıtları ekle
INSERT IGNORE INTO UserTrainings (UserId, TrainingId, CompletedAt, Score, IsCompleted) VALUES
(1, 1, '2024-01-15 14:30:00', 95.50, TRUE),
(1, 2, '2024-01-20 16:00:00', 88.75, TRUE),
(2, 1, '2024-01-18 10:15:00', 92.00, TRUE),
(2, 3, '2024-01-25 11:30:00', 87.25, TRUE),
(3, 1, '2024-01-22 13:45:00', 90.00, TRUE),
(3, 4, NULL, NULL, FALSE),
(4, 1, '2024-01-28 09:20:00', 85.50, TRUE),
(4, 5, NULL, NULL, FALSE),
(5, 6, '2024-02-01 15:10:00', 93.75, TRUE),
(6, 7, '2024-02-05 14:20:00', 89.00, TRUE);

-- Eğitim kategorileri için örnek veriler (EF Core migrations sonrası manuel eklenebilir)
-- INSERT INTO Trainings (Title, Description, Date, Duration, Mandatory, Category, Instructor, Location, MaxParticipants, IsActive, CreatedAt)
-- VALUES 
-- ('İş Sağlığı ve Güvenliği Temel Eğitimi', 'İSG temel bilgileri, risk değerlendirmesi ve güvenlik kuralları', DATE_ADD(NOW(), INTERVAL 7 DAY), 240, 1, 'İSG', 'İSG Uzmanı', 'Konferans Salonu', 50, 1, NOW()),
-- ('Yangın Güvenliği ve Acil Durum Eğitimi', 'Yangın önleme, söndürme teknikleri ve acil durum prosedürleri', DATE_ADD(NOW(), INTERVAL 14 DAY), 180, 1, 'Yangın Güvenliği', 'İtfaiye Eri', 'Eğitim Merkezi', 30, 1, NOW()),
-- ('İlk Yardım Eğitimi', 'Temel ilk yardım teknikleri ve acil müdahale yöntemleri', DATE_ADD(NOW(), INTERVAL 21 DAY), 360, 0, 'İlk Yardım', 'Doktor', 'Sağlık Merkezi', 20, 1, NOW()),
-- ('Yüksekte Çalışma Güvenliği', 'Yüksekte çalışma riskleri ve güvenlik önlemleri', DATE_ADD(NOW(), INTERVAL 28 DAY), 300, 1, 'İSG', 'Güvenlik Uzmanı', 'Atölye', 25, 1, NOW()),
-- ('Kimyasal Güvenlik Eğitimi', 'Kimyasal madde güvenliği ve MSDS bilgileri', DATE_ADD(NOW(), INTERVAL 35 DAY), 240, 1, 'Kimyasal Güvenlik', 'Kimya Mühendisi', 'Laboratuvar', 15, 1, NOW());
