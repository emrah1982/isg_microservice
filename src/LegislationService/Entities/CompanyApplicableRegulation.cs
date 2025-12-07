namespace LegislationService.Entities
{
    public class CompanyApplicableRegulation
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public int RegulationId { get; set; }
        public string? Notes { get; set; }

        public Regulation? Regulation { get; set; }
    }
}
