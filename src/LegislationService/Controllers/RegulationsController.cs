using LegislationService.Data;
using LegislationService.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LegislationService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RegulationsController : ControllerBase
    {
        private readonly LegislationDbContext _db;
        public RegulationsController(LegislationDbContext db) { _db = db; }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? type = null,
            [FromQuery] string? status = null,
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null,
            [FromQuery] string? search = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var q = _db.Regulations.AsNoTracking().AsQueryable();
            if (!string.IsNullOrWhiteSpace(type)) q = q.Where(r => r.Type == type);
            if (!string.IsNullOrWhiteSpace(status)) q = q.Where(r => r.Status == status);
            if (from.HasValue) q = q.Where(r => r.PublishDate >= from.Value);
            if (to.HasValue) q = q.Where(r => r.PublishDate <= to.Value);
            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim();
                q = q.Where(r => (r.Title ?? "").Contains(s) || (r.Summary ?? "").Contains(s) || (r.LawNumber ?? "").Contains(s));
            }

            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);
            var total = await q.CountAsync();
            var items = await q
                .OrderByDescending(r => r.PublishDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new { total, page, pageSize, items });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _db.Regulations.Include(x => x.Changes).FirstOrDefaultAsync(x => x.Id == id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Regulation model)
        {
            _db.Regulations.Add(model);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = model.Id }, model);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Regulation model)
        {
            var existing = await _db.Regulations.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Title = model.Title ?? existing.Title;
            existing.LawNumber = model.LawNumber ?? existing.LawNumber;
            existing.Type = model.Type ?? existing.Type;
            existing.PublishDate = model.PublishDate ?? existing.PublishDate;
            existing.SourceURL = model.SourceURL ?? existing.SourceURL;
            existing.Summary = model.Summary ?? existing.Summary;
            existing.Status = model.Status ?? existing.Status;
            existing.LastChecked = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return Ok(existing);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _db.Regulations.FindAsync(id);
            if (existing == null) return NotFound();
            _db.Regulations.Remove(existing);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
