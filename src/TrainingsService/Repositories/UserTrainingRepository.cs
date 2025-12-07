using Microsoft.EntityFrameworkCore;
using TrainingsService.Data;
using TrainingsService.Entities;

namespace TrainingsService.Repositories;

public class UserTrainingRepository : IUserTrainingRepository
{
    private readonly TrainingsDbContext _context;
    
    public UserTrainingRepository(TrainingsDbContext context)
    {
        _context = context;
    }
    
    public async Task<UserTraining?> GetByIdAsync(int id)
    {
        return await _context.UserTrainings
            .Include(ut => ut.Training)
            .FirstOrDefaultAsync(ut => ut.Id == id && !ut.IsDeleted);
    }
    
    public async Task<UserTraining?> GetByUserAndTrainingAsync(int userId, int trainingId)
    {
        return await _context.UserTrainings
            .Include(ut => ut.Training)
            .FirstOrDefaultAsync(ut => ut.UserId == userId && ut.TrainingId == trainingId && !ut.IsDeleted);
    }
    
    public async Task<IEnumerable<UserTraining>> GetByUserIdAsync(int userId)
    {
        return await _context.UserTrainings
            .Include(ut => ut.Training)
            .Where(ut => ut.UserId == userId && !ut.IsDeleted)
            .OrderByDescending(ut => ut.AssignedDate)
            .ToListAsync();
    }
    
    public async Task<IEnumerable<UserTraining>> GetByTrainingIdAsync(int trainingId)
    {
        return await _context.UserTrainings
            .Include(ut => ut.Training)
            .Where(ut => ut.TrainingId == trainingId && !ut.IsDeleted)
            .OrderBy(ut => ut.AssignedDate)
            .ToListAsync();
    }
    
    public async Task<IEnumerable<UserTraining>> GetAllAsync()
    {
        return await _context.UserTrainings
            .Include(ut => ut.Training)
            .Where(ut => !ut.IsDeleted)
            .OrderByDescending(ut => ut.AssignedDate)
            .ToListAsync();
    }
    
    public async Task<UserTraining> CreateAsync(UserTraining userTraining)
    {
        _context.UserTrainings.Add(userTraining);
        await _context.SaveChangesAsync();
        return userTraining;
    }
    
    public async Task<UserTraining> UpdateAsync(UserTraining userTraining)
    {
        userTraining.UpdatedAt = DateTime.UtcNow;
        _context.UserTrainings.Update(userTraining);
        await _context.SaveChangesAsync();
        return userTraining;
    }
    
    public async Task DeleteAsync(int id)
    {
        var userTraining = await _context.UserTrainings.FindAsync(id);
        if (userTraining != null)
        {
            userTraining.IsDeleted = true;
            userTraining.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
    
    public async Task<bool> IsUserAssignedToTrainingAsync(int userId, int trainingId)
    {
        return await _context.UserTrainings
            .AnyAsync(ut => ut.UserId == userId && ut.TrainingId == trainingId && !ut.IsDeleted);
    }
}
