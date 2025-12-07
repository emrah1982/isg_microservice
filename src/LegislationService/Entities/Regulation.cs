using System.ComponentModel.DataAnnotations;

namespace LegislationService.Entities
{
    public class Regulation
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? LawNumber { get; set; }
        public string? Type { get; set; }
        public DateTime? PublishDate { get; set; }
        public string? SourceURL { get; set; }
        public string? Summary { get; set; }
        public string? Status { get; set; }
        public DateTime? LastChecked { get; set; }
        public ICollection<RegulationChange> Changes { get; set; } = new List<RegulationChange>();
    }
}
