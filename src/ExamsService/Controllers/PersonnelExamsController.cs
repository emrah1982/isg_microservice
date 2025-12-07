using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExamsService.Data;

namespace ExamsService.Controllers;

[ApiController]
[Route("api/personnel-exams")]
public class PersonnelExamsController : ControllerBase
{
    private readonly ExamsDbContext _ctx;
    public PersonnelExamsController(ExamsDbContext ctx) { _ctx = ctx; }

    // GET api/personnel-exams/{personnelId}?userId=123
    [HttpGet("{personnelId}")]
    public async Task<IActionResult> GetPersonnelExams(int personnelId, [FromQuery] int? userId)
    {
        // assignments for personnel
        var assignments = await _ctx.PersonnelAssignments
            .Where(a => a.PersonnelId == personnelId)
            .ToListAsync();

        // pre-load exams
        var examIds = assignments.Select(a => a.ExamId).Distinct().ToList();
        var exams = await _ctx.Exams.Where(e => examIds.Contains(e.Id)).ToDictionaryAsync(e => e.Id);

        // attempts optionally filtered by user
        var attemptsQuery = _ctx.ExamAttempts.AsNoTracking().Where(at => examIds.Contains(at.ExamId));
        if (userId.HasValue)
            attemptsQuery = attemptsQuery.Where(at => at.UserId == userId.Value);

        var attempts = await attemptsQuery.ToListAsync();

        var grouped = attempts
            .GroupBy(a => a.ExamId)
            .ToDictionary(g => g.Key, g => new {
                attemptCount = g.Count(),
                lastAttemptAt = (DateTime?)g.Max(x => x.SubmittedAt ?? x.StartedAt),
                lastScore = g.OrderByDescending(x => x.SubmittedAt ?? x.StartedAt).FirstOrDefault()?.Score ?? 0,
                bestScore = g.Max(x => x.Score) // likely int? depending on Score
            });

        var result = assignments
            .OrderBy(a => a.AssignedAt)
            .Select(a => new {
                a.Id,
                a.PersonnelId,
                a.ExamId,
                a.TrainingId,
                a.AssignedAt,
                a.Status,
                ExamTitle = exams.TryGetValue(a.ExamId, out var ex) ? ex.Title : $"Exam #{a.ExamId}",
                PassScore = exams.TryGetValue(a.ExamId, out var ex2) ? ex2.PassScore : 70,
                // Ensure the anonymous type matches exactly: lastAttemptAt is DateTime? and bestScore is int?
                Stats = grouped.ContainsKey(a.ExamId)
                    ? grouped[a.ExamId]
                    : new { attemptCount = 0, lastAttemptAt = (DateTime?)null, lastScore = 0, bestScore = (int?)0 },
                Passed = grouped.ContainsKey(a.ExamId) && grouped[a.ExamId].bestScore >= (exams.TryGetValue(a.ExamId, out var ex3) ? ex3.PassScore : 70)
            });

        return Ok(result);
    }
}
