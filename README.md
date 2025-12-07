### 3. 👁️ VisionService (Görsel Uygunsuzluk Tespiti)
**Sorumluluk**: Base64 görseli DeepSeek-VL API ile analiz edip İSG uygunsuzluklarını JSON olarak döndürür. Onay sonrası görseli `DocumentsService`'e kaydedebilir; yüksek seviyede ihlalde `IncidentsService`'e otomatik olay kaydı oluşturabilir.

**Bağımlılıklar**:
- DeepSeek API anahtarı (env: `DEEPSEEK_API_KEY`)
- DocumentsService (görsel kaydı için)
- IncidentsService (otomatik olay için – opsiyonel)

**Konfigürasyon** (`src/VisionService/appsettings.json`):
```
"DeepSeek": {
  "Endpoint": "https://api.deepseek.com/v1/chat/completions",
  "Model": "deepseek-vl"
},
"Services": {
  "DocumentsService": "http://documents-service:8084",
  "IncidentsService": "http://incidents-service:8083"
}
```

**Docker Compose**: `vision-service` 8086 portunda yayınlanır. Ortam değişkeni olarak `DEEPSEEK_API_KEY` verilmelidir.

**API Endpoints**:
```
POST /api/vision/infer
Body: { "base64Image": "data:image/jpeg;base64,...", "threshold": 0.35, "autoCreateIncident": false }
Desc: Görseli analiz eder, violations ve summary döner.

POST /api/vision/save
Body: { "base64Image": "data:image/jpeg;base64,...", "title": "...", "description": "...", "location": "İstasyon-3", "isPublic": false, "uploadedBy": 123 }
Desc: Onay sonrası görseli DocumentsService'e kaydeder.
```

# 🏭 İSG (İş Sağlığı ve Güvenliği) Mikroservis Sistemi

Bu proje, **İş Sağlığı ve Güvenliği** yönetimi için geliştirilmiş kapsamlı bir mikroservis sistemidir. ASP.NET Core 8, MySQL ve Docker Compose teknolojileri kullanılarak geliştirilmiştir.

## 🎯 Proje Amacı

İSG yazılımında kullanılacak temel modülleri mikroservis mimarisi ile geliştirmek:

- ✅ **Kullanıcı Yönetimi** (personel, yöneticiler, denetçiler, doktor vb.)
- ✅ **Eğitim ve Sertifika Takibi**
- ✅ **Risk Analizi Modülü**
- ✅ **İş Kazası/Olay Kayıtları**
- ✅ **Raporlama & Dashboard**
- ✅ **Evrak/Doküman Yönetimi**
- ✅ **İSG Expert - AI Destekli Kurumsal Asistan**

## 🏗️ Sistem Mimarisi

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   UsersService  │  │ TrainingsService│  │ RiskAnalysisService│
│    (Port 8080)  │  │    (Port 8081)  │  │    (Port 8082)  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                     │                     │
         ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   users_db      │  │  trainings_db   │  │    risks_db     │
│   (Port 3306)   │  │   (Port 3307)   │  │   (Port 3308)   │
└─────────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ IncidentsService│  │DocumentsService │  │ReportingService │
│    (Port 8083)  │  │    (Port 8084)  │  │    (Port 8085)  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
          │                    │                     │
          ▼                    ▼                     │
      ┌──────────────────────────────────────────────┐
      │               VisionService (8086)           │
      │  DeepSeek-VL ile görsel uygunsuzluk tespiti  │
      └──────────────────────────────────────────────┘
         │                     │                     │
         ▼                     ▼                     │
