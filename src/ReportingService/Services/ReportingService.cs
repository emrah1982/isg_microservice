using Shared.DTOs;
using ReportingService.DTOs;
using System.Text.Json;

namespace ReportingService.Services;

public class ReportingService : IReportingService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ReportingService> _logger;
    private readonly IConfiguration _configuration;

    public ReportingService(HttpClient httpClient, ILogger<ReportingService> logger, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _logger = logger;
        _configuration = configuration;
    }

    public async Task<ApiResponse<DashboardDataDto>> GetDashboardDataAsync()
    {
        try
        {
            var dashboardData = new DashboardDataDto
            {
                UserStats = await GetUserStatisticsInternalAsync(),
                TrainingStats = await GetTrainingStatisticsInternalAsync(),
                RiskStats = await GetRiskStatisticsInternalAsync(),
                IncidentStats = await GetIncidentStatisticsInternalAsync(),
                DocumentStats = await GetDocumentStatisticsInternalAsync()
            };

            return ApiResponse<DashboardDataDto>.SuccessResponse(dashboardData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Dashboard verisi alınırken hata oluştu");
            return ApiResponse<DashboardDataDto>.ErrorResponse($"Dashboard verisi alınamadı: {ex.Message}");
        }
    }

    public async Task<ApiResponse<UserStatistics>> GetUserStatisticsAsync()
    {
        try
        {
            var stats = await GetUserStatisticsInternalAsync();
            return ApiResponse<UserStatistics>.SuccessResponse(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Kullanıcı istatistikleri alınırken hata oluştu");
            return ApiResponse<UserStatistics>.ErrorResponse($"Kullanıcı istatistikleri alınamadı: {ex.Message}");
        }
    }

    public async Task<ApiResponse<TrainingStatistics>> GetTrainingStatisticsAsync()
    {
        try
        {
            var stats = await GetTrainingStatisticsInternalAsync();
            return ApiResponse<TrainingStatistics>.SuccessResponse(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Eğitim istatistikleri alınırken hata oluştu");
            return ApiResponse<TrainingStatistics>.ErrorResponse($"Eğitim istatistikleri alınamadı: {ex.Message}");
        }
    }

    public async Task<ApiResponse<RiskStatistics>> GetRiskStatisticsAsync()
    {
        try
        {
            var stats = await GetRiskStatisticsInternalAsync();
            return ApiResponse<RiskStatistics>.SuccessResponse(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Risk istatistikleri alınırken hata oluştu");
            return ApiResponse<RiskStatistics>.ErrorResponse($"Risk istatistikleri alınamadı: {ex.Message}");
        }
    }

    public async Task<ApiResponse<IncidentStatistics>> GetIncidentStatisticsAsync()
    {
        try
        {
            var stats = await GetIncidentStatisticsInternalAsync();
            return ApiResponse<IncidentStatistics>.SuccessResponse(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Olay istatistikleri alınırken hata oluştu");
            return ApiResponse<IncidentStatistics>.ErrorResponse($"Olay istatistikleri alınamadı: {ex.Message}");
        }
    }

    public async Task<ApiResponse<DocumentStatistics>> GetDocumentStatisticsAsync()
    {
        try
        {
            var stats = await GetDocumentStatisticsInternalAsync();
            return ApiResponse<DocumentStatistics>.SuccessResponse(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Doküman istatistikleri alınırken hata oluştu");
            return ApiResponse<DocumentStatistics>.ErrorResponse($"Doküman istatistikleri alınamadı: {ex.Message}");
        }
    }

    private async Task<UserStatistics> GetUserStatisticsInternalAsync()
    {
        try
        {
            var usersServiceUrl = _configuration["Services:UsersService"] ?? "http://users-service:8080";
            var response = await _httpClient.GetAsync($"{usersServiceUrl}/api/users");
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var apiResponse = JsonSerializer.Deserialize<ApiResponse<IEnumerable<dynamic>>>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                
                // Mock data for now - in real implementation, parse the actual user data
                return new UserStatistics
                {
                    TotalUsers = 150,
                    ActiveUsers = 142,
                    UsersByRole = new Dictionary<string, int>
                    {
                        { "Employee", 100 },
                        { "Supervisor", 25 },
                        { "Manager", 15 },
                        { "Admin", 5 },
                        { "Doctor", 3 },
                        { "Inspector", 2 }
                    }
                };
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "UsersService'den veri alınamadı, mock data kullanılıyor");
        }

        return new UserStatistics { TotalUsers = 0, ActiveUsers = 0 };
    }

    private async Task<TrainingStatistics> GetTrainingStatisticsInternalAsync()
    {
        try
        {
            var trainingsServiceUrl = _configuration["Services:TrainingsService"] ?? "http://trainings-service:8081";
            var response = await _httpClient.GetAsync($"{trainingsServiceUrl}/api/trainings");
            
            if (response.IsSuccessStatusCode)
            {
                // Mock data for now
                return new TrainingStatistics
                {
                    TotalTrainings = 45,
                    CompletedTrainings = 38,
                    PendingTrainings = 5,
                    OverdueTrainings = 2,
                    CompletionRate = 84.4
                };
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "TrainingsService'den veri alınamadı, mock data kullanılıyor");
        }

        return new TrainingStatistics();
    }

    private async Task<RiskStatistics> GetRiskStatisticsInternalAsync()
    {
        try
        {
            var riskServiceUrl = _configuration["Services:RiskAnalysisService"] ?? "http://risk-service:8082";
            var response = await _httpClient.GetAsync($"{riskServiceUrl}/api/risks");
            
            if (response.IsSuccessStatusCode)
            {
                // Mock data for now
                return new RiskStatistics
                {
                    TotalRisks = 23,
                    OpenRisks = 18,
                    HighSeverityRisks = 5,
                    RisksByCategory = new Dictionary<string, int>
                    {
                        { "Kimyasal", 8 },
                        { "Ergonomik", 6 },
                        { "Mekanik", 5 },
                        { "Elektrik", 4 }
                    },
                    RisksByStatus = new Dictionary<string, int>
                    {
                        { "Open", 18 },
                        { "Mitigating", 3 },
                        { "Closed", 2 }
                    }
                };
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "RiskAnalysisService'den veri alınamadı, mock data kullanılıyor");
        }

        return new RiskStatistics();
    }

    private async Task<IncidentStatistics> GetIncidentStatisticsInternalAsync()
    {
        try
        {
            var incidentsServiceUrl = _configuration["Services:IncidentsService"] ?? "http://incidents-service:8083";
            var response = await _httpClient.GetAsync($"{incidentsServiceUrl}/api/incidents");
            
            if (response.IsSuccessStatusCode)
            {
                // Mock data for now
                return new IncidentStatistics
                {
                    TotalIncidents = 12,
                    OpenIncidents = 3,
                    IncidentsThisMonth = 2,
                    IncidentsByType = new Dictionary<string, int>
                    {
                        { "Kaza", 7 },
                        { "Ramak Kala", 4 },
                        { "Meslek Hastalığı", 1 }
                    },
                    IncidentsBySeverity = new Dictionary<string, int>
                    {
                        { "Hafif", 6 },
                        { "Orta", 4 },
                        { "Ağır", 2 },
                        { "Ölümcül", 0 }
                    }
                };
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "IncidentsService'den veri alınamadı, mock data kullanılıyor");
        }

        return new IncidentStatistics();
    }

    private async Task<DocumentStatistics> GetDocumentStatisticsInternalAsync()
    {
        try
        {
            var documentsServiceUrl = _configuration["Services:DocumentsService"] ?? "http://documents-service:8084";
            var response = await _httpClient.GetAsync($"{documentsServiceUrl}/api/documents");
            
            if (response.IsSuccessStatusCode)
            {
                // Mock data for now
                return new DocumentStatistics
                {
                    TotalDocuments = 89,
                    PendingApproval = 5,
                    ExpiringDocuments = 3,
                    DocumentsByCategory = new Dictionary<string, int>
                    {
                        { "İSG Politikası", 15 },
                        { "Prosedür", 25 },
                        { "Talimat", 30 },
                        { "Sertifika", 19 }
                    }
                };
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "DocumentsService'den veri alınamadı, mock data kullanılıyor");
        }

        return new DocumentStatistics();
    }
}
