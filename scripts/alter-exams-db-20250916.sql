-- ALTER script to ensure linking and attempts tables exist in exams_db
USE exams_db;

-- TrainingExams table (link exams to trainings)
CREATE TABLE IF NOT EXISTS TrainingExams (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  TrainingId INT NOT NULL,
  ExamId INT NOT NULL,
  `Order` INT NOT NULL DEFAULT 0,
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_training_exam (TrainingId, ExamId),
  INDEX idx_training (TrainingId),
  INDEX idx_exam (ExamId),
  CONSTRAINT fk_trainingexams_exam FOREIGN KEY (ExamId) REFERENCES Exams(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ExamAttempts table
CREATE TABLE IF NOT EXISTS ExamAttempts (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  ExamId INT NOT NULL,
  UserId INT NOT NULL,
  StartedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  SubmittedAt DATETIME NULL,
  Score INT NULL,
  Passed TINYINT(1) NULL,
  INDEX idx_examattempts_exam (ExamId),
  INDEX idx_examattempts_user (UserId),
  CONSTRAINT fk_examattempts_exam FOREIGN KEY (ExamId) REFERENCES Exams(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ExamAnswers table
CREATE TABLE IF NOT EXISTS ExamAnswers (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  AttemptId INT NOT NULL,
  QuestionId INT NOT NULL,
  SelectedOptionId INT NOT NULL,
  IsCorrect TINYINT(1) NOT NULL DEFAULT 0,
  INDEX idx_answers_attempt (AttemptId),
  INDEX idx_answers_question (QuestionId),
  INDEX idx_answers_option (SelectedOptionId),
  CONSTRAINT fk_examanswers_attempt FOREIGN KEY (AttemptId) REFERENCES ExamAttempts(Id) ON DELETE CASCADE,
  CONSTRAINT fk_examanswers_question FOREIGN KEY (QuestionId) REFERENCES Questions(Id) ON DELETE CASCADE,
  CONSTRAINT fk_examanswers_option FOREIGN KEY (SelectedOptionId) REFERENCES Options(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
