using Microsoft.AspNetCore.Mvc;
using ISGExpertService.Models;
using ISGExpertService.Services;

namespace ISGExpertService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ISGExpertController : ControllerBase
{
    private readonly ChatGPTService _chatGPTService;
    private readonly ISGPromptService _promptService;
    private readonly ILogger<ISGExpertController> _logger;

    public ISGExpertController(
        ChatGPTService chatGPTService, 
        ISGPromptService promptService,
        ILogger<ISGExpertController> logger)
    {
        _chatGPTService = chatGPTService;
        _promptService = promptService;
        _logger = logger;
    }

    /// <summary>
    /// Kurumsal İSG analizi yapar - Tam kapsamlı rapor
    /// </summary>
    [HttpPost("analyze")]
    public async Task<ActionResult<ISGAnalysisResponse>> AnalyzeISGCompliance([FromBody] ISGAnalysisRequest request)
    {
        try
        {
            _logger.LogInformation("Starting ISG analysis for: {Uygunsuzluk}", request.Uygunsuzluk);

            if (string.IsNullOrWhiteSpace(request.Uygunsuzluk))
            {
                return BadRequest(new { message = "Uygunsuzluk tanımı gereklidir" });
            }

            var response = await _chatGPTService.GetStructuredISGAnalysisAsync(request, _promptService);
            
            // Debug: Önleyici iyileştirmeler verisini logla
            _logger.LogInformation("Önleyici İyileştirmeler Debug - Sistem: {Sistem}, Politika: {Politika}", 
                response.OnleyiciIyilestirmeler?.SistemIyilestirmeleri?.Count ?? 0,
                response.OnleyiciIyilestirmeler?.PolitikaProsedurDegisiklikleri?.Count ?? 0);
            
            _logger.LogInformation("ISG analysis completed successfully for ID: {Id}", response.Id);
            
            return Ok(response);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("ChatGPT API anahtarı"))
        {
            _logger.LogWarning("ChatGPT API key not configured for detailed analysis");
            return BadRequest(new { 
                message = "ChatGPT API anahtarı tanımlanmamış", 
                error = "Lütfen sistem yöneticisine başvurun veya CHATGPT_API_KEY environment variable'ını ayarlayın." 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during ISG analysis");
            return StatusCode(500, new { 
                message = "İSG analizi sırasında hata oluştu", 
                error = ex.Message 
            });
        }
    }

    /// <summary>
    /// Basit İSG analizi yapar - Hızlı değerlendirme
    /// </summary>
    [HttpPost("quick-analyze")]
    public async Task<ActionResult<object>> QuickAnalyze([FromBody] QuickAnalysisRequest request)
    {
        try
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Uygunsuzluk))
            {
                return BadRequest(new { message = "Uygunsuzluk tanımı gereklidir" });
            }

            _logger.LogInformation("Starting quick ISG analysis for: {Uygunsuzluk}", request.Uygunsuzluk);

            var response = await _chatGPTService.GetSimpleISGAnalysisAsync(request.Uygunsuzluk);
            
            return Ok(new { 
                id = Guid.NewGuid().ToString(),
                uygunsuzluk = request.Uygunsuzluk,
                analiz = response,
                olusturmaTarihi = DateTime.UtcNow,
                tip = "Hızlı Analiz"
            });
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("ChatGPT API anahtarı"))
        {
            _logger.LogWarning("ChatGPT API key not configured");
            return BadRequest(new { 
                message = "ChatGPT API anahtarı tanımlanmamış", 
                error = "Lütfen sistem yöneticisine başvurun veya CHATGPT_API_KEY environment variable'ını ayarlayın." 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during quick ISG analysis");
            return StatusCode(500, new { 
                message = "Hızlı İSG analizi sırasında hata oluştu", 
                error = ex.Message 
            });
        }
    }

    /// <summary>
    /// İSG mevzuat bilgisi sorgular
    /// </summary>
    [HttpGet("mevzuat")]
    public async Task<ActionResult<object>> GetMevzuatInfo([FromQuery] string konu)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(konu))
            {
                return BadRequest(new { message = "Konu belirtilmelidir" });
            }

            var prompt = $@"Sen bir İSG mevzuat uzmanısın. Aşağıdaki konu hakkında Türkiye İSG mevzuatı bilgisi ver:

KONU: {konu}

Lütfen şunları içeren bir yanıt ver:
1. İlgili yasal düzenlemeler (6331 sayılı kanun, yönetmelikler)
2. Temel yükümlülükler
3. Yaptırımlar
4. Pratik uygulama önerileri

Yanıtını Türkçe, kısa ve öz bir şekilde ver.";

