using TrainingsService.Entities;

namespace TrainingsService.Repositories;

public interface IUserTrainingRepository
{
    Task<UserTraining?> GetByIdAsync(int id);
    Task<UserTraining?> GetByUserAndTrainingAsync(int userId, int trainingId);
    Task<IEnumerable<UserTraining>> GetByUserIdAsync(int userId);
    Task<IEnumerable<UserTraining>> GetByTrainingIdAsync(int trainingId);
    Task<IEnumerable<UserTraining>> GetAllAsync();
    Task<UserTraining> CreateAsync(UserTraining userTraining);
    Task<UserTraining> UpdateAsync(UserTraining userTraining);
    Task DeleteAsync(int id);
    Task<bool> IsUserAssignedToTrainingAsync(int userId, int trainingId);
}
