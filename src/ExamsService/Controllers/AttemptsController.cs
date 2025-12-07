using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExamsService.Data;
using ExamsService.DTOs;
using ExamsService.Entities;

namespace ExamsService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AttemptsController : ControllerBase
{
    private readonly ExamsDbContext _ctx;
    public AttemptsController(ExamsDbContext ctx) { _ctx = ctx; }

    [HttpPost("start/{examId}")]
    public async Task<IActionResult> Start(int examId, [FromBody] StartAttemptDto dto)
    {
        var exists = await _ctx.Exams.AsNoTracking().AnyAsync(e => e.Id == examId);
        if (!exists) return NotFound("Exam not found");
        var attempt = new ExamAttempt { ExamId = examId, UserId = dto.UserId, StartedAt = DateTime.UtcNow };
        _ctx.ExamAttempts.Add(attempt);
        await _ctx.SaveChangesAsync();
        return Ok(new { attemptId = attempt.Id });
    }

    [HttpPost("{attemptId}/answer")]
    public async Task<IActionResult> Answer(int attemptId, [FromBody] AnswerDto dto)
    {
        var attempt = await _ctx.ExamAttempts.FindAsync(attemptId);
        if (attempt == null) return NotFound("Attempt not found");

        // Validate question belongs to exam and option belongs to question
        var question = await _ctx.Questions.AsNoTracking().FirstOrDefaultAsync(q => q.Id == dto.QuestionId && q.ExamId == attempt.ExamId);
        if (question == null) return BadRequest("Question does not belong to the exam");
        var option = await _ctx.Options.AsNoTracking().FirstOrDefaultAsync(o => o.Id == dto.SelectedOptionId && o.QuestionId == question.Id);
        if (option == null) return BadRequest("Option does not belong to the question");

        // Upsert answer for the question
        var existing = await _ctx.ExamAnswers.FirstOrDefaultAsync(a => a.AttemptId == attemptId && a.QuestionId == dto.QuestionId);
        if (existing == null)
        {
            existing = new ExamAnswer
            {
                AttemptId = attemptId,
                QuestionId = dto.QuestionId,
                SelectedOptionId = dto.SelectedOptionId,
                IsCorrect = option.IsCorrect
            };
            _ctx.ExamAnswers.Add(existing);
        }
        else
        {
            existing.SelectedOptionId = dto.SelectedOptionId;
            existing.IsCorrect = option.IsCorrect;
        }

        await _ctx.SaveChangesAsync();
        return Ok();
    }

    [HttpPost("{attemptId}/submit")]
    public async Task<IActionResult> Submit(int attemptId)
    {
        var attempt = await _ctx.ExamAttempts.FirstOrDefaultAsync(a => a.Id == attemptId);
        if (attempt == null) return NotFound("Attempt not found");
        if (attempt.SubmittedAt != null) return BadRequest("Attempt already submitted");

        var exam = await _ctx.Exams.AsNoTracking().FirstOrDefaultAsync(e => e.Id == attempt.ExamId);
        if (exam == null) return NotFound("Exam not found");

        var totalQuestions = await _ctx.Questions.AsNoTracking().CountAsync(q => q.ExamId == exam.Id);
        var correctCount = await _ctx.ExamAnswers.AsNoTracking().CountAsync(a => a.AttemptId == attemptId && a.IsCorrect);
        var score = totalQuestions > 0 ? (int)Math.Round((double)correctCount * 100.0 / totalQuestions) : 0;
        var passed = score >= exam.PassScore;

        attempt.Score = score;
        attempt.Passed = passed;
        attempt.SubmittedAt = DateTime.UtcNow;
        await _ctx.SaveChangesAsync();

        return Ok(new { score, passed, totalQuestions, correctCount });
    }

    [HttpGet("{attemptId}")]
    public async Task<IActionResult> GetAttempt(int attemptId)
    {
        var attempt = await _ctx.ExamAttempts
            .Include(a => a.Answers)
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == attemptId);
        if (attempt == null) return NotFound();
        return Ok(new
        {
            attempt.Id,
            attempt.ExamId,
            attempt.UserId,
            attempt.StartedAt,
            attempt.SubmittedAt,
            attempt.Score,
            attempt.Passed,
            Answers = attempt.Answers.Select(a => new { a.QuestionId, a.SelectedOptionId, a.IsCorrect })
        });
    }
}
