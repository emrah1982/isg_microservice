using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ActivitiesService.Data;
using ActivitiesService.Entities;
using System.Text.Json;

namespace ActivitiesService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ControlFormExecutionsController : ControllerBase
{
    private readonly ActivitiesDbContext _context;
    private readonly ILogger<ControlFormExecutionsController> _logger;

    public ControlFormExecutionsController(ActivitiesDbContext context, ILogger<ControlFormExecutionsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Test endpoint
    /// </summary>
    [HttpGet("test")]
    public ActionResult<string> Test()
    {
        return Ok("ControlFormExecutions API çalışıyor!");
    }

    /// <summary>
    /// Kontrol formu uygulamalarını listele
    /// </summary>
    [HttpGet]
    public async Task<ActionResult> GetControlFormExecutions()
    {
        try
        {
            var executions = await _context.ControlFormExecutions
                .OrderByDescending(e => e.ExecutionDate)
                .ToListAsync();

            return Ok(executions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting control form executions");
            return StatusCode(500, ex.Message);
        }
    }

    /// <summary>
    /// Belirli bir kontrol formu uygulamasını getir
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult> GetControlFormExecution(int id)
    {
        try
        {
            var execution = await _context.ControlFormExecutions.FindAsync(id);
            if (execution == null)
                return NotFound();

            return Ok(execution);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting control form execution");
            return StatusCode(500, ex.Message);
        }
    }

    /// <summary>
    /// Yeni kontrol formu uygulaması oluştur
    /// </summary>
    [HttpPost]
    public async Task<ActionResult> CreateControlFormExecution([FromBody] ControlFormExecution execution)
    {
        try
        {
            // Execution number oluştur
            var today = DateTime.Now.ToString("yyyyMMdd");
            var count = await _context.ControlFormExecutions
                .Where(e => e.ExecutionNumber.StartsWith($"EXE-{today}"))
                .CountAsync();
            
            execution.ExecutionNumber = $"EXE-{today}-{(count + 1):D3}";
            execution.CreatedAt = DateTime.UtcNow;
            execution.ExecutionDate = DateTime.UtcNow;
            execution.Status = "InProgress";
            
            // Şablondan kontrol maddelerini kopyala
            if (string.IsNullOrEmpty(execution.ChecklistResponsesJson) || execution.ChecklistResponsesJson == "[]")
            {
                var template = await _context.ControlFormTemplates.FindAsync(execution.ControlFormTemplateId);
                if (template != null && !string.IsNullOrEmpty(template.ChecklistItemsJson))
                {
                    try
                    {
                        var templateItems = JsonSerializer.Deserialize<List<JsonElement>>(template.ChecklistItemsJson);
                        var responses = templateItems?.Select((item, index) =>
                        {
                            item.TryGetProperty("isRequired", out JsonElement req);
                            item.TryGetProperty("responseType", out JsonElement type);
                            item.TryGetProperty("isCritical", out JsonElement crit);

                            return new
                            {
                                itemId = index + 1,
                                itemText = item.GetProperty("item").GetString(),
                                isRequired = req.ValueKind != JsonValueKind.Undefined && req.GetBoolean(),
                                responseType = type.ValueKind != JsonValueKind.Undefined ? type.GetString() : "checkbox",
                                booleanValue = (bool?)null,
                                textValue = "",
                                numberValue = (decimal?)null,
                                selectValue = "",
                                isCompliant = false,
                                isCritical = crit.ValueKind != JsonValueKind.Undefined && crit.GetBoolean(),
                                responseDate = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                                notes = ""
                            };
                        }).ToList();

                        execution.ChecklistResponsesJson = JsonSerializer.Serialize(responses);
                        _logger.LogInformation("Template items copied for execution. Items count: {Count}", responses?.Count ?? 0);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to parse template items for template {TemplateId}", execution.ControlFormTemplateId);
                        execution.ChecklistResponsesJson = "[]";
                    }
                }
                else
                {
                    _logger.LogWarning("Template {TemplateId} not found or has no checklist items", execution.ControlFormTemplateId);
                    execution.ChecklistResponsesJson = "[]";
                }
            }

            _context.ControlFormExecutions.Add(execution);
            await _context.SaveChangesAsync();

            return Ok(execution);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating control form execution");
            return StatusCode(500, ex.Message);
        }
    }

    /// <summary>
    /// Kontrol formu uygulamasını güncelle
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateControlFormExecution(int id, [FromBody] JsonElement payload)
    {
        try
        {
            _logger.LogInformation("Update request received for execution {Id}", id);
            string? status = null;
            string? notes = null;
            string? checklistJson = null;

            if (payload.ValueKind == JsonValueKind.Object)
            {
                if (payload.TryGetProperty("status", out var st) && st.ValueKind == JsonValueKind.String)
                    status = st.GetString();
                if (payload.TryGetProperty("notes", out var nt) && nt.ValueKind == JsonValueKind.String)
                    notes = nt.GetString();
                if (payload.TryGetProperty("checklistResponsesJson", out var cj))
                {
                    // checklistResponsesJson alanı string veya nesne/array olarak gelebilir
                    if (cj.ValueKind == JsonValueKind.String)
                        checklistJson = cj.GetString();
                    else
                        checklistJson = cj.GetRawText();
                }
            }
            _logger.LogInformation("Parsed payload: Status={Status}, NotesLen={NotesLen}, ChecklistLen={ChecklistLen}", 
                status, notes?.Length ?? 0, checklistJson?.Length ?? 0);

            var existing = await _context.ControlFormExecutions.FindAsync(id);
            if (existing == null)
            {
                _logger.LogWarning("Execution {Id} not found", id);
                return NotFound();
            }

            if (!string.IsNullOrWhiteSpace(status))
                existing.Status = status!;
            if (notes != null)
                existing.Notes = notes;
            if (!string.IsNullOrWhiteSpace(checklistJson))
                existing.ChecklistResponsesJson = checklistJson!;
            existing.UpdatedAt = DateTime.UtcNow;
            
            _logger.LogInformation("Updated execution {Id}: Status={Status}, ChecklistResponsesJson length={Length}", 
                id, existing.Status, existing.ChecklistResponsesJson?.Length ?? 0);
            
            if (existing.Status == "Completed")
                existing.CompletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            _logger.LogInformation("Execution {Id} updated successfully", id);
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating control form execution");
            return StatusCode(500, ex.Message);
        }
    }

    /// <summary>
    /// Kontrol formu uygulamasını sil
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteControlFormExecution(int id)
    {
        try
        {
            var execution = await _context.ControlFormExecutions.FindAsync(id);
            if (execution == null)
                return NotFound();

            _context.ControlFormExecutions.Remove(execution);
            await _context.SaveChangesAsync();
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting control form execution");
            return StatusCode(500, ex.Message);
        }
    }

    /// <summary>
    /// Çoklu makine için toplu kontrol formu uygulaması oluştur
    /// </summary>
    [HttpPost("bulk")]
    public async Task<ActionResult> CreateBulkExecutions([FromBody] BulkExecutionDto dto)
    {
        try
        {
            if (dto.MachineIds == null || dto.MachineIds.Count == 0)
                return BadRequest("En az bir makine seçilmelidir.");

            var executions = new List<ControlFormExecution>();
            var today = DateTime.Now.ToString("yyyyMMdd");
            
            // Bugünkü execution sayısını al
            var todayCount = await _context.ControlFormExecutions
                .Where(e => e.ExecutionNumber.StartsWith($"EXE-{today}"))
                .CountAsync();
            
            // Şablondan kontrol maddelerini al
            var template = await _context.ControlFormTemplates.FindAsync(dto.ControlFormTemplateId);
            string checklistResponsesJson = "[]";
            
            if (template != null && !string.IsNullOrEmpty(template.ChecklistItemsJson))
            {
                try
                {
                    var templateItems = JsonSerializer.Deserialize<List<JsonElement>>(template.ChecklistItemsJson);
                    var responses = templateItems?.Select((item, index) =>
                    {
                        item.TryGetProperty("isRequired", out JsonElement req);
                        item.TryGetProperty("responseType", out JsonElement type);
                        item.TryGetProperty("isCritical", out JsonElement crit);

                        return new
                        {
                            itemId = index + 1,
                            itemText = item.GetProperty("item").GetString(),
                            isRequired = req.ValueKind != JsonValueKind.Undefined && req.GetBoolean(),
                            responseType = type.ValueKind != JsonValueKind.Undefined ? type.GetString() : "checkbox",
                            booleanValue = (bool?)null,
                            textValue = "",
                            numberValue = (decimal?)null,
                            selectValue = "",
                            isCompliant = false,
                            isCritical = crit.ValueKind != JsonValueKind.Undefined && crit.GetBoolean(),
                            responseDate = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                            notes = ""
                        };
                    }).ToList();

                    checklistResponsesJson = JsonSerializer.Serialize(responses);
                    _logger.LogInformation("Template items copied for bulk execution. Items count: {Count}", responses?.Count ?? 0);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to parse template items for bulk execution template {TemplateId}", dto.ControlFormTemplateId);
                    checklistResponsesJson = "[]";
                }
            }
            
            for (int i = 0; i < dto.MachineIds.Count; i++)
            {
                var machineId = dto.MachineIds[i];
                var machine = await _context.Machines.FindAsync(machineId);
                
                var execution = new ControlFormExecution
                {
                    ControlFormTemplateId = dto.ControlFormTemplateId,
                    ExecutionNumber = $"EXE-{today}-{(todayCount + i + 1):D3}",
                    MachineId = machineId,
                    MachineName = machine?.Name ?? $"Makine-{machineId}",
                    MachineModel = machine?.Model,
                    MachineSerialNumber = machine?.SerialNumber,
                    Location = machine?.Location,
                    ExecutionDate = DateTime.UtcNow,
                    ExecutedByPersonName = dto.ExecutedByPersonName,
                    Status = "InProgress",
                    Notes = dto.Notes,
                    ChecklistResponsesJson = checklistResponsesJson,
                    CreatedAt = DateTime.UtcNow
                };
                
                executions.Add(execution);
            }
            
            _context.ControlFormExecutions.AddRange(executions);
            await _context.SaveChangesAsync();
            
            return Ok(new { 
                Message = $"{executions.Count} adet kontrol formu uygulaması oluşturuldu.",
                Executions = executions 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating bulk control form executions");
            return StatusCode(500, ex.Message);
        }
    }
}

public class UpdateControlFormExecutionDto
{
    public string? Status { get; set; }
    public string? Notes { get; set; }
    public string? ChecklistResponsesJson { get; set; }
}

public class BulkExecutionDto
{
    public int ControlFormTemplateId { get; set; }
    public List<int> MachineIds { get; set; } = new();
    public string? ExecutedByPersonName { get; set; }
    public string? Notes { get; set; }
}
