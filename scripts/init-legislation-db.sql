CREATE DATABASE IF NOT EXISTS legislation_db;
USE legislation_db;

-- Ensure UTF8MB4 for proper Turkish characters
ALTER DATABASE legislation_db CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci;

CREATE TABLE IF NOT EXISTS Regulations (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Title VARCHAR(255),
  LawNumber VARCHAR(50),
  Type VARCHAR(50),
  PublishDate DATE,
  SourceURL TEXT,
  Summary TEXT,
  Status VARCHAR(50),
  LastChecked DATETIME
) CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci;

-- Unique indexes (idempotent - ignore if exists)
ALTER TABLE Regulations ADD UNIQUE KEY IF NOT EXISTS UX_Regulations_Title (Title);
ALTER TABLE Regulations ADD UNIQUE KEY IF NOT EXISTS UX_Regulations_LawNumber (LawNumber);

CREATE TABLE IF NOT EXISTS RegulationChanges (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  RegulationId INT,
  ChangeDate DATE,
  ChangeSummary TEXT,
  FOREIGN KEY (RegulationId) REFERENCES Regulations(Id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci;

-- Seed: Core Laws and Key OHS Regulations
-- Note: This script may run only on first container init. If rerun manually, duplicates can occur.

INSERT IGNORE INTO Regulations (Title, LawNumber, Type, PublishDate, SourceURL, Summary, Status, LastChecked)
VALUES
  (
    '4857 Sayılı İş Kanunu',
    '4857',
    'Kanun',
    '2003-05-22',
    'https://www.mevzuat.gov.tr/MevzuatMetin/1.5.4857.pdf',
    'İş ilişkilerini ve çalışma şartlarını düzenleyen temel iş kanunu.',
    'Yürürlükte',
    NOW()
  ),
  (
    '6331 Sayılı İş Sağlığı ve Güvenliği Kanunu',
    '6331',
    'Kanun',
    '2012-06-30',
    'https://www.mevzuat.gov.tr/MevzuatMetin/1.5.6331.pdf',
    'İş sağlığı ve güvenliği ile ilgili usul ve esasları belirleyen temel kanun.',
    'Yürürlükte',
    NOW()
  );

-- Key OHS Regulations (Yönetmelikler)
INSERT IGNORE INTO Regulations (Title, LawNumber, Type, PublishDate, SourceURL, Summary, Status, LastChecked)
VALUES
  (
    'İş Ekipmanlarının Kullanımında Sağlık ve Güvenlik Şartları Yönetmeliği',
    NULL,
    'Yönetmelik',
    '2013-04-25',
    'https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=18365&MevzuatTur=7&MevzuatTertip=5',
    'İş ekipmanlarının asgari sağlık ve güvenlik gerekleri.',
    'Yürürlükte',
    NOW()
  ),
  (
    'Çalışanların İş Sağlığı ve Güvenliği Eğitimlerinin Usul ve Esasları Hakkında Yönetmelik',
    NULL,
    'Yönetmelik',
    '2013-07-15',
    'https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=18785&MevzuatTur=7&MevzuatTertip=5',
    'Çalışanların İSG eğitimleriyle ilgili usul ve esaslar.',
    'Yürürlükte',
    NOW()
  ),
  (
    'İşyeri Hekimi ve Diğer Sağlık Personelinin Görev, Yetki, Sorumluluk ve Eğitimleri Hakkında Yönetmelik',
    NULL,
    'Yönetmelik',
    '2013-07-20',
    'https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=18810&MevzuatTur=7&MevzuatTertip=5',
    'İşyeri hekimi ve diğer sağlık personelinin görev ve yetkileri.',
    'Yürürlükte',
    NOW()
  ),
  (
    'İş Güvenliği Uzmanlarının Görev, Yetki, Sorumluluk ve Eğitimleri Hakkında Yönetmelik',
    NULL,
    'Yönetmelik',
    
    '2013-07-29',
    'https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=18835&MevzuatTur=7&MevzuatTertip=5',
    'İş güvenliği uzmanlarının görev ve yetkileri.',
    'Yürürlükte',
    NOW()
  ),
  (
    'İşyeri Bina ve Eklentilerinde Alınacak Sağlık ve Güvenlik Önlemlerine İlişkin Yönetmelik',
    NULL,
    'Yönetmelik',
    '2013-07-17',
    'https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=18797&MevzuatTur=7&MevzuatTertip=5',
    'İşyeri bina ve eklentilerine ilişkin asgari tedbirler.',
    'Yürürlükte',
    NOW()
  ),
  (
    'İşyerlerinde Acil Durumlar Hakkında Yönetmelik',
    NULL,
    'Yönetmelik',
    '2013-06-18',
    'https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=28681&MevzuatTur=7&MevzuatTertip=5',
    'Acil durumların belirlenmesi ve yönetimi.',
    'Yürürlükte',
    NOW()
  ),
  (
    'Kişisel Koruyucu Donanımların İşyerlerinde Kullanılması Hakkında Yönetmelik',
    NULL,
    'Yönetmelik',
    '2013-05-02',
    'https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=28695&MevzuatTur=7&MevzuatTertip=5',
    'KKD seçimi, kullanımı ve yükümlülükler.',
    'Yürürlükte',
    NOW()
  );

CREATE TABLE IF NOT EXISTS CompanyCompliance (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  CompanyId INT,
  RegulationId INT,
  ComplianceStatus VARCHAR(50),
  LastAuditDate DATE,
  ResponsiblePerson VARCHAR(255),
  Notes TEXT,
  FOREIGN KEY (RegulationId) REFERENCES Regulations(Id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci;

-- New: Regulation Articles (madde/bent)
CREATE TABLE IF NOT EXISTS RegulationArticles (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  RegulationId INT NOT NULL,
  Code VARCHAR(100),            -- Örn: Madde 4/1-a
  Title TEXT,                   -- Changed from VARCHAR(255) to TEXT for long titles
  Text MEDIUMTEXT,
  OrderNo INT,
  FOREIGN KEY (RegulationId) REFERENCES Regulations(Id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci;

-- Indexes for RegulationArticles (idempotent)
CREATE INDEX IF NOT EXISTS IX_RegArticle_Reg_Order ON RegulationArticles(RegulationId, OrderNo);
CREATE UNIQUE INDEX IF NOT EXISTS UX_RegArticle_Reg_Code ON RegulationArticles(RegulationId, Code);

-- New: Company applicable regulations (işletmenin tabi olduğu mevzuatlar)
CREATE TABLE IF NOT EXISTS CompanyApplicableRegulations (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  CompanyId INT NOT NULL,
  RegulationId INT NOT NULL,
  Notes TEXT,
  FOREIGN KEY (RegulationId) REFERENCES Regulations(Id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci;

-- Index for CompanyApplicableRegulations (idempotent)
CREATE UNIQUE INDEX IF NOT EXISTS UX_Company_Reg ON CompanyApplicableRegulations(CompanyId, RegulationId);

-- New: Company article compliance (madde bazlı uyum durumu)
CREATE TABLE IF NOT EXISTS CompanyArticleCompliance (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  CompanyId INT NOT NULL,
  ArticleId INT NOT NULL,
  ComplianceStatus ENUM('Compliant','NonCompliant','NotApplicable') NOT NULL,
  LastAuditDate DATE,
  ResponsiblePerson VARCHAR(255),
  Notes TEXT,
  EvidenceURL TEXT,
  FOREIGN KEY (ArticleId) REFERENCES RegulationArticles(Id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci;

-- Index for CompanyArticleCompliance (idempotent)
CREATE UNIQUE INDEX IF NOT EXISTS UX_Company_Article ON CompanyArticleCompliance(CompanyId, ArticleId);
