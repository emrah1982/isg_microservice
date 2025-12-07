namespace ActivitiesService.Models;

/// <summary>
/// Kontrol listesi maddesi (şablonlarda kullanılır)
/// </summary>
public class ChecklistItem
{
    public int Id { get; set; }
    public string Item { get; set; } = string.Empty;
    public bool IsRequired { get; set; } = true;
    public string? Notes { get; set; }
    public string ResponseType { get; set; } = "checkbox"; // checkbox, text, number, select
    public string[]? SelectOptions { get; set; }
    public bool IsCritical { get; set; } = false;
    public int DisplayOrder { get; set; }
}
