-- Machine Templates and Checklist Items
USE activities_db;

-- MachineTemplates table
CREATE TABLE IF NOT EXISTS MachineTemplates (
  Id INT NOT NULL AUTO_INCREMENT,
  MachineType VARCHAR(100) NOT NULL,
  Description VARCHAR(500) NULL,
  IsActive TINYINT(1) NOT NULL DEFAULT 1,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (Id),
  KEY IX_MachineTemplates_MachineType (MachineType)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- MachineChecklistItems table
CREATE TABLE IF NOT EXISTS MachineChecklistItems (
  Id INT NOT NULL AUTO_INCREMENT,
  MachineTemplateId INT NOT NULL,
  ItemText VARCHAR(500) NOT NULL,
  Category VARCHAR(100) NULL,
  DisplayOrder INT NOT NULL,
  IsRequired TINYINT(1) NOT NULL DEFAULT 1,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (Id),
  KEY IX_MachineChecklistItems_MachineTemplateId (MachineTemplateId),
  KEY IX_MachineChecklistItems_DisplayOrder (DisplayOrder),
  CONSTRAINT FK_MachineChecklistItems_MachineTemplates FOREIGN KEY (MachineTemplateId) 
    REFERENCES MachineTemplates(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert Forklift Template
INSERT INTO MachineTemplates (MachineType, Description, IsActive) 
VALUES ('Forklift', 'Forklift kontrol listesi şablonu', 1);
SET @forklift_id = LAST_INSERT_ID();

INSERT INTO MachineChecklistItems (MachineTemplateId, ItemText, Category, DisplayOrder) VALUES
(@forklift_id, 'Fren sistemi kontrolü', 'Güvenlik', 1),
(@forklift_id, 'Direksiyon ve kumanda kontrolü', 'Mekanik', 2),
(@forklift_id, 'Hidrolik sistem kontrolü', 'Hidrolik', 3),
(@forklift_id, 'Lastik durumu ve hava basıncı', 'Lastik', 4),
(@forklift_id, 'Far ve sinyal lambaları', 'Elektrik', 5),
(@forklift_id, 'Geri vites sesli uyarı sistemi', 'Güvenlik', 6),
(@forklift_id, 'Emniyet kemeri kontrolü', 'Güvenlik', 7),
(@forklift_id, 'Korna çalışma durumu', 'Elektrik', 8),
(@forklift_id, 'Motor yağ seviyesi', 'Motor', 9),
(@forklift_id, 'Soğutma suyu seviyesi', 'Motor', 10),
(@forklift_id, 'Hidrolik yağ seviyesi', 'Hidrolik', 11),
(@forklift_id, 'Akü durumu ve bağlantılar', 'Elektrik', 12),
(@forklift_id, 'Çatal ve zincir durumu', 'Mekanik', 13),
(@forklift_id, 'Yangın söndürücü varlığı ve tarihi', 'Güvenlik', 14),
(@forklift_id, 'İlk yardım çantası kontrolü', 'Güvenlik', 15);

-- Insert Vinç Template
INSERT INTO MachineTemplates (MachineType, Description, IsActive) 
VALUES ('Vinç', 'Vinç kontrol listesi şablonu', 1);
SET @vinc_id = LAST_INSERT_ID();

INSERT INTO MachineChecklistItems (MachineTemplateId, ItemText, Category, DisplayOrder) VALUES
(@vinc_id, 'Kablo ve halat durumu', 'Güvenlik', 1),
(@vinc_id, 'Kanca ve emniyet mandalı', 'Güvenlik', 2),
(@vinc_id, 'Fren sistemi kontrolü', 'Mekanik', 3),
(@vinc_id, 'Hidrolik sistem sızıntı kontrolü', 'Hidrolik', 4),
(@vinc_id, 'Motor çalışma durumu', 'Motor', 5),
(@vinc_id, 'Elektrik bağlantıları ve kablolar', 'Elektrik', 6),
(@vinc_id, 'Güvenlik kilitleri ve limitler', 'Güvenlik', 7),
(@vinc_id, 'Sesli ve ışıklı uyarı sistemleri', 'Elektrik', 8),
(@vinc_id, 'Kumanda paneli ve butonlar', 'Elektrik', 9),
(@vinc_id, 'Yük kapasitesi etiketleri', 'Güvenlik', 10),
(@vinc_id, 'Stabilizatör ve destek ayakları', 'Mekanik', 11),
(@vinc_id, 'Yağlama noktaları', 'Bakım', 12),
(@vinc_id, 'Acil durdurma butonu', 'Güvenlik', 13);

-- Insert Kompresör Template
INSERT INTO MachineTemplates (MachineType, Description, IsActive) 
VALUES ('Kompresör', 'Kompresör kontrol listesi şablonu', 1);
SET @kompresor_id = LAST_INSERT_ID();

INSERT INTO MachineChecklistItems (MachineTemplateId, ItemText, Category, DisplayOrder) VALUES
(@kompresor_id, 'Basınç göstergesi kontrolü', 'Güvenlik', 1),
(@kompresor_id, 'Emniyet valfi çalışma testi', 'Güvenlik', 2),
(@kompresor_id, 'Motor yağ seviyesi', 'Motor', 3),
(@kompresor_id, 'Hava filtresi temizliği', 'Bakım', 4),
(@kompresor_id, 'Yağ filtresi durumu', 'Bakım', 5),
(@kompresor_id, 'Soğutma sistemi kontrolü', 'Motor', 6),
(@kompresor_id, 'Hava hortumları ve bağlantılar', 'Mekanik', 7),
(@kompresor_id, 'Elektrik bağlantıları', 'Elektrik', 8),
(@kompresor_id, 'Titreşim ve gürültü seviyesi', 'Mekanik', 9),
(@kompresor_id, 'Otomatik durdurma sistemi', 'Güvenlik', 10),
(@kompresor_id, 'Yoğuşma suyu tahliye vanası', 'Bakım', 11),
(@kompresor_id, 'Kayış gerginliği', 'Mekanik', 12),
(@kompresor_id, 'Topraklama bağlantısı', 'Elektrik', 13);

-- Insert Ekskavatör Template
INSERT INTO MachineTemplates (MachineType, Description, IsActive) 
VALUES ('Ekskavatör', 'Ekskavatör kontrol listesi şablonu', 1);
SET @ekskavator_id = LAST_INSERT_ID();

INSERT INTO MachineChecklistItems (MachineTemplateId, ItemText, Category, DisplayOrder) VALUES
(@ekskavator_id, 'Hidrolik sistem sızıntı kontrolü', 'Hidrolik', 1),
(@ekskavator_id, 'Kova ve dişler durumu', 'Mekanik', 2),
(@ekskavator_id, 'Palet ve zincir gerginliği', 'Mekanik', 3),
(@ekskavator_id, 'Motor yağ seviyesi', 'Motor', 4),
(@ekskavator_id, 'Hidrolik yağ seviyesi', 'Hidrolik', 5),
(@ekskavator_id, 'Soğutma suyu kontrolü', 'Motor', 6),
(@ekskavator_id, 'Fren sistemi', 'Güvenlik', 7),
(@ekskavator_id, 'Döner tabla yağlama', 'Bakım', 8),
(@ekskavator_id, 'Cam ve aynalar', 'Güvenlik', 9),
(@ekskavator_id, 'Korna ve uyarı sistemleri', 'Elektrik', 10),
(@ekskavator_id, 'Emniyet kemeri', 'Güvenlik', 11),
(@ekskavator_id, 'Yangın söndürücü', 'Güvenlik', 12);

-- Insert Jeneratör Template
INSERT INTO MachineTemplates (MachineType, Description, IsActive) 
VALUES ('Jeneratör', 'Jeneratör kontrol listesi şablonu', 1);
SET @jenerator_id = LAST_INSERT_ID();

INSERT INTO MachineChecklistItems (MachineTemplateId, ItemText, Category, DisplayOrder) VALUES
(@jenerator_id, 'Motor yağ seviyesi', 'Motor', 1),
(@jenerator_id, 'Soğutma suyu seviyesi', 'Motor', 2),
(@jenerator_id, 'Yakıt seviyesi ve sızıntı kontrolü', 'Motor', 3),
(@jenerator_id, 'Akü durumu ve şarj seviyesi', 'Elektrik', 4),
(@jenerator_id, 'Hava filtresi temizliği', 'Bakım', 5),
(@jenerator_id, 'Egzoz sistemi sızıntı kontrolü', 'Motor', 6),
(@jenerator_id, 'Elektrik bağlantıları ve kablolar', 'Elektrik', 7),
(@jenerator_id, 'Otomatik transfer anahtarı (ATS)', 'Elektrik', 8),
(@jenerator_id, 'Voltaj ve frekans göstergeleri', 'Elektrik', 9),
(@jenerator_id, 'Acil durdurma butonu', 'Güvenlik', 10),
(@jenerator_id, 'Ses izolasyonu ve titreşim', 'Mekanik', 11),
(@jenerator_id, 'Topraklama sistemi', 'Elektrik', 12);

-- Insert Transpalet Template
INSERT INTO MachineTemplates (MachineType, Description, IsActive) 
VALUES ('Transpalet', 'Transpalet kontrol listesi şablonu', 1);
SET @transpalet_id = LAST_INSERT_ID();

INSERT INTO MachineChecklistItems (MachineTemplateId, ItemText, Category, DisplayOrder) VALUES
(@transpalet_id, 'Hidrolik pompa çalışması', 'Hidrolik', 1),
(@transpalet_id, 'Tekerlek durumu', 'Mekanik', 2),
(@transpalet_id, 'Fren sistemi', 'Güvenlik', 3),
(@transpalet_id, 'Çatal durumu ve kaynak kontrolü', 'Mekanik', 4),
(@transpalet_id, 'Kumanda kolu ve butonlar', 'Mekanik', 5),
(@transpalet_id, 'Hidrolik yağ sızıntısı', 'Hidrolik', 6),
(@transpalet_id, 'Yük kapasitesi etiketi', 'Güvenlik', 7);

-- Insert Loder Template
INSERT INTO MachineTemplates (MachineType, Description, IsActive) 
VALUES ('Loder', 'Loder kontrol listesi şablonu', 1);
SET @loder_id = LAST_INSERT_ID();

INSERT INTO MachineChecklistItems (MachineTemplateId, ItemText, Category, DisplayOrder) VALUES
(@loder_id, 'Hidrolik sistem kontrolü', 'Hidrolik', 1),
(@loder_id, 'Kova ve kesici kenar durumu', 'Mekanik', 2),
(@loder_id, 'Lastik durumu ve basınç', 'Lastik', 3),
(@loder_id, 'Fren sistemi', 'Güvenlik', 4),
(@loder_id, 'Direksiyon sistemi', 'Mekanik', 5),
(@loder_id, 'Motor yağ seviyesi', 'Motor', 6),
(@loder_id, 'Soğutma suyu', 'Motor', 7),
(@loder_id, 'Far ve sinyal lambaları', 'Elektrik', 8),
(@loder_id, 'Geri vites uyarı sistemi', 'Güvenlik', 9),
(@loder_id, 'Emniyet kemeri', 'Güvenlik', 10),
(@loder_id, 'Cam ve aynalar', 'Güvenlik', 11);
