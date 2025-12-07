using Shared.DTOs;
using VisionService.DTOs;

namespace VisionService.Services;

public interface IVisionService
{
    Task<ApiResponse<VisionResponseDto>> AnalyzeAsync(VisionRequestDto request, CancellationToken ct = default);
}
