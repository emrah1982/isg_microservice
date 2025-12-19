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

Kurumsal Yönetim Perspektifi
Entegre Sistemler: [Hangi yönetim sistemleriyle entegre edileceğini paragraf şeklinde açıkla]
İSG Kurulu Önerisi: [İSG kurulu için önerileri paragraf şeklinde açıkla]
Dijitalleşme Önerileri: [Dijital çözüm önerilerini paragraf şeklinde açıkla]
ESG Entegrasyon: [ESG entegrasyon önerilerini paragraf şeklinde açıkla]
Özet (Soru / Cevap)
[En az 5 adet Soru-Cevap çifti üret. Her soru kısa ve net olsun; cevap öz ve uygulanabilir olsun. Örn: \nSoru: ...\nCevap: ...]
Düzeltme talep eden tarafından doldurulur: Takip gerekli değil / Takip gerekli Açıklama:
[Takip gerekliliğini açıkça belirt ve kısa bir açıklama yaz.]
--- RAPOR SONU ---
";
    }

    private string GetBaseISGPrompt()
    {
        return @"Is Sagligi ve Guvenligi (ISG) Uzman Asistani - Kurumsal Versiyon
Sen Turkiye'de faaliyet gosteren kurumsal duzeyde deneyimli bir Is Sagligi ve Guvenligi uzmansin.
Tum yanitlarini yasal mevzuat, ISO 45001:2018 gereklilikleri ve kurumsal ISG yonetim sistemleri ile uyumlu olacak sekilde ver.

YETKI ALANLARIN:
- Mevzuat Uyumlulugu: 6331 sayili Is Sagligi ve Guvenligi Kanunu, Ilgili yonetmelik, teblig, genelge, Is Mufettisi denetim kriterleri
- ISO 45001:2018 Uyum: Liderlik ve calisan katilimi (madde 5), Risk ve firsat yonetimi (madde 6), Destekleyici surecler (madde 7), Operasyonel kontrol (madde 8), Performans degerlendirme (madde 9), Surekli iyilestirme (madde 10)
- Uluslararasi Standartlar ve Trendler: ILO sozlesmeleri, ESG raporlama kriterleri, Dijital ISG cozumleri (IoT, yapay zeka, big data)

UYGUNSUZLUK YONETIMI RAPORU formatinda analiz yap:
1. UYGUNSUZLUK ANALIZI (Tanim, Kategori, Risk Derecesi, Yasal Dayanak, Ilgili Paydaslar)
2. ACIL AKSIYON PLANI (0-24 Saat)
3. DUZELTICI FAALIYETLER (Kok Neden Temelli)
4. ONLEYICI IYILESTIRMELER (Tekrar Onleme)
5. PERFORMANS IZLEME (KPI ve Gostergeler)
6. ETKINLIK VE GOZDEN GECIRME
7. KURUMSAL YONETIM PERSPEKTIFI";
    }

    private string BuildContextualInfo(ISGAnalysisRequest request)
    {
        var context = "KURUMSAL BAGLAM BILGILERI:\n";
        
        if (!string.IsNullOrEmpty(request.SirketAdi))
            context += $"- Sirket: {request.SirketAdi}\n";
        
        if (!string.IsNullOrEmpty(request.SektorBilgisi))
            context += $"- Sektor: {request.SektorBilgisi}\n";
        
        if (!string.IsNullOrEmpty(request.CalisanSayisi))
            context += $"- Calisan Sayisi: {request.CalisanSayisi}\n";
        
        if (!string.IsNullOrEmpty(request.Departman))
            context += $"- Departman: {request.Departman}\n";
        
        if (!string.IsNullOrEmpty(request.Lokasyon))
            context += $"- Lokasyon: {request.Lokasyon}\n";
        
        context += $"- ISO 45001 Sertifikasi: {(request.ISO45001Sertifikasi ? "Mevcut" : "Mevcut Degil")}\n";
        
        if (request.EkBilgiler?.Any() == true)
        {
            context += "- Ek Bilgiler:\n";
            foreach (var bilgi in request.EkBilgiler)
            {
                context += $"  - {bilgi}\n";
            }
        }
        
        return context;
    }

    private string BuildAnalysisRequest(ISGAnalysisRequest request)
    {
        return $@"ANALIZ TALEBI:
Belirtilen uygunsuzlugu ISO 45001 ve Turk ISG mevzuatina uyumlu kurumsal formatta analiz et ve cozum onerisi sun:

UYGUNSUZLUK: {request.Uygunsuzluk}

Bu uygunsuzluk icin kapsamli bir kurumsal ISG analizi yap ve yukaridaki JSON formatinda yanit ver.";
    }

    public string GenerateSimpleISGPrompt(string uygunsuzluk)
    {
        return $@"Sen Turkiye'de faaliyet gosteren deneyimli bir Is Sagligi ve Guvenligi uzmansin.
Asagidaki sablonu kullanarak verilen uygunsuzluk bilgisini profesyonel bir ISG raporuna donustur.
Cevabi her zaman ayni sablon yapisiyla ver:

- Uygunsuzlugun Tanimi:
- Uygunsuzlugun Kok Nedeni: insan, Malzeme, Makine, Metot, Doga (Yagmur, toprak kaymasi, dolu, ruzgar, deprem, sel vs) Aciklama:
- Uygunsuzlugun Giderilmesi icin Planlanan Duzeltici Faaliyetler ve Duzeltmeler:
- Uygunsuzlugun tekrarini onlemek icin yapilacak iyilestirmeler:
- Duzeltme talep eden tarafindan doldurulur: Takip gerekli degil / Takip gerekli Aciklama:

Uygunsuzluk bilgisi: ""{uygunsuzluk}""";
    }
}