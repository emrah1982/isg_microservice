using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExamsService.Data;
using ExamsService.Entities;
using System.Text.Json;

namespace ExamsService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AssignmentsController : ControllerBase
{
    private readonly ExamsDbContext _ctx;
    public AssignmentsController(ExamsDbContext ctx) { _ctx = ctx; }

    public class CreateAssignmentDto
    {
        public int PersonnelId { get; set; }
        public int ExamId { get; set; }
        public int? TrainingId { get; set; }
        public string? AssignedBy { get; set; }
    }

    public class BulkAssignmentDto
    {
        public int ExamId { get; set; }
        public int? TrainingId { get; set; }
        public List<int> PersonnelIds { get; set; } = new();
        public string? AssignedBy { get; set; }
    }

    public class TitleBasedAssignmentDto
    {
        public int ExamId { get; set; }
        public int? TrainingId { get; set; }
        public string? Title { get; set; }
        public string? Department { get; set; }
        public string? AssignedBy { get; set; }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAssignmentDto dto)
    {
        var exists = await _ctx.PersonnelAssignments
            .AnyAsync(a => a.PersonnelId == dto.PersonnelId && a.ExamId == dto.ExamId && a.TrainingId == dto.TrainingId);
        if (exists) return Conflict("Assignment already exists");

        var entity = new PersonnelAssignment
        {
            PersonnelId = dto.PersonnelId,
            ExamId = dto.ExamId,
            TrainingId = dto.TrainingId,
            AssignedBy = dto.AssignedBy,
            AssignedAt = DateTime.UtcNow,
            Status = "assigned"
        };
        _ctx.PersonnelAssignments.Add(entity);
        await _ctx.SaveChangesAsync();
        return Created($"api/assignments/{entity.Id}", entity);
    }