┌─────────────────┐  ┌─────────────────┐             │
│  incidents_db   │  │  documents_db   │             │
│   (Port 3309)   │  │   (Port 3310)   │◄────────────┘
└─────────────────┘  └─────────────────┘
```

## 🚀 Mikroservisler

### 1. 👥 UsersService (Kullanıcı Yönetimi)
**Sorumluluk**: Kullanıcı kayıt, giriş, rol yönetimi ve JWT token üretimi

**Veritabanı**: `users_db` (MySQL)

**Tablolar**:
- `Users` - Kullanıcı bilgileri (Id, FirstName, LastName, Email, PasswordHash, RoleId, TcNo, Department, Position, vb.)
- `Roles` - Roller (Admin, Manager, Supervisor, Employee, Doctor, Inspector)

**API Endpoints**:
```
POST   /api/users/register      → Kullanıcı kaydı
POST   /api/users/authenticate  → JWT token üretimi
GET    /api/users/{id}          → Kullanıcı bilgisi
GET    /api/users               → Tüm kullanıcıları listele
PUT    /api/users/{id}          → Kullanıcı güncelle
GET    /api/users/validate/{id} → Kullanıcı doğrulama (diğer servisler için)
```

### 2. 📚 TrainingsService (Eğitim Yönetimi)
**Sorumluluk**: Eğitim oluşturma, kullanıcıya atama, sertifika takibi

**Veritabanı**: `trainings_db` (MySQL)

**Tablolar**:
- `Trainings` - Eğitim bilgileri (Id, Title, Description, Date, Duration, Mandatory, Category, vb.)
- `UserTrainings` - Kullanıcı-eğitim ilişkileri (UserId, TrainingId, Status, Score, CertificatePath, vb.)

**API Endpoints**:
```
POST   /api/trainings                    → Eğitim oluştur
GET    /api/trainings/{id}               → Eğitim bilgisi
GET    /api/trainings                    → Tüm eğitimleri listele
GET    /api/trainings/active             → Aktif eğitimleri listele
PUT    /api/trainings/{id}               → Eğitim güncelle
DELETE /api/trainings/{id}               → Eğitim sil
POST   /api/trainings/{id}/assign        → Kullanıcıya eğitim ata
GET    /api/trainings/{id}/participants  → Eğitim katılımcıları
GET    /api/trainings/user/{userId}      → Kullanıcının eğitimleri
PUT    /api/trainings/user-training/{id}/status → Eğitim durumu güncelle
```

## 🔐 Güvenlik ve Kimlik Doğrulama

### JWT Token Tabanlı Kimlik Doğrulama
- **UsersService** JWT token üretir
- **TrainingsService** token'ı doğrular
- Token süresi: 24 saat
- Roller: Admin, Manager, Supervisor, Employee, Doctor, Inspector

### Rol Tabanlı Yetkilendirme
```csharp
[Authorize(Roles = "Admin,Manager")]           // Sadece Admin ve Manager
[Authorize(Roles = "Admin,Manager,Supervisor")] // Admin, Manager ve Supervisor
[Authorize]                                    // Giriş yapmış kullanıcılar
```

## 🔄 Servisler Arası İletişim

TrainingsService, kullanıcı doğrulaması için UsersService'i HttpClient ile çağırır:

```csharp
// Kullanıcı doğrulama
GET http://users-service:8080/api/users/validate/{userId}

// Kullanıcı bilgisi alma
GET http://users-service:8080/api/users/{userId}
```

## 🗃️ Veritabanı Yapısı

### Users Database (users_db)
```sql
-- Roller
Roles: Id, Name, Description, CreatedAt, UpdatedAt, IsDeleted

-- Kullanıcılar
Users: Id, FirstName, LastName, Email, PasswordHash, RoleId, 
       PhoneNumber, TcNo, Department, Position, HireDate, 
       IsActive, LastLoginDate, CreatedAt, UpdatedAt, IsDeleted
```

### Trainings Database (trainings_db)
```sql
-- Eğitimler
Trainings: Id, Title, Description, Date, EndDate, Mandatory, 
           Instructor, Location, Duration, MaxParticipants, 
           Category, IsActive, CreatedAt, UpdatedAt, IsDeleted

-- Kullanıcı Eğitimleri
UserTrainings: Id, UserId, TrainingId, Status, CompletionDate, 
               Score, CertificatePath, CertificateIssueDate, 
               CertificateExpiryDate, Notes, AssignedDate, 
               AssignedBy, CreatedAt, UpdatedAt, IsDeleted
```

## 🐳 Docker ile Çalıştırma

### Gereksinimler
- Docker Desktop
- Docker Compose

### Sistem Başlatma
```bash
# Tüm servisleri başlat
docker-compose up -d

