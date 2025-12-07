-- Initial schema for PersonnelService
CREATE DATABASE IF NOT EXISTS personnel_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE personnel_db;

CREATE TABLE IF NOT EXISTS Personnel (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  UserId INT NULL,
  NationalId VARCHAR(11) NULL,
  FirstName VARCHAR(100) NOT NULL,
  LastName VARCHAR(100) NOT NULL,
  Email VARCHAR(200) NULL,
  Phone VARCHAR(50) NULL,
  Department VARCHAR(150) NULL,
  Title VARCHAR(150) NULL,
  Position VARCHAR(150) NULL,
  StartDate DATE NULL,
  Status VARCHAR(32) NOT NULL DEFAULT 'Active',
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_personnel_department (Department),
  INDEX idx_personnel_title (Title),
  INDEX idx_personnel_name (FirstName, LastName),
  INDEX idx_personnel_national_phone (NationalId, Phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed sample data
INSERT INTO Personnel (FirstName, LastName, Email, Phone, Department, Title, Position, StartDate, Status, NationalId)
VALUES
('Ahmet', 'Yılmaz', 'ahmet.yilmaz@example.com', '+90 532 000 0001', 'Üretim', 'Mühendis', 'Kıdemli Mühendis', '2022-05-01', 'Active', '11111111111'),
('Ayşe', 'Demir', 'ayse.demir@example.com', '+90 532 000 0002', 'İK', 'Uzman', 'İK Uzmanı', '2023-01-15', 'Active', '22222222222');
