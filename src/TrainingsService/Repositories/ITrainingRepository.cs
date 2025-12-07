using TrainingsService.Entities;

namespace TrainingsService.Repositories;

public interface ITrainingRepository
{
    Task<Training?> GetByIdAsync(int id);
    Task<IEnumerable<Training>> GetAllAsync();
    Task<IEnumerable<Training>> GetActiveTrainingsAsync();
    Task<IEnumerable<Training>> GetTrainingsByCategoryAsync(string category);
    Task<Training> CreateAsync(Training training);
    Task<Training> UpdateAsync(Training training);
    Task DeleteAsync(int id);
}