            var response = await _chatGPTService.GetISGAnalysisAsync(prompt, "gpt-3.5-turbo");
            
            return Ok(new { 
                konu = konu,
                mevzuatBilgisi = response,
                tarih = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting mevzuat info");
            return StatusCode(500, new { 
                message = "Mevzuat bilgisi alınırken hata oluştu", 
                error = ex.Message 
            });
        }
    }

    /// <summary>
    /// ISO 45001 madde bilgisi sorgular
    /// </summary>
    [HttpGet("iso45001")]
    public async Task<ActionResult<object>> GetISO45001Info([FromQuery] string madde)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(madde))
            {
                return BadRequest(new { message = "Madde numarası belirtilmelidir" });
            }

            var prompt = $@"Sen bir ISO 45001:2018 uzmanısın. Aşağıdaki madde hakkında detaylı bilgi ver:

ISO 45001:2018 MADDE: {madde}

Lütfen şunları içeren bir yanıt ver:
1. Maddenin kapsamı ve amacı
2. Temel gereksinimler
3. Uygulama örnekleri
4. Kurumsal entegrasyon önerileri
5. Denetim kontrol noktaları

Yanıtını Türkçe ve profesyonel bir dilde ver.";

            var response = await _chatGPTService.GetISGAnalysisAsync(prompt, "gpt-4");
            
            return Ok(new { 
                madde = madde,
                iso45001Bilgisi = response,
                tarih = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting ISO 45001 info");
            return StatusCode(500, new { 
                message = "ISO 45001 bilgisi alınırken hata oluştu", 
                error = ex.Message 
            });
        }
    }

    /// <summary>
    /// Risk değerlendirmesi yapar
    /// </summary>
    [HttpPost("risk-assessment")]
    public async Task<ActionResult<object>> AssessRisk([FromBody] object request)
    {
        try
        {
            var riskTanimi = "";
            var faaliyet = "";
            var lokasyon = "";
            
            // Request'i parse et
            if (request is Newtonsoft.Json.Linq.JObject jObject)
            {
                riskTanimi = jObject["riskTanimi"]?.ToString() ?? "";
                faaliyet = jObject["faaliyet"]?.ToString() ?? "";
                lokasyon = jObject["lokasyon"]?.ToString() ?? "";
            }

            if (string.IsNullOrWhiteSpace(riskTanimi))
            {
                return BadRequest(new { message = "Risk tanımı gereklidir" });
            }

            var prompt = $@"Sen bir İSG risk değerlendirme uzmanısın. Aşağıdaki risk için değerlendirme yap:

RİSK TANIMI: {riskTanimi}
FAALİYET: {faaliyet}
LOKASYON: {lokasyon}

5x5 Risk Matrisi kullanarak değerlendirme yap:
1. Olasılık (1-5): Çok Düşük, Düşük, Orta, Yüksek, Çok Yüksek
2. Şiddet (1-5): Çok Düşük, Düşük, Orta, Yüksek, Çok Yüksek
3. Risk Skoru = Olasılık × Şiddet
4. Risk Seviyesi: 1-4 Kabul Edilebilir, 5-9 Düşük, 10-15 Orta, 16-20 Yüksek, 21-25 Kabul Edilemez

Ayrıca şunları da ver:
- Mevcut kontrol tedbirleri
- Ek kontrol tedbirleri önerileri
- Yasal yükümlülükler
- İzleme ve gözden geçirme önerileri

Yanıtını JSON formatında ver.";

            var response = await _chatGPTService.GetISGAnalysisAsync(prompt, "gpt-4");
            
            return Ok(new { 
                riskTanimi = riskTanimi,
                faaliyet = faaliyet,
                lokasyon = lokasyon,
                riskDegerlendirmesi = response,
                tarih = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during risk assessment");
            return StatusCode(500, new { 
                message = "Risk değerlendirmesi sırasında hata oluştu", 
                error = ex.Message 
            });
        }
    }

    /// <summary>
    /// Servis durumu kontrolü
    /// </summary>
    [HttpGet("health")]
    public ActionResult<object> Health()
    {
        return Ok(new { 
            status = "healthy", 
            service = "ISG Expert Service",
            version = "1.0.0",
            timestamp = DateTime.UtcNow,
            features = new[]
            {
                "Kurumsal İSG Analizi",
                "Hızlı İSG Değerlendirmesi", 
                "Mevzuat Sorguları",
                "ISO 45001 Bilgileri",
                "Risk Değerlendirmesi"
            }
        });
    }
}
