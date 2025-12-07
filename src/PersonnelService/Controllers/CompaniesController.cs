using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonnelService.Data;
using PersonnelService.Entities;

namespace PersonnelService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CompaniesController : ControllerBase
{
    private readonly PersonnelDbContext _ctx;
    public CompaniesController(PersonnelDbContext ctx) { _ctx = ctx; }

    [HttpGet]
    public async Task<IActionResult> List()
    {
        var items = await _ctx.Companies.AsNoTracking().OrderBy(x => x.Name).ToListAsync();
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var c = await _ctx.Companies.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        if (c == null) return NotFound();
        return Ok(c);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Company c)
    {
        try
        {
            var name = (c.Name ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(name)) return BadRequest("Firma adı zorunludur");
            c.Id = 0;
            c.Name = name;
            c.TaxNumber = string.IsNullOrWhiteSpace(c.TaxNumber) ? null : c.TaxNumber;
            c.Address = string.IsNullOrWhiteSpace(c.Address) ? null : c.Address;
            c.CreatedAt = DateTime.UtcNow;
            c.UpdatedAt = DateTime.UtcNow;
            _ctx.Companies.Add(c);
            await _ctx.SaveChangesAsync();
            return Created($"api/companies/{c.Id}", c);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Firma oluşturulurken hata oluştu", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Company dto)
    {
        try
        {
            var c = await _ctx.Companies.FirstOrDefaultAsync(x => x.Id == id);
            if (c == null) return NotFound();
            var name = (dto.Name ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(name)) return BadRequest("Firma adı zorunludur");
            c.Name = name;
            c.TaxNumber = string.IsNullOrWhiteSpace(dto.TaxNumber) ? null : dto.TaxNumber;
            c.Address = string.IsNullOrWhiteSpace(dto.Address) ? null : dto.Address;
            c.UpdatedAt = DateTime.UtcNow;
            await _ctx.SaveChangesAsync();
            return Ok(c);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Firma güncellenirken hata oluştu", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var c = await _ctx.Companies.FindAsync(id);
        if (c == null) return NotFound();
        _ctx.Companies.Remove(c);
        await _ctx.SaveChangesAsync();
        return NoContent();
    }
}
