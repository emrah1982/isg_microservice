import axiosInstance from '@utils/axiosInstance';

export type DailyTaskStatus = 'completed' | 'in_progress' | 'planned';
export type DailyTaskPriority = 'high' | 'medium' | 'low';
export type DailyTaskCategory =
  | 'safety_training'
  | 'equipment_check'
  | 'maintenance'
  | 'inspection'
  | 'emergency_drill'
  | 'other';

export type DailyRiskLevel = 'high' | 'medium' | 'low';

export interface DailyReportTaskDto {
  id?: number | string;
  description: string;
  startTime?: string | null;
  endTime?: string | null;
  responsible?: string | null;
  status?: DailyTaskStatus;
  priority?: DailyTaskPriority;
  category?: DailyTaskCategory;
}

export interface DailyReportProductionDto {
  id?: number | string;
  description: string;
  location?: string | null;
  safetyMeasures?: string | null;
  riskLevel?: DailyRiskLevel;
  equipmentUsed?: string | null;
  personnelCount?: number | null;
}

export interface DailyIsgReportDto {
  id: number;
  reportDate: string;
  shift: 'morning' | 'afternoon' | 'night';
  weatherCondition?: string | null;
  createdBy?: string | null;
  highlights?: string | null;
  completedTasks: DailyReportTaskDto[];
  plannedTasks: DailyReportTaskDto[];
  productions: DailyReportProductionDto[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateDailyIsgReportRequest {
  reportDate: string;
  shift: 'morning' | 'afternoon' | 'night';
  weatherCondition?: string | null;
  createdBy?: string | null;
  highlights?: string | null;
  completedTasks: DailyReportTaskDto[];
  plannedTasks: DailyReportTaskDto[];
  productions: DailyReportProductionDto[];
}

export interface UpdateDailyIsgReportRequest extends CreateDailyIsgReportRequest {}

const basePath = '/api/daily-isg-reports';

export async function listDailyIsgReports(query?: { date?: string; shift?: string }) {
  const { data } = await axiosInstance.get<DailyIsgReportDto[]>(basePath, {
    params: query,
  });
  return data;
}

export async function createDailyIsgReport(payload: CreateDailyIsgReportRequest) {
  const { data } = await axiosInstance.post<DailyIsgReportDto>(basePath, payload);
  return data;
}

export async function updateDailyIsgReport(id: number, payload: UpdateDailyIsgReportRequest) {
  const { data } = await axiosInstance.put<DailyIsgReportDto>(`${basePath}/${id}`, payload);
  return data;
}

export async function deleteDailyIsgReport(id: number) {
  await axiosInstance.delete(`${basePath}/${id}`);
}
