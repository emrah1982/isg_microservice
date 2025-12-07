using LegislationService.Data;
using LegislationService.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LegislationService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CompanyComplianceController : ControllerBase
    {
        private readonly LegislationDbContext _db;
        public CompanyComplianceController(LegislationDbContext db) { _db = db; }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _db.CompanyCompliances.AsNoTracking().ToListAsync();
            return Ok(list);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CompanyCompliance model)
        {
            _db.CompanyCompliances.Add(model);
            await _db.SaveChangesAsync();
            return Ok(model);
        }
    }
}
