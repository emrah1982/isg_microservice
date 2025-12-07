using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.DTOs;
using VisionService.DTOs;
using VisionService.Services;
using System.Net.Http.Json;

namespace VisionService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VisionController : ControllerBase
{
    private readonly IVisionService _visionService;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    public VisionController(IVisionService visionService, IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _visionService = visionService;
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    [HttpGet("health")]
    [AllowAnonymous]
    public IActionResult Health() => Ok(new { status = "ok" });

    [HttpPost("infer")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<VisionResponseDto>>> Infer([FromBody] VisionRequestDto request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
            return BadRequest(ApiResponse<VisionResponseDto>.ErrorResponse("Geçersiz veri", errors));
        }

        var result = await _visionService.AnalyzeAsync(request, ct);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    // Temporary placeholder to satisfy frontend GET call
    [HttpGet("infer")]
    [AllowAnonymous]
    public ActionResult<ApiResponse<IEnumerable<VisionResponseDto>>> GetLatest()
        => Ok(ApiResponse<IEnumerable<VisionResponseDto>>.SuccessResponse(Enumerable.Empty<VisionResponseDto>()));

    /// <summary>
    /// İkinci adım: Kullanıcı onayı sonrası base64 görseli DocumentsService'e kaydet (lokasyon ile)
    /// </summary>
    [HttpPost("save")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<object>>> Save([FromBody] VisionSaveRequestDto request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
            return BadRequest(ApiResponse<object>.ErrorResponse("Geçersiz veri", errors));
        }

        var documentsBase = _configuration["Services:DocumentsService"] ?? "http://documents-service:8084";
        var client = _httpClientFactory.CreateClient();

        var uploadDto = new
        {
            Base64Image = request.Base64Image,
            Title = string.IsNullOrWhiteSpace(request.Title) ? "Vision Snapshot" : request.Title,
            Description = request.Description,
            Category = "VisionViolation",
            Location = request.Location,
            IsPublic = request.IsPublic,
            UploadedBy = request.UploadedBy
        };

        using var res = await client.PostAsJsonAsync($"{documentsBase}/api/documents/uploadBase64", uploadDto, ct);
        var body = await res.Content.ReadAsStringAsync(ct);
        if (!res.IsSuccessStatusCode)
        {
            return StatusCode((int)res.StatusCode, ApiResponse<object>.ErrorResponse($"DocumentsService hata: {body}"));
        }

        // Passthrough response
        return Ok(ApiResponse<object>.SuccessResponse(System.Text.Json.JsonSerializer.Deserialize<object>(body), "Görsel kaydedildi"));
    }
}
