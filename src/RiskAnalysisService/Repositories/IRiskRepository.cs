using RiskAnalysisService.Entities;

namespace RiskAnalysisService.Repositories;

public interface IRiskRepository
{
    Task<RiskItem?> GetByIdAsync(int id);
    Task<IEnumerable<RiskItem>> GetAllAsync();
    Task<IEnumerable<RiskItem>> GetByStatusAsync(string status);
    Task<RiskItem> CreateAsync(RiskItem risk);
    Task<RiskItem> UpdateAsync(RiskItem risk);
    Task DeleteAsync(int id);
}
