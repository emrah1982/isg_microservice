# ✅ Makine Sistemi Yükseltme Kontrol Listesi

## 📋 Yapılması Gerekenler

### 1️⃣ Veritabanı Migration (5 dakika)
- [ ] phpMyAdmin'e girin: http://localhost:8090
- [ ] `activities_db` veritabanını seçin
- [ ] SQL sekmesine tıklayın
- [ ] `scripts/alter-activities-db-20251011-machines.sql` dosyasının içeriğini kopyalayın
- [ ] Yapıştırıp "Go" butonuna tıklayın
- [ ] Sonuç tablosunda "Machines" ve "ControlForms" satırlarını görmelisiniz

**Beklenen Çıktı:**
```
TableName                        | RecordCount | UniqueMachineTypes/Machines
Machines                         | 5+          | 5
ControlForms with MachineId      | X           | Y
```

### 2️⃣ Backend Servisi Yeniden Başlatma (2 dakika)
```bash
cd c:\Users\User\Desktop\isg_microservice
docker compose up -d --build activities-service
```

- [ ] Komut çalıştırıldı
- [ ] Container başarıyla ayağa kalktı
- [ ] Log'larda hata yok

**Kontrol:**
```bash
docker logs activities-service
```

### 3️⃣ Frontend Güncelleme (2 dakika)

**Dosya:** `ReactApp/src/pages/Activities/ControlFormsPage.tsx`

Değiştir:
```tsx
import CreateModal from './ControlForms/CreateModal';
```

Şununla:
```tsx
import CreateModalV2 from './ControlForms/CreateModalV2';
```

Ve:
```tsx
{isCreateModalOpen && (
  <CreateModal
    onClose={() => setIsCreateModalOpen(false)}
    onCreate={(payload) => createMut.mutate(payload)}
    isPending={createMut.isPending}
  />
)}
```

Şununla:
```tsx
{isCreateModalOpen && (
  <CreateModalV2
    onClose={() => setIsCreateModalOpen(false)}
    onCreate={(payload) => createMut.mutate(payload)}
    isPending={createMut.isPending}
  />
)}
```

- [ ] Değişiklik yapıldı
- [ ] Dosya kaydedildi

### 4️⃣ Test Senaryoları

#### Test 1: Yeni Makine Ekleme
- [ ] "Yeni Kontrol Formu" aç
- [ ] "Makine Seç" → "+ Yeni Makine Ekle" tıkla
- [ ] Bilgileri doldur:
  - Makine Tipi: `Forklift`
  - Ad: `Test Forklift 1`
  - Model: `Toyota 8FD25`
  - Seri No: `TEST123`
  - Lokasyon: `Test Depo`
- [ ] "Makineyi Kaydet" tıkla
- [ ] Makine başarıyla oluşturuldu mesajı
- [ ] Kontrol listesi otomatik yüklendi

#### Test 2: Mevcut Makine ile Form
- [ ] "Yeni Kontrol Formu" aç
- [ ] "Makine Seç" → "Test Forklift 1" seç
- [ ] Makine bilgileri otomatik doldu
- [ ] Kontrol listesi yüklendi
- [ ] Form No: `KF-TEST-001` yaz
- [ ] "Kaydet" tıkla
- [ ] Form başarıyla kaydedildi

#### Test 3: Aynı Makine İkinci Form
- [ ] "Yeni Kontrol Formu" aç
- [ ] "Test Forklift 1" seç
- [ ] Kontrol listesi önceki formdan geldi mi kontrol et
- [ ] Form No: `KF-TEST-002` yaz
- [ ] "Kaydet" tıkla

### 5️⃣ API Test (Opsiyonel)

**Makineleri Listele:**
```bash
curl http://localhost:8091/api/machines
```

**Yeni Makine Oluştur:**
```bash
curl -X POST http://localhost:8091/api/machines \
  -H "Content-Type: application/json" \
  -d '{
    "machineType": "Ekskavatör",
    "name": "Ekskavatör 1",
    "model": "CAT 320D",
    "serialNumber": "EX001",
    "location": "Şantiye",
    "status": "Active"
  }'
```

- [ ] API yanıt veriyor
- [ ] Yeni makine oluşturuldu

### 6️⃣ Veritabanı Doğrulama

**phpMyAdmin'de kontrol:**

```sql
-- Makineleri listele
SELECT * FROM Machines ORDER BY CreatedAt DESC LIMIT 10;

-- Makineye bağlı formları listele
SELECT 
    m.Name as MachineName,
    m.Model,
    m.SerialNumber,
    COUNT(cf.Id) as FormCount
FROM Machines m
LEFT JOIN ControlForms cf ON m.Id = cf.MachineId
GROUP BY m.Id
ORDER BY FormCount DESC;
```

- [ ] Machines tablosu dolu
- [ ] ControlForms.MachineId ilişkisi çalışıyor

## ✨ Başarı Kriterleri

- ✅ Migration hatasız çalıştı
- ✅ Backend servisi ayakta
- ✅ Frontend yeni modal ile çalışıyor
- ✅ Yeni makine eklenebiliyor
- ✅ Mevcut makine seçilebiliyor
- ✅ Kontrol listesi otomatik yükleniyor
- ✅ Form kaydediliyor
- ✅ Veritabanında MachineId ilişkisi var

## 🐛 Sorun Giderme

### Migration Hatası
```
Error: Table 'Machines' already exists
```
**Çözüm:** Migration daha önce çalıştırılmış. Devam edin.

### Backend Başlamıyor
```
docker logs activities-service
```
**Çözüm:** Log'lardaki hatayı kontrol edin. Genelde DB bağlantı sorunu.

### Frontend Hatası
```
Module not found: Can't resolve './ControlForms/CreateModalV2'
```
**Çözüm:** Dosya adını kontrol edin. `CreateModalV2.tsx` olmalı.

### Kontrol Listesi Gelmiyor
**Kontrol:**
1. Tarayıcı console'u açın (F12)
2. "Loaded checklist from..." mesajını arayın
3. Şablon veritabanında var mı kontrol edin:
```sql
SELECT * FROM MachineTemplates WHERE MachineType = 'Forklift';
SELECT * FROM MachineChecklistItems WHERE MachineTemplateId = X;
```

## 📞 Yardım

Sorun devam ederse:
1. Tarayıcı console log'larını paylaşın
2. Backend log'larını paylaşın (`docker logs activities-service`)
3. Hangi adımda takıldığınızı belirtin

## 🎉 Tamamlandı!

Tüm checkboxlar işaretlendiyse sistem hazır! 

**Sonraki Adımlar:**
- Gerçek makine verilerini ekleyin
- Şablon kontrol listelerini doldurun (`scripts/add-machine-templates-with-checklists.sql`)
- Kullanıcı eğitimi verin
