using Shared.DTOs;
using ReportingService.DTOs;

namespace ReportingService.Services;

public interface IReportingService
{
    Task<ApiResponse<DashboardDataDto>> GetDashboardDataAsync();
    Task<ApiResponse<UserStatistics>> GetUserStatisticsAsync();
    Task<ApiResponse<TrainingStatistics>> GetTrainingStatisticsAsync();
    Task<ApiResponse<RiskStatistics>> GetRiskStatisticsAsync();
    Task<ApiResponse<IncidentStatistics>> GetIncidentStatisticsAsync();
    Task<ApiResponse<DocumentStatistics>> GetDocumentStatisticsAsync();
}
