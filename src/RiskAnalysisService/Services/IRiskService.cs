using Shared.DTOs;
using RiskAnalysisService.DTOs;

namespace RiskAnalysisService.Services;

public interface IRiskService
{
    Task<ApiResponse<RiskItemResponseDto>> CreateRiskAsync(RiskItemCreateDto createDto);
    Task<ApiResponse<RiskItemResponseDto>> GetRiskByIdAsync(int id);
    Task<ApiResponse<IEnumerable<RiskItemResponseDto>>> GetAllRisksAsync();
    Task<ApiResponse<IEnumerable<RiskItemResponseDto>>> GetRisksByStatusAsync(string status);
    Task<ApiResponse<RiskItemResponseDto>> UpdateRiskAsync(int id, RiskItemCreateDto updateDto);
    Task<ApiResponse<bool>> DeleteRiskAsync(int id);
    Task<ApiResponse<bool>> UpdateRiskStatusAsync(int id, string status);
}
