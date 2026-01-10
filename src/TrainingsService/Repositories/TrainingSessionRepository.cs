using Microsoft.EntityFrameworkCore;
using TrainingsService.Data;
using TrainingsService.Entities;

namespace TrainingsService.Repositories;

public class TrainingSessionRepository : ITrainingSessionRepository
{
    private readonly TrainingsDbContext _context;
    
    public TrainingSessionRepository(TrainingsDbContext context)
    {
        _context = context;
    }
    
    public async Task<TrainingSession?> GetByIdAsync(int id)
    {
        return await _context.TrainingSessions
            .Include(s => s.Training)
            .Include(s => s.Participants)
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == id);
    }
    
    public async Task<IEnumerable<TrainingSession>> GetAllAsync()
    {
        return await _context.TrainingSessions
            .Include(s => s.Training)
            .Include(s => s.Participants)
            .Where(s => !s.IsDeleted)
            .OrderByDescending(s => s.SessionDate)
            .ToListAsync();
    }
    
    public async Task<IEnumerable<TrainingSession>> GetByTrainingIdAsync(int trainingId)
    {
        return await _context.TrainingSessions
            .Include(s => s.Training)
            .Include(s => s.Participants)
            .Where(s => s.TrainingId == trainingId && !s.IsDeleted)
            .OrderByDescending(s => s.SessionDate)
            .ToListAsync();
    }
    
    public async Task<IEnumerable<TrainingSession>> GetActiveSessionsAsync()
    {
        return await _context.TrainingSessions
            .Include(s => s.Training)
            .Include(s => s.Participants)
            .Where(s => s.IsActive && !s.IsDeleted)
            .OrderByDescending(s => s.SessionDate)
            .ToListAsync();
    }
    
    public async Task<TrainingSession> CreateAsync(TrainingSession session)
    {
        _context.TrainingSessions.Add(session);
        await _context.SaveChangesAsync();
        return session;
    }
    
    public async Task<TrainingSession> UpdateAsync(TrainingSession session)
    {
        session.UpdatedAt = DateTime.UtcNow;
        _context.TrainingSessions.Update(session);
        await _context.SaveChangesAsync();
        return session;
    }
    
    public async Task DeleteAsync(int id)
    {
        var session = await _context.TrainingSessions.FindAsync(id);
        if (session != null)
        {
            session.IsDeleted = true;
            session.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
    
    public async Task<IEnumerable<SessionParticipant>> GetSessionParticipantsAsync(int sessionId)
    {
        return await _context.SessionParticipants
            .Where(p => p.SessionId == sessionId && !p.IsDeleted)
            .ToListAsync();
    }
    
    public async Task<SessionParticipant> AddParticipantAsync(SessionParticipant participant)
    {
        _context.SessionParticipants.Add(participant);
        await _context.SaveChangesAsync();
        return participant;
    }
    
    public async Task<IEnumerable<SessionParticipant>> AddParticipantsAsync(IEnumerable<SessionParticipant> participants)
    {
        _context.SessionParticipants.AddRange(participants);
        await _context.SaveChangesAsync();
        return participants;
    }
    
    public async Task RemoveParticipantAsync(int sessionId, int personnelId)
    {
        var participant = await _context.SessionParticipants
            .FirstOrDefaultAsync(p => p.SessionId == sessionId && p.PersonnelId == personnelId);
        
        if (participant != null)
        {
            participant.IsDeleted = true;
            participant.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
    
    public async Task<SessionParticipant?> GetParticipantAsync(int sessionId, int personnelId)
    {
        return await _context.SessionParticipants
            .FirstOrDefaultAsync(p => p.SessionId == sessionId && p.PersonnelId == personnelId && !p.IsDeleted);
    }
}
