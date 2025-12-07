using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExamsService.Data;
using ExamsService.DTOs;
using ExamsService.Entities;

namespace ExamsService.Controllers;

[ApiController]
[Route("api/training-exams")]
[Route("api/trainingexams")]
public class TrainingExamsController : ControllerBase
{
    private readonly ExamsDbContext _ctx;
    public TrainingExamsController(ExamsDbContext ctx) { _ctx = ctx; }

    // Link an exam to a training
    [HttpPost]
    public async Task<IActionResult> Link([FromBody] TrainingExamLinkDto dto)
    {
        var exists = await _ctx.TrainingExams.AnyAsync(x => x.TrainingId == dto.TrainingId && x.ExamId == dto.ExamId);
        if (exists) return Conflict("Training-Exam already linked");

        var te = new TrainingExam { TrainingId = dto.TrainingId, ExamId = dto.ExamId, Order = dto.Order };
        _ctx.TrainingExams.Add(te);
        await _ctx.SaveChangesAsync();
        return Created($"api/training-exams/{te.Id}", te);
    }

    // Get exams of a training
    [HttpGet("{trainingId}")]
    public async Task<IActionResult> GetByTraining(int trainingId)
    {
        var items = await _ctx.TrainingExams
            .Where(x => x.TrainingId == trainingId)
            .OrderBy(x => x.Order)
            .Join(_ctx.Exams, te => te.ExamId, e => e.Id, (te, e) => new {
                te.Id, te.TrainingId, te.ExamId, te.Order,
                ExamTitle = e.Title, e.DurationMinutes, e.PassScore, e.IsActive
            })
            .ToListAsync();
        return Ok(items);
    }

    // Get trainings linked to an exam
    [HttpGet("by-exam/{examId}")]
    public async Task<IActionResult> GetTrainingsByExam(int examId)
    {
        var items = await _ctx.TrainingExams
            .Where(x => x.ExamId == examId)
            .OrderBy(x => x.Order)
            .Select(x => new { x.Id, x.TrainingId, x.ExamId, x.Order, x.CreatedAt })
            .ToListAsync();
        return Ok(items);
    }

    // Unlink
    [HttpDelete("{trainingId}/{examId}")]
    public async Task<IActionResult> Unlink(int trainingId, int examId)
    {
        var te = await _ctx.TrainingExams.FirstOrDefaultAsync(x => x.TrainingId == trainingId && x.ExamId == examId);
        if (te == null) return NotFound();
        _ctx.TrainingExams.Remove(te);
        await _ctx.SaveChangesAsync();
        return NoContent();
    }

    // Reorder within a training
    [HttpPost("{trainingId}/reorder")]
    public async Task<IActionResult> Reorder(int trainingId, [FromBody] List<ReorderItemDto> items)
    {
        var map = items.ToDictionary(i => i.Id, i => i.Order);
        var list = await _ctx.TrainingExams.Where(x => x.TrainingId == trainingId).ToListAsync();
        foreach (var te in list)
        {
            if (map.TryGetValue(te.Id, out var ord)) te.Order = ord;
        }
        await _ctx.SaveChangesAsync();
        return Ok();
    }
}
