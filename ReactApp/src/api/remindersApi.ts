import axiosInstance from '@utils/axiosInstance';

export interface ReminderTaskDto {
  id: number;
  title: string;
  description?: string;
  machineId?: number;
  controlFormTemplateId?: number;
  dueDate: string; // ISO
  period?: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly' | 'Custom';
  periodDays?: number;
  status: 'Open' | 'Completed' | 'Skipped';
  createdAt: string;
  completedAt?: string;
}

export async function listReminders(params?: { status?: string; machineId?: number; templateId?: number; days?: number }) {
  const { data } = await axiosInstance.get<ReminderTaskDto[]>('/api/reminders', { params });
  return data;
}

export async function completeReminder(id: number) {
  const { data } = await axiosInstance.post<ReminderTaskDto>(`/api/reminders/${id}/complete`);
  return data;
}

export async function purgeOldReminders(days = 90) {
  const { data } = await axiosInstance.delete<{ deleted: number }>(`/api/reminders/purge-old`, { params: { days } });
  return data;
}
