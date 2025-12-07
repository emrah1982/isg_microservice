using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PPEService.Data;
using PPEService.Entities;
using System.Text.Json;

namespace PPEService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PpeAssignmentsController : ControllerBase
{
    private readonly PpeDbContext _ctx;
    private readonly HttpClient _http;
    public PpeAssignmentsController(PpeDbContext ctx)
    {
        _ctx = ctx;
        _http = new HttpClient();
    }

    private async Task<Dictionary<int, PersonnelDto>> FetchPersonnelByIdsAsync(IEnumerable<int> ids)
    {
        var idList = ids.Distinct().ToList();
        var result = new Dictionary<int, PersonnelDto>();
        if (idList.Count == 0) return result;
        var qs = string.Join(',', idList);
        var bases = new[] { "http://personnel-service:8089", "http://localhost:8089" };
        foreach (var b in bases)
        {
            try
            {
                var resp = await _http.GetAsync($"{b}/api/personnel/by-ids?ids={Uri.EscapeDataString(qs)}");
                if (!resp.IsSuccessStatusCode) continue;
                var json = await resp.Content.ReadAsStringAsync();
                List<PersonnelDto>? list = null;
                if (json.TrimStart().StartsWith("["))
                {
                    list = JsonSerializer.Deserialize<List<PersonnelDto>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                }
                else
                {
                    using var doc = JsonDocument.Parse(json);
                    if (doc.RootElement.TryGetProperty("data", out var dataEl) && dataEl.ValueKind == JsonValueKind.Array)
                    {
                        list = JsonSerializer.Deserialize<List<PersonnelDto>>(dataEl.GetRawText(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    }
                }
                foreach (var p in list ?? new()) result[p.Id] = p;
                break;
            }
            catch { }
        }
        return result;
    }

    public class EnrichedAssignment
    {
        public int Id { get; set; }
        public int PersonnelId { get; set; }
        public string? PersonnelName { get; set; }
        public string? Title { get; set; }
        public string? Department { get; set; }
        public int PpeItemId { get; set; }
        public string? ItemName { get; set; }
        public int Quantity { get; set; }
        public DateTime AssignedAt { get; set; }
        public string? AssignedBy { get; set; }
        public string Status { get; set; } = "assigned";
        public DateTime? DueDate { get; set; }
        public DateTime? ReturnedAt { get; set; }
    }

    public class PersonnelDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? Title { get; set; }
        public string? Department { get; set; }
    }

    [HttpGet("enriched")]
    public async Task<IActionResult> ListEnriched([FromQuery] int? personnelId)
    {
        var q = _ctx.PpeAssignments.AsNoTracking().AsQueryable();
        if (personnelId.HasValue) q = q.Where(x => x.PersonnelId == personnelId.Value);
        var rows = await q.OrderByDescending(x => x.AssignedAt).Take(1000).ToListAsync();
        if (rows.Count == 0) return Ok(Array.Empty<EnrichedAssignment>());

        var itemIds = rows.Select(r => r.PpeItemId).Distinct().ToList();
        var items = await _ctx.PpeItems.AsNoTracking().Where(i => itemIds.Contains(i.Id)).ToDictionaryAsync(i => i.Id, i => i.Name);

        var personnelIds = rows.Select(r => r.PersonnelId).Distinct().ToList();
        var people = await FetchPersonnelByIdsAsync(personnelIds);

        var list = rows.Select(r => new EnrichedAssignment
        {
            Id = r.Id,
            PersonnelId = r.PersonnelId,
            PersonnelName = people.TryGetValue(r.PersonnelId, out var p) ? ($"{p.FirstName} {p.LastName}") : null,
            Title = people.TryGetValue(r.PersonnelId, out var p1) ? p1.Title : null,
            Department = people.TryGetValue(r.PersonnelId, out var p2) ? p2.Department : null,
            PpeItemId = r.PpeItemId,
            ItemName = items.TryGetValue(r.PpeItemId, out var nm) ? nm : null,
            Quantity = r.Quantity,
            AssignedAt = r.AssignedAt,
            AssignedBy = r.AssignedBy,
            Status = r.Status,
            DueDate = r.DueDate,
            ReturnedAt = r.ReturnedAt
        }).ToList();

        return Ok(list);
    }
    private async Task<bool> PersonnelExistsAsync(int personnelId)
    {
        var bases = new[] { "http://personnel-service:8089", "http://localhost:8089" };
        foreach (var b in bases)
        {
            try
            {
                var resp = await _http.GetAsync($"{b}/api/personnel/{personnelId}");
                if (resp.IsSuccessStatusCode) return true;
            }
            catch { }
        }
        return false;
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] int? personnelId, [FromQuery] int? itemId)
    {
        var q = _ctx.PpeAssignments.AsNoTracking().AsQueryable();
        if (personnelId.HasValue) q = q.Where(x => x.PersonnelId == personnelId.Value);
        if (itemId.HasValue) q = q.Where(x => x.PpeItemId == itemId.Value);
        var rows = await q.OrderByDescending(x => x.AssignedAt).ToListAsync();
        return Ok(rows);
    }

