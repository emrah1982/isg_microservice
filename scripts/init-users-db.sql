-- İSG Users Database Initialization Script
USE users_db;

-- Database charset ve collation ayarları
ALTER DATABASE users_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Roles tablosu oluştur
CREATE TABLE IF NOT EXISTS Roles (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(50) NOT NULL UNIQUE,
    Description VARCHAR(200),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    IsDeleted TINYINT(1) NOT NULL DEFAULT 0,
    DeletedAt DATETIME NULL
);

-- Users tablosu oluştur (UserResponseDto modeline uygun)
CREATE TABLE IF NOT EXISTS Users (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    Email VARCHAR(255) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    RoleId INT NOT NULL,
    PhoneNumber VARCHAR(20) NULL,
    TcNo VARCHAR(11) NULL UNIQUE,
    Department VARCHAR(100) NULL,
    Position VARCHAR(100) NULL,
    HireDate DATETIME NULL,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    LastLoginDate DATETIME NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    IsDeleted TINYINT(1) NOT NULL DEFAULT 0,
    DeletedAt DATETIME NULL,
    FOREIGN KEY (RoleId) REFERENCES Roles(Id),
    INDEX idx_email (Email),
    INDEX idx_tc_no (TcNo),
    INDEX idx_role_id (RoleId),
    INDEX idx_is_active (IsActive)
);

-- Roller ekle (idempotent)
INSERT INTO Roles (Id, Name, Description)
VALUES
(1, 'Admin', 'Sistem Yöneticisi - Tam yetki'),
(2, 'Manager', 'İSG Uzmanı - Yönetim yetkisi'),
(3, 'Supervisor', 'Vardiya Amiri - Denetim yetkisi'),
(4, 'Employee', 'Çalışan - Temel kullanım'),
(5, 'Doctor', 'İş Yeri Hekimi - Sağlık raporları'),
(6, 'Inspector', 'Müfettiş - Denetim ve kontrol')
ON DUPLICATE KEY UPDATE
  Description = VALUES(Description),
  UpdatedAt = CURRENT_TIMESTAMP,
  IsDeleted = 0,
  DeletedAt = NULL;

-- Örnek kullanıcılar ekle (şifre: admin123 - tüm kullanıcılar için, idempotent)
INSERT INTO Users (FirstName, LastName, Email, PasswordHash, RoleId, PhoneNumber, TcNo, Department, Position, HireDate, IsActive)
VALUES
('Admin', 'Kullanıcı', 'admin@isg.com', 'AQAAAAEAACcQAAAAEGTXIRyn/yWre4JMpxHF+h+Le/nm+jId2nOJWiBtUMiBnPoepcZZ/AxI48VK3x0Usw==', 1, '0532-123-4567', '12345678901', 'Bilgi İşlem', 'Sistem Yöneticisi', '2023-01-15', TRUE),
('Mehmet', 'Yılmaz', 'mehmet.yilmaz@company.com', 'AQAAAAEAACcQAAAAEGTXIRyn/yWre4JMpxHF+h+Le/nm+jId2nOJWiBtUMiBnPoepcZZ/AxI48VK3x0Usw==', 2, '0533-234-5678', '23456789012', 'İSG Departmanı', 'İSG Uzmanı', '2023-02-01', TRUE),
('Ayşe', 'Kaya', 'ayse.kaya@company.com', 'AQAAAAEAACcQAAAAEGTXIRyn/yWre4JMpxHF+h+Le/nm+jId2nOJWiBtUMiBnPoepcZZ/AxI48VK3x0Usw==', 3, '0534-345-6789', '34567890123', 'Üretim', 'Vardiya Amiri', '2023-03-10', TRUE),
('Ali', 'Demir', 'ali.demir@company.com', 'AQAAAAEAACcQAAAAEGTXIRyn/yWre4JMpxHF+h+Le/nm+jId2nOJWiBtUMiBnPoepcZZ/AxI48VK3x0Usw==', 4, '0535-456-7890', '45678901234', 'Üretim', 'Operatör', '2023-04-05', TRUE),
('Dr. Fatma', 'Özkan', 'fatma.ozkan@company.com', 'AQAAAAEAACcQAAAAEGTXIRyn/yWre4JMpxHF+h+Le/nm+jId2nOJWiBtUMiBnPoepcZZ/AxI48VK3x0Usw==', 5, '0536-567-8901', '56789012345', 'Sağlık', 'İş Yeri Hekimi', '2023-05-20', TRUE),
('Hasan', 'Çelik', 'hasan.celik@company.com', 'AQAAAAEAACcQAAAAEGTXIRyn/yWre4JMpxHF+h+Le/nm+jId2nOJWiBtUMiBnPoepcZZ/AxI48VK3x0Usw==', 6, '0537-678-9012', '67890123456', 'Kalite', 'Müfettiş', '2023-06-15', TRUE)
ON DUPLICATE KEY UPDATE
  PasswordHash = VALUES(PasswordHash),
  RoleId = VALUES(RoleId),
  IsActive = VALUES(IsActive),
  UpdatedAt = CURRENT_TIMESTAMP,
  IsDeleted = 0,
  DeletedAt = NULL;
