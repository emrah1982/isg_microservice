using Shared.Entities;
using System.ComponentModel.DataAnnotations;

namespace IncidentsService.Entities;

public class IncidentWitness : BaseEntity
{
    [Required]
    public int IncidentId { get; set; }
    public Incident Incident { get; set; } = null!;

    public int? WitnessUserId { get; set; } // UsersService referansı

    [MaxLength(100)]
    public string? WitnessName { get; set; } // Harici tanık için

    [MaxLength(100)]
    public string? WitnessContact { get; set; }

    [MaxLength(1000)]
    public string? Statement { get; set; }

    public DateTime? StatementDate { get; set; }
}