    public class CreateAssignmentDto
    {
        public int PersonnelId { get; set; }
        public int PpeItemId { get; set; }
        public int Quantity { get; set; } = 1;
        public DateTime? DueDate { get; set; }
        public string? AssignedBy { get; set; }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAssignmentDto dto)
    {
        // validate item
        var item = await _ctx.PpeItems.FirstOrDefaultAsync(x => x.Id == dto.PpeItemId && x.IsActive);
        if (item == null) return BadRequest("PPE item not found or inactive");
        // validate personnel via PersonnelService
        var ok = await PersonnelExistsAsync(dto.PersonnelId);
        if (!ok) return BadRequest("Personnel not found");

        var qty = Math.Max(1, dto.Quantity);
        if (item.StockQuantity < qty)
            return BadRequest($"Insufficient stock. Available: {item.StockQuantity}");

        using var tx = await _ctx.Database.BeginTransactionAsync();
        try
        {
            // decrement stock
            item.StockQuantity -= qty;
            await _ctx.SaveChangesAsync();

            var entity = new PpeAssignment
            {
                PersonnelId = dto.PersonnelId,
                PpeItemId = dto.PpeItemId,
                Quantity = qty,
                AssignedAt = DateTime.UtcNow,
                AssignedBy = dto.AssignedBy,
                DueDate = dto.DueDate,
                Status = "assigned"
            };
            _ctx.PpeAssignments.Add(entity);
            await _ctx.SaveChangesAsync();

            await tx.CommitAsync();
            return Created($"api/ppeassignments/{entity.Id}", entity);
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    [HttpPut("{id}/return")]
    public async Task<IActionResult> MarkReturned(int id)
    {
        var a = await _ctx.PpeAssignments.FirstOrDefaultAsync(x => x.Id == id);
        if (a == null) return NotFound();
        if (a.Status == "returned") return Ok(a); // idempotent

        using var tx = await _ctx.Database.BeginTransactionAsync();
        try
        {
            // increment stock back
            var item = await _ctx.PpeItems.FirstOrDefaultAsync(x => x.Id == a.PpeItemId);
            if (item != null)
            {
                item.StockQuantity += Math.Max(1, a.Quantity);
            }

            a.Status = "returned";
            a.ReturnedAt = DateTime.UtcNow;
            await _ctx.SaveChangesAsync();
            await tx.CommitAsync();
            return Ok(a);
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var a = await _ctx.PpeAssignments.FindAsync(id);
        if (a == null) return NotFound();
        _ctx.PpeAssignments.Remove(a);
        await _ctx.SaveChangesAsync();
        return NoContent();
    }
}
