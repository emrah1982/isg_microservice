using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using IncidentsService.Data;
using IncidentsService.DTOs;
using Shared.DTOs;
using System.Linq;

namespace IncidentsService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IncidentsController : ControllerBase
{
    private readonly IncidentsDbContext _context;
    private readonly ILogger<IncidentsController> _logger;

    public IncidentsController(IncidentsDbContext context, ILogger<IncidentsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // Returns distinct action descriptions for dropdown suggestions
    [HttpGet("actions/descriptions")]
    public async Task<ActionResult<ApiResponse<IEnumerable<string>>>> GetActionDescriptions()
    {
        try
        {
            var list = await _context.IncidentActions
                .AsNoTracking()
                .Select(a => a.ActionDescription)
                .Where(s => s != null && s != "")
                .Distinct()
                .OrderBy(s => s)
                .ToListAsync();
            return Ok(ApiResponse<IEnumerable<string>>.SuccessResponse(list));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Action descriptions fetch error");
            return StatusCode(500, ApiResponse<IEnumerable<string>>.ErrorResponse($"Hata: {ex.Message}"));
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<IncidentResponseDto>>> GetById(int id)
    {
        try
        {
            var e = await _context.Incidents.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            if (e == null)
                return NotFound(ApiResponse<IncidentResponseDto>.ErrorResponse("Olay bulunamadı"));

            var res = new IncidentResponseDto
            {
                Id = e.Id,
                Title = e.Title,
                Description = e.Description,
                IncidentDate = e.IncidentDate,
                Type = "",
                Severity = e.Severity,
                Location = e.Location,
                ReportedBy = e.ReportedBy,
                ReportedByName = null,
                InvolvedPersonId = null,
                InvolvedPersonName = null,
                Status = e.Status,
                InvestigationStartDate = null,
                InvestigationEndDate = null,
                RootCause = null,
                CorrectiveActions = null,
                RequiresReporting = false,
                ReportingDeadline = null,
                CreatedAt = e.CreatedAt,
                Witnesses = new()
            };

            return Ok(ApiResponse<IncidentResponseDto>.SuccessResponse(res));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Olay getirme hatası");
            return StatusCode(500, ApiResponse<IncidentResponseDto>.ErrorResponse($"Getirme hatası: {ex.Message}"));
        }
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<IncidentResponseDto>>>> GetAll()
    {
        try
        {
            var list = await _context.Incidents
                .AsNoTracking()
                .OrderByDescending(i => i.CreatedAt)
                .Select(i => new IncidentResponseDto
                {
                    Id = i.Id,
                    Title = i.Title,
                    Description = i.Description,
                    IncidentDate = i.IncidentDate,
                    Type = "",
                    Severity = i.Severity,
                    Location = i.Location,
                    ReportedBy = i.ReportedBy,
                    ReportedByName = null,
                    InvolvedPersonId = null,
                    InvolvedPersonName = null,
                    Status = i.Status,
                    InvestigationStartDate = null,
                    InvestigationEndDate = null,
                    RootCause = null,
                    CorrectiveActions = null,
                    RequiresReporting = false,
                    ReportingDeadline = null,
                    CreatedAt = i.CreatedAt,
                    Witnesses = new()
                })
                .ToListAsync();

            return Ok(ApiResponse<IEnumerable<IncidentResponseDto>>.SuccessResponse(list));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Olayları listeleme hatası");
            return StatusCode(500, ApiResponse<IEnumerable<IncidentResponseDto>>.ErrorResponse($"Listeleme hatası: {ex.Message}"));
        }
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<IncidentResponseDto>>> Create([FromBody] IncidentCreateDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse<IncidentResponseDto>.ErrorResponse("Geçersiz veri", errors));
            }

            // Resolve ReportedBy (DB requires NOT NULL). Use authenticated user id if available, otherwise fallback to 1.
            int? reportedBy = null;
            var userIdClaim = User?.FindFirst("userId")?.Value ?? User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out var parsed))
            {
                reportedBy = parsed;
            }

            var entity = new IncidentsService.Entities.Incident
            {
                Title = dto.Title,
                Description = dto.Description,
                IncidentDate = dto.IncidentDate,
                // Type column is not present in SQL schema; it's ignored in model
                Severity = dto.Severity,
                Location = dto.Location,
                Status = "Open",
                ReportedBy = reportedBy ?? 1, // NOT NULL in DB schema
                InvolvedPersonId = null, // ignored in model configuration
                RootCause = null,
                CorrectiveActions = null,
                RequiresReporting = false,
                ReportingDeadline = null,
            };

            _context.Incidents.Add(entity);
            await _context.SaveChangesAsync();

            var res = new IncidentResponseDto
            {
                Id = entity.Id,
                Title = entity.Title,
                Description = entity.Description,
                IncidentDate = entity.IncidentDate,
                Type = "",
                Severity = entity.Severity,
                Location = entity.Location,
                ReportedBy = entity.ReportedBy,
                ReportedByName = null,
                InvolvedPersonId = null,
                InvolvedPersonName = null,
                Status = entity.Status,
                InvestigationStartDate = null,
                InvestigationEndDate = null,
                RootCause = null,
                CorrectiveActions = null,
                RequiresReporting = false,
                ReportingDeadline = null,
                CreatedAt = entity.CreatedAt,
                Witnesses = new()
            };

            return Ok(ApiResponse<IncidentResponseDto>.SuccessResponse(res, "Olay oluşturuldu"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Olay oluşturma hatası");
            return StatusCode(500, ApiResponse<IncidentResponseDto>.ErrorResponse($"Oluşturma hatası: {ex.Message}"));
        }
    }
}
