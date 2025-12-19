namespace PersonnelService.Entities;

public class Personnel
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public string? NationalId { get; set; } // TC Kimlik No
    public string CitizenshipType { get; set; } = "TR"; // TR | Foreign
    public string? Nationality { get; set; } // e.g. Turkey, Syria, Afghanistan
    public string? ForeignIdentityNumber { get; set; } // Yabancı kimlik no (varsa)
    public string? PassportNumber { get; set; } // Pasaport no (varsa)
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public int? CompanyId { get; set; } // FK to Company
    public string? Department { get; set; }
    public string? Title { get; set; }
    public string? Position { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? IsgTemelEgitimBelgesiTarihi { get; set; }
    public string Status { get; set; } = "Active"; // Active/Inactive
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
