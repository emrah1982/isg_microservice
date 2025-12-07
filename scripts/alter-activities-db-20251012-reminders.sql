-- Migration: ReminderTasks (Periyot Bazlı Hatırlatıcılar)
-- Tarih: 2025-10-12

CREATE TABLE IF NOT EXISTS ReminderTasks (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Title VARCHAR(200) NOT NULL,
  Description VARCHAR(2000) NULL,
  MachineId INT NULL,
  ControlFormTemplateId INT NULL,
  DueDate DATETIME NOT NULL,
  Period VARCHAR(20) NULL,
  PeriodDays INT NULL,
  Status VARCHAR(20) NOT NULL DEFAULT 'Open',
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CompletedAt DATETIME NULL,
  INDEX idx_due_date (DueDate),
  INDEX idx_scope (MachineId, ControlFormTemplateId, DueDate),
  CONSTRAINT fk_reminder_machine FOREIGN KEY (MachineId) REFERENCES Machines(Id) ON DELETE SET NULL,
  CONSTRAINT fk_reminder_template FOREIGN KEY (ControlFormTemplateId) REFERENCES ControlFormTemplates(Id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
