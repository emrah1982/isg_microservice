using System.ComponentModel.DataAnnotations;

namespace VisionService.DTOs;

public class VisionRequestDto
{
    [Required(ErrorMessage = "base64Image zorunludur")]
    public string Base64Image { get; set; } = string.Empty;

    public string? Provider { get; set; } = "deepseek"; // deepseek

    // 0-1 arasında güven eşiği
    public double Threshold { get; set; } = 0.35;

    // High severity için otomatik olay oluşturulsun mu?
    public bool AutoCreateIncident { get; set; } = false;

    // Annotasyonlu çıktı istensin mi? (İleride genişletilebilir)
    public bool ReturnAnnotated { get; set; } = false;
}
