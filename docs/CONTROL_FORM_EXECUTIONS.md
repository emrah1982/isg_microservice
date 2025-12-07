# Kontrol Formu Uygulamaları Sistemi

Bu dokümantasyon, kontrol formlarının uygulanması/doldurulması için geliştirilen yeni sistemi açıklamaktadır.

## 📋 Sistem Özeti

**Amaç**: Mevcut kontrol formları sayfasında oluşturulan kontrol form şablonlarını kullanarak, gerçek kontrol uygulamaları yapabilmek ve bu kayıtları takip edebilmek.

**İki Ana Bölüm**:
1. **Kontrol Formları** (`/activities/control-forms`) - Form şablonlarının tasarlandığı sayfa
2. **Kontrol Uygulamaları** (`/activities/control-executions`) - Formların doldurulduğu/uygulandığı sayfa

## 🗄️ Veritabanı Yapısı

### ControlFormExecutions Tablosu
```sql
- Id (PK)
- ControlFormTemplateId (FK) - Hangi şablondan türetildiği
- ExecutionNumber - Otomatik oluşturulan uygulama numarası
- MachineId (FK) - Hangi makineye uygulandığı
- MachineName, MachineModel, MachineSerialNumber, Location
- ExecutionDate - Uygulama tarihi
- ExecutedByPersonnelId, ExecutedByPersonName - Uygulayan personel
- Status - InProgress/Completed/Cancelled
- Notes - Genel notlar
- ChecklistResponsesJson - Doldurulmuş kontrol maddeleri (JSON)
- TotalScore, MaxScore, SuccessPercentage - Skorlama
- HasCriticalIssues - Kritik sorunlar var mı?
- CompletedAt - Tamamlanma tarihi
- CreatedAt, UpdatedAt
```

### ControlFormExecutionAttachments Tablosu
```sql
- Id (PK)
- ControlFormExecutionId (FK)
- FileName, StoredPath, ContentType, FileSize
- FileType - Document/Image/Video
- Description - Dosya açıklaması
- UploadedAt
```

## 🔧 Backend API

### Controller: `ControlFormExecutionsController`

**Endpoint**: `/api/controlformexecutions`

#### Ana Metodlar:
- `GET /` - Uygulamaları listele (filtreleme desteği)
- `GET /{id}` - Belirli uygulamayı getir
- `POST /` - Yeni uygulama başlat
- `PUT /{id}` - Uygulamayı güncelle
- `DELETE /{id}` - Uygulamayı sil
- `GET /templates` - Aktif şablonları listele

#### Filtreleme Parametreleri:
- `q` - Genel arama
- `status` - Durum filtresi
- `templateId` - Şablon filtresi
- `machineId` - Makine filtresi
- `startDate`, `endDate` - Tarih aralığı

## 🎨 Frontend Yapısı

### Ana Sayfa: `ControlFormExecutionsPage`
- **Lokasyon**: `/activities/control-executions`
- **Özellikler**:
  - Uygulama listesi
  - Gelişmiş filtreleme
  - Analiz sekmesi
  - Yeni uygulama oluşturma

### Modal Bileşenleri:

#### 1. CreateExecutionModal
- Yeni kontrol uygulaması başlatma
- Şablon seçimi
- Makine bilgileri girişi
- Personel ataması

#### 2. ExecuteFormModal
- **Ana uygulama modalı**
- Kontrol maddelerini tek tek doldurma
- Sidebar ile madde listesi
- İlerleme takibi
- Kaydetme ve tamamlama

#### 3. ExecutionDetailModal
- Tamamlanmış uygulamaların detayı
- Yazdırma özelliği
- İstatistikler
- Kontrol maddesi cevapları

## 📊 Özellikler

### Kontrol Maddesi Türleri:
- **Checkbox**: Uygun/Uygun Değil seçimi
- **Text**: Açıklama metni
- **Number**: Sayısal değer
- **Select**: Seçenekli liste (gelecekte)

### Skorlama Sistemi:
- Tamamlanma yüzdesi hesaplama
- Kritik madde kontrolü
- Başarı oranı hesaplama
- Zorunlu madde kontrolü

### Analiz ve Raporlama:
- Toplam uygulama sayısı
- Durum bazlı istatistikler
- Kritik sorunlu uygulamalar
- Ortalama tamamlanma oranı

## 🚀 Kullanım Akışı

### 1. Yeni Uygulama Başlatma:
1. "Yeni Kontrol Uygulaması" butonuna tıkla
2. Kontrol formu şablonu seç
3. Makine bilgilerini gir
4. Uygulayacak personeli belirle
5. "Oluştur" ile uygulamayı başlat

### 2. Kontrol Uygulama:
1. Listeden "Uygula" butonuna tıkla
2. Kontrol maddelerini tek tek doldur
3. Her madde için:
   - Uygun/Uygun değil seç
   - Gerekirse not ekle
   - Kritik maddeler için özel dikkat
4. "Kaydet" ile ara kayıt yap
5. "Tamamla" ile uygulamayı bitir

### 3. Takip ve Raporlama:
1. Ana listede tüm uygulamaları gör
2. Filtrelerle arama yap
3. "Detay" ile sonuçları incele
4. "Yazdır" ile rapor al
5. Analiz sekmesinde genel istatistikleri gör

## 🔗 Entegrasyon

### Mevcut Sistemle Bağlantı:
- **ControlFormTemplates** tablosu ile bağlantı
- **Machines** tablosu ile ilişki
- **Personnel** sistemi ile entegrasyon

### API Proxy Konfigürasyonu:
```typescript
'/api/controlformexecutions': {
  target: 'http://localhost:8091',
  changeOrigin: true,
  secure: false
}
```

## 📝 Veritabanı Migration

**Script**: `alter-activities-db-20251013-controlformexecutions.sql`

Çalıştırma:
```bash
mysql -u root -p activities_db < scripts/alter-activities-db-20251013-controlformexecutions.sql
```

## 🎯 Gelecek Geliştirmeler

1. **Dosya Ekleme**: Kontrol sırasında fotoğraf/doküman ekleme
2. **QR Kod**: Makine bazlı hızlı erişim
3. **Mobil Uygulama**: Sahada kullanım için
4. **Otomatik Hatırlatma**: Periyodik kontroller için
5. **Dashboard**: Yönetici paneli
6. **Export**: Excel/PDF export özelliği

## 🔧 Teknik Notlar

- **Framework**: ASP.NET Core 8, React 18, TypeScript
- **Veritabanı**: MySQL 8.0
- **State Management**: TanStack Query
- **Styling**: CSS Modules
- **Validation**: Backend ve frontend validasyon

## 📞 Destek

Bu sistem ile ilgili sorunlar için:
1. Backend loglarını kontrol edin
2. Browser console'u inceleyin  
3. Veritabanı bağlantısını doğrulayın
4. API endpoint'lerinin çalıştığını test edin
