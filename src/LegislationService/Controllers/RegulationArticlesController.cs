using LegislationService.Data;
using LegislationService.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UglyToad.PdfPig;
using System.Net.Http;
using System.Text.RegularExpressions;

namespace LegislationService.Controllers
{
    [ApiController]
    [Route("api/regulations/{regulationId:int}/articles")]
    public class RegulationArticlesController : ControllerBase
    {
        private readonly LegislationDbContext _db;
        private readonly IHttpClientFactory _httpClientFactory;
        public RegulationArticlesController(LegislationDbContext db, IHttpClientFactory httpClientFactory)
        {
            _db = db;
            _httpClientFactory = httpClientFactory;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(int regulationId)
        {
            var items = await _db.RegulationArticles
                .AsNoTracking()
                .Where(a => a.RegulationId == regulationId)
                .OrderBy(a => a.OrderNo)
                .ThenBy(a => a.Id)
                .ToListAsync();
            return Ok(items);
        }

        public class ArticleDto
        {
            public string? Code { get; set; }
            public string? Title { get; set; }
            public string? Text { get; set; }
            public int? OrderNo { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> UpsertMany(int regulationId, [FromBody] List<ArticleDto> payload)
        {
            if (payload == null || payload.Count == 0) return BadRequest("Empty payload");

            var codes = payload.Where(p => !string.IsNullOrWhiteSpace(p.Code)).Select(p => p.Code!).ToHashSet();
            var existing = await _db.RegulationArticles
                .Where(a => a.RegulationId == regulationId && a.Code != null && codes.Contains(a.Code))
                .ToListAsync();

            foreach (var p in payload)
            {
                var entity = (!string.IsNullOrWhiteSpace(p.Code))
                    ? existing.FirstOrDefault(e => e.Code == p.Code)
                    : null;
                if (entity == null)
                {
                    entity = new RegulationArticle
                    {
                        RegulationId = regulationId,
                        Code = p.Code,
                        Title = p.Title,
                        Text = p.Text,
                        OrderNo = p.OrderNo
                    };
                    _db.RegulationArticles.Add(entity);
                }
                else
                {
                    entity.Title = p.Title;
                    entity.Text = p.Text;
                    entity.OrderNo = p.OrderNo;
                    _db.RegulationArticles.Update(entity);
                }
            }

            await _db.SaveChangesAsync();
            return NoContent();
        }

        public class ImportFromUrlRequest { public string? Url { get; set; } }

        [HttpGet("ping")]
        public IActionResult Ping(int regulationId)
        {
            return Ok(new { ok = true, regulationId });
        }

        [HttpPost("import/pdf-file")]
        public async Task<IActionResult> ImportFromPdfFile(int regulationId, IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0) return BadRequest("Dosya gerekli");
                if (!file.ContentType.Contains("pdf")) return BadRequest("Sadece PDF dosyaları desteklenir");

                await using var stream = file.OpenReadStream();

                string allText = string.Empty;
                using (var pdf = PdfDocument.Open(stream))
                {
                    var sb = new System.Text.StringBuilder();
                    foreach (var page in pdf.GetPages())
                        sb.AppendLine(page.Text);
                    allText = sb.ToString();
                }

                return await ParseAndUpsertArticles(regulationId, allText);
            }
            catch (Exception ex)
            {
                return BadRequest($"Dosya işleme hatası: {ex.Message}");
            }
        }

        [HttpPost("import/pdf-url")]
        public async Task<IActionResult> ImportFromPdfUrl(int regulationId, [FromBody] ImportFromUrlRequest body)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(body?.Url)) return BadRequest("Url is required");

                var http = _httpClientFactory.CreateClient();
                http.Timeout = TimeSpan.FromSeconds(300);
                using var req = new HttpRequestMessage(HttpMethod.Get, body.Url);
                req.Headers.UserAgent.ParseAdd("Mozilla/5.0");
                req.Headers.Accept.ParseAdd("application/pdf,*/*");

                using var resp = await http.SendAsync(req, HttpCompletionOption.ResponseHeadersRead);
                if (!resp.IsSuccessStatusCode)
                    return BadRequest($"PDF indirilemedi. HTTP {(int)resp.StatusCode} {resp.ReasonPhrase}");

                await using var stream = await resp.Content.ReadAsStreamAsync();

                string allText = string.Empty;
                using (var pdf = PdfDocument.Open(stream))
                {
                    var sb = new System.Text.StringBuilder();
                    foreach (var page in pdf.GetPages())
                        sb.AppendLine(page.Text);
                    allText = sb.ToString();
                }

                return await ParseAndUpsertArticles(regulationId, allText);
            }
            catch (Exception ex)
            {
                return BadRequest($"Import hata: {ex.Message}");
            }
        }

        private async Task<IActionResult> ParseAndUpsertArticles(int regulationId, string allText)
        {
            // Normalize text
            allText = allText.Replace("\r", "").Replace("\u00A0", " ");
            allText = Regex.Replace(allText, @"\n{2,}", "\n");

            // Regex to capture all article types (Madde, Geçici Madde, Ek Madde)
            var articlePattern = new Regex(
                @"(?:(?:^|\n)\s*)((?:Madde|GEÇİCİ MADDE|Geçici Madde|EK MADDE|Ek Madde)\s+\d+\s*[-–]?\s*)(.*?)(?=(?:\n\s*(?:Madde|GEÇİCİ MADDE|Geçici Madde|EK MADDE|Ek Madde)\s+\d+)|\Z)",
                RegexOptions.Singleline | RegexOptions.IgnoreCase
            );

            var matches = articlePattern.Matches(allText);
            Console.WriteLine($"=== PARSE: {matches.Count} articles detected ===");

            if (matches.Count == 0)
                return BadRequest("PDF metninde madde bulunamadı. Formatı kontrol edin.");

            var list = new List<ArticleDto>();

            foreach (Match m in matches)
            {
                var header = m.Groups[1].Value.Trim();
                var body = m.Groups[2].Value.Trim();

                // Extract madde numarası
                var numMatch = Regex.Match(header, @"(\d+)");
                int? orderNo = numMatch.Success ? int.Parse(numMatch.Groups[1].Value) : null;

                // Başlık oluştur (ilk satır veya cümle)
                string title = "";
                if (!string.IsNullOrWhiteSpace(body))
                {
                    var firstLine = body.Split('\n').FirstOrDefault()?.Trim() ?? "";
                    var firstSentence = Regex.Match(firstLine, @"^.+?[.!?]");
                    title = firstSentence.Success && firstSentence.Value.Length < 150
                        ? firstSentence.Value.TrimEnd('.', '!', '?').Trim()
                        : (firstLine.Length > 150 ? firstLine.Substring(0, 150) + "..." : firstLine);
                }

                list.Add(new ArticleDto
                {
                    Code = header.Replace("\n", " ").Trim(),
                    Title = string.IsNullOrWhiteSpace(title) ? header : title,
                    Text = body,
                    OrderNo = orderNo
                });
            }

            Console.WriteLine($"=== PARSE RESULT: {list.Count} articles extracted ===");

            // Save via existing logic
            return await UpsertMany(regulationId, list);
        }
    }
}
