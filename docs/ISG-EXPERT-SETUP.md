# 🤖 İSG Expert Service - Kurulum ve Kullanım Kılavuzu

## 📋 Genel Bakış

İSG Expert Service, ChatGPT API kullanarak İş Sağlığı ve Güvenliği alanında kurumsal düzeyde analiz yapan AI destekli bir mikroservistir. ISO 45001 ve Türk İSG mevzuatına uyumlu olarak geliştirilmiştir.

## 🚀 Hızlı Başlangıç

### 1. Gereksinimler

- **ChatGPT API Key**: OpenAI'dan alınacak API anahtarı
- **Docker & Docker Compose**: Container ortamı için
- **.NET 8 SDK**: Yerel geliştirme için (opsiyonel)

### 2. Environment Kurulumu

`.env` dosyası oluşturun:

```bash
cp .env.example .env
```

`.env` dosyasında ChatGPT API anahtarınızı ekleyin:

```env
CHATGPT_API_KEY=
```

### 3. Servis Başlatma

Docker Compose ile tüm sistemi başlatın:

```bash
docker-compose up -d isg-expert-service
```

Sadece İSG Expert Service'i başlatmak için:

```bash
docker-compose up -d isg-expert-service
```

### 4. Servis Kontrolü

Servis durumunu kontrol edin:

```bash
curl http://localhost:8091/health
```

Swagger UI'ye erişin:
```
http://localhost:8091
```

## 🔧 API Kullanımı

### Hızlı İSG Analizi

Basit ve hızlı uygunsuzluk analizi:

```bash
curl -X POST http://localhost:8091/api/isgexpert/quick-analyze \
  -H "Content-Type: application/json" \
  -d '{
    "uygunsuzluk": "İş yerinde acil durum çıkış yolları malzemelerle kapatılmış"
  }'
```

### Kurumsal İSG Analizi

Detaylı kurumsal analiz:

```bash
curl -X POST http://localhost:8091/api/isgexpert/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "uygunsuzluk": "Acil durum çıkış yolları malzemelerle kapatılmış",
    "sirketAdi": "ABC İnşaat Ltd. Şti.",
    "sektorBilgisi": "İnşaat",
    "departman": "Üretim",
    "lokasyon": "İstanbul Fabrika",
    "calisanSayisi": "50-249",
    "iso45001Sertifikasi": true,
    "ekBilgiler": ["Yeni işçiler var", "Son denetim 6 ay önce yapıldı"]
  }'
```

### Mevzuat Sorgulama

İSG mevzuatı hakkında bilgi alma:

```bash
curl -X GET "http://localhost:8091/api/isgexpert/mevzuat?konu=acil%20durum%20planları"
```

### ISO 45001 Bilgisi

ISO 45001 madde bilgisi sorgulama:

```bash
curl -X GET "http://localhost:8091/api/isgexpert/iso45001?madde=8.1"
```

### Risk Değerlendirmesi

Risk analizi yapma:

```bash
curl -X POST http://localhost:8091/api/isgexpert/risk-assessment \
  -H "Content-Type: application/json" \
  -d '{
    "riskTanimi": "Yüksekten düşme riski",
    "faaliyet": "Çatı onarım çalışması",
    "lokasyon": "Fabrika çatısı"
  }'
```

## 🎯 React Frontend Entegrasyonu

React uygulamanızda İSG Expert sayfasını kullanmak için:

1. **Route Ekleme** (`App.tsx`):
```tsx
import ISGExpertPage from './pages/ISGExpert/ISGExpertPage';

// Routes içine ekleyin
<Route path="/isg-expert" element={<ISGExpertPage />} />
```

2. **Menü Ekleme**:
```tsx
<Link to="/isg-expert">🤖 İSG Expert</Link>
```

3. **Axios Configuration**: 
`axiosInstance.ts` dosyasında `isgexpert` route'u zaten eklenmiştir.

## ⚙️ Konfigürasyon

### appsettings.json

```json
{
  "ChatGPT": {
    "BaseUrl": "https://api.openai.com/v1/chat/completions",
    "ApiKey": "",
    "DefaultModel": "gpt-4",
    "QuickModel": "gpt-3.5-turbo",
    "MaxTokens": 4000,
    "Temperature": 0.7
  },
  "ISGExpert": {
    "MaxAnalysisPerHour": 100,
    "EnableDetailedLogging": true,
    "SupportedLanguages": ["tr", "en"],
    "DefaultLanguage": "tr"
  }
}
```

