using Shared.DTOs;
using TrainingsService.DTOs;
using TrainingsService.Entities;
using TrainingsService.Repositories;

namespace TrainingsService.Services;

public class TrainingService : ITrainingService
{
    private readonly ITrainingRepository _trainingRepository;
    private readonly IUserTrainingRepository _userTrainingRepository;
    private readonly IUsersServiceClient _usersServiceClient;
    private readonly ILogger<TrainingService> _logger;
    
    public TrainingService(
        ITrainingRepository trainingRepository,
        IUserTrainingRepository userTrainingRepository,
        IUsersServiceClient usersServiceClient,
        ILogger<TrainingService> logger)
    {
        _trainingRepository = trainingRepository;
        _userTrainingRepository = userTrainingRepository;
        _usersServiceClient = usersServiceClient;
        _logger = logger;
    }
    
    public async Task<ApiResponse<TrainingResponseDto>> CreateTrainingAsync(TrainingCreateDto createDto)
    {
        try
        {
            var training = new Training
            {
                Title = createDto.Title,
                Description = createDto.Description,
                Date = createDto.Date,
                EndDate = createDto.EndDate,
                Mandatory = createDto.Mandatory,
                Instructor = createDto.Instructor,
                Location = createDto.Location,
                Duration = createDto.Duration,
                MaxParticipants = createDto.MaxParticipants,
                Category = createDto.Category
            };
            
            var createdTraining = await _trainingRepository.CreateAsync(training);
            
            return ApiResponse<TrainingResponseDto>.SuccessResponse(
                MapToTrainingResponseDto(createdTraining), 
                "Eğitim başarıyla oluşturuldu.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Eğitim oluşturma hatası");
            return ApiResponse<TrainingResponseDto>.ErrorResponse($"Eğitim oluşturma hatası: {ex.Message}");
        }
    }
    
    public async Task<ApiResponse<TrainingResponseDto>> GetTrainingByIdAsync(int id)
    {
        try
        {
            var training = await _trainingRepository.GetByIdAsync(id);
            
            if (training == null)
            {
                return ApiResponse<TrainingResponseDto>.ErrorResponse("Eğitim bulunamadı.");
            }
            
            return ApiResponse<TrainingResponseDto>.SuccessResponse(MapToTrainingResponseDto(training));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Eğitim getirme hatası. TrainingId: {id}");
            return ApiResponse<TrainingResponseDto>.ErrorResponse($"Eğitim getirme hatası: {ex.Message}");
        }
    }
    
