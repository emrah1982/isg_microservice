using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonnelService.Data;
using PersonnelService.Entities;

namespace PersonnelService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CompanyController : ControllerBase
{
    private readonly PersonnelDbContext _ctx;
    private readonly ILogger<CompanyController> _logger;
    
    public CompanyController(PersonnelDbContext ctx, ILogger<CompanyController> logger) 
    { 
        _ctx = ctx; 
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> List()
    {
        try
        {
            _logger.LogInformation("Fetching companies list");
            var companies = await _ctx.Companies.AsNoTracking()
                .OrderBy(c => c.Name)
                .ToListAsync();
            
            _logger.LogInformation("Found {Count} companies", companies.Count);
            return Ok(companies);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching companies: {Message}", ex.Message);
            return StatusCode(500, new { message = "Firmalar yüklenirken hata oluştu", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        try
        {
            var company = await _ctx.Companies.AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id);
            
            if (company == null)
            {
                _logger.LogWarning("Company with ID {Id} not found", id);
                return NotFound();
            }
            
            return Ok(company);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching company {Id}: {Message}", id, ex.Message);
            return StatusCode(500, new { message = "Firma yüklenirken hata oluştu", error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Company company)
    {
        try
        {
            _logger.LogInformation("Creating new company: {Name}", company.Name);
            
            company.Id = 0;
            company.CreatedAt = DateTime.UtcNow;
            company.UpdatedAt = DateTime.UtcNow;
            
            _ctx.Companies.Add(company);
            await _ctx.SaveChangesAsync();
            
            _logger.LogInformation("Company created with ID: {Id}", company.Id);
            return Created($"api/companies/{company.Id}", company);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating company: {Message}", ex.Message);
            return StatusCode(500, new { message = "Firma oluşturulurken hata oluştu", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Company dto)
    {
        try
        {
            _logger.LogInformation("Updating company ID: {Id}", id);
            
            var company = await _ctx.Companies.FirstOrDefaultAsync(c => c.Id == id);
            if (company == null)
            {
                _logger.LogWarning("Company with ID {Id} not found for update", id);
                return NotFound();
            }
            
            company.Name = dto.Name;
            company.TaxNumber = dto.TaxNumber;
            company.Address = dto.Address;
            company.UpdatedAt = DateTime.UtcNow;
            
            await _ctx.SaveChangesAsync();
            
            _logger.LogInformation("Company {Id} updated successfully", id);
            return Ok(company);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating company {Id}: {Message}", id, ex.Message);
            return StatusCode(500, new { message = "Firma güncellenirken hata oluştu", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            _logger.LogInformation("Deleting company ID: {Id}", id);
            
            var company = await _ctx.Companies.FirstOrDefaultAsync(c => c.Id == id);
            if (company == null)
            {
                _logger.LogWarning("Company with ID {Id} not found for deletion", id);
                return NotFound();
            }
            
            // Check if company is used by any personnel
            var personnelCount = await _ctx.Personnel.CountAsync(p => p.CompanyId == id);
            if (personnelCount > 0)
            {
                _logger.LogWarning("Cannot delete company {Id} - used by {Count} personnel", id, personnelCount);
                return BadRequest(new { 
                    message = "Bu firma silinemez", 
                    error = $"Bu firmaya bağlı {personnelCount} personel bulunmaktadır",
                    personnelCount 
                });
            }
            
            _ctx.Companies.Remove(company);
            await _ctx.SaveChangesAsync();
            
            _logger.LogInformation("Company {Id} deleted successfully", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting company {Id}: {Message}", id, ex.Message);
            return StatusCode(500, new { message = "Firma silinirken hata oluştu", error = ex.Message });
        }
    }
}
