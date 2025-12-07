-- Exams DB initialization
CREATE DATABASE IF NOT EXISTS exams_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE exams_db;

-- Exams table
CREATE TABLE IF NOT EXISTS Exams (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Title VARCHAR(200) NOT NULL,
  Description TEXT NULL,
  DurationMinutes INT NOT NULL,
  PassScore INT NOT NULL,
  IsActive TINYINT(1) DEFAULT 1,
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Questions table
CREATE TABLE IF NOT EXISTS Questions (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  ExamId INT NOT NULL,
  Text TEXT NOT NULL,
  `Order` INT NOT NULL DEFAULT 0,
  FOREIGN KEY (ExamId) REFERENCES Exams(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Options table
CREATE TABLE IF NOT EXISTS Options (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  QuestionId INT NOT NULL,
  Text TEXT NOT NULL,
  IsCorrect TINYINT(1) NOT NULL DEFAULT 0,
  `Order` INT NOT NULL DEFAULT 0,
  FOREIGN KEY (QuestionId) REFERENCES Questions(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Training-Exam mapping (cross-service logical FK: TrainingId comes from TrainingsService)
CREATE TABLE IF NOT EXISTS TrainingExams (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  TrainingId INT NOT NULL,
  ExamId INT NOT NULL,
  `Order` INT NOT NULL DEFAULT 0,
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_training_exam (TrainingId, ExamId),
  FOREIGN KEY (ExamId) REFERENCES Exams(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Exam attempts and answers
CREATE TABLE IF NOT EXISTS ExamAttempts (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  ExamId INT NOT NULL,
  UserId INT NOT NULL,
  StartedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  SubmittedAt DATETIME NULL,
  Score INT NULL,
  Passed TINYINT(1) NULL,
  FOREIGN KEY (ExamId) REFERENCES Exams(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ExamAnswers (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  AttemptId INT NOT NULL,
  QuestionId INT NOT NULL,
  SelectedOptionId INT NOT NULL,
  IsCorrect TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (AttemptId) REFERENCES ExamAttempts(Id) ON DELETE CASCADE,
  FOREIGN KEY (QuestionId) REFERENCES Questions(Id) ON DELETE CASCADE,
  FOREIGN KEY (SelectedOptionId) REFERENCES Options(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed sample exam (optional)
INSERT INTO Exams (Title, Description, DurationMinutes, PassScore, IsActive)
VALUES ('İSG Temel Sınavı', 'Temel iş güvenliği bilgisi değerlendirmesi', 30, 70, 1);

SET @examId = LAST_INSERT_ID();
INSERT INTO Questions (ExamId, Text, `Order`) VALUES
(@examId, 'Yangın türleri hangileridir?', 1),
(@examId, 'KKD açılımı nedir?', 2);

SET @q1 = (SELECT Id FROM Questions WHERE ExamId=@examId AND `Order`=1 LIMIT 1);
SET @q2 = (SELECT Id FROM Questions WHERE ExamId=@examId AND `Order`=2 LIMIT 1);

INSERT INTO Options (QuestionId, Text, IsCorrect, `Order`) VALUES
(@q1, 'A, B, C, D, E', 1, 1),
(@q1, 'Küçük, Orta, Büyük', 0, 2),
(@q1, 'Kırmızı, Sarı, Yeşil', 0, 3),
(@q1, 'Sıcak, Soğuk, Ilık', 0, 4),
(@q2, 'Kişisel Koruyucu Donanım', 1, 1),
(@q2, 'Kamu Kurumları Dairesi', 0, 2),
(@q2, 'Kimyasal Koruma Deposu', 0, 3),
(@q2, 'Kontrollü Kapalı Dolaşım', 0, 4);
