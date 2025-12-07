using Microsoft.EntityFrameworkCore;
using RiskAnalysisService.Data;
using RiskAnalysisService.Entities;

namespace RiskAnalysisService.Repositories;

public class RiskRepository : IRiskRepository
{
    private readonly RiskDbContext _context;
    
    public RiskRepository(RiskDbContext context)
    {
        _context = context;
    }
    
    public async Task<RiskItem?> GetByIdAsync(int id)
    {
        return await _context.RiskItems
            .Include(r => r.Controls)
            .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted);
    }
    
    public async Task<IEnumerable<RiskItem>> GetAllAsync()
    {
        return await _context.RiskItems
            .Include(r => r.Controls)
            .Where(r => !r.IsDeleted)
            .OrderByDescending(r => r.Severity)
            .ToListAsync();
    }
    
    public async Task<IEnumerable<RiskItem>> GetByStatusAsync(string status)
    {
        return await _context.RiskItems
            .Include(r => r.Controls)
            .Where(r => !r.IsDeleted && r.Status == status)
            .OrderByDescending(r => r.Severity)
            .ToListAsync();
    }
    
    public async Task<RiskItem> CreateAsync(RiskItem risk)
    {
        _context.RiskItems.Add(risk);
        await _context.SaveChangesAsync();
        return risk;
    }
    
    public async Task<RiskItem> UpdateAsync(RiskItem risk)
    {
        risk.UpdatedAt = DateTime.UtcNow;
        _context.RiskItems.Update(risk);
        await _context.SaveChangesAsync();
        return risk;
    }
    
    public async Task DeleteAsync(int id)
    {
        var risk = await _context.RiskItems.FindAsync(id);
        if (risk != null)
        {
            risk.IsDeleted = true;
            risk.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
}
