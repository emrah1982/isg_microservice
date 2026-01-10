using Shared.DTOs;
using TrainingsService.DTOs;

namespace TrainingsService.Services;

public interface ITrainingSessionService
{
    Task<ApiResponse<SessionResponseDto>> CreateSessionAsync(SessionCreateDto createDto);
    Task<ApiResponse<SessionResponseDto>> GetSessionByIdAsync(int id);
    Task<ApiResponse<IEnumerable<SessionResponseDto>>> GetAllSessionsAsync();
    Task<ApiResponse<IEnumerable<SessionResponseDto>>> GetSessionsByTrainingIdAsync(int trainingId);
    Task<ApiResponse<IEnumerable<SessionResponseDto>>> GetActiveSessionsAsync();
    Task<ApiResponse<SessionResponseDto>> UpdateSessionAsync(int id, SessionCreateDto updateDto);
    Task<ApiResponse<bool>> DeleteSessionAsync(int id);
    Task<ApiResponse<bool>> UpdatePassScoreAsync(int sessionId, int passScore);
    Task<ApiResponse<IEnumerable<SessionParticipantDto>>> GetSessionParticipantsAsync(int sessionId);
    Task<ApiResponse<bool>> AssignParticipantsAsync(int sessionId, List<int> participantIds, int? assignedBy = null, DateTime? trainingDate = null);
    Task<ApiResponse<bool>> RemoveParticipantAsync(int sessionId, int personnelId);
}
