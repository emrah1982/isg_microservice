using VisionService.DTOs;

namespace VisionService.Providers;

public interface IVisionProvider
{
    Task<VisionResponseDto> AnalyzeAsync(string base64Image, double threshold, CancellationToken ct = default);
}
