using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.DTOs;
using RiskAnalysisService.DTOs;
using RiskAnalysisService.Services;

namespace RiskAnalysisService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RisksController : ControllerBase
{
    private readonly IRiskService _riskService;
    
    public RisksController(IRiskService riskService)
    {
        _riskService = riskService;
    }
    
    /// <summary>
    /// Risk oluştur
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin,Manager,Supervisor")]
    public async Task<ActionResult<ApiResponse<RiskItemResponseDto>>> CreateRisk([FromBody] RiskItemCreateDto createDto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            
            return BadRequest(ApiResponse<RiskItemResponseDto>.ErrorResponse("Geçersiz veri", errors));
        }
        
        var result = await _riskService.CreateRiskAsync(createDto);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }
        
        return Ok(result);
    }
    
    /// <summary>
    /// Risk bilgisi getir
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<RiskItemResponseDto>>> GetRisk(int id)
    {
        var result = await _riskService.GetRiskByIdAsync(id);
        
        if (!result.Success)
        {
            return NotFound(result);
        }
        
        return Ok(result);
    }
    
    /// <summary>
    /// Tüm riskleri listele
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<RiskItemResponseDto>>>> GetAllRisks()
    {
        var result = await _riskService.GetAllRisksAsync();
        return Ok(result);
    }
    
    /// <summary>
    /// Duruma göre riskleri listele
    /// </summary>
    [HttpGet("status/{status}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<RiskItemResponseDto>>>> GetRisksByStatus(string status)
    {
        var result = await _riskService.GetRisksByStatusAsync(status);
        return Ok(result);
    }
    
    /// <summary>
    /// Risk güncelle
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Manager,Supervisor")]
    public async Task<ActionResult<ApiResponse<RiskItemResponseDto>>> UpdateRisk(int id, [FromBody] RiskItemCreateDto updateDto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            
            return BadRequest(ApiResponse<RiskItemResponseDto>.ErrorResponse("Geçersiz veri", errors));
        }
        
        var result = await _riskService.UpdateRiskAsync(id, updateDto);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }
        
        return Ok(result);
    }
    
    /// <summary>
    /// Risk sil
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteRisk(int id)
    {
        var result = await _riskService.DeleteRiskAsync(id);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }
        
        return Ok(result);
    }
    
    /// <summary>
    /// Risk durumunu güncelle
    /// </summary>
    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin,Manager,Supervisor")]
    public async Task<ActionResult<ApiResponse<bool>>> UpdateRiskStatus(int id, [FromQuery] string status)
    {
        var validStatuses = new[] { "Open", "Mitigating", "Closed" };
        if (!validStatuses.Contains(status))
        {
            return BadRequest(ApiResponse<bool>.ErrorResponse("Geçersiz durum değeri."));
        }
        
        var result = await _riskService.UpdateRiskStatusAsync(id, status);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }
        
        return Ok(result);
    }
}
