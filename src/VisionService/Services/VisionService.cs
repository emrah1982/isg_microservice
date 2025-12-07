using Shared.DTOs;
using VisionService.DTOs;
using VisionService.Providers;
using System.Net.Http.Json;

namespace VisionService.Services;

public class VisionServiceImpl : IVisionService
{
    private readonly IVisionProvider _provider;
    private readonly ILogger<VisionServiceImpl> _logger;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    public VisionServiceImpl(IVisionProvider provider, ILogger<VisionServiceImpl> logger, IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _provider = provider;
        _logger = logger;
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    public async Task<ApiResponse<VisionResponseDto>> AnalyzeAsync(VisionRequestDto request, CancellationToken ct = default)
    {
        try
        {
            var result = await _provider.AnalyzeAsync(request.Base64Image, request.Threshold, ct);

            // Optional: auto create incident for High severity
            if (request.AutoCreateIncident && result.Violations.Any(v => string.Equals(v.Severity, "High", StringComparison.OrdinalIgnoreCase)))
            {
                _ = Task.Run(() => TryCreateIncidentAsync(result, ct));
            }

            return ApiResponse<VisionResponseDto>.SuccessResponse(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Vision analyze error");
            return ApiResponse<VisionResponseDto>.ErrorResponse($"Analyze error: {ex.Message}");
        }
    }

    private async Task TryCreateIncidentAsync(VisionResponseDto result, CancellationToken ct)
    {
        try
        {
            var incidentsBase = _configuration["Services:IncidentsService"] ?? "http://incidents-service:8083";
            var client = _httpClientFactory.CreateClient();

            var dto = new
            {
                Title = "Automated Vision Violation",
                Description = result.Summary,
                IncidentDate = DateTime.UtcNow,
                Type = "VisionViolation",
                Severity = "High",
                Location = (string?)null,
                InvolvedPersonId = (int?)null,
                RootCause = (string?)null,
                CorrectiveActions = (string?)null,
                RequiresReporting = false,
                ReportingDeadline = (DateTime?)null
            };

            using var res = await client.PostAsJsonAsync($"{incidentsBase}/api/incidents", dto, ct);
            if (!res.IsSuccessStatusCode)
            {
                _logger.LogWarning("Auto incident create failed: {Status}", res.StatusCode);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Auto incident creation exception");
        }
    }
}
