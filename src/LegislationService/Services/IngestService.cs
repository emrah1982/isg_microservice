using LegislationService.Data;
using LegislationService.Entities;
using Microsoft.EntityFrameworkCore;

namespace LegislationService.Services
{
    public class IngestService
    {
        private readonly LegislationDbContext _db;
        private readonly ILogger<IngestService> _logger;

        public IngestService(LegislationDbContext db, ILogger<IngestService> logger)
        {
            _db = db;
            _logger = logger;
        }

        public async Task<Regulation> UpsertRegulationAsync(Regulation input)
        {
            // Basit upsert: Başlığa göre eşleştir
            var existing = await _db.Regulations.FirstOrDefaultAsync(r => r.Title == input.Title);
            if (existing == null)
            {
                input.LastChecked = DateTime.UtcNow;
                _db.Regulations.Add(input);
                await _db.SaveChangesAsync();
                return input;
            }

            existing.LawNumber = input.LawNumber ?? existing.LawNumber;
            existing.Type = input.Type ?? existing.Type;
            existing.PublishDate = input.PublishDate ?? existing.PublishDate;
            existing.SourceURL = input.SourceURL ?? existing.SourceURL;
            existing.Summary = input.Summary ?? existing.Summary;
            existing.Status = input.Status ?? existing.Status;
            existing.LastChecked = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return existing;
        }

        public async Task AddChangeAsync(int regulationId, string? summary, DateTime? date = null)
        {
            var has = await _db.Regulations.AnyAsync(r => r.Id == regulationId);
            if (!has) throw new InvalidOperationException($"Regulation {regulationId} not found");

            _db.RegulationChanges.Add(new RegulationChange
            {
                RegulationId = regulationId,
                ChangeDate = date ?? DateTime.UtcNow.Date,
                ChangeSummary = summary
            });
            await _db.SaveChangesAsync();
        }
    }
}
