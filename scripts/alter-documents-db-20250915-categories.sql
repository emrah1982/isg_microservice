-- Create table for hierarchical document categories
USE documents_db;

CREATE TABLE IF NOT EXISTS DocumentCategories (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  MainCategory VARCHAR(100) NOT NULL,
  SubCategory VARCHAR(100) NULL,
  IsActive BOOLEAN NOT NULL DEFAULT TRUE,
  CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_main_category (MainCategory),
  INDEX idx_main_sub (MainCategory, SubCategory)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional seeds (realistic examples)
INSERT IGNORE INTO DocumentCategories (MainCategory, SubCategory) VALUES
('Talimatlar', 'Kalıpçı'),
('Talimatlar', 'Elektrik'),
('Talimatlar', 'Kaynak'),
('Prosedürler', 'Acil Durum'),
('Prosedürler', 'İş Süreci'),
('Formlar', 'Rapor'),
('Formlar', 'Bildirim');
