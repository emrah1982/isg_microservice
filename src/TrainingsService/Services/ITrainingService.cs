using Shared.DTOs;
using TrainingsService.DTOs;

namespace TrainingsService.Services;

public interface ITrainingService
{
    Task<ApiResponse<TrainingResponseDto>> CreateTrainingAsync(TrainingCreateDto createDto);
    Task<ApiResponse<TrainingResponseDto>> GetTrainingByIdAsync(int id);
    Task<ApiResponse<IEnumerable<TrainingResponseDto>>> GetAllTrainingsAsync();
    Task<ApiResponse<IEnumerable<TrainingResponseDto>>> GetActiveTrainingsAsync();
    Task<ApiResponse<TrainingResponseDto>> UpdateTrainingAsync(int id, TrainingCreateDto updateDto);
    Task<ApiResponse<bool>> DeleteTrainingAsync(int id);
    Task<ApiResponse<UserTrainingResponseDto>> AssignTrainingToUserAsync(int trainingId, UserTrainingAssignDto assignDto, int assignedBy);
    Task<ApiResponse<IEnumerable<UserTrainingResponseDto>>> GetTrainingParticipantsAsync(int trainingId);
    Task<ApiResponse<IEnumerable<UserTrainingResponseDto>>> GetUserTrainingsAsync(int userId);
    Task<ApiResponse<UserTrainingResponseDto>> UpdateUserTrainingStatusAsync(int userTrainingId, string status, int? score = null);
}
