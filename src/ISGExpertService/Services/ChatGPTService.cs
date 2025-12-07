using ISGExpertService.Models;
using Newtonsoft.Json;
using System.Text;

namespace ISGExpertService.Services;

public class ChatGPTService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ChatGPTService> _logger;
    private readonly string _apiKey;
    private readonly string _baseUrl;

    public ChatGPTService(HttpClient httpClient, IConfiguration configuration, ILogger<ChatGPTService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
        
        // Öncelik her zaman environment variable'da
        var envKey = Environment.GetEnvironmentVariable("CHATGPT_API_KEY");
        if (!string.IsNullOrEmpty(envKey))
        {
            _apiKey = envKey;
        }
        else
        {
            // Environment variable yoksa diğer konfigürasyonlara bak
            _apiKey = _configuration["ChatGPT:ApiKey"] ?? string.Empty;
        }

        var configKey = _configuration["ChatGPT:ApiKey"]; // Sadece loglama için
        
        _logger.LogInformation("ChatGPT API Key - Config: {HasConfig}, Env: {HasEnv}, Final: {HasFinal}, Length: {Length}", 
            !string.IsNullOrEmpty(configKey), 
            !string.IsNullOrEmpty(envKey), 
            !string.IsNullOrEmpty(_apiKey),
            _apiKey?.Length ?? 0);
        
        _baseUrl = _configuration["ChatGPT:BaseUrl"] ?? "https://api.openai.com/v1/chat/completions";
        
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "ISG-Expert-Service/1.0");
    }

    public async Task<string> GetISGAnalysisAsync(string prompt, string model = "gpt-4")
    {
        if (string.IsNullOrEmpty(_apiKey))
        {
            throw new InvalidOperationException("ChatGPT API anahtarı tanımlanmamış. Lütfen CHATGPT_API_KEY environment variable'ını ayarlayın.");
        }

        try
        {
            _logger.LogInformation("Sending request to ChatGPT API with model: {Model}", model);
            
            var request = new ChatGPTRequest
            {
                Model = model,
                Messages = new List<ChatMessage>
                {
                    new ChatMessage 
                    { 
                        Role = "system",
Content = @"Sen profesyonel bir İş Sağlığı ve Güvenliği uzmanısın. 
Türkiye'deki İSG mevzuatı, 6331 sayılı Kanun ve ISO 45001 standardına tamamen hakim bir uzmansın. 
Aşağıdaki biçimde Türkçe bir uygunsuzluk analizi raporu oluştur:
---
**Uygunsuzluğun Tanımı:** [Kısa ama net açıklama]
**Uygunsuzluğun Kök Nedeni:** [Kategori: insan, malzeme, makine, metot, doğa. Açıklama ile birlikte]
**Uygunsuzluğun Giderilmesi için Planlanan Düzeltici Faaliyetler ve Düzeltmeler:** [En az 3 madde]
**Uygunsuzluğun Tekrarını Önlemek İçin Planlanan İyileştirmeler:** [En az 4-5 madde, sistemsel ve kalıcı çözümler]
---
Yanıt biçimini bu formatta ve mevzuata uygun şekilde hazırla ve mevzuata uygun öneriler sun."
						
                    },
                    new ChatMessage 
                    { 
                        Role = "user", 
                        Content = prompt 
                    }
                },
                Temperature = 0.7,
                MaxTokens = 4000
            };

            var json = JsonConvert.SerializeObject(request, new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore
            });

            var content = new StringContent(json, Encoding.UTF8, "application/json");
            
            _logger.LogDebug("Request payload: {Json}", json);

            var response = await _httpClient.PostAsync(_baseUrl, content);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("ChatGPT API error: {StatusCode} - {Content}", response.StatusCode, errorContent);
                throw new HttpRequestException($"ChatGPT API error: {response.StatusCode} - {errorContent}");
            }

            var responseJson = await response.Content.ReadAsStringAsync();
            _logger.LogDebug("Response payload: {Json}", responseJson);

            var chatResponse = JsonConvert.DeserializeObject<ChatGPTResponse>(responseJson);
            
            if (chatResponse?.Choices?.Any() != true)
            {
                _logger.LogWarning("No choices returned from ChatGPT API");
                throw new InvalidOperationException("No response received from ChatGPT API");
            }

            var result = chatResponse.Choices[0].Message.Content;
            
            _logger.LogInformation("ChatGPT API call successful. Tokens used: {TotalTokens}", 
                chatResponse.Usage?.TotalTokens ?? 0);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling ChatGPT API");
            throw;
        }
    }

    public async Task<string> GetSimpleISGAnalysisAsync(string uygunsuzluk)
    {
        // ISGPromptService'den güncellenmiş prompt'u kullan
        var promptService = new ISGPromptService();
        var prompt = promptService.GenerateSimpleISGPrompt(uygunsuzluk);

        return await GetISGAnalysisAsync(prompt, "Content");
    }

    public async Task<ISGAnalysisResponse> GetStructuredISGAnalysisAsync(ISGAnalysisRequest request, ISGPromptService promptService)
    {
        try
        {
            var prompt = promptService.GenerateISGAnalysisPrompt(request);
            _logger.LogInformation("Generated Prompt: {Prompt}", prompt.Substring(0, Math.Min(500, prompt.Length)) + "...");
            
            var response = await GetISGAnalysisAsync(prompt, "gpt-4o");
            
            _logger.LogInformation("Raw ChatGPT Response: {Response}", response);
            
            // Düz metin response'u parse et
            var analysisResponse = ParseTextISGAnalysisResponse(response, request);
            analysisResponse.TamRapor = response;
            
            return analysisResponse;
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Failed to parse structured response, falling back to simple analysis");
            
            // JSON parse edilemezse, basit analiz yap
            var simpleResponse = await GetSimpleISGAnalysisAsync(request.Uygunsuzluk);
            
            return new ISGAnalysisResponse
            {
                UygunsuzlukAnalizi = new UygunsuzlukAnalizi
                {
                    Tanim = request.Uygunsuzluk,
                    Kategori = "Genel",
                    RiskDerecesi = "Orta",
                    RiskSkoru = 10
                },
                KokNedenAnalizi = new KokNedenAnalizi(),
                DuzelticiVeDuzeltmeFaaliyetleri = new DuzelticiVeDuzeltmeFaaliyetleri(),
                UygunsuzlugunTekrariniOnlemekIcinIyilestirmeler = new UygunsuzlugunTekrariniOnlemekIcinIyilestirmeler(),
                TamRapor = simpleResponse
            };
        }
    }

    private ISGAnalysisResponse ParseISGAnalysisResponse(string jsonResponse, ISGAnalysisRequest request)
    {
        try
        {
            // JSON'dan gereksiz karakterleri temizle
            var cleanJson = ExtractJsonFromResponse(jsonResponse);
            
            var settings = new JsonSerializerSettings
            {
                DateFormatString = "yyyy-MM-dd",
                NullValueHandling = NullValueHandling.Ignore,
                MissingMemberHandling = MissingMemberHandling.Ignore
            };

            var parsedResponse = JsonConvert.DeserializeObject<dynamic>(cleanJson);
            
            _logger.LogInformation("Parsed Response Keys: {Keys}", 
                string.Join(", ", ((Newtonsoft.Json.Linq.JObject)parsedResponse).Properties().Select(p => p.Name)));
            
            var response = new ISGAnalysisResponse();
            
            // UygunsuzlukAnalizi
            if (parsedResponse?.uygunsuzlukAnalizi != null)
            {
                response.UygunsuzlukAnalizi = JsonConvert.DeserializeObject<UygunsuzlukAnalizi>(
                    parsedResponse.uygunsuzlukAnalizi.ToString(), settings) ?? new UygunsuzlukAnalizi();
            }
            
            // AcilAksiyonPlani
            if (parsedResponse?.acilAksiyonPlani != null)
            {
                response.AcilAksiyonPlani = JsonConvert.DeserializeObject<AcilAksiyonPlani>(
                    parsedResponse.acilAksiyonPlani.ToString(), settings) ?? new AcilAksiyonPlani();
            }
            
            // KokNedenAnalizi
            if (parsedResponse?.kokNedenAnalizi != null)
            {
                response.KokNedenAnalizi = JsonConvert.DeserializeObject<KokNedenAnalizi>(
                    parsedResponse.kokNedenAnalizi.ToString(), settings) ?? new KokNedenAnalizi();
            }
            
            // Eski format desteği - duzelticiFaaliyetler içinden kokNedenAnalizi'ni al
            if (parsedResponse?.duzelticiFaaliyetler?.kokNedenAnalizi != null)
            {
                response.KokNedenAnalizi = JsonConvert.DeserializeObject<KokNedenAnalizi>(
                    parsedResponse.duzelticiFaaliyetler.kokNedenAnalizi.ToString(), settings) ?? new KokNedenAnalizi();
            }
            
            // Eski format desteği - duzelticiFaaliyetler'den aksiyonları al
            if (parsedResponse?.duzelticiFaaliyetler != null)
            {
                var duzeltici = new DuzelticiVeDuzeltmeFaaliyetleri();
                
                if (parsedResponse.duzelticiFaaliyetler.aksiyonlar != null)
                {
                    foreach (var aksiyon in parsedResponse.duzelticiFaaliyetler.aksiyonlar)
                    {
                        duzeltici.DuzelticiAksiyonlar.Add(new DuzelticiAksiyon
                        {
                            Aciklama = aksiyon.aciklama?.ToString() ?? "",
                            SorumluDepartman = aksiyon.sorumluDepartman?.ToString() ?? "",
                            HedefTarih = aksiyon.hedefTarih?.ToString() ?? "",
                            TakipMekanizmasi = aksiyon.takipMekanizmasi?.ToString() ?? "",
                            Kaynak = aksiyon.kaynak?.ToString() ?? ""
                        });
                    }
                }
                
                response.DuzelticiVeDuzeltmeFaaliyetleri = duzeltici;
            }
            
            // UygunsuzlugunTekrariniOnlemekIcinIyilestirmeler
            if (parsedResponse?.uygunsuzlugunTekrariniOnlemekIcinIyilestirmeler != null)
            {
                response.UygunsuzlugunTekrariniOnlemekIcinIyilestirmeler = JsonConvert.DeserializeObject<UygunsuzlugunTekrariniOnlemekIcinIyilestirmeler>(
                    parsedResponse.uygunsuzlugunTekrariniOnlemekIcinIyilestirmeler.ToString(), settings) ?? new UygunsuzlugunTekrariniOnlemekIcinIyilestirmeler();
                
                _logger.LogInformation("Parsed UygunsuzlugunTekrariniOnlemekIcinIyilestirmeler - Sistemsel: {Sistemsel}, Prosedur: {Prosedur}", 
                    response.UygunsuzlugunTekrariniOnlemekIcinIyilestirmeler.SistemselIyilestirmeler?.Count ?? 0,
                    response.UygunsuzlugunTekrariniOnlemekIcinIyilestirmeler.ProsedurGuncellemeleri?.Count ?? 0);
            }
            // Eski format desteği - onleyiciIyilestirmeler'i yeni formata çevir
            else if (parsedResponse?.onleyiciIyilestirmeler != null)
            {
                _logger.LogInformation("Converting old format onleyiciIyilestirmeler to new format");
                
                var iyilestirmeler = new UygunsuzlugunTekrariniOnlemekIcinIyilestirmeler();
                
                // Eski format verilerini yeni formata çevir
                if (parsedResponse.onleyiciIyilestirmeler.sistemIyilestirmeleri != null)
                {
                    foreach (var sistem in parsedResponse.onleyiciIyilestirmeler.sistemIyilestirmeleri)
                    {
                        iyilestirmeler.SistemselIyilestirmeler.Add(new SistemselIyilestirme
                        {
                            Alan = "Sistem İyileştirmesi",
                            Aciklama = sistem.ToString(),
                            BeklenenFayda = "İyileştirilmiş sistem performansı",
                            Uygulama = "Planlanan iyileştirme"
                        });
                    }
                }
                
                if (parsedResponse.onleyiciIyilestirmeler.politikaProsedurDegisiklikleri != null)
                {
                    foreach (var politika in parsedResponse.onleyiciIyilestirmeler.politikaProsedurDegisiklikleri)
                    {
                        iyilestirmeler.ProsedurGuncellemeleri.Add(new ProsedurGuncelleme
                        {
                            Prosedur = "Politika/Prosedür",
                            Degisiklik = politika.ToString(),
                            OnayMekanizmasi = "Yönetim onayı"
                        });
                    }
                }
                
                if (parsedResponse.onleyiciIyilestirmeler.kurumsalEgitimProgramlari != null)
                {
                    foreach (var egitim in parsedResponse.onleyiciIyilestirmeler.kurumsalEgitimProgramlari)
                    {
                        iyilestirmeler.EgitimProgramlari.Add(new EgitimProgrami
                        {
                            EgitimKonusu = egitim.ToString(),
                            HedefKitle = "Tüm çalışanlar",
                            Periyot = "Yıllık",
                            Icerik = "Kapsamlı eğitim programı"
                        });
                    }
                }
                
                response.UygunsuzlugunTekrariniOnlemekIcinIyilestirmeler = iyilestirmeler;
                
                _logger.LogInformation("Converted old format - Sistemsel: {Sistemsel}, Prosedur: {Prosedur}, Egitim: {Egitim}", 
                    iyilestirmeler.SistemselIyilestirmeler?.Count ?? 0,
                    iyilestirmeler.ProsedurGuncellemeleri?.Count ?? 0,
                    iyilestirmeler.EgitimProgramlari?.Count ?? 0);
            }
            else
            {
                _logger.LogWarning("Neither new nor old format iyilestirmeler found in ChatGPT response");
            }
            
            // PerformansIzleme
            if (parsedResponse?.performansIzleme != null)
            {
                response.PerformansIzleme = JsonConvert.DeserializeObject<PerformansIzleme>(
                    parsedResponse.performansIzleme.ToString(), settings) ?? new PerformansIzleme();
            }
            
            // EtkinlikGozdenGecirme
            if (parsedResponse?.etkinlikGozdenGecirme != null)
            {
                response.EtkinlikGozdenGecirme = JsonConvert.DeserializeObject<EtkinlikGozdenGecirme>(
                    parsedResponse.etkinlikGozdenGecirme.ToString(), settings) ?? new EtkinlikGozdenGecirme();
            }
            
            // KurumsalYonetim
            if (parsedResponse?.kurumsalYonetim != null)
            {
                response.KurumsalYonetim = JsonConvert.DeserializeObject<KurumsalYonetim>(
                    parsedResponse.kurumsalYonetim.ToString(), settings) ?? new KurumsalYonetim();
            }
            
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error parsing ISG analysis response");
            throw new JsonException("Failed to parse ISG analysis response", ex);
        }
    }

    private ISGAnalysisResponse ParseTextISGAnalysisResponse(string textResponse, ISGAnalysisRequest request)
    {
        try
        {
            var response = new ISGAnalysisResponse();
            
            // Başlıkları bul ve içeriği parse et
            var sections = ParseTextSections(textResponse);
            
            // Uygunsuzluk Analizi
            if (sections.ContainsKey("Uygunsuzluğun Tanımı"))
            {
                response.UygunsuzlukAnalizi = new UygunsuzlukAnalizi
                {
                    Tanim = sections["Uygunsuzluğun Tanımı"],
                    Kategori = "Sistemsel",
                    RiskDerecesi = "Orta",
                    RiskSkoru = 10
                };
            }
            
            // Kök Neden Analizi
            response.KokNedenAnalizi = ParseKokNedenAnalizi(sections);
            
            // Düzeltici Faaliyetler
            response.DuzelticiVeDuzeltmeFaaliyetleri = ParseDuzelticiVeDuzeltmeFaaliyetleri(sections);
            
            // İyileştirmeler
            response.UygunsuzlugunTekrariniOnlemekIcinIyilestirmeler = ParseIyilestirmeler(sections);
            
            // Düzeltme Talep Formu
            response.DuzeltmeTalepFormu = ParseDuzeltmeTalepFormu(sections);

            // Özet (Soru/Cevap)
            response.OzetSoruCevap = ParseOzetSoruCevap(sections);
            
            _logger.LogInformation("Successfully parsed text response with {SectionCount} sections", sections.Count);
            
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error parsing text ISG analysis response");
            
            // Fallback: Basit response döndür
            return new ISGAnalysisResponse
            {
                UygunsuzlukAnalizi = new UygunsuzlukAnalizi
                {
                    Tanim = request.Uygunsuzluk,
                    Kategori = "Genel",
                    RiskDerecesi = "Orta",
                    RiskSkoru = 10
                },
                KokNedenAnalizi = new KokNedenAnalizi(),
                DuzelticiVeDuzeltmeFaaliyetleri = new DuzelticiVeDuzeltmeFaaliyetleri(),
                UygunsuzlugunTekrariniOnlemekIcinIyilestirmeler = new UygunsuzlugunTekrariniOnlemekIcinIyilestirmeler()
            };
        }
    }
    
    private Dictionary<string, string> ParseTextSections(string text)
    {
        var sections = new Dictionary<string, string>();
        var lines = text.Split('\n', StringSplitOptions.RemoveEmptyEntries);
        
        string currentSection = null;
        var currentContent = new List<string>();
        
        foreach (var line in lines)
        {
            var trimmedLine = line.Trim();
            
            // Başlık kontrolü
            if (IsHeaderLine(trimmedLine))
            {
                // Önceki bölümü kaydet
                if (currentSection != null && currentContent.Any())
                {
                    sections[currentSection] = string.Join("\n", currentContent).Trim();
                }
                
                // Başlığı normalize ederek kanonik isimle kaydet
                currentSection = NormalizeHeader(trimmedLine);
                currentContent.Clear();
            }
            else if (currentSection != null && !string.IsNullOrWhiteSpace(trimmedLine))
            {
                currentContent.Add(trimmedLine);
            }
        }
        
        // Son bölümü kaydet
        if (currentSection != null && currentContent.Any())
        {
            sections[currentSection] = string.Join("\n", currentContent).Trim();
        }
        
        return sections;
    }
    
    private bool IsHeaderLine(string line)
    {
        var normalized = NormalizeHeader(line);
        return KnownHeaders().Contains(normalized);
    }
    
    private KokNedenAnalizi ParseKokNedenAnalizi(Dictionary<string, string> sections)
    {
        var kokNeden = new KokNedenAnalizi();
        
        if (sections.ContainsKey("Uygunsuzluğun Kök Nedeni"))
        {
            var content = sections["Uygunsuzluğun Kök Nedeni"];
            var lines = content.Split('\n');
            
            foreach (var line in lines)
            {
                if (line.StartsWith("İnsan:"))
                    kokNeden.Insan.Add(line.Substring(6).Trim());
                else if (line.StartsWith("Malzeme:"))
                    kokNeden.Malzeme.Add(line.Substring(8).Trim());
                else if (line.StartsWith("Makine:"))
                    kokNeden.Makine.Add(line.Substring(7).Trim());
                else if (line.StartsWith("Metot:"))
                    kokNeden.Metot.Add(line.Substring(6).Trim());
                else if (line.StartsWith("Doğa:"))
                    kokNeden.Doga.Add(line.Substring(5).Trim());
            }
        }
        
        return kokNeden;
    }
    
    private DuzelticiVeDuzeltmeFaaliyetleri ParseDuzelticiVeDuzeltmeFaaliyetleri(Dictionary<string, string> sections)
    {
        var duzeltici = new DuzelticiVeDuzeltmeFaaliyetleri();
        
        if (sections.ContainsKey("Uygunsuzluğun Giderilmesi İçin Planlanan Düzeltici Faaliyetler ve Düzeltmeler"))
        {
            var content = sections["Uygunsuzluğun Giderilmesi İçin Planlanan Düzeltici Faaliyetler ve Düzeltmeler"];
            var lines = content.Split('\n', StringSplitOptions.RemoveEmptyEntries);
            
            foreach (var line in lines)
            {
                if (!string.IsNullOrWhiteSpace(line.Trim()))
                {
                    duzeltici.DuzelticiAksiyonlar.Add(new DuzelticiAksiyon
                    {
                        Aciklama = line.Trim(),
                        SorumluDepartman = "İSG Departmanı",
                        HedefTarih = DateTime.Now.AddDays(30).ToString("yyyy-MM-dd")
                    });
                }
            }
        }
        
        return duzeltici;
    }
    
    private UygunsuzlugunTekrariniOnlemekIcinIyilestirmeler ParseIyilestirmeler(Dictionary<string, string> sections)
    {
        var iyilestirmeler = new UygunsuzlugunTekrariniOnlemekIcinIyilestirmeler();
        
        if (sections.ContainsKey("Uygunsuzluğun Tekrarını Önlemek İçin Planlanan İyileştirmeler"))
        {
            var content = sections["Uygunsuzluğun Tekrarını Önlemek İçin Planlanan İyileştirmeler"];
            
            // Paragraf formatında geldiği için tek bir sistemsel iyileştirme olarak ekle
            iyilestirmeler.SistemselIyilestirmeler.Add(new SistemselIyilestirme
            {
                Alan = "Kapsamlı İyileştirme",
                Aciklama = content,
                BeklenenFayda = "Sistemsel iyileştirme ve risk azaltma",
                Uygulama = "Aşamalı uygulama"
            });
        }
        
        return iyilestirmeler;
    }

    // Başlıkları normalize edip kanonik anahtar döndürür
    private string NormalizeHeader(string header)
    {
        if (string.IsNullOrWhiteSpace(header)) return header;
        var h = header.Trim();
        // Sona konan ':' ve benzeri işaretleri at
        h = h.TrimEnd(':', ' ', '\t', '—', '-', '–');
        // Birden fazla boşluğu sadeleştir
        while (h.Contains("  ")) h = h.Replace("  ", " ");

        // Eşleştirme: küçük-büyük harf farkını kaldır
        var map = KnownHeaders().ToDictionary(x => x.ToLowerInvariant(), x => x);
        var lower = h.ToLowerInvariant();

        // Özel uzun başlık için toleranslı kontrol
        if (lower.Contains("uygunsuzluğun tanımı")) return "Uygunsuzluğun Tanımı";
        if (lower.Contains("uygunsuzluğun kök nedeni") || lower.Contains("uygunsuzluğun kok nedeni")) return "Uygunsuzluğun Kök Nedeni";
        if (lower.Contains("uygunsuzluğun giderilmesi") && lower.Contains("düzeltici faaliyetler"))
            return "Uygunsuzluğun Giderilmesi İçin Planlanan Düzeltici Faaliyetler ve Düzeltmeler";
        if (lower.Contains("uygunsuzluğun tekrarını önlemek") || lower.Contains("uygunsuzluğun tekrarini onlemek"))
            return "Uygunsuzluğun Tekrarını Önlemek İçin Planlanan İyileştirmeler";
        if (lower.StartsWith("düzeltme talep eden") || lower.StartsWith("duzeltme talep eden"))
            return "Düzeltme talep eden tarafından doldurulur: Takip gerekli değil / Takip gerekli Açıklama:";
        if (lower.StartsWith("özet (soru / cevap)") || lower.StartsWith("ozet (soru / cevap)")
            || lower.StartsWith("özet (soru-cevap)") || lower.StartsWith("ozet (soru-cevap)"))
            return "Özet (Soru / Cevap)";

        // Doğrudan tam eşleşme varsa
        if (map.TryGetValue(lower, out var canonical)) return canonical;
        return header.Trim();
    }

    private IEnumerable<string> KnownHeaders()
    {
        return new[]
        {
            "Uygunsuzluğun Tanımı",
            "Uygunsuzluğun Kök Nedeni",
            "Uygunsuzluğun Giderilmesi İçin Planlanan Düzeltici Faaliyetler ve Düzeltmeler",
            "Uygunsuzluğun Tekrarını Önlemek İçin Planlanan İyileştirmeler",
            "Düzeltme talep eden tarafından doldurulur: Takip gerekli değil / Takip gerekli Açıklama:",
            "Özet (Soru / Cevap)"
        };
    }

    private DuzeltmeTalepFormu ParseDuzeltmeTalepFormu(Dictionary<string, string> sections)
    {
        var form = new DuzeltmeTalepFormu();
        var header = "Düzeltme talep eden tarafından doldurulur: Takip gerekli değil / Takip gerekli Açıklama:";
        if (sections.ContainsKey(header))
        {
            var content = sections[header];
            var lower = content.ToLowerInvariant();

            if (lower.Contains("takip gerekli değil") || lower.Contains("takip gerekli degil"))
            {
                form.TakipGerekli = false;
            }
            else if (lower.Contains("takip gerekli"))
            {
                form.TakipGerekli = true;
            }

            form.Aciklama = content.Trim();
        }
        return form;
    }

    private OzetSoruCevap ParseOzetSoruCevap(Dictionary<string, string> sections)
    {
        var ozet = new OzetSoruCevap();
        var header = "Özet (Soru / Cevap)";
        if (!sections.ContainsKey(header)) return ozet;

        var content = sections[header];
        var lines = content.Split('\n', StringSplitOptions.RemoveEmptyEntries);

        string currentQuestion = null;
        foreach (var raw in lines)
        {
            var line = raw.Trim();
            if (line.StartsWith("Soru:", StringComparison.OrdinalIgnoreCase))
            {
                currentQuestion = line.Substring(6).Trim();
            }
            else if (line.StartsWith("Cevap:", StringComparison.OrdinalIgnoreCase))
            {
                var answer = line.Substring(7).Trim();
                if (!string.IsNullOrWhiteSpace(currentQuestion) || !string.IsNullOrWhiteSpace(answer))
                {
                    ozet.Kalemler.Add(new SoruCevap
                    {
                        Soru = currentQuestion ?? string.Empty,
                        Cevap = answer
                    });
                }
                currentQuestion = null;
            }
        }

        return ozet;
    }

    private string ExtractJsonFromResponse(string response)
    {
        // ChatGPT bazen JSON'dan önce veya sonra açıklama ekler, sadece JSON kısmını al
        var startIndex = response.IndexOf('{');
        var lastIndex = response.LastIndexOf('}');
        
        if (startIndex >= 0 && lastIndex > startIndex)
        {
            return response.Substring(startIndex, lastIndex - startIndex + 1);
        }
        
        return response;
    }
}
