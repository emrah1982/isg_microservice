using System.Text.Json.Serialization;

namespace ActivitiesService.Entities;

/// <summary>
/// Makine varlığı - Her fiziksel makineyi temsil eder
/// </summary>
public class Machine
{
    public int Id { get; set; }
    
    /// <summary>
    /// Makine tipi (örn: Forklift, Ekskavatör, Roc)
    /// </summary>
    public string MachineType { get; set; } = string.Empty;
    
    /// <summary>
    /// Makine adı/tanımı
    /// </summary>
    public string Name { get; set; } = string.Empty;
    
    /// <summary>
    /// Model bilgisi (örn: Toyota 8FD25)
    /// </summary>
    public string? Model { get; set; }
    
    /// <summary>
    /// Seri numarası - Makineyi benzersiz tanımlar
    /// </summary>
    public string? SerialNumber { get; set; }
    
    /// <summary>
    /// Makine lokasyonu
    /// </summary>
    public string? Location { get; set; }
    
    /// <summary>
    /// Üretim yılı
    /// </summary>
    public int? ManufactureYear { get; set; }
    
    /// <summary>
    /// Makine durumu
    /// </summary>
    public string Status { get; set; } = "Active"; // Active, Maintenance, Retired
    
    /// <summary>
    /// Bu makineye özel kontrol listesi (JSON)
    /// Eğer boşsa MachineTemplate'den yüklenir
    /// </summary>
    public string? CustomChecklistJson { get; set; }
    
    /// <summary>
    /// Notlar
    /// </summary>
    public string? Notes { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation
    [JsonIgnore]
    public List<ControlForm> ControlForms { get; set; } = new();
}
