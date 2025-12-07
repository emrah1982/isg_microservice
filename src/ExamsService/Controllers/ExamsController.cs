using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExamsService.Data;
using ExamsService.DTOs;
using ExamsService.Entities;

namespace ExamsService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExamsController : ControllerBase
{
    private readonly ExamsDbContext _ctx;
    public ExamsController(ExamsDbContext ctx) { _ctx = ctx; }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExamResponseDto>>> GetAll()
    {
        var exams = await _ctx.Exams.AsNoTracking().OrderByDescending(x => x.Id).ToListAsync();
        var result = exams.Select(MapExam);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ExamResponseDto>> GetById(int id)
    {
        var exam = await _ctx.Exams
            .Include(e => e.Questions.OrderBy(q => q.Order))
            .ThenInclude(q => q.Options.OrderBy(o => o.Order))
            .FirstOrDefaultAsync(e => e.Id == id);
        if (exam == null) return NotFound();
        return Ok(MapExam(exam));
    }

    [HttpPost]
    public async Task<ActionResult<ExamResponseDto>> Create([FromBody] ExamCreateDto dto)
    {
        var exam = new Exam
        {
            Title = dto.Title,
            Description = dto.Description,
            DurationMinutes = dto.DurationMinutes,
            PassScore = dto.PassScore,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        foreach (var (qDto, idx) in dto.Questions.Select((q, i) => (q, i)))
        {
            var q = new Question { Text = qDto.Text, Order = qDto.Order > 0 ? qDto.Order : idx };
            foreach (var (oDto, oi) in qDto.Options.Select((o, i) => (o, i)))
            {
                q.Options.Add(new Option { Text = oDto.Text, IsCorrect = oDto.IsCorrect, Order = oDto.Order > 0 ? oDto.Order : oi });
            }
            exam.Questions.Add(q);
        }

        _ctx.Exams.Add(exam);
        await _ctx.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = exam.Id }, MapExam(exam));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ExamResponseDto>> Update(int id, [FromBody] ExamCreateDto dto)
    {
        var exam = await _ctx.Exams.Include(e => e.Questions).ThenInclude(q => q.Options).FirstOrDefaultAsync(e => e.Id == id);
        if (exam == null) return NotFound();

        exam.Title = dto.Title;
        exam.Description = dto.Description;
        exam.DurationMinutes = dto.DurationMinutes;
        exam.PassScore = dto.PassScore;
        exam.IsActive = dto.IsActive;
        exam.UpdatedAt = DateTime.UtcNow;

        // Basit strateji: Mevcut soru/şıkları temizleyip yeniden oluştur (ileri optimizasyon sonra)
        _ctx.Options.RemoveRange(exam.Questions.SelectMany(q => q.Options));
        _ctx.Questions.RemoveRange(exam.Questions);
        exam.Questions.Clear();
        foreach (var (qDto, idx) in dto.Questions.Select((q, i) => (q, i)))
        {
            var q = new Question { Text = qDto.Text, Order = qDto.Order > 0 ? qDto.Order : idx };
            foreach (var (oDto, oi) in qDto.Options.Select((o, i) => (o, i)))
            {
                q.Options.Add(new Option { Text = oDto.Text, IsCorrect = oDto.IsCorrect, Order = oDto.Order > 0 ? oDto.Order : oi });
            }
            exam.Questions.Add(q);
        }

        await _ctx.SaveChangesAsync();
        return Ok(MapExam(exam));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var exam = await _ctx.Exams.FindAsync(id);
        if (exam == null) return NotFound();
        _ctx.Exams.Remove(exam);
        await _ctx.SaveChangesAsync();
        return NoContent();
    }

    // Reorder questions within an exam
    [HttpPost("{id}/reorder-questions")]
    public async Task<IActionResult> ReorderQuestions(int id, [FromBody] List<ReorderItemDto> items)
    {
        var questions = await _ctx.Questions.Where(q => q.ExamId == id).ToListAsync();
        foreach (var item in items)
        {
            var q = questions.FirstOrDefault(x => x.Id == item.Id);
            if (q != null) q.Order = item.Order;
        }
        await _ctx.SaveChangesAsync();
        return Ok();
    }

    // Reorder options within a question
    [HttpPost("questions/{questionId}/reorder-options")]
    public async Task<IActionResult> ReorderOptions(int questionId, [FromBody] List<ReorderItemDto> items)
    {
        var options = await _ctx.Options.Where(o => o.QuestionId == questionId).ToListAsync();
        foreach (var item in items)
        {
            var o = options.FirstOrDefault(x => x.Id == item.Id);
            if (o != null) o.Order = item.Order;
        }
        await _ctx.SaveChangesAsync();
        return Ok();
    }

    // Move an option to another question and/or reorder
    public class MoveOptionDto { public int OptionId { get; set; } public int TargetQuestionId { get; set; } public int Order { get; set; } }

    [HttpPost("options/move")]
    public async Task<IActionResult> MoveOption([FromBody] MoveOptionDto dto)
    {
        var opt = await _ctx.Options.FirstOrDefaultAsync(o => o.Id == dto.OptionId);
        if (opt == null) return NotFound();
        opt.QuestionId = dto.TargetQuestionId;
        opt.Order = dto.Order;
        await _ctx.SaveChangesAsync();
        return Ok();
    }

    private static ExamResponseDto MapExam(Exam exam)
    {
        return new ExamResponseDto
        {
            Id = exam.Id,
            Title = exam.Title,
            Description = exam.Description,
            DurationMinutes = exam.DurationMinutes,
            PassScore = exam.PassScore,
            IsActive = exam.IsActive,
            CreatedAt = exam.CreatedAt,
            UpdatedAt = exam.UpdatedAt,
            Questions = exam.Questions
                .OrderBy(q => q.Order)
                .Select(q => new QuestionResponseDto
                {
                    Id = q.Id,
                    Text = q.Text,
                    Order = q.Order,
                    Options = q.Options
                        .OrderBy(o => o.Order)
                        .Select(o => new OptionResponseDto { Id = o.Id, Text = o.Text, IsCorrect = o.IsCorrect, Order = o.Order })
                        .ToList()
                })
                .ToList()
        };
    }
}
