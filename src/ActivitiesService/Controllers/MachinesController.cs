using ActivitiesService.Data;
using ActivitiesService.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ActivitiesService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MachinesController : ControllerBase
{
    private readonly ActivitiesDbContext _db;

    public MachinesController(ActivitiesDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Tüm makineleri listele (arama ve filtreleme destekli)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? q, [FromQuery] string? status, [FromQuery] string? machineType)
    {
        var query = _db.Machines.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(q))
        {
            var search = q.ToLower();
            query = query.Where(m =>
                m.Name.ToLower().Contains(search) ||
                (m.Model != null && m.Model.ToLower().Contains(search)) ||
                (m.SerialNumber != null && m.SerialNumber.ToLower().Contains(search)) ||
                (m.Location != null && m.Location.ToLower().Contains(search))
            );
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(m => m.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(machineType))
        {
            query = query.Where(m => m.MachineType.ToLower().Contains(machineType.ToLower()));
        }

        var machines = await query
            .OrderBy(m => m.MachineType)
            .ThenBy(m => m.Name)
            .ToListAsync();

        return Ok(machines);
    }

    /// <summary>
    /// Makine detayı
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var machine = await _db.Machines
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Id == id);

        if (machine == null) return NotFound();
        return Ok(machine);
    }

    /// <summary>
    /// Makine oluştur
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Machine machine)
    {
        if (string.IsNullOrWhiteSpace(machine.MachineType) || string.IsNullOrWhiteSpace(machine.Name))
        {
            return BadRequest("Makine tipi ve adı zorunludur.");
        }

        // Normalize
        machine.MachineType = machine.MachineType.Trim();
        machine.Name = machine.Name.Trim();
        if (!string.IsNullOrWhiteSpace(machine.Model)) machine.Model = machine.Model!.Trim();
        if (!string.IsNullOrWhiteSpace(machine.SerialNumber)) machine.SerialNumber = machine.SerialNumber!.Trim();
        if (!string.IsNullOrWhiteSpace(machine.Location)) machine.Location = machine.Location!.Trim();

        // Aynı seri numaralı makine var mı kontrol et
        if (!string.IsNullOrWhiteSpace(machine.SerialNumber))
        {
            var exists = await _db.Machines.AnyAsync(m => m.SerialNumber == machine.SerialNumber);
            if (exists)
            {
                return BadRequest($"Bu seri numarasına ({machine.SerialNumber}) sahip bir makine zaten kayıtlı.");
            }
        }

        machine.CreatedAt = DateTime.UtcNow;
        machine.UpdatedAt = null;

        _db.Machines.Add(machine);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = machine.Id }, machine);
    }

    /// <summary>
    /// Makine güncelle
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Machine updated)
    {
        var existing = await _db.Machines.FindAsync(id);
        if (existing == null) return NotFound();

        existing.MachineType = updated.MachineType.Trim();
        existing.Name = updated.Name.Trim();
        existing.Model = string.IsNullOrWhiteSpace(updated.Model) ? null : updated.Model!.Trim();
        existing.SerialNumber = string.IsNullOrWhiteSpace(updated.SerialNumber) ? null : updated.SerialNumber!.Trim();
        existing.Location = string.IsNullOrWhiteSpace(updated.Location) ? null : updated.Location!.Trim();
        existing.ManufactureYear = updated.ManufactureYear;
        existing.Status = updated.Status;
        existing.CustomChecklistJson = updated.CustomChecklistJson;
        existing.Notes = updated.Notes;
        existing.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(existing);
    }

    /// <summary>
    /// Makine sil
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var machine = await _db.Machines.FindAsync(id);
        if (machine == null) return NotFound();

        // İlişkili kontrol formları kontrol et
        var hasControlForms = await _db.ControlForms.AnyAsync(cf => cf.MachineId == id);
        if (hasControlForms)
        {
            return BadRequest("Bu makineye ait kontrol formları bulunduğu için silinemez. Önce ilişkili formları silin veya makineyi 'Retired' durumuna alın.");
        }

        _db.Machines.Remove(machine);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// Makineye özel kontrol listesi kaydet
    /// </summary>
    [HttpPost("{id}/checklist")]
    public async Task<IActionResult> SaveCustomChecklist(int id, [FromBody] CustomChecklistRequest request)
    {
        var machine = await _db.Machines.FindAsync(id);
        if (machine == null) return NotFound();

        machine.CustomChecklistJson = request.ChecklistJson;
        machine.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(machine);
    }

    /// <summary>
    /// Makine tiplerine göre grupla
    /// </summary>
    [HttpGet("by-type")]
    public async Task<IActionResult> GroupByType()
    {
        var grouped = await _db.Machines
            .Where(m => m.Status == "Active")
            .GroupBy(m => m.MachineType)
            .Select(g => new
            {
                MachineType = g.Key,
                Count = g.Count(),
                Machines = g.OrderBy(m => m.Name).ToList()
            })
            .OrderBy(g => g.MachineType)
            .ToListAsync();

        return Ok(grouped);
    }
}

public class CustomChecklistRequest
{
    public string ChecklistJson { get; set; } = string.Empty;
}
