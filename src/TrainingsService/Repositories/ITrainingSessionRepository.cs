using TrainingsService.Entities;

namespace TrainingsService.Repositories;

public interface ITrainingSessionRepository
{
    Task<TrainingSession?> GetByIdAsync(int id);
    Task<IEnumerable<TrainingSession>> GetAllAsync();
    Task<IEnumerable<TrainingSession>> GetByTrainingIdAsync(int trainingId);
    Task<IEnumerable<TrainingSession>> GetActiveSessionsAsync();
    Task<TrainingSession> CreateAsync(TrainingSession session);
    Task<TrainingSession> UpdateAsync(TrainingSession session);
    Task DeleteAsync(int id);
    Task<IEnumerable<SessionParticipant>> GetSessionParticipantsAsync(int sessionId);
    Task<SessionParticipant> AddParticipantAsync(SessionParticipant participant);
    Task<IEnumerable<SessionParticipant>> AddParticipantsAsync(IEnumerable<SessionParticipant> participants);
    Task RemoveParticipantAsync(int sessionId, int personnelId);
    Task<SessionParticipant?> GetParticipantAsync(int sessionId, int personnelId);
}
