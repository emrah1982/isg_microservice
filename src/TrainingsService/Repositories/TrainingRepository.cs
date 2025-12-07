using Microsoft.EntityFrameworkCore;
using TrainingsService.Data;
using TrainingsService.Entities;

namespace TrainingsService.Repositories;

public class TrainingRepository : ITrainingRepository
{
    private readonly TrainingsDbContext _context;
    
    public TrainingRepository(TrainingsDbContext context)
    {
        _context = context;
    }
    
    public async Task<Training?> GetByIdAsync(int id)
    {
        return await _context.Trainings
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == id);
    }
    
    public async Task<IEnumerable<Training>> GetAllAsync()
    {
        return await _context.Trainings
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }
    
    public async Task<IEnumerable<Training>> GetActiveTrainingsAsync()
    {
        return await _context.Trainings
            .Where(t => t.IsActive)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }
    
    public async Task<IEnumerable<Training>> GetTrainingsByCategoryAsync(string category)
    {
        return await _context.Trainings
            .Where(t => t.Category == category)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }
    
    public async Task<Training> CreateAsync(Training training)
    {
        _context.Trainings.Add(training);
        await _context.SaveChangesAsync();
        return training;
    }
    
    public async Task<Training> UpdateAsync(Training training)
    {
        training.UpdatedAt = DateTime.UtcNow;
        _context.Trainings.Update(training);
        await _context.SaveChangesAsync();
        return training;
    }
    
    public async Task DeleteAsync(int id)
    {
        var training = await _context.Trainings.FindAsync(id);
        if (training != null)
        {
            training.IsDeleted = true;
            training.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
}
