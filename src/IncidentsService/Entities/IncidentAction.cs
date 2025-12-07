using Shared.Entities;
using System.ComponentModel.DataAnnotations;

namespace IncidentsService.Entities;

public class IncidentAction : BaseEntity
{
    public int IncidentId { get; set; }

    [Required]
    public string ActionDescription { get; set; } = string.Empty;

    public int ActionBy { get; set; }

    public DateTime ActionDate { get; set; } = DateTime.UtcNow;

    public Incident? Incident { get; set; }
}
