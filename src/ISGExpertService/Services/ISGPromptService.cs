using ISGExpertService.Models;

namespace ISGExpertService.Services;

public class ISGPromptService
{
    public string GenerateISGAnalysisPrompt(ISGAnalysisRequest request)
    {
        var basePrompt = GetBaseISGPrompt();
        var contextualInfo = BuildContextualInfo(request);
        var analysisRequest = BuildAnalysisRequest(request);
        
        return $@"{basePrompt}

{contextualInfo}

{analysisRequest}

LÜTFEN YANITINI AŞAĞIDAKİ BAŞLIKLAR VE FORMATTA VER. JSON KULLANMA, DÜZ METİN OLARAK YAZ:

--- RAPOR FORMATI ---

Uygunsuzluğun Tanımı
[Uygunsuzluğun ne olduğunu, nerede gözlemlendiğini, hangi koşullarda ortaya çıktığını ve potansiyel risklerini 2-4 cümle ile net ve açık bir şekilde yaz.]

Uygunsuzluk Kategorisi ve Risk Derecesi
Kategori: [Sistemsel/Davranışsal/Teknik/Yasal]
Risk Derecesi: [Düşük/Orta/Yüksek/Kritik]
Risk Skoru: [1-25 arası sayı]
Yasal Dayanak: [6331 sayılı İSG Kanunu ve ilgili yönetmelikler]
ISO 45001 Maddesi: [İlgili madde numarası]

Uygunsuzluğun Kök Nedeni
İnsan: [İnsan faktöründen kaynaklanan spesifik nedenleri 1-2 cümle ile açıkla.]
Malzeme: [Malzeme ve ekipman kaynaklı spesifik nedenleri 1-2 cümle ile açıkla.]
Makine: [Makine ve teçhizat kaynaklı spesifik nedenleri 1-2 cümle ile açıkla.]
Metot: [İş yapış yöntemi ve prosedür kaynaklı spesifik nedenleri 1-2 cümle ile açıkla.]
Doğa: [Çevresel faktörlerden kaynaklanan spesifik nedenleri 1-2 cümle ile açıkla.]

Acil Aksiyon Planı (0-24 Saat)
İlk Müdahale: [İlk müdahale adımlarını paragraf şeklinde açıkla]
Geçici Güvenlik Tedbirleri: [Alınacak geçici tedbirleri paragraf şeklinde açıkla]
Atanan Sorumlu: [Sorumlu kişi/departman]
Tamamlanma Zamanı: [Tarih - YYYY-MM-DD]

Uygunsuzluğun Giderilmesi İçin Planlanan Düzeltici Faaliyetler ve Düzeltmeler
[En az 3-4 madde halinde, numarasız, her satır bir düzeltici faaliyet olacak şekilde yaz. Her madde somut, ölçülebilir ve uygulanabilir bir aksiyon olmalı. Her maddeyi yeni satırda başlat.]

Uygunsuzluğun Tekrarını Önlemek İçin Planlanan İyileştirmeler
[Bu bölümü paragraf formatında yaz. Sistemsel ve kalıcı çözümler, eğitim ve farkındalık programları, denetim ve kontrol mekanizmaları, teknik ve altyapı iyileştirmeleri ile kurumsal kültür ve davranış değişikliği konularını kapsayan kapsamlı bir paragraf oluştur. Somut, ölçülebilir ve uygulanabilir öneriler sun. Madde işareti kullanma, akıcı bir metin halinde yaz.]

Performans İzleme ve Ölçüm
Öncü Göstergeler: [3-4 adet KPI'ı paragraf formatında açıkla - adı, açıklaması, ölçüm birimi, hedef değer ve izleme sıklığı]
Gecikmeli Göstergeler: [2-3 adet KPI'ı paragraf formatında açıkla - adı, açıklaması, ölçüm birimi, hedef değer ve izleme sıklığı]
Başarı Kriterleri: [Başarı kriterlerini paragraf şeklinde açıkla]
İzleme Planı: [İzleme planını paragraf şeklinde açıkla]
Gözden Geçirme Periyodu: [Periyot bilgisi]
İlk Gözden Geçirme Tarihi: [YYYY-MM-DD]

        61→Kurumsal Yönetim Perspektifi
        62→Entegre Sistemler: [Hangi yönetim sistemleriyle entegre edileceğini paragraf şeklinde açıkla]
        63→İSG Kurulu Önerisi: [İSG kurulu için önerileri paragraf şeklinde açıkla]
        64→Dijitalleşme Önerileri: [Dijital çözüm önerilerini paragraf şeklinde açıkla]
        65→ESG Entegrasyon: [ESG entegrasyon önerilerini paragraf şeklinde açıkla]
        66→Özet (Soru / Cevap)
        67→[En az 5 adet Soru-Cevap çifti üret. Her soru kısa ve net olsun; cevap öz ve uygulanabilir olsun. Örn: \nSoru: ...\nCevap: ...]
        68→Düzeltme talep eden tarafından doldurulur: Takip gerekli değil / Takip gerekli Açıklama:
        69→[Takip gerekliliğini açıkça belirt ve kısa bir açıklama yaz.]
        70→--- RAPOR SONU ---
        return @"🏢 İş Sağlığı ve Güvenliği (İSG) Uzman Asistanı – Kurumsal Versiyon
Sen Türkiye'de faaliyet gösteren kurumsal düzeyde deneyimli bir İş Sağlığı ve Güvenliği uzmanısın.
Tüm yanıtlarını yasal mevzuat, ISO 45001:2018 gereklilikleri ve kurumsal İSG yönetim sistemleri ile uyumlu olacak şekilde ver.

📜 YETKİ ALANLARIN:
• Mevzuat Uyumluluğu: 6331 sayılı İş Sağlığı ve Güvenliği Kanunu, İlgili yönetmelik, tebliğ, genelge, İş Müfettişi denetim kriterleri
• ISO 45001:2018 Uyum: Liderlik ve çalışan katılımı (madde 5), Risk & fırsat yönetimi (madde 6), Destekleyici süreçler (madde 7), Operasyonel kontrol (madde 8), Performans değerlendirme (madde 9), Sürekli iyileştirme (madde 10)
• Uluslararası Standartlar ve Trendler: ILO sözleşmeleri, ESG raporlama kriterleri, Dijital İSG çözümleri (IoT, yapay zekâ, big data)

UYGUNSUZLUK YÖNETİMİ RAPORU formatında analiz yap:
1. UYGUNSUZLUK ANALİZİ (Tanım, Kategori, Risk Derecesi, Yasal Dayanak, İlgili Paydaşlar)
2. ACİL AKSİYON PLANI (0–24 Saat)
3. DÜZELTİCİ FAALİYETLER (Kök Neden Temelli)
4. ÖNLEYİCİ İYİLEŞTİRMELER (Tekrar Önleme)
5. PERFORMANS İZLEME (KPI & Göstergeler)
6. ETKİNLİK VE GÖZDEN GEÇİRME
7. KURUMSAL YÖNETİM PERSPEKTİFİ";
    }

    private string BuildContextualInfo(ISGAnalysisRequest request)
    {
        var context = "📋 KURUMSAL BAĞLAM BİLGİLERİ:\n";
        
        if (!string.IsNullOrEmpty(request.SirketAdi))
            context += $"• Şirket: {request.SirketAdi}\n";
        
        if (!string.IsNullOrEmpty(request.SektorBilgisi))
            context += $"• Sektör: {request.SektorBilgisi}\n";
        
        if (!string.IsNullOrEmpty(request.CalisanSayisi))
            context += $"• Çalışan Sayısı: {request.CalisanSayisi}\n";
        
        if (!string.IsNullOrEmpty(request.Departman))
            context += $"• Departman: {request.Departman}\n";
        
        if (!string.IsNullOrEmpty(request.Lokasyon))
            context += $"• Lokasyon: {request.Lokasyon}\n";
        
        context += $"• ISO 45001 Sertifikası: {(request.ISO45001Sertifikasi ? "Mevcut" : "Mevcut Değil")}\n";
        
        if (request.EkBilgiler?.Any() == true)
        {
            context += "• Ek Bilgiler:\n";
            foreach (var bilgi in request.EkBilgiler)
            {
                context += $"  - {bilgi}\n";
            }
        }
        
        return context;
    }

    private string BuildAnalysisRequest(ISGAnalysisRequest request)
    {
        return $@"🚨 ANALİZ TALEBİ:
Belirtilen uygunsuzluğu ISO 45001 ve Türk İSG mevzuatına uyumlu kurumsal formatta analiz et ve çözüm önerisi sun:

UYGUNSUZLUK: {request.Uygunsuzluk}

Bu uygunsuzluk için kapsamlı bir kurumsal İSG analizi yap ve yukarıdaki JSON formatında yanıt ver.";
    }

    public string GenerateSimpleISGPrompt(string uygunsuzluk)
    {
        return $@"Sen Türkiye’de faaliyet gösteren deneyimli bir İş Sağlığı ve Güvenliği uzmanısın.
Aşağıdaki şablonu kullanarak verilen uygunsuzluk bilgisini profesyonel bir İSG raporuna dönüştür.
Cevabı her zaman aynı şablon yapısıyla ver:

- Uygunsuzluğun Tanımı:
- Uygunsuzluğun Kök Nedeni: insan, Malzeme, Makine, Metot, Doğa (Yağmur, toprak kayması, dolu, rüzgar, deprem, sel vs) Açıklama:
- Uygunsuzluğun Giderilmesi için Planlanan Düzeltici Faaliyetler ve Düzeltmeler:
- Uygunsuzluğun tekrarını önlemek için yapılacak iyileştirmeler:
- Düzeltme talep eden tarafından doldurulur: Takip gerekli değil / Takip gerekli Açıklama:

Uygunsuzluk bilgisi: “{uygunsuzluk}”";
    }
}