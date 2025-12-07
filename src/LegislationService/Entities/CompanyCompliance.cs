namespace LegislationService.Entities
{
    public class CompanyCompliance
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public int RegulationId { get; set; }
        public string? ComplianceStatus { get; set; }
        public DateTime? LastAuditDate { get; set; }
        public string? ResponsiblePerson { get; set; }
        public string? Notes { get; set; }
    }
}
