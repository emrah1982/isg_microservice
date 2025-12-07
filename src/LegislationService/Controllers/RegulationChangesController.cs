using LegislationService.Data;
using LegislationService.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LegislationService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RegulationChangesController : ControllerBase
    {
        private readonly LegislationDbContext _db;
        public RegulationChangesController(LegislationDbContext db) { _db = db; }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _db.RegulationChanges.AsNoTracking().ToListAsync();
            return Ok(list);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] RegulationChange model)
        {
            _db.RegulationChanges.Add(model);
            await _db.SaveChangesAsync();
            return Ok(model);
        }
    }
}