### Environment Variables

```env
# Zorunlu
CHATGPT_API_KEY=sk-your-api-key

# Opsiyonel
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8091
ISG_EXPERT_MAX_ANALYSIS_PER_HOUR=100
ISG_EXPERT_ENABLE_DETAILED_LOGGING=true
```

## 🔍 Troubleshooting

### Yaygın Sorunlar

1. **API Key Hatası**:
```
Error: ChatGPT API Key not found
```
**Çözüm**: `.env` dosyasında `CHATGPT_API_KEY` değişkenini kontrol edin.

2. **Connection Timeout**:
```
Error: A task was canceled
```
**Çözüm**: İnternet bağlantınızı kontrol edin, ChatGPT API'sine erişim olduğundan emin olun.

3. **JSON Parse Error**:
```
Error: Failed to parse ISG analysis response
```
**Çözüm**: Bu durumda sistem otomatik olarak basit analize geçer.

### Log Kontrolü

Container loglarını kontrol edin:

```bash
docker logs isg-expert-service -f
```

### Health Check

Servis sağlığını kontrol edin:

```bash
curl http://localhost:8091/health
```

Beklenen yanıt:
```json
{
  "status": "healthy",
  "service": "ISG Expert Service",
  "version": "1.0.0",
  "timestamp": "2024-01-01T12:00:00Z",
  "features": [
    "Kurumsal İSG Analizi",
    "Hızlı İSG Değerlendirmesi",
    "Mevzuat Sorguları",
    "ISO 45001 Bilgileri",
    "Risk Değerlendirmesi"
  ]
}
```

## 📊 Performans ve Limitler

### Rate Limiting

- **Varsayılan**: Saatte 100 analiz
- **Konfigürasyon**: `ISG_EXPERT_MAX_ANALYSIS_PER_HOUR` environment variable ile ayarlanabilir

### Token Kullanımı

- **Hızlı Analiz**: ~500-1000 token
- **Kurumsal Analiz**: ~2000-4000 token
- **Mevzuat Sorguları**: ~300-800 token

### Response Süreleri

- **Hızlı Analiz**: 3-8 saniye
- **Kurumsal Analiz**: 10-30 saniye
- **Mevzuat Sorguları**: 2-5 saniye

## 🔐 Güvenlik

### API Key Güvenliği

- API anahtarınızı asla kod içinde hardcode etmeyin
- Environment variables kullanın
- Production'da secrets management sistemi kullanın

### CORS Politikası

Varsayılan olarak tüm origin'lere izin verilir. Production'da kısıtlayın:

```csharp
options.AddPolicy(CorsPolicy, policy =>
    policy.WithOrigins("https://yourdomain.com")
          .AllowAnyHeader()
          .AllowAnyMethod());
```

## 📈 Monitoring

### Metrics

Servis aşağıdaki metrikleri sağlar:

- Request count
- Response times
- Error rates
- Token usage
- API call success rates

### Logging

Detaylı logging için:

```env
ISG_EXPERT_ENABLE_DETAILED_LOGGING=true
LOG_LEVEL=Debug
```

## 🚀 Production Deployment

### Docker Production

```yaml
isg-expert-service:
  image: isg-expert-service:latest
  environment:
    - ASPNETCORE_ENVIRONMENT=Production
    - CHATGPT_API_KEY=${CHATGPT_API_KEY}
  deploy:
    replicas: 2
    resources:
      limits:
        memory: 512M
        cpus: '0.5'
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: isg-expert-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: isg-expert-service
  template:
    metadata:
      labels:
        app: isg-expert-service
    spec:
      containers:
      - name: isg-expert-service
        image: isg-expert-service:latest
        ports:
        - containerPort: 8091
        env:
        - name: CHATGPT_API_KEY
          valueFrom:
            secretKeyRef:
              name: chatgpt-secret
              key: api-key
```

## 📞 Destek

Teknik destek için:

- **GitHub Issues**: Hata raporları ve özellik istekleri
- **Email**: isg-expert@company.com
- **Dokümantasyon**: `/swagger` endpoint'i

---

**Not**: Bu servis sürekli geliştirilmekte olup, yeni özellikler ve iyileştirmeler düzenli olarak eklenmektedir.
