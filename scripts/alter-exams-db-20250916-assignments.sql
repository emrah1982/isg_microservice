-- Create PersonnelAssignments table for person-based exam/training assignments
USE exams_db;

CREATE TABLE IF NOT EXISTS PersonnelAssignments (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  PersonnelId INT NOT NULL,
  ExamId INT NOT NULL,
  TrainingId INT NULL,
  AssignedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  AssignedBy VARCHAR(100) NULL,
  Status VARCHAR(32) NOT NULL DEFAULT 'assigned',
  UNIQUE KEY uq_pa (PersonnelId, ExamId, TrainingId),
  INDEX idx_pa_personnel (PersonnelId),
  INDEX idx_pa_exam (ExamId),
  INDEX idx_pa_training (TrainingId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
