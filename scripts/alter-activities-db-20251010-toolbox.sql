-- Activities DB Alter Script: Toolboxes feature
-- Purpose: Create a separate table for storing searchable Toolboxes (saved items with title/content/tags)
-- Environment: MySQL/MariaDB in Docker

-- Safety: create table if not exists; add indexes idempotently

CREATE TABLE IF NOT EXISTS Toolboxes (
  Id INT NOT NULL AUTO_INCREMENT,
  Title VARCHAR(200) NOT NULL,
  Content TEXT NULL,
  Category VARCHAR(100) NULL,
  Keywords VARCHAR(500) NULL,
  CreatedByPersonnelId INT NULL,
  CreatedByPersonName VARCHAR(100) NULL,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (Id),
  KEY IX_Toolboxes_CreatedAt (CreatedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add FULLTEXT index for search (supported on InnoDB with utf8mb4)
-- Using separate statements to avoid failures on repeat runs
SET @exists_ft := (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'Toolboxes'
    AND INDEX_NAME = 'FT_Toolboxes_Search'
);

SET @sql_ft := IF(@exists_ft = 0,
  'ALTER TABLE Toolboxes ADD FULLTEXT INDEX FT_Toolboxes_Search (Title, Content, Keywords)',
  'DO /* FT_Toolboxes_Search already exists */ 0'
);
PREPARE stmt_ft FROM @sql_ft; EXECUTE stmt_ft; DEALLOCATE PREPARE stmt_ft;

-- Optional helper view: latest items first (idempotent create/replace)
CREATE OR REPLACE VIEW vw_toolboxes_latest AS
SELECT Id, Title, Content, Category, Keywords, CreatedByPersonnelId, CreatedByPersonName, CreatedAt, UpdatedAt
FROM Toolboxes
ORDER BY COALESCE(UpdatedAt, CreatedAt) DESC;

-- Example search usage (reference):
-- SELECT * FROM Toolboxes WHERE MATCH(Title, Content, Keywords) AGAINST ('+aramakelimesi*' IN BOOLEAN MODE);

-- Example Toolboxes data (safe to run multiple times, uses INSERT IGNORE)
INSERT IGNORE INTO Toolboxes (Id, Title, Content, Category, Keywords, CreatedByPersonnelId, CreatedByPersonName, CreatedAt, UpdatedAt)
VALUES
  (1, 'İlk Yardım Rehberi', 'İş kazalarında yapılması gereken temel ilk yardım uygulamaları. Kanama durdurma, CPR, yanık tedavisi gibi temel konular.', 'Sağlık', 'ilk yardım, kaza, sağlık, acil durum', 1, 'Dr. Ahmet Yılmaz', '2024-01-15 10:00:00', '2024-01-15 10:00:00'),

  (2, 'Yangın Güvenliği', 'İşyerinde yangın çıkması durumunda alınması gereken önlemler ve yangın söndürme teknikleri. Yangın türleri ve uygun söndürme maddeleri.', 'Güvenlik', 'yangın, güvenlik, söndürme, acil durum, eğitim', 2, 'İSG Uzmanı Ayşe Kaya', '2024-01-16 14:30:00', '2024-01-16 14:30:00'),

  (3, 'Kişisel Koruyucu Donanımlar', 'İş güvenliği için kullanılan KKD''lerin doğru kullanımı ve bakımı. Baret, emniyet kemeri, koruyucu gözlük, eldiven türleri.', 'Ekipman', 'kkd, koruyucu, donanım, güvenlik, ekipman', 3, 'Teknik Güvenlik Sorumlusu', '2024-01-17 09:15:00', '2024-01-17 09:15:00'),

  (4, 'Risk Analizi Yöntemleri', 'İşyerlerinde risk değerlendirmesi yapma teknikleri. Tehlike tanımlama, risk skorlama ve önlem alma stratejileri.', 'Analiz', 'risk, analiz, değerlendirme, tehlike, önlem', 1, 'Dr. Ahmet Yılmaz', '2024-01-18 11:45:00', '2024-01-18 11:45:00'),

  (5, 'Ergonomi ve İş Pozisyonu', 'Doğru oturma pozisyonu, masa düzeni ve bilgisayar kullanımı ergonomisi. Kas-iskelet sistemi hastalıklarını önleme.', 'Ergonomi', 'ergonomi, postür, sağlık, bilgisayar, ofis', 4, 'İşyeri Hekimi Dr. Mehmet Demir', '2024-01-19 16:20:00', '2024-01-19 16:20:00'),

  (6, 'Kimyasal Maddeler Güvenliği', 'İşyerinde kullanılan kimyasal maddelerin güvenli saklanması ve kullanımı. MSDS formları ve acil durum prosedürleri.', 'Kimyasal', 'kimyasal, güvenlik, mads, saklama, kullanım', 2, 'İSG Uzmanı Ayşe Kaya', '2024-01-20 13:10:00', '2024-01-20 13:10:00'),

  (7, 'Elektrik Güvenliği', 'Elektrikle çalışmada alınması gereken önlemler. Topraklama, sigorta kullanımı ve elektrik çarpması durumunda ilk yardım.', 'Elektrik', 'elektrik, güvenlik, topraklama, çarpması, önlem', 5, 'Elektrik Teknikeri', '2024-01-21 08:30:00', '2024-01-21 08:30:00'),

  (8, 'Yüksekte Çalışma', 'İskele, merdiven ve platformlarda güvenli çalışma teknikleri. Düşme önleme ekipmanları ve güvenlik prosedürleri.', 'Yükseklik', 'yükseklik, iskele, düşme, güvenlik, platform', 3, 'Teknik Güvenlik Sorumlusu', '2024-01-22 15:45:00', '2024-01-22 15:45:00');