# Logları izle
docker-compose logs -f

# Servisleri durdur
docker-compose down

# Veritabanı verilerini de sil
docker-compose down -v
```

### Servis Portları
- **UsersService**: http://localhost:8080
- **TrainingsService**: http://localhost:8081
- **Users Database**: localhost:3306
- **Trainings Database**: localhost:3307
- **RiskAnalysisService**: http://localhost:8082
- **IncidentsService**: http://localhost:8083
- **DocumentsService**: http://localhost:8084
- **ReportingService**: http://localhost:8085
- **VisionService**: http://localhost:8086
- **phpMyAdmin**: http://localhost:8090

## 📖 API Dokümantasyonu (Swagger)

Servisler çalıştıktan sonra Swagger UI'a erişebilirsiniz:

- **UsersService Swagger**: http://localhost:8080
- **TrainingsService Swagger**: http://localhost:8081

## 🧪 Test Senaryoları

### 1. Kullanıcı Kaydı ve Girişi
```bash
# Kullanıcı kaydı
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@company.com",
    "password": "test123",
    "roleId": 4,
    "department": "IT",
    "position": "Developer"
  }'

# Kullanıcı girişi
curl -X POST http://localhost:8080/api/users/authenticate \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@company.com",
    "password": "test123"
  }'
```

### 2. Eğitim Oluşturma ve Atama
```bash
# JWT token'ı al (yukarıdaki giriş sonucundan)
TOKEN="your-jwt-token-here"

# Eğitim oluştur
curl -X POST http://localhost:8081/api/trainings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "İSG Temel Eğitimi",
    "description": "İş sağlığı ve güvenliği temel bilgileri",
    "date": "2024-12-01T09:00:00",
    "duration": 240,
    "mandatory": true,
    "category": "İSG",
    "instructor": "İSG Uzmanı",
    "location": "Konferans Salonu",
    "maxParticipants": 50
  }'

# Kullanıcıya eğitim ata
curl -X POST http://localhost:8081/api/trainings/1/assign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "notes": "Zorunlu eğitim"
  }'
```

## 🔧 Geliştirme Ortamı Kurulumu

### Yerel Geliştirme
```bash
# Repository'yi klonla
git clone <repository-url>
cd isg_microservice

# Shared kütüphanesini build et
dotnet build src/Shared/Shared.csproj

# UsersService'i çalıştır
cd src/UsersService
dotnet run

# TrainingsService'i çalıştır (yeni terminal)
cd src/TrainingsService
dotnet run
```

### Veritabanı Migration'ları (Tüm Servisler)
Önkoşul: Yerel MySQL (127.0.0.1:3306), kullanıcı: root, parola: secgem. Her servisin `appsettings.json` bağlantı bilgileri günceldir.

```powershell
# dotnet-ef aracını kurun/güncelleyin
dotnet tool install --global dotnet-ef
dotnet tool update --global dotnet-ef

# UsersService
dotnet ef migrations add Baseline_YYYYMMDD -p .\src\UsersService\UsersService.csproj -s .\src\UsersService\UsersService.csproj
dotnet ef database update -p .\src\UsersService\UsersService.csproj -s .\src\UsersService\UsersService.csproj

# TrainingsService
dotnet ef migrations add InitialCreate -p .\src\TrainingsService\TrainingsService.csproj -s .\src\TrainingsService\TrainingsService.csproj
dotnet ef database update -p .\src\TrainingsService\TrainingsService.csproj -s .\src\TrainingsService\TrainingsService.csproj

# RiskAnalysisService
dotnet ef migrations add InitialCreate -p .\src\RiskAnalysisService\RiskAnalysisService.csproj -s .\src\RiskAnalysisService\RiskAnalysisService.csproj
dotnet ef database update -p .\src\RiskAnalysisService\RiskAnalysisService.csproj -s .\src\RiskAnalysisService\RiskAnalysisService.csproj

