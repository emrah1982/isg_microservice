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
  const { data } = await axiosInstance.get<ApiResponse<BackendTraining[]>>('http://localhost:8081/api/trainings');
  const list = Array.isArray(data?.data) ? data.data : [];
  return list.map(mapTraining);
}

export async function fetchTrainingById(id: string): Promise<Training> {
  try {
    const { data } = await axiosInstance.get<ApiResponse<BackendTraining>>(`http://localhost:8081/api/trainings/${id}`);
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
