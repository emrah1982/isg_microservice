namespace LegislationService.Entities
{
    public class RegulationArticle
    {
        public int Id { get; set; }
        public int RegulationId { get; set; }
        public string? Code { get; set; }
        public string? Title { get; set; }
        public string? Text { get; set; }
        public int? OrderNo { get; set; }

        public Regulation? Regulation { get; set; }
    }
}
