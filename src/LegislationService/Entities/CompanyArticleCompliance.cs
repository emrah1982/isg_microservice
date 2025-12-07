namespace LegislationService.Entities
{
    public class CompanyArticleCompliance
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public int ArticleId { get; set; }
        public string ComplianceStatus { get; set; } = "NotApplicable"; // Compliant | NonCompliant | NotApplicable
        public DateTime? LastAuditDate { get; set; }
        public string? ResponsiblePerson { get; set; }
        public string? Notes { get; set; }
        public string? EvidenceURL { get; set; }

        public RegulationArticle? Article { get; set; }
    }
}