    [HttpPost("bulk")]
    public async Task<IActionResult> Bulk([FromBody] BulkAssignmentDto dto)
    {
        var toInsert = new List<PersonnelAssignment>();
        foreach (var pid in dto.PersonnelIds.Distinct())
        {
            var exists = await _ctx.PersonnelAssignments.AnyAsync(a => a.PersonnelId == pid && a.ExamId == dto.ExamId && a.TrainingId == dto.TrainingId);
            if (!exists)
            {
                toInsert.Add(new PersonnelAssignment
                {
                    PersonnelId = pid,
                    ExamId = dto.ExamId,
                    TrainingId = dto.TrainingId,
                    AssignedBy = dto.AssignedBy,
                    AssignedAt = DateTime.UtcNow,
                    Status = "assigned"
                });
            }
        }
        if (toInsert.Count == 0) return Conflict("All assignments already exist");
        _ctx.PersonnelAssignments.AddRange(toInsert);
        await _ctx.SaveChangesAsync();
        return Ok(new { created = toInsert.Count });
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] int? personnelId, [FromQuery] int? examId, [FromQuery] int? trainingId)
    {
        var q = _ctx.PersonnelAssignments.AsNoTracking().AsQueryable();
        if (personnelId.HasValue) q = q.Where(a => a.PersonnelId == personnelId.Value);
        if (examId.HasValue) q = q.Where(a => a.ExamId == examId.Value);
        if (trainingId.HasValue) q = q.Where(a => a.TrainingId == trainingId.Value);
        var list = await q.OrderByDescending(a => a.AssignedAt).ToListAsync();
        return Ok(list);
    }

    public class AssignmentByTitleRow
    {
        public int ExamId { get; set; }
        public string ExamTitle { get; set; } = string.Empty;
        public string? Title { get; set; }
        public string? Department { get; set; }
        public int Count { get; set; }
    }

    [HttpGet("summary-by-title")]
    public async Task<IActionResult> SummaryByTitle([FromQuery] int? examId)
        => Ok(await BuildSummaryByTitleAsync(examId));

    // Some environments might mis-route GET; provide POST alias to avoid 405 surprises
    [HttpPost("summary-by-title")]
    public async Task<IActionResult> SummaryByTitlePost([FromBody] int? examId)
        => Ok(await BuildSummaryByTitleAsync(examId));

    private async Task<List<AssignmentByTitleRow>> BuildSummaryByTitleAsync(int? examId)
    {
        var q = _ctx.PersonnelAssignments.AsNoTracking().AsQueryable();
        if (examId.HasValue) q = q.Where(a => a.ExamId == examId.Value);

        var assignments = await q.OrderByDescending(a => a.AssignedAt).Take(1000).ToListAsync();
        if (assignments.Count == 0) return new List<AssignmentByTitleRow>();

        var examIds = assignments.Select(a => a.ExamId).Distinct().ToList();
        var exams = await _ctx.Exams.AsNoTracking().Where(e => examIds.Contains(e.Id)).ToDictionaryAsync(e => e.Id, e => e.Title);

        var personnelIds = assignments.Select(a => a.PersonnelId).Distinct().ToList();
        var http = new HttpClient();
        var details = new Dictionary<int, (string? Title, string? Department)>();
        foreach (var pid in personnelIds)
        {
            try
            {
                var resp = await http.GetAsync($"http://personnel-service:8089/api/personnel/{pid}");
                if (!resp.IsSuccessStatusCode) continue;
                var json = await resp.Content.ReadAsStringAsync();
                using var doc = System.Text.Json.JsonDocument.Parse(json);
                var root = doc.RootElement;
                var node = root.TryGetProperty("data", out var d) ? d : root;
                var t = node.TryGetProperty("title", out var tEl) ? tEl.GetString() : null;
                var dep = node.TryGetProperty("department", out var dEl) ? dEl.GetString() : null;
                details[pid] = (t, dep);
            }
            catch { /* ignore */ }
        }

        return assignments
            .Select(a => new {
                a.ExamId,
                ExamTitle = exams.TryGetValue(a.ExamId, out var et) ? et : $"Exam #{a.ExamId}",
                Title = details.TryGetValue(a.PersonnelId, out var info) ? info.Title : null,
                Department = details.TryGetValue(a.PersonnelId, out var info2) ? info2.Department : null
            })
            .GroupBy(x => new { x.ExamId, x.ExamTitle, x.Title, x.Department })
            .Select(g => new AssignmentByTitleRow
            {
                ExamId = g.Key.ExamId,
                ExamTitle = g.Key.ExamTitle,
                Title = g.Key.Title,
                Department = g.Key.Department,
                Count = g.Count()
            })
            .OrderBy(r => r.ExamTitle)
            .ThenBy(r => r.Title)
            .ThenBy(r => r.Department)
            .ToList();
    }

    [HttpPost("by-title")]
    public async Task<IActionResult> AssignByTitle([FromBody] TitleBasedAssignmentDto dto)
    {
        // Call PersonnelService to get personnel by title/department
        using var httpClient = new HttpClient();
        // Helper to call PersonnelService with fallback base URLs
        async Task<HttpResponseMessage> CallPersonnelAsync(string pathAndQuery)
        {
            var bases = new [] { "http://personnel-service:8089", "http://localhost:8089" };
            foreach (var b in bases)
            {
                try
                {
                    var resp = await httpClient.GetAsync($"{b}{pathAndQuery}");
                    if (resp.IsSuccessStatusCode) return resp;
                }
                catch { /* try next */ }
            }
            // Return last attempt result (may be error)
            return await httpClient.GetAsync($"{bases.Last()}{pathAndQuery}");
        }

        // Build main request (both filters if provided)
        string BuildQuery(string? t, string? d)
        {
            var q = new List<string>();
            if (!string.IsNullOrWhiteSpace(t)) q.Add($"title={Uri.EscapeDataString(t)}");
            if (!string.IsNullOrWhiteSpace(d)) q.Add($"department={Uri.EscapeDataString(d)}");
            return q.Count > 0 ? ("?" + string.Join("&", q)) : string.Empty;
        }

        var response = await CallPersonnelAsync("/api/personnel" + BuildQuery(dto.Title, dto.Department));
        if (!response.IsSuccessStatusCode) return BadRequest("Personnel service unavailable");
        
        var personnelJson = await response.Content.ReadAsStringAsync();
        // Support both array and { data: [...] }
        List<PersonnelDto>? personnel = null;
        try
        {
            if (personnelJson.TrimStart().StartsWith("["))
            {
                personnel = JsonSerializer.Deserialize<List<PersonnelDto>>(personnelJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }
            else
            {
                using var doc = JsonDocument.Parse(personnelJson);
                var root = doc.RootElement;
                if (root.TryGetProperty("data", out var dataEl) && dataEl.ValueKind == JsonValueKind.Array)
                {
                    personnel = JsonSerializer.Deserialize<List<PersonnelDto>>(dataEl.GetRawText(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                }
            }
        }
        catch { /* will handle below if null */ }

        if (personnel == null) personnel = new List<PersonnelDto>();

        // If both title and department provided, also compute partial matches (matched by any, but not both)
        var notMatchedPersonnel = new List<PersonnelDto>();
        if (!string.IsNullOrWhiteSpace(dto.Title) && !string.IsNullOrWhiteSpace(dto.Department))
        {
            // title-only
            var respTitleOnly = await CallPersonnelAsync("/api/personnel" + BuildQuery(dto.Title, null));
            var jsonTitleOnly = await respTitleOnly.Content.ReadAsStringAsync();
            var titleOnly = new List<PersonnelDto>();
            try
            {
                if (jsonTitleOnly.TrimStart().StartsWith("["))
                    titleOnly = JsonSerializer.Deserialize<List<PersonnelDto>>(jsonTitleOnly, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new();
                else
                {
                    using var doc = JsonDocument.Parse(jsonTitleOnly);
                    if (doc.RootElement.TryGetProperty("data", out var dataEl) && dataEl.ValueKind == JsonValueKind.Array)
                        titleOnly = JsonSerializer.Deserialize<List<PersonnelDto>>(dataEl.GetRawText(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new();
                }
            }
            catch { }

            // department-only
            var respDeptOnly = await CallPersonnelAsync("/api/personnel" + BuildQuery(null, dto.Department));
            var jsonDeptOnly = await respDeptOnly.Content.ReadAsStringAsync();
            var deptOnly = new List<PersonnelDto>();
            try
            {
                if (jsonDeptOnly.TrimStart().StartsWith("["))
                    deptOnly = JsonSerializer.Deserialize<List<PersonnelDto>>(jsonDeptOnly, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new();
                else
                {
                    using var doc = JsonDocument.Parse(jsonDeptOnly);
                    if (doc.RootElement.TryGetProperty("data", out var dataEl) && dataEl.ValueKind == JsonValueKind.Array)
                        deptOnly = JsonSerializer.Deserialize<List<PersonnelDto>>(dataEl.GetRawText(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new();
                }
            }
            catch { }

            // main list requires both filters (intersection). partial = (titleOnly U deptOnly) - personnel
            var mainIds = new HashSet<int>(personnel.Select(x => x.Id));
            var unionIds = new Dictionary<int, PersonnelDto>();
            foreach (var p in titleOnly) unionIds[p.Id] = p;
            foreach (var p in deptOnly) unionIds[p.Id] = p;
            foreach (var kv in unionIds)
            {
                if (!mainIds.Contains(kv.Key)) notMatchedPersonnel.Add(kv.Value);
            }
        }

        if (personnel.Count == 0 && notMatchedPersonnel.Count == 0)
            return NotFound("No personnel found with specified criteria");
        
        var toInsert = new List<PersonnelAssignment>();
        var assignedPersonnel = new List<PersonnelDto>();
        var alreadyAssignedPersonnel = new List<PersonnelDto>();
        foreach (var p in personnel)
        {
            var exists = await _ctx.PersonnelAssignments.AnyAsync(a => a.PersonnelId == p.Id && a.ExamId == dto.ExamId && a.TrainingId == dto.TrainingId);
            if (!exists)
            {
                toInsert.Add(new PersonnelAssignment
                {
                    PersonnelId = p.Id,
                    ExamId = dto.ExamId,
                    TrainingId = dto.TrainingId,
                    AssignedBy = dto.AssignedBy,
                    AssignedAt = DateTime.UtcNow,
                    Status = "assigned"
                });
                assignedPersonnel.Add(p);
            }
            else
            {
                alreadyAssignedPersonnel.Add(p);
            }
        }
        
        if (toInsert.Count > 0)
        {
            _ctx.PersonnelAssignments.AddRange(toInsert);
            await _ctx.SaveChangesAsync();
        }
        
        return Ok(new { 
            totalFound = personnel.Count, 
            assigned = toInsert.Count, 
            alreadyAssigned = alreadyAssignedPersonnel.Count,
            assignedPersonnel,
            alreadyAssignedPersonnel,
            notMatchedPersonnel
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var a = await _ctx.PersonnelAssignments.FindAsync(id);
        if (a == null) return NotFound();
        _ctx.PersonnelAssignments.Remove(a);
        await _ctx.SaveChangesAsync();
        return NoContent();
    }

    public class PersonnelDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? Title { get; set; }
        public string? Department { get; set; }
    }
}
