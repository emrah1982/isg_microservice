using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.DTOs;
using ReportingService.DTOs;
using ReportingService.Services;

namespace ReportingService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IReportingService _reportingService;
    
    public ReportsController(IReportingService reportingService)
    {
        _reportingService = reportingService;
    }
    
    /// <summary>
    /// Dashboard verilerini getir
    /// </summary>
    [HttpGet("dashboard")]
    [Authorize(Roles = "Admin,Manager,Supervisor")]
    public async Task<ActionResult<ApiResponse<DashboardDataDto>>> GetDashboardData()
    {
        var result = await _reportingService.GetDashboardDataAsync();
        return Ok(result);
    }
    
    /// <summary>
    /// Kullanıcı istatistiklerini getir
    /// </summary>
    [HttpGet("users")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<ApiResponse<UserStatistics>>> GetUserStatistics()
    {
        var result = await _reportingService.GetUserStatisticsAsync();
        return Ok(result);
    }
    
    /// <summary>
    /// Eğitim istatistiklerini getir
    /// </summary>
    [HttpGet("trainings")]
    [Authorize(Roles = "Admin,Manager,Supervisor")]
    public async Task<ActionResult<ApiResponse<TrainingStatistics>>> GetTrainingStatistics()
    {
        var result = await _reportingService.GetTrainingStatisticsAsync();
        return Ok(result);
    }
    
    /// <summary>
    /// Risk istatistiklerini getir
    /// </summary>
    [HttpGet("risks")]
    [Authorize(Roles = "Admin,Manager,Supervisor")]
    public async Task<ActionResult<ApiResponse<RiskStatistics>>> GetRiskStatistics()
    {
        var result = await _reportingService.GetRiskStatisticsAsync();
        return Ok(result);
    }
    
    /// <summary>
    /// Olay istatistiklerini getir
    /// </summary>
    [HttpGet("incidents")]
    [Authorize(Roles = "Admin,Manager,Supervisor")]
    public async Task<ActionResult<ApiResponse<IncidentStatistics>>> GetIncidentStatistics()
    {
        var result = await _reportingService.GetIncidentStatisticsAsync();
        return Ok(result);
    }
    
    /// <summary>
    /// Doküman istatistiklerini getir
    /// </summary>
    [HttpGet("documents")]
    [Authorize(Roles = "Admin,Manager,Supervisor")]
    public async Task<ActionResult<ApiResponse<DocumentStatistics>>> GetDocumentStatistics()
    {
        var result = await _reportingService.GetDocumentStatisticsAsync();
        return Ok(result);
    }
}
