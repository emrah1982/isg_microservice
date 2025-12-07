using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonnelService.Data;

namespace PersonnelService.Controllers;

[ApiController]
[Route("api/auth")] 
public class AuthController : ControllerBase
{
    private readonly PersonnelDbContext _ctx;
    public AuthController(PersonnelDbContext ctx) { _ctx = ctx; }

    public class LoginDto { public string NationalId { get; set; } = string.Empty; public string Phone { get; set; } = string.Empty; }

    [HttpPost("login")] 
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var national = (dto.NationalId ?? string.Empty).Trim();
        var phone = (dto.Phone ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(national) || string.IsNullOrWhiteSpace(phone))
            return BadRequest("NationalId and Phone required");

        var p = await _ctx.Personnel.AsNoTracking().FirstOrDefaultAsync(x => x.NationalId == national && x.Phone == phone && x.Status == "Active");
        if (p == null) return Unauthorized("Kullanıcı bulunamadı veya bilgiler hatalı");

        // Simple session payload (no JWT for now) - frontend can store this minimal object
        return Ok(new { personnelId = p.Id, fullName = p.FirstName + " " + p.LastName, department = p.Department, title = p.Title, userId = p.UserId });
    }
}