    public async Task<ApiResponse<IEnumerable<TrainingResponseDto>>> GetAllTrainingsAsync()
    {
        try
        {
            var trainings = await _trainingRepository.GetAllAsync();
            var trainingDtos = trainings.Select(MapToTrainingResponseDto);
            
            return ApiResponse<IEnumerable<TrainingResponseDto>>.SuccessResponse(trainingDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Eğitim listesi getirme hatası");
            return ApiResponse<IEnumerable<TrainingResponseDto>>.ErrorResponse($"Eğitim listesi getirme hatası: {ex.Message}");
        }
    }
    
    public async Task<ApiResponse<IEnumerable<TrainingResponseDto>>> GetActiveTrainingsAsync()
    {
        try
        {
            var trainings = await _trainingRepository.GetActiveTrainingsAsync();
            var trainingDtos = trainings.Select(MapToTrainingResponseDto);
            
            return ApiResponse<IEnumerable<TrainingResponseDto>>.SuccessResponse(trainingDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Aktif eğitim listesi getirme hatası");
            return ApiResponse<IEnumerable<TrainingResponseDto>>.ErrorResponse($"Aktif eğitim listesi getirme hatası: {ex.Message}");
        }
    }
    
    public async Task<ApiResponse<TrainingResponseDto>> UpdateTrainingAsync(int id, TrainingCreateDto updateDto)
    {
        try
        {
            var training = await _trainingRepository.GetByIdAsync(id);
            
            if (training == null)
            {
                return ApiResponse<TrainingResponseDto>.ErrorResponse("Eğitim bulunamadı.");
            }
            
            training.Title = updateDto.Title;
            training.Description = updateDto.Description;
            training.Date = updateDto.Date;
            training.EndDate = updateDto.EndDate;
            training.Mandatory = updateDto.Mandatory;
            training.Instructor = updateDto.Instructor;
            training.Location = updateDto.Location;
            training.Duration = updateDto.Duration;
            training.MaxParticipants = updateDto.MaxParticipants;
            training.Category = updateDto.Category;
            
            var updatedTraining = await _trainingRepository.UpdateAsync(training);
            
            return ApiResponse<TrainingResponseDto>.SuccessResponse(
                MapToTrainingResponseDto(updatedTraining), 
                "Eğitim başarıyla güncellendi.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Eğitim güncelleme hatası. TrainingId: {id}");
            return ApiResponse<TrainingResponseDto>.ErrorResponse($"Eğitim güncelleme hatası: {ex.Message}");
        }
    }
    
    public async Task<ApiResponse<bool>> DeleteTrainingAsync(int id)
    {
        try
        {
            var training = await _trainingRepository.GetByIdAsync(id);
            
            if (training == null)
            {
                return ApiResponse<bool>.ErrorResponse("Eğitim bulunamadı.");
            }
            
            await _trainingRepository.DeleteAsync(id);
            
            return ApiResponse<bool>.SuccessResponse(true, "Eğitim başarıyla silindi.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Eğitim silme hatası. TrainingId: {id}");
            return ApiResponse<bool>.ErrorResponse($"Eğitim silme hatası: {ex.Message}");
        }
    }
    
    public async Task<ApiResponse<UserTrainingResponseDto>> AssignTrainingToUserAsync(int trainingId, UserTrainingAssignDto assignDto, int assignedBy)
    {
        try
        {
            // Eğitim kontrolü
            var training = await _trainingRepository.GetByIdAsync(trainingId);
            if (training == null)
            {
                return ApiResponse<UserTrainingResponseDto>.ErrorResponse("Eğitim bulunamadı.");
            }
            
            // Kullanıcı doğrulama
            var userValidation = await _usersServiceClient.ValidateUserAsync(assignDto.UserId);
            if (!userValidation.Success || !userValidation.Data)
            {
                return ApiResponse<UserTrainingResponseDto>.ErrorResponse("Kullanıcı bulunamadı veya pasif durumda.");
            }
            
            // Zaten atanmış mı kontrolü
            if (await _userTrainingRepository.IsUserAssignedToTrainingAsync(assignDto.UserId, trainingId))
            {
                return ApiResponse<UserTrainingResponseDto>.ErrorResponse("Kullanıcı bu eğitime zaten atanmış.");
            }
            
            // Maksimum katılımcı kontrolü
            if (training.MaxParticipants > 0)
            {
                var currentParticipants = await _userTrainingRepository.GetByTrainingIdAsync(trainingId);
                if (currentParticipants.Count() >= training.MaxParticipants)
                {
                    return ApiResponse<UserTrainingResponseDto>.ErrorResponse("Eğitim maksimum katılımcı sayısına ulaştı.");
                }
            }
            
            var userTraining = new UserTraining
            {
                UserId = assignDto.UserId,
                TrainingId = trainingId,
                Status = "Assigned",
                Notes = assignDto.Notes,
                AssignedBy = assignedBy,
                AssignedDate = DateTime.UtcNow
            };
            
            var createdUserTraining = await _userTrainingRepository.CreateAsync(userTraining);
            createdUserTraining.Training = training;
            
            var responseDto = await MapToUserTrainingResponseDto(createdUserTraining);
            
            return ApiResponse<UserTrainingResponseDto>.SuccessResponse(responseDto, "Eğitim kullanıcıya başarıyla atandı.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Eğitim atama hatası. TrainingId: {trainingId}, UserId: {assignDto.UserId}");
            return ApiResponse<UserTrainingResponseDto>.ErrorResponse($"Eğitim atama hatası: {ex.Message}");
        }
    }
    
    public async Task<ApiResponse<IEnumerable<UserTrainingResponseDto>>> GetTrainingParticipantsAsync(int trainingId)
    {
        try
        {
            var training = await _trainingRepository.GetByIdAsync(trainingId);
            if (training == null)
            {
                return ApiResponse<IEnumerable<UserTrainingResponseDto>>.ErrorResponse("Eğitim bulunamadı.");
            }
            
            var userTrainings = await _userTrainingRepository.GetByTrainingIdAsync(trainingId);
            var participants = new List<UserTrainingResponseDto>();
            
            foreach (var userTraining in userTrainings)
            {
                var participant = await MapToUserTrainingResponseDto(userTraining);
                participants.Add(participant);
            }
            
            return ApiResponse<IEnumerable<UserTrainingResponseDto>>.SuccessResponse(participants);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Eğitim katılımcıları getirme hatası. TrainingId: {trainingId}");
            return ApiResponse<IEnumerable<UserTrainingResponseDto>>.ErrorResponse($"Katılımcı listesi getirme hatası: {ex.Message}");
        }
    }
    
    public async Task<ApiResponse<IEnumerable<UserTrainingResponseDto>>> GetUserTrainingsAsync(int userId)
    {
        try
        {
            var userTrainings = await _userTrainingRepository.GetByUserIdAsync(userId);
            var trainingList = new List<UserTrainingResponseDto>();
            
            foreach (var userTraining in userTrainings)
            {
                var trainingDto = await MapToUserTrainingResponseDto(userTraining);
                trainingList.Add(trainingDto);
            }
            
            return ApiResponse<IEnumerable<UserTrainingResponseDto>>.SuccessResponse(trainingList);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Kullanıcı eğitimleri getirme hatası. UserId: {userId}");
            return ApiResponse<IEnumerable<UserTrainingResponseDto>>.ErrorResponse($"Kullanıcı eğitimleri getirme hatası: {ex.Message}");
        }
    }
    
    public async Task<ApiResponse<UserTrainingResponseDto>> UpdateUserTrainingStatusAsync(int userTrainingId, string status, int? score = null)
    {
        try
        {
            var userTraining = await _userTrainingRepository.GetByIdAsync(userTrainingId);
            
            if (userTraining == null)
            {
                return ApiResponse<UserTrainingResponseDto>.ErrorResponse("Kullanıcı eğitimi bulunamadı.");
            }
            
            userTraining.Status = status;
            if (score.HasValue)
            {
                userTraining.Score = score.Value;
            }
            
            if (status == "Completed")
            {
                userTraining.CompletionDate = DateTime.UtcNow;
            }
            
            var updatedUserTraining = await _userTrainingRepository.UpdateAsync(userTraining);
            var responseDto = await MapToUserTrainingResponseDto(updatedUserTraining);
            
            return ApiResponse<UserTrainingResponseDto>.SuccessResponse(responseDto, "Eğitim durumu güncellendi.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Eğitim durumu güncelleme hatası. UserTrainingId: {userTrainingId}");
            return ApiResponse<UserTrainingResponseDto>.ErrorResponse($"Durum güncelleme hatası: {ex.Message}");
        }
    }
    
    private static TrainingResponseDto MapToTrainingResponseDto(Training training)
    {
        return new TrainingResponseDto
        {
            Id = training.Id,
            Title = training.Title,
            Description = training.Description,
            Date = training.Date,
            EndDate = training.EndDate,
            Mandatory = training.Mandatory,
            Instructor = training.Instructor,
            Location = training.Location,
            Duration = training.Duration,
            MaxParticipants = training.MaxParticipants,
            Category = training.Category,
            IsActive = training.IsActive,
            ParticipantCount = training.UserTrainings?.Count() ?? 0,
            CreatedAt = training.CreatedAt
        };
    }
    
    private async Task<UserTrainingResponseDto> MapToUserTrainingResponseDto(UserTraining userTraining)
    {
        var dto = new UserTrainingResponseDto
        {
            Id = userTraining.Id,
            UserId = userTraining.UserId,
            TrainingId = userTraining.TrainingId,
            TrainingTitle = userTraining.Training?.Title ?? "",
            Status = userTraining.Status,
            CompletionDate = userTraining.CompletionDate,
            Score = userTraining.Score,
            CertificatePath = userTraining.CertificatePath,
            CertificateIssueDate = userTraining.CertificateIssueDate,
            CertificateExpiryDate = userTraining.CertificateExpiryDate,
            Notes = userTraining.Notes,
            AssignedDate = userTraining.AssignedDate,
            AssignedBy = userTraining.AssignedBy
        };
        
        // Kullanıcı bilgilerini al
        try
        {
            var userResponse = await _usersServiceClient.GetUserByIdAsync(userTraining.UserId);
            if (userResponse.Success && userResponse.Data != null)
            {
                dto.UserName = $"{userResponse.Data.FirstName} {userResponse.Data.LastName}";
                dto.UserEmail = userResponse.Data.Email;
            }
            
            // Atayan kişi bilgilerini al
            if (userTraining.AssignedBy.HasValue)
            {
                var assignedByResponse = await _usersServiceClient.GetUserByIdAsync(userTraining.AssignedBy.Value);
                if (assignedByResponse.Success && assignedByResponse.Data != null)
                {
                    dto.AssignedByName = $"{assignedByResponse.Data.FirstName} {assignedByResponse.Data.LastName}";
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, $"Kullanıcı bilgileri alınırken hata oluştu. UserId: {userTraining.UserId}");
        }
        
        return dto;
    }
}
