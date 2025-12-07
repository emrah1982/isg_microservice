using Shared.DTOs;
using RiskAnalysisService.DTOs;
using RiskAnalysisService.Entities;
using RiskAnalysisService.Repositories;

namespace RiskAnalysisService.Services;

public class RiskService : IRiskService
{
    private readonly IRiskRepository _riskRepository;
    private readonly ILogger<RiskService> _logger;
    
    public RiskService(IRiskRepository riskRepository, ILogger<RiskService> logger)
    {
        _riskRepository = riskRepository;
        _logger = logger;
    }
    
    public async Task<ApiResponse<RiskItemResponseDto>> CreateRiskAsync(RiskItemCreateDto createDto)
    {
        try
        {
            var risk = new RiskItem
            {
                Title = createDto.Title,
                Description = createDto.Description,
                Probability = createDto.Probability,
                Impact = createDto.Impact,
                OwnerUserId = createDto.OwnerUserId,
                DueDate = createDto.DueDate,
                Category = createDto.Category
            };
            
            var createdRisk = await _riskRepository.CreateAsync(risk);
            
            return ApiResponse<RiskItemResponseDto>.SuccessResponse(
                MapToRiskResponseDto(createdRisk), 
                "Risk başarıyla oluşturuldu.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Risk oluşturma hatası");
            return ApiResponse<RiskItemResponseDto>.ErrorResponse($"Risk oluşturma hatası: {ex.Message}");
        }
    }
    
    public async Task<ApiResponse<RiskItemResponseDto>> GetRiskByIdAsync(int id)
    {
        try
        {
            var risk = await _riskRepository.GetByIdAsync(id);
            
            if (risk == null)
            {
                return ApiResponse<RiskItemResponseDto>.ErrorResponse("Risk bulunamadı.");
            }
            
            return ApiResponse<RiskItemResponseDto>.SuccessResponse(MapToRiskResponseDto(risk));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Risk getirme hatası. RiskId: {id}");
            return ApiResponse<RiskItemResponseDto>.ErrorResponse($"Risk getirme hatası: {ex.Message}");
        }
    }
    
    public async Task<ApiResponse<IEnumerable<RiskItemResponseDto>>> GetAllRisksAsync()
    {
        try
        {
            var risks = await _riskRepository.GetAllAsync();
            var riskDtos = risks.Select(MapToRiskResponseDto);
            
            return ApiResponse<IEnumerable<RiskItemResponseDto>>.SuccessResponse(riskDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Risk listesi getirme hatası");
            return ApiResponse<IEnumerable<RiskItemResponseDto>>.ErrorResponse($"Risk listesi getirme hatası: {ex.Message}");
        }
    }
    
    public async Task<ApiResponse<IEnumerable<RiskItemResponseDto>>> GetRisksByStatusAsync(string status)
    {
        try
        {
            var risks = await _riskRepository.GetByStatusAsync(status);
            var riskDtos = risks.Select(MapToRiskResponseDto);
            
            return ApiResponse<IEnumerable<RiskItemResponseDto>>.SuccessResponse(riskDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Risk listesi getirme hatası. Status: {status}");
            return ApiResponse<IEnumerable<RiskItemResponseDto>>.ErrorResponse($"Risk listesi getirme hatası: {ex.Message}");
        }
    }
    
    public async Task<ApiResponse<RiskItemResponseDto>> UpdateRiskAsync(int id, RiskItemCreateDto updateDto)
    {
        try
        {
            var risk = await _riskRepository.GetByIdAsync(id);
            
            if (risk == null)
            {
                return ApiResponse<RiskItemResponseDto>.ErrorResponse("Risk bulunamadı.");
            }
            
            risk.Title = updateDto.Title;
            risk.Description = updateDto.Description;
            risk.Probability = updateDto.Probability;
            risk.Impact = updateDto.Impact;
            risk.OwnerUserId = updateDto.OwnerUserId;
            risk.DueDate = updateDto.DueDate;
            risk.Category = updateDto.Category;
            
            var updatedRisk = await _riskRepository.UpdateAsync(risk);
            
            return ApiResponse<RiskItemResponseDto>.SuccessResponse(
                MapToRiskResponseDto(updatedRisk), 
                "Risk başarıyla güncellendi.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Risk güncelleme hatası. RiskId: {id}");
            return ApiResponse<RiskItemResponseDto>.ErrorResponse($"Risk güncelleme hatası: {ex.Message}");
        }
    }
    
    public async Task<ApiResponse<bool>> DeleteRiskAsync(int id)
    {
        try
        {
            var risk = await _riskRepository.GetByIdAsync(id);
            
            if (risk == null)
            {
                return ApiResponse<bool>.ErrorResponse("Risk bulunamadı.");
            }
            
            await _riskRepository.DeleteAsync(id);
            
            return ApiResponse<bool>.SuccessResponse(true, "Risk başarıyla silindi.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Risk silme hatası. RiskId: {id}");
            return ApiResponse<bool>.ErrorResponse($"Risk silme hatası: {ex.Message}");
        }
    }
    
    public async Task<ApiResponse<bool>> UpdateRiskStatusAsync(int id, string status)
    {
        try
        {
            var risk = await _riskRepository.GetByIdAsync(id);
            
            if (risk == null)
            {
                return ApiResponse<bool>.ErrorResponse("Risk bulunamadı.");
            }
            
            risk.Status = status;
            await _riskRepository.UpdateAsync(risk);
            
            return ApiResponse<bool>.SuccessResponse(true, "Risk durumu güncellendi.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Risk durum güncelleme hatası. RiskId: {id}");
            return ApiResponse<bool>.ErrorResponse($"Risk durum güncelleme hatası: {ex.Message}");
        }
    }
    
    private static RiskItemResponseDto MapToRiskResponseDto(RiskItem risk)
    {
        return new RiskItemResponseDto
        {
            Id = risk.Id,
            Title = risk.Title,
            Description = risk.Description,
            Probability = risk.Probability,
            Impact = risk.Impact,
            Severity = risk.Severity,
            Status = risk.Status,
            OwnerUserId = risk.OwnerUserId,
            DueDate = risk.DueDate,
            Category = risk.Category,
            CreatedAt = risk.CreatedAt,
            Controls = risk.Controls?.Select(c => new RiskControlResponseDto
            {
                Id = c.Id,
                RiskItemId = c.RiskItemId,
                Action = c.Action,
                Responsible = c.Responsible,
                TargetDate = c.TargetDate,
                Completed = c.Completed,
                CompletedDate = c.CompletedDate,
                CreatedAt = c.CreatedAt
            }).ToList() ?? new List<RiskControlResponseDto>()
        };
    }
}
