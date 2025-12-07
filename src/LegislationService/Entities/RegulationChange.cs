namespace LegislationService.Entities
{
    public class RegulationChange
    {
        public int Id { get; set; }
        public int RegulationId { get; set; }
        public DateTime? ChangeDate { get; set; }
        public string? ChangeSummary { get; set; }
        public Regulation? Regulation { get; set; }
    }
}
