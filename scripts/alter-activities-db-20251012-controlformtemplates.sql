-- Migration: ControlFormTemplates (Form Şablonları)
-- Tarih: 2025-10-12

CREATE TABLE IF NOT EXISTS ControlFormTemplates (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  TemplateName VARCHAR(150) NOT NULL,
  MachineType VARCHAR(100) NOT NULL,
  Model VARCHAR(100) NULL,
  SerialNumber VARCHAR(100) NULL,
  DefaultStatus VARCHAR(20) NOT NULL DEFAULT 'Pending',
  DefaultNotes VARCHAR(2000) NULL,
  ChecklistItemsJson TEXT NOT NULL,
  IsActive TINYINT(1) NOT NULL DEFAULT 1,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NULL,
  INDEX idx_cft_machinetype (MachineType),
  INDEX idx_cft_scope (MachineType, Model, SerialNumber)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Örnek şablonlar
INSERT INTO ControlFormTemplates (TemplateName, MachineType, Model, SerialNumber, DefaultStatus, DefaultNotes, ChecklistItemsJson, IsActive, CreatedAt)
VALUES
('Forklift - Günlük Kontrol', 'Forklift', NULL, NULL, 'Pending', NULL,
  '[{"item":"Fren sistemi","checked":true,"isRequired":true},{"item":"Direksiyon","checked":true,"isRequired":true},{"item":"Işıklar","checked":true,"isRequired":false}]',
  1, NOW()
),
('Roc - Güvenlik Kontrolü', 'Roc', NULL, NULL, 'Pending', NULL,
  '[{"item":"Acil stop","checked":true,"isRequired":true},{"item":"Basınç göstergeleri","checked":true,"isRequired":true}]',
  1, NOW()
)
ON DUPLICATE KEY UPDATE Id = Id;
