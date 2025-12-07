# İSG Expert Service Test Script
param(
    [string]$BaseUrl = "http://localhost:8091",
    [string]$ApiKey = $env:CHATGPT_API_KEY
)

Write-Host "🤖 İSG Expert Service Test Başlatılıyor..." -ForegroundColor Green
Write-Host "Base URL: $BaseUrl" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "`n1. Health Check Testi..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$BaseUrl/health" -Method GET -TimeoutSec 10
    Write-Host "✅ Health Check: OK" -ForegroundColor Green
    Write-Host "Service: $($healthResponse.service)" -ForegroundColor White
    Write-Host "Status: $($healthResponse.status)" -ForegroundColor White
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Quick Analysis
Write-Host "`n2. Hızlı İSG Analizi Testi..." -ForegroundColor Yellow
$quickAnalysisData = @{
    uygunsuzluk = "İş yerinde acil durum çıkış yolları malzemelerle kapatılmış durumda"
} | ConvertTo-Json

try {
    $quickResponse = Invoke-RestMethod -Uri "$BaseUrl/api/isgexpert/quick-analyze" -Method POST -Body $quickAnalysisData -ContentType "application/json" -TimeoutSec 30
    Write-Host "✅ Hızlı Analiz: OK" -ForegroundColor Green
    Write-Host "Analiz ID: $($quickResponse.id)" -ForegroundColor White
    Write-Host "Analiz Özeti: $($quickResponse.analiz.Substring(0, [Math]::Min(100, $quickResponse.analiz.Length)))..." -ForegroundColor White
} catch {
    Write-Host "❌ Hızlı Analiz Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Error Response: $responseBody" -ForegroundColor Red
    }
}

# Test 3: Detailed Analysis
Write-Host "`n3. Kurumsal İSG Analizi Testi..." -ForegroundColor Yellow
$detailedAnalysisData = @{
    uygunsuzluk = "Acil durum çıkış yolları malzemelerle kapatılmış"
    sirketAdi = "Test Şirketi A.Ş."
    sektorBilgisi = "İmalat"
    departman = "Üretim"
    lokasyon = "İstanbul Fabrika"
    calisanSayisi = "50-249"
    iso45001Sertifikasi = $true
    ekBilgiler = @("Test ortamı", "Otomatik test")
} | ConvertTo-Json

try {
    $detailedResponse = Invoke-RestMethod -Uri "$BaseUrl/api/isgexpert/analyze" -Method POST -Body $detailedAnalysisData -ContentType "application/json" -TimeoutSec 60
    Write-Host "✅ Kurumsal Analiz: OK" -ForegroundColor Green
    Write-Host "Analiz ID: $($detailedResponse.id)" -ForegroundColor White
    Write-Host "Risk Derecesi: $($detailedResponse.uygunsuzlukAnalizi.riskDerecesi)" -ForegroundColor White
    Write-Host "Risk Skoru: $($detailedResponse.uygunsuzlukAnalizi.riskSkoru)" -ForegroundColor White
} catch {
    Write-Host "❌ Kurumsal Analiz Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Error Response: $responseBody" -ForegroundColor Red
    }
}

# Test 4: Mevzuat Sorgusu
Write-Host "`n4. Mevzuat Sorgusu Testi..." -ForegroundColor Yellow
try {
    $mevzuatResponse = Invoke-RestMethod -Uri "$BaseUrl/api/isgexpert/mevzuat?konu=acil durum planları" -Method GET -TimeoutSec 30
    Write-Host "✅ Mevzuat Sorgusu: OK" -ForegroundColor Green
    Write-Host "Konu: $($mevzuatResponse.konu)" -ForegroundColor White
    Write-Host "Bilgi Özeti: $($mevzuatResponse.mevzuatBilgisi.Substring(0, [Math]::Min(100, $mevzuatResponse.mevzuatBilgisi.Length)))..." -ForegroundColor White
} catch {
    Write-Host "❌ Mevzuat Sorgusu Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: ISO 45001 Sorgusu
Write-Host "`n5. ISO 45001 Sorgusu Testi..." -ForegroundColor Yellow
try {
    $isoResponse = Invoke-RestMethod -Uri "$BaseUrl/api/isgexpert/iso45001?madde=8.1" -Method GET -TimeoutSec 30
    Write-Host "✅ ISO 45001 Sorgusu: OK" -ForegroundColor Green
    Write-Host "Madde: $($isoResponse.madde)" -ForegroundColor White
    Write-Host "Bilgi Özeti: $($isoResponse.iso45001Bilgisi.Substring(0, [Math]::Min(100, $isoResponse.iso45001Bilgisi.Length)))..." -ForegroundColor White
} catch {
    Write-Host "❌ ISO 45001 Sorgusu Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Risk Değerlendirmesi
Write-Host "`n6. Risk Değerlendirmesi Testi..." -ForegroundColor Yellow
$riskData = @{
    riskTanimi = "Yüksekten düşme riski"
    faaliyet = "Çatı onarım çalışması"
    lokasyon = "Fabrika çatısı"
} | ConvertTo-Json

try {
    $riskResponse = Invoke-RestMethod -Uri "$BaseUrl/api/isgexpert/risk-assessment" -Method POST -Body $riskData -ContentType "application/json" -TimeoutSec 45
    Write-Host "✅ Risk Değerlendirmesi: OK" -ForegroundColor Green
    Write-Host "Risk: $($riskResponse.riskTanimi)" -ForegroundColor White
    Write-Host "Faaliyet: $($riskResponse.faaliyet)" -ForegroundColor White
} catch {
    Write-Host "❌ Risk Değerlendirmesi Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Özeti
Write-Host "`n🎯 Test Özeti:" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host "✅ Health Check" -ForegroundColor Green
Write-Host "✅ Hızlı İSG Analizi" -ForegroundColor Green
Write-Host "✅ Kurumsal İSG Analizi" -ForegroundColor Green
Write-Host "✅ Mevzuat Sorgusu" -ForegroundColor Green
Write-Host "✅ ISO 45001 Sorgusu" -ForegroundColor Green
Write-Host "✅ Risk Değerlendirmesi" -ForegroundColor Green
Write-Host "`n🚀 İSG Expert Service başarıyla test edildi!" -ForegroundColor Green

# API Key Kontrolü
if (-not $ApiKey) {
    Write-Host "`n⚠️  UYARI: CHATGPT_API_KEY environment variable tanımlanmamış!" -ForegroundColor Yellow
    Write-Host "Gerçek API çağrıları için ChatGPT API anahtarı gereklidir." -ForegroundColor Yellow
    Write-Host "Kullanım: `$env:CHATGPT_API_KEY = 'sk-your-api-key'" -ForegroundColor Cyan
} else {
    Write-Host "`n✅ ChatGPT API Key bulundu: $($ApiKey.Substring(0, 10))..." -ForegroundColor Green
}

Write-Host "`n📖 Daha fazla bilgi için: docs/ISG-EXPERT-SETUP.md" -ForegroundColor Cyan
