-- İSG Documents Database Initialization Script
-- This script initializes the documents_db database with proper charset settings

-- Set charset and collation
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS documents_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE documents_db;

-- Set timezone
SET time_zone = '+00:00';

-- Create Documents table
CREATE TABLE IF NOT EXISTS Documents (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    Description TEXT,
    Category VARCHAR(100) NOT NULL,
    FilePath VARCHAR(500) NOT NULL,
    FileType VARCHAR(50) NOT NULL,
    FileSize BIGINT NOT NULL,
    Version VARCHAR(20) NOT NULL DEFAULT '1.0',
    Status ENUM('Draft', 'Review', 'Approved', 'Archived') NOT NULL DEFAULT 'Draft',
    IsPublic BOOLEAN NOT NULL DEFAULT FALSE,
    CreatedBy INT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    IsDeleted BOOLEAN NOT NULL DEFAULT FALSE,
    INDEX idx_category (Category),
    INDEX idx_status (Status),
    INDEX idx_created_at (CreatedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create DocumentVersions table for version history
CREATE TABLE IF NOT EXISTS DocumentVersions (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    DocumentId INT NOT NULL,
    Version VARCHAR(20) NOT NULL,
    FilePath VARCHAR(500) NOT NULL,
    FileSize BIGINT NOT NULL,
    ChangeLog TEXT,
    CreatedBy INT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (DocumentId) REFERENCES Documents(Id) ON DELETE CASCADE,
    INDEX idx_document_id (DocumentId),
    INDEX idx_version (Version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample document data
INSERT INTO Documents (Title, Description, Category, FilePath, FileType, FileSize, Version, Status, IsPublic, CreatedBy, CreatedAt, UpdatedAt, IsDeleted) VALUES
('İSG Politikası 2024', 'Şirket İSG politika belgesi - güncel revizyon', 'İSG Politikası', '/documents/isg-politikasi-2024.pdf', 'PDF', 2048576, '1.0', 'Approved', 1, 1, NOW(), NOW(), 0),
('Acil Durum Prosedürü', 'Yangın ve tahliye prosedürü - detaylı kılavuz', 'Prosedür', '/documents/acil-durum-proseduru.pdf', 'PDF', 1536000, '2.1', 'Approved', 1, 1, NOW(), NOW(), 0),
('KKD Kullanım Talimatı', 'Kişisel koruyucu donanım kullanım kılavuzu', 'Talimat', '/documents/kkd-talimat.pdf', 'PDF', 1024000, '1.5', 'Approved', 1, 2, NOW(), NOW(), 0),
('Risk Değerlendirme Formu', 'İş yeri risk değerlendirme formu şablonu', 'Form', '/documents/risk-degerlendirme-formu.docx', 'DOCX', 512000, '1.2', 'Approved', 1, 1, NOW(), NOW(), 0),
('Kaza Rapor Formu', 'İş kazası bildirim formu', 'Form', '/documents/kaza-rapor-formu.pdf', 'PDF', 256000, '1.0', 'Approved', 1, 2, NOW(), NOW(), 0),
('İSG Eğitim Sunumu', 'Genel İSG farkındalık eğitimi sunumu', 'Eğitim', '/documents/isg-egitim-sunumu.pptx', 'PPTX', 3072000, '1.3', 'Approved', 1, 1, NOW(), NOW(), 0),
('Makine Güvenlik Talimatı', 'Endüstriyel makine güvenlik kullanım talimatı', 'Talimat', '/documents/makine-guvenlik-talimat.pdf', 'PDF', 1792000, '2.0', 'Review', 0, 2, NOW(), NOW(), 0),
('İSG Denetim Raporu Q1', '2024 Q1 dönem İSG denetim raporu', 'Rapor', '/documents/isg-denetim-q1-2024.pdf', 'PDF', 2560000, '1.0', 'Approved', 0, 1, NOW(), NOW(), 0);

-- Insert sample document versions
INSERT INTO DocumentVersions (DocumentId, Version, FilePath, FileSize, ChangeLog, CreatedBy, CreatedAt) VALUES
(2, '1.0', '/documents/versions/acil-durum-proseduru-v1.pdf', 1200000, 'İlk versiyon oluşturuldu', 1, DATE_SUB(NOW(), INTERVAL 30 DAY)),
(2, '2.0', '/documents/versions/acil-durum-proseduru-v2.pdf', 1400000, 'Yangın çıkış yolları güncellendi', 1, DATE_SUB(NOW(), INTERVAL 15 DAY)),
(2, '2.1', '/documents/acil-durum-proseduru.pdf', 1536000, 'Küçük düzeltmeler ve format iyileştirmeleri', 1, NOW()),
(3, '1.0', '/documents/versions/kkd-talimat-v1.pdf', 800000, 'İlk versiyon', 2, DATE_SUB(NOW(), INTERVAL 45 DAY)),
(3, '1.5', '/documents/kkd-talimat.pdf', 1024000, 'Yeni KKD türleri eklendi', 2, NOW());
