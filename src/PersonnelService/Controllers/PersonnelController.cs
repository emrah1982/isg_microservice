using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonnelService.Data;
using PersonnelService.Entities;
using ClosedXML.Excel;
using System.Globalization;

namespace PersonnelService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PersonnelController : ControllerBase
{
    private readonly PersonnelDbContext _ctx;
    private readonly ILogger<PersonnelController> _logger;
    
    public PersonnelController(PersonnelDbContext ctx, ILogger<PersonnelController> logger) 
    { 
        _ctx = ctx; 
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? q, [FromQuery] string? department, [FromQuery] string? title, [FromQuery] string? nationalId, [FromQuery] int? companyId)
    {
        var people = _ctx.Personnel.AsNoTracking().AsQueryable();
        return Ok(await people.ToListAsync());
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var person = await _ctx.Personnel.FindAsync(id);
        if (person == null) return NotFound();
        return Ok(person);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Personnel personnel)
    {
        _ctx.Personnel.Add(personnel);
        await _ctx.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = personnel.Id }, personnel);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Personnel personnel)
    {
        if (id != personnel.Id) return BadRequest();
        var existing = await _ctx.Personnel.FindAsync(id);
        if (existing == null) return NotFound();
        existing.FirstName = personnel.FirstName;
        existing.LastName = personnel.LastName;
        existing.NationalId = personnel.NationalId;
        existing.Email = personnel.Email;
        existing.Phone = personnel.Phone;
        existing.Department = personnel.Department;
        existing.Title = personnel.Title;
        existing.CompanyId = personnel.CompanyId;
        existing.StartDate = personnel.StartDate;
        existing.IsgTemelEgitimBelgesiTarihi = personnel.IsgTemelEgitimBelgesiTarihi;
        existing.UpdatedAt = DateTime.UtcNow;
        await _ctx.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var person = await _ctx.Personnel.FindAsync(id);
        if (person == null) return NotFound();
        _ctx.Personnel.Remove(person);
        await _ctx.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("reports/isg-temel-training-renewal/import-excel")]
    [RequestSizeLimit(50_000_000)]
    public async Task<IActionResult> ImportIsgTemelTrainingRenewalExcel([FromForm] IFormFile file, [FromForm] string hazardClass)
    {
        if (file == null) return BadRequest(new { message = "Excel gerekli" });
        return Ok(new { message = "Test endpoint" });
    }

    [HttpGet("reports/isg-temel-training-renewal/template")]
    public IActionResult DownloadIsgTemelTrainingRenewalTemplate()
    {
        using var wb = new XLWorkbook();
        var ws = wb.AddWorksheet("ISG_Temel");
        ws.Cell(1, 1).Value = "T.C. KMLK NO";
        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        ms.Position = 0;
        return File(ms.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "template.xlsx");
    }
}
