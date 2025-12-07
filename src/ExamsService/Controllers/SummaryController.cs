using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExamsService.Data;
using System.Text.Json;

namespace ExamsService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SummaryController : ControllerBase
{
    private readonly ExamsDbContext _ctx;
    public SummaryController(ExamsDbContext ctx) { _ctx = ctx; }

    public class AssignmentByTitleRow
    {
        public int ExamId { get; set; }
        public string ExamTitle { get; set; } = string.Empty;
        public string? Title { get; set; }
        public string? Department { get; set; }
        public int Count { get; set; }
    }

    [HttpGet("assignments-by-title")]
    public async Task<IActionResult> GetAssignmentsByTitle([FromQuery] int? examId)
    {
        var q = _ctx.PersonnelAssignments.AsNoTracking().AsQueryable();
        if (examId.HasValue) q = q.Where(a => a.ExamId == examId.Value);

        var assignments = await q.OrderByDescending(a => a.AssignedAt).Take(1000).ToListAsync();
        if (assignments.Count == 0) return Ok(new List<AssignmentByTitleRow>());

        var examIds = assignments.Select(a => a.ExamId).Distinct().ToList();
        var exams = await _ctx.Exams.AsNoTracking().Where(e => examIds.Contains(e.Id)).ToDictionaryAsync(e => e.Id, e => e.Title);

        var personnelIds = assignments.Select(a => a.PersonnelId).Distinct().ToList();
        var http = new HttpClient();
        var details = new Dictionary<int, (string? Title, string? Department)>();
        
        // Fetch personnel details in bulk to avoid N+1 queries
        if (personnelIds.Count > 0)
        {
            try
            {
                // Try Docker service DNS first, then localhost as fallback
                var baseUrls = new [] { "http://personnel-service:8089", "http://localhost:8089" };
                HttpResponseMessage? resp = null;
                foreach (var b in baseUrls)
                {
                    try
                    {
                        resp = await http.GetAsync($"{b}/api/personnel");
                        if (resp.IsSuccessStatusCode) break;
                    }
                    catch { /* try next */ }
                }
                if (resp == null) throw new Exception("PersonnelService not reachable");
                if (resp.IsSuccessStatusCode)
                {
                    var json = await resp.Content.ReadAsStringAsync();
                    using var doc = System.Text.Json.JsonDocument.Parse(json);
                    var root = doc.RootElement;
                    
                    // PersonnelService returns { data: [...], total: N, page: 1, pageSize: 50 }
                    Console.WriteLine($"Personnel API response: {json}");
                    if (root.TryGetProperty("data", out var dataEl) && dataEl.ValueKind == JsonValueKind.Array)
                    {
                        Console.WriteLine($"Found {dataEl.GetArrayLength()} personnel records");
                        foreach (var person in dataEl.EnumerateArray())
                        {
                            if (person.TryGetProperty("id", out var idEl))
                            {
                                var pid = idEl.GetInt32();
                                Console.WriteLine($"Processing personnel ID: {pid}");
                                if (personnelIds.Contains(pid))
                                {
                                    var t = person.TryGetProperty("title", out var tEl) ? tEl.GetString() : null;
                                    var dep = person.TryGetProperty("department", out var dEl) ? dEl.GetString() : null;
                                    Console.WriteLine($"Personnel {pid}: title='{t}', department='{dep}'");
                                    details[pid] = (t, dep);
                                }
                            }
                        }
                    }
                    Console.WriteLine($"Final details dictionary has {details.Count} entries");
                }
            }
            catch (Exception ex)
            {
                // Log the error for debugging
                Console.WriteLine($"Failed to fetch personnel details: {ex.Message}");
                Console.WriteLine($"Personnel IDs needed: [{string.Join(", ", personnelIds)}]");
            }
        }

        // Fallback for any missing personnel details: fetch individually
        if (personnelIds.Count > 0)
        {
            var missing = personnelIds.Where(pid => !details.ContainsKey(pid)).ToList();
            if (missing.Count > 0)
            {
                var baseUrls = new [] { "http://personnel-service:8089", "http://localhost:8089" };
                foreach (var pid in missing)
                {
                    foreach (var b in baseUrls)
                    {
                        try
                        {
                            var resp = await http.GetAsync($"{b}/api/personnel/{pid}");
                            if (!resp.IsSuccessStatusCode) continue;
                            var json = await resp.Content.ReadAsStringAsync();
                            using var doc = System.Text.Json.JsonDocument.Parse(json);
                            var root = doc.RootElement;
                            var node = root.TryGetProperty("data", out var d) ? d : root;
                            var t = node.TryGetProperty("title", out var tEl) ? tEl.GetString() : null;
                            var dep = node.TryGetProperty("department", out var dEl) ? dEl.GetString() : null;
                            details[pid] = (t, dep);
                            break;
                        }
                        catch { /* try next base url */ }
                    }
                }
            }
        }

        var grouped = assignments
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

        return Ok(grouped);
    }
}
