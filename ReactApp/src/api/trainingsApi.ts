import { axiosInstance } from '@utils/axiosInstance';

export type Training = {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  trainingType?: string;
  isActive?: boolean;
  date: string;
  category?: string;
  instructor?: string;
  location?: string;
  participantCount?: number;
};

export type Session = {
  id: number;
  trainingId: number;
  trainingTitle: string;
  sessionDate: string;
  sessionEndDate?: string;
  branch?: string;
  location?: string;
  instructor?: string;
  passScore?: number;
  maxParticipants?: number;
  notes?: string;
  isActive: boolean;
  participantCount: number;
  createdAt: string;
  updatedAt?: string;
};

export type SessionCreateDto = {
  trainingId: number;
  sessionDate: string;
  sessionEndDate?: string;
  branch?: string;
  location?: string;
  instructor?: string;
  passScore?: number;
  maxParticipants?: number;
  notes?: string;
};

// Backend generic response wrapper
type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
};

// Backend TrainingsService DTO
type BackendTraining = {
  id: number;
  title: string;
  description?: string;
  duration: number;
  trainingType: string;
  isActive: boolean;
  // Additional fields from backend DTO
  date?: string;
  endDate?: string | null;
  mandatory?: boolean;
  instructor?: string | null;
  location?: string | null;
  maxParticipants?: number;
  category?: string | null;
  participantCount?: number;
  createdAt: string;
};

const mapTraining = (t: BackendTraining): Training => ({
  id: String(t.id),
  title: t.title,
  description: t.description,
  duration: t.duration,
  trainingType: t.trainingType,
  isActive: t.isActive,
  date: t.date || t.createdAt,
  category: t.category ?? t.trainingType,
  instructor: t.instructor ?? undefined,
  location: t.location ?? undefined,
  participantCount: t.participantCount ?? 0,
});

export async function fetchTrainings(): Promise<Training[]> {
  // Relative URL kullanarak axiosInstance'ın microservice yönlendirmesini devreye sok
  const { data } = await axiosInstance.get<ApiResponse<BackendTraining[]>>('/api/trainings');
  const list = Array.isArray(data?.data) ? data.data : [];
  return list.map(mapTraining);
}

// Session CRUD operations
export async function fetchSessions(): Promise<Session[]> {
  const { data } = await axiosInstance.get<ApiResponse<Session[]>>('/api/training-sessions');
  return Array.isArray(data?.data) ? data.data : [];
}

export async function fetchSessionById(id: number): Promise<Session> {
  const { data } = await axiosInstance.get<ApiResponse<Session>>(`/api/training-sessions/${id}`);
  return data.data;
}

export async function createSession(dto: SessionCreateDto): Promise<Session> {
  const { data } = await axiosInstance.post<ApiResponse<Session>>('/api/training-sessions', dto);
  return data.data;
}

export async function updateSession(id: number, dto: SessionCreateDto): Promise<Session> {
  const { data } = await axiosInstance.put<ApiResponse<Session>>(`/api/training-sessions/${id}`, dto);
  return data.data;
}

export async function deleteSession(id: number): Promise<void> {
  await axiosInstance.delete(`/api/training-sessions/${id}`);
}

export async function updateSessionPassScore(sessionId: number, passScore: number): Promise<void> {
  await axiosInstance.post(`/api/training-sessions/${sessionId}/pass-score`, { passScore });
}

// Session Participants operations
export async function assignParticipantsToSession(sessionId: number, participantIds: number[], trainingDate?: string): Promise<void> {
  await axiosInstance.post(`/api/training-sessions/${sessionId}/participants`, { 
    participantIds,
    trainingDate: trainingDate || null
  });
}

export async function getSessionParticipants(sessionId: number): Promise<any[]> {
  const { data } = await axiosInstance.get<ApiResponse<any[]>>(`/api/training-sessions/${sessionId}/participants`);
  return Array.isArray(data?.data) ? data.data : [];
}

export async function removeParticipantFromSession(sessionId: number, personnelId: number): Promise<void> {
  await axiosInstance.delete(`/api/training-sessions/${sessionId}/participants/${personnelId}`);
}

export async function fetchTrainingById(id: string): Promise<Training> {
  try {
    // Tekil kayıt için de relative URL kullan
    const { data } = await axiosInstance.get<ApiResponse<BackendTraining>>(`/api/trainings/${id}`);
    return mapTraining(data.data);
  } catch (err: any) {
    // 404 ise fallback: tüm eğitimleri çekip arama
    if (err?.response?.status === 404) {
      const list = await fetchTrainings();
      const found = list.find(t => t.id === String(id));
      if (found) return found;
    }
    throw err;
  }
}
