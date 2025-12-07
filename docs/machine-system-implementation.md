# Makine Varlığı Sistemi - Uygulama Kılavuzu

## 📋 Genel Bakış

Profesyonel makine yönetimi sistemi ile her fiziksel makine veritabanında kayıtlı olur ve kontrol formları bu makinelere bağlanır.

## 🎯 Özellikler

### 1. Makine Varlığı (Machine Entity)
- Her fiziksel makine benzersiz ID ile tanımlanır
- Makine tipi, model, seri numarası, lokasyon bilgileri
- Makineye özel kontrol listesi kaydedilebilir
- Durum takibi: Active, Maintenance, Retired

### 2. Kontrol Listesi Öncelik Sırası
1. **Makineye özel kontrol listesi** (Machine.CustomChecklistJson)
2. **Makine tipi şablonu** (MachineTemplate.ChecklistItems)
3. **Manuel ekleme**

### 3. Geriye Dönük Uyumluluk
- Eski formlar için MachineName, MachineModel vb. alanlar korundu
- Yeni formlar MachineId ile ilişkilendirilir
- Mevcut veriler otomatik migration ile Machine kayıtlarına dönüştürülür

## 🗄️ Veritabanı Yapısı

### Machines Tablosu
```sql
CREATE TABLE Machines (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    MachineType VARCHAR(100) NOT NULL,
    Name VARCHAR(200) NOT NULL,
    Model VARCHAR(100) NULL,
    SerialNumber VARCHAR(100) NULL UNIQUE,
    Location VARCHAR(200) NULL,
    ManufactureYear INT NULL,
    Status VARCHAR(50) DEFAULT 'Active',
    CustomChecklistJson TEXT NULL,
    Notes TEXT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NULL
);
```

### ControlForms İlişkisi
```sql
ALTER TABLE ControlForms 
ADD COLUMN MachineId INT NULL,
ADD FOREIGN KEY (MachineId) REFERENCES Machines(Id) ON DELETE SET NULL;
```

## 🚀 Kurulum Adımları

### 1. Migration Çalıştır
```bash
# phpMyAdmin'e girin: http://localhost:8090
# activities_db seçin
# SQL sekmesinde şu dosyayı çalıştırın:
```
Dosya: `scripts/alter-activities-db-20251011-machines.sql`

### 2. Backend Servisi Yeniden Başlat
```bash
cd c:\Users\User\Desktop\isg_microservice
docker compose up -d --build activities-service
```

### 3. Frontend Güncellemesi
`ControlFormsPage.tsx` içinde:
```tsx
import CreateModalV2 from './ControlForms/CreateModalV2';

// CreateModal yerine CreateModalV2 kullan
{isCreateModalOpen && (
  <CreateModalV2
    onClose={() => setIsCreateModalOpen(false)}
    onCreate={(payload) => createMut.mutate(payload)}
    isPending={createMut.isPending}
  />
)}
```

## 📝 Kullanım Senaryoları

### Senaryo 1: İlk Makine Kaydı
1. "Yeni Kontrol Formu" aç
2. "Makine Seç" → "+ Yeni Makine Ekle"
3. Makine bilgilerini gir:
   - Makine Tipi: Forklift
   - Ad: Forklift 1
   - Model: Toyota 8FD25
   - Seri No: SN123456
   - Lokasyon: Depo A
4. "Makineyi Kaydet"
5. Şablondan kontrol listesi otomatik yüklenir
6. İsterseniz madde ekle/çıkar
7. "Kaydet"

### Senaryo 2: Mevcut Makine ile Form
1. "Yeni Kontrol Formu" aç
2. "Makine Seç" → Listeden "Forklift 1" seç
3. Makine bilgileri otomatik doldurulur
4. **Eğer daha önce bu makineye özel kontrol listesi kaydedildiyse** → O liste gelir
5. **Değilse** → Şablondan gelir
6. Form doldurulup kaydedilir

