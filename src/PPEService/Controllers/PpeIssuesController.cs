using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PPEService.Data;
using PPEService.Entities;

namespace PPEService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PpeIssuesController : ControllerBase
{
    private readonly PpeDbContext _ctx;
    public PpeIssuesController(PpeDbContext ctx) { _ctx = ctx; }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] int? assignmentId)
    {
        var q = _ctx.PpeIssues.AsNoTracking().AsQueryable();
        if (assignmentId.HasValue) q = q.Where(x => x.AssignmentId == assignmentId.Value);
        var rows = await q.OrderByDescending(x => x.ReportedAt).ToListAsync();
        return Ok(rows);
    }

    public class CreateIssueDto
    {
        public int AssignmentId { get; set; }
        public string Type { get; set; } = "lost";
        public string? Notes { get; set; }
        public string? ReportedBy { get; set; }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateIssueDto dto)
    {
        var a = await _ctx.PpeAssignments.AsNoTracking().FirstOrDefaultAsync(x => x.Id == dto.AssignmentId);
        if (a == null) return BadRequest("Assignment not found");
        var issue = new PpeIssue
        {
            AssignmentId = dto.AssignmentId,
            Type = string.IsNullOrWhiteSpace(dto.Type) ? "other" : dto.Type.Trim().ToLower(),
            Notes = dto.Notes,
            ReportedAt = DateTime.UtcNow,
            ReportedBy = dto.ReportedBy
        };
        _ctx.PpeIssues.Add(issue);
        await _ctx.SaveChangesAsync();
        return Created($"api/ppeissues/{issue.Id}", issue);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var issue = await _ctx.PpeIssues.FindAsync(id);
        if (issue == null) return NotFound();
        _ctx.PpeIssues.Remove(issue);
        await _ctx.SaveChangesAsync();
        return NoContent();
    }
}
