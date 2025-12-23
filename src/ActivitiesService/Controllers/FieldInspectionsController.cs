using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ActivitiesService.Data;
using ActivitiesService.Entities;

namespace ActivitiesService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FieldInspectionsController : ControllerBase
    {
        private readonly ActivitiesDbContext _context;

        public FieldInspectionsController(ActivitiesDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<FieldInspection>>> GetAll(
            [FromQuery] int? companyId,
            [FromQuery] string? search,
            [FromQuery] string? riskLevel,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            var query = _context.FieldInspections.AsQueryable();

            if (companyId.HasValue)
            {
                query = query.Where(f => f.CompanyId == companyId.Value);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchLower = search.ToLower();
                query = query.Where(f =>
                    f.Location.ToLower().Contains(searchLower) ||
                    f.HazardTitle.ToLower().Contains(searchLower) ||
                    f.HazardDescription.ToLower().Contains(searchLower));
            }

            if (!string.IsNullOrWhiteSpace(riskLevel) && riskLevel != "all")
            {
                query = query.Where(f => f.RiskLevel == riskLevel);
            }

            if (startDate.HasValue)
            {
                query = query.Where(f => f.Date >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(f => f.Date <= endDate.Value);
            }

            var results = await query
                .OrderByDescending(f => f.Date)
                .ToListAsync();

            return Ok(results);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<FieldInspection>> GetById(int id)
        {
            var inspection = await _context.FieldInspections.FindAsync(id);

            if (inspection == null)
            {
                return NotFound();
            }

            return Ok(inspection);
        }

        [HttpPost]
        public async Task<ActionResult<FieldInspection>> Create([FromBody] FieldInspection inspection)
        {
            inspection.RiskScore = inspection.Severity * inspection.Likelihood;
            
            if (inspection.RiskScore >= 12)
                inspection.RiskLevel = "Kabul Edilemez";
            else if (inspection.RiskScore >= 8)
                inspection.RiskLevel = "Yuksek";
            else if (inspection.RiskScore >= 4)
                inspection.RiskLevel = "Orta";
            else
                inspection.RiskLevel = "Dusuk";

            inspection.CreatedAt = DateTime.UtcNow;
            inspection.UpdatedAt = DateTime.UtcNow;

            _context.FieldInspections.Add(inspection);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = inspection.Id }, inspection);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] FieldInspection inspection)
        {
            if (id != inspection.Id)
            {
                return BadRequest("ID mismatch");
            }

            var existing = await _context.FieldInspections.FindAsync(id);
            if (existing == null)
            {
                return NotFound();
            }

            existing.Date = inspection.Date;
            existing.Location = inspection.Location;
            existing.HazardTitle = inspection.HazardTitle;
            existing.HazardDescription = inspection.HazardDescription;
            existing.Legislation = inspection.Legislation;
            existing.Measures = inspection.Measures;
            existing.RiskTargets = inspection.RiskTargets;
            existing.Severity = inspection.Severity;
            existing.Likelihood = inspection.Likelihood;
            existing.BeforeImageUrl = inspection.BeforeImageUrl;
            existing.AfterImageUrl = inspection.AfterImageUrl;

            existing.RiskScore = existing.Severity * existing.Likelihood;
            
            if (existing.RiskScore >= 12)
                existing.RiskLevel = "Kabul Edilemez";
            else if (existing.RiskScore >= 8)
                existing.RiskLevel = "Yuksek";
            else if (existing.RiskScore >= 4)
                existing.RiskLevel = "Orta";
            else
                existing.RiskLevel = "Dusuk";

            existing.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(existing);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var inspection = await _context.FieldInspections.FindAsync(id);
            if (inspection == null)
            {
                return NotFound();
            }

            _context.FieldInspections.Remove(inspection);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