### Senaryo 3: Makineye Özel Kontrol Listesi Kaydetme
1. Bir makine için form oluştur
2. Kontrol listesini özelleştir (madde ekle/çıkar)
3. Formu kaydet
4. **Opsiyonel:** API ile makineye özel listeyi kalıcı yap:
```bash
POST /api/machines/{machineId}/checklist
{
  "checklistJson": "[...]"
}
```

## 🔌 API Endpoints

### Machines API
```
GET    /api/machines                    # Tüm makineler (filtreleme: q, status, machineType)
GET    /api/machines/{id}               # Makine detayı
POST   /api/machines                    # Yeni makine
PUT    /api/machines/{id}               # Makine güncelle
DELETE /api/machines/{id}               # Makine sil
POST   /api/machines/{id}/checklist     # Makineye özel kontrol listesi kaydet
GET    /api/machines/by-type            # Makine tiplerine göre grupla
```

### ControlForms API (Güncellendi)
```
POST /api/controlforms
{
  "formNumber": "KF-2025-001",
  "machineId": 5,                       // Yeni alan
  "controlDate": "2025-10-11T14:00",
  "status": "Pending",
  "checklistItemsJson": "[...]"
}
```

## 🎨 Frontend Bileşenler

### CreateModalV2
- Makine seçim dropdown'u
- Yeni makine ekleme formu
- Otomatik kontrol listesi yükleme
- Makineye özel / şablon kontrol listesi göstergesi

### MachinesApi
```typescript
import { listMachines, createMachine, getMachine } from '@api/machinesApi';

// Kullanım
const machines = await listMachines({ status: 'Active' });
const newMachine = await createMachine({
  machineType: 'Forklift',
  name: 'Forklift 1',
  model: 'Toyota 8FD25',
  serialNumber: 'SN123456',
  status: 'Active'
});
```

## 📊 Veri Akışı

```
1. Kullanıcı makine seçer
   ↓
2. Frontend makine bilgilerini çeker (GET /api/machines/{id})
   ↓
3. Kontrol listesi yükleme önceliği:
   a) Machine.CustomChecklistJson varsa → Kullan
   b) Yoksa → MachineTemplate'den yükle
   ↓
4. Kullanıcı formu doldurur
   ↓
5. Form kaydedilir (POST /api/controlforms)
   - machineId gönderilir
   - Backend makine bilgilerini otomatik doldurur
   ↓
6. Veritabanına kaydedilir
```

## 🔍 Sorgulama Örnekleri

### Bir makineye ait tüm kontrol formları
```sql
SELECT cf.*, m.Name as MachineName, m.Model, m.SerialNumber
FROM ControlForms cf
INNER JOIN Machines m ON cf.MachineId = m.Id
WHERE m.Id = 5
ORDER BY cf.ControlDate DESC;
```

### Makine tipine göre form sayısı
```sql
SELECT 
    m.MachineType,
    COUNT(cf.Id) as FormCount,
    SUM(CASE WHEN cf.Status = 'Completed' THEN 1 ELSE 0 END) as CompletedCount
FROM Machines m
LEFT JOIN ControlForms cf ON m.Id = cf.MachineId
GROUP BY m.MachineType;
```

## ⚠️ Önemli Notlar

1. **Seri Numarası Benzersizliği:** Her makine için seri numarası unique olmalı
2. **Silme Koruması:** Makineye ait form varsa makine silinemez
3. **Durum Yönetimi:** Kullanılmayan makineler 'Retired' durumuna alınmalı
4. **Kontrol Listesi Önceliği:** Makineye özel liste her zaman şablondan önceliklidir

## 🎯 Gelecek Geliştirmeler

- [ ] Makine bakım geçmişi
- [ ] Makine performans raporları
- [ ] QR kod ile makine tanıma
- [ ] Makine lokasyon takibi (GPS)
- [ ] Makine kullanım saati sayacı
- [ ] Otomatik bakım hatırlatıcıları

## 📞 Destek

Sorun yaşarsanız:
1. Backend log'larını kontrol edin
2. Tarayıcı console'unda hata mesajlarını inceleyin
3. Migration'ın başarıyla çalıştığını doğrulayın
4. API endpoint'lerini Postman ile test edin
