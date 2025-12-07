namespace PPEService.Entities;

public class PpeItem
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;           // Baret, Eldiven, Gözlük
    public string? Category { get; set; }                      // Baş koruma, El koruma, Göz koruma
    public string? Standard { get; set; }                      // EN397 vb.
    public string? Size { get; set; }                          // S, M, L, XL veya numara
    public bool IsActive { get; set; } = true;
    public int StockQuantity { get; set; } = 0;                // Stok adedi
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