# IncidentsService
dotnet ef migrations add InitialCreate -p .\src\IncidentsService\IncidentsService.csproj -s .\src\IncidentsService\IncidentsService.csproj
dotnet ef database update -p .\src\IncidentsService\IncidentsService.csproj -s .\src\IncidentsService\IncidentsService.csproj

# DocumentsService
dotnet ef migrations add InitialCreate -p .\src\DocumentsService\DocumentsService.csproj -s .\src\DocumentsService\DocumentsService.csproj
dotnet ef database update -p .\src\DocumentsService\DocumentsService.csproj -s .\src\DocumentsService\DocumentsService.csproj
```

Notlar:
- UsersService daha önce tablo oluşturduysa, ilk adımda `Baseline_...` migration kullanarak şemayı baseline alabilirsiniz (migration'ın Up/Down boş bırakılabilir).
- Uygulamalar açılışta `Database.Migrate()` çağırdığı için sonradan eklenen migration’lar otomatik uygulanır.

## 📊 Gelecek Modüller (Roadmap)

### 🔍 Risk Analizi Modülü
- Risk değerlendirme formları
- Risk matrisi hesaplamaları
- Önleyici faaliyet takibi
- Risk raporlama

### 📋 İş Kazası/Olay Kayıtları
- Kaza kayıt formları
- Olay analizi ve kök neden analizi
- Yasal raporlama
- İstatistiksel analizler

### 📈 Raporlama & Dashboard
- Eğitim tamamlanma oranları
- Kaza istatistikleri
- Risk dağılım grafikleri
- Uygunluk raporları

### 📁 Evrak/Doküman Yönetimi
- İSG dokümanları
- Sertifika yönetimi
- Versiyon kontrolü
- Dijital imza entegrasyonu

### 🤖 İSG Expert - AI Destekli Kurumsal Asistan
- **ChatGPT API Entegrasyonu**: OpenAI GPT-4 ile güçlendirilmiş
- **Kurumsal İSG Analizi**: ISO 45001 ve Türk İSG mevzuatı uyumlu
- **Uygunsuzluk Yönetimi**: Kök neden analizi ve düzeltici faaliyetler
- **Risk Değerlendirmesi**: 5x5 risk matrisi ile otomatik değerlendirme
- **Mevzuat Sorguları**: 6331 sayılı İSG Kanunu ve yönetmelik bilgileri
- **Performans İzleme**: KPI önerileri ve dashboard tasarımı
- **Hızlı Analiz**: Anlık İSG değerlendirmesi
- **Kurumsal Raporlama**: Detaylı analiz raporları

**API Endpoints**:
```
POST /api/isgexpert/analyze          # Kurumsal İSG analizi
POST /api/isgexpert/quick-analyze    # Hızlı İSG değerlendirmesi
GET  /api/isgexpert/mevzuat         # Mevzuat bilgisi sorgulama
GET  /api/isgexpert/iso45001        # ISO 45001 madde bilgileri
POST /api/isgexpert/risk-assessment # Risk değerlendirmesi
GET  /api/isgexpert/health          # Servis durumu
```

**Kullanım Örneği**:
```bash
curl -X POST http://localhost:8091/api/isgexpert/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "uygunsuzluk": "Acil durum çıkış yolları malzemelerle kapatılmış",
    "sirketAdi": "ABC Şirketi",
    "sektorBilgisi": "İmalat",
    "iso45001Sertifikasi": true
  }'
```

## 🛠️ Teknoloji Stack'i

- **Backend**: ASP.NET Core 8.0
- **Database**: MySQL 8.0
- **ORM**: Entity Framework Core
- **Authentication**: JWT Bearer Token
- **API Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose
- **Architecture**: Microservices
- **Communication**: HTTP/REST API

## 📝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Commit yapın (`git commit -am 'Yeni özellik eklendi'`)
4. Branch'i push yapın (`git push origin feature/yeni-ozellik`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

Proje hakkında sorularınız için:
- Email: isg-support@company.com
- Issue: GitHub Issues bölümünü kullanın

---

**Not**: Bu sistem İş Sağlığı ve Güvenliği mevzuatına uygun olarak geliştirilmiştir ve sürekli güncellenecektir.
