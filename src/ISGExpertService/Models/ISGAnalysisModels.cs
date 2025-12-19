using Newtonsoft.Json;

namespace ISGExpertService.Models;

/// <summary>
/// Hızlı analiz için basit request modeli
/// </summary>
public class QuickAnalysisRequest
{
    public string Uygunsuzluk { get; set; } = string.Empty;
}

public class OzetSoruCevap
{
    public List<SoruCevap> Kalemler { get; set; } = new();
}

public class SoruCevap
{
    public string Soru { get; set; } = string.Empty;
    public string Cevap { get; set; } = string.Empty;
}

public class ISGAnalysisRequest
{
    public string Uygunsuzluk { get; set; } = string.Empty;
    public string? Lokasyon { get; set; }
    public string? Departman { get; set; }
    public string? SirketAdi { get; set; }
    public string? CalisanSayisi { get; set; }
    public bool ISO45001Sertifikasi { get; set; } = false;
    public List<string>? EkBilgiler { get; set; }
}

public class ISGAnalysisResponse
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public DateTime OlusturmaTarihi { get; set; } = DateTime.UtcNow;
    public UygunsuzlukAnalizi UygunsuzlukAnalizi { get; set; } = new();
    public AcilAksiyonPlani AcilAksiyonPlani { get; set; } = new();
    public KokNedenAnalizi KokNedenAnalizi { get; set; } = new();
    public DuzelticiVeDuzeltmeFaaliyetleri DuzelticiVeDuzeltmeFaaliyetleri { get; set; } = new();
    public UygunsuzlugunTekrariniOnlemekIcinIyilestirmeler UygunsuzlugunTekrariniOnlemekIcinIyilestirmeler { get; set; } = new();
    public PerformansIzleme PerformansIzleme { get; set; } = new();
    public EtkinlikGozdenGecirme EtkinlikGozdenGecirme { get; set; } = new();
    public KurumsalYonetim KurumsalYonetim { get; set; } = new();
    public string TamRapor { get; set; } = string.Empty;
    public DuzeltmeTalepFormu DuzeltmeTalepFormu { get; set; } = new();
    public OzetSoruCevap OzetSoruCevap { get; set; } = new();
}

public class UygunsuzlukAnalizi
{
    public string Tanim { get; set; } = string.Empty;
    public string Kategori { get; set; } = string.Empty;
    public string RiskDerecesi { get; set; } = string.Empty;
    public int RiskSkoru { get; set; }
    public string YasalDayanak { get; set; } = string.Empty;
    public string ISO45001Maddesi { get; set; } = string.Empty;
    public string IzlemePlani { get; set; } = string.Empty;
    public string GozdenGecirmePlani { get; set; } = string.Empty;
    public DateTime? IlkGozdenGecirmeTarihi { get; set; }
}

public class KurumsalYonetim
{
    public List<string> EntegreSistemler { get; set; } = new();
    public string ISGKuruluOnerisi { get; set; } = string.Empty;
    public List<string> DigitallesmeOnerileri { get; set; } = new();
    public string ESGEntegrasyon { get; set; } = string.Empty;
}

public class DuzeltmeTalepFormu
{
    // "Düzeltme talep eden tarafından doldurulur: Takip gerekli değil / Takip gerekli Açıklama:"
    public bool TakipGerekli { get; set; } = false;
    public string TakipAciklama { get; set; } = string.Empty;
    public string Aciklama { get; set; } = string.Empty;
    public string TalepEden { get; set; } = string.Empty;
}

public class ChatGPTRequest
{
    [JsonProperty("model")]
    public string Model { get; set; } = "gpt-4";

    [JsonProperty("messages")]
    public List<ChatMessage> Messages { get; set; } = new();

    [JsonProperty("temperature")]
    public double Temperature { get; set; } = 0.7;

    [JsonProperty("max_tokens")]
    public int MaxTokens { get; set; } = 4000;
}

public class ChatMessage
{
    [JsonProperty("role")]
    public string Role { get; set; } = string.Empty;

    [JsonProperty("content")]
    public string Content { get; set; } = string.Empty;
}

public class ChatGPTResponse
{
    public List<Choice> Choices { get; set; } = new();
    public Usage Usage { get; set; } = new();
}

public class Choice
{
    public ChatMessage Message { get; set; } = new();
    public string FinishReason { get; set; } = string.Empty;
}

public class Usage
{
    public int PromptTokens { get; set; }
    public int CompletionTokens { get; set; }
    public int TotalTokens { get; set; }
}

public class KokNedenAnalizi
{
    public List<string> Insan { get; set; } = new();
    public List<string> Malzeme { get; set; } = new();
    public List<string> Makine { get; set; } = new();
    public List<string> Metot { get; set; } = new();
    public List<string> Doga { get; set; } = new();
}

public class AcilAksiyonPlani
{
    public string IlkMudahale { get; set; } = string.Empty;
    public string GeciciGuvenlikTedbirleri { get; set; } = string.Empty;
    public string AtananSorumlu { get; set; } = string.Empty;
    public DateTime? TamamlanmaZamani { get; set; }
}

public class DuzelticiVeDuzeltmeFaaliyetleri
{
    public List<string> Faaliyetler { get; set; } = new();
    public List<DuzelticiAksiyon> DuzelticiAksiyonlar { get; set; } = new();
}

public class DuzelticiAksiyon
{
    public string Aciklama { get; set; } = string.Empty;
    public string SorumluDepartman { get; set; } = string.Empty;
    public string HedefTarih { get; set; } = string.Empty;
}

public class UygunsuzlugunTekrariniOnlemekIcinIyilestirmeler
{
    public string Aciklama { get; set; } = string.Empty;
    public List<SistemselIyilestirme> SistemselIyilestirmeler { get; set; } = new();
    public List<ProsedurGuncelleme> ProsedurGuncellemeleri { get; set; } = new();
    public List<EgitimProgrami> EgitimProgramlari { get; set; } = new();
}

public class ProsedurGuncelleme
{
    public string Baslik { get; set; } = string.Empty;
    public string Aciklama { get; set; } = string.Empty;
}

public class EgitimProgrami
{
    public string Baslik { get; set; } = string.Empty;
    public string Aciklama { get; set; } = string.Empty;
}

public class SistemselIyilestirme
{
    public string Baslik { get; set; } = string.Empty;
    public string Detay { get; set; } = string.Empty;
    public string Alan { get; set; } = string.Empty;
    public string Aciklama { get; set; } = string.Empty;
    public string BeklenenFayda { get; set; } = string.Empty;
    public string Uygulama { get; set; } = string.Empty;
}

public class PerformansIzleme
{
    public List<string> OncuGostergeler { get; set; } = new();
    public List<string> GecikmeliGostergeler { get; set; } = new();
    public string BasariKriterleri { get; set; } = string.Empty;
    public string IzlemePlani { get; set; } = string.Empty;
    public string GozdenGecirmePeriyodu { get; set; } = string.Empty;
    public DateTime? IlkGozdenGecirmeTarihi { get; set; }
}

public class EtkinlikGozdenGecirme
{
    public string Aciklama { get; set; } = string.Empty;
}
