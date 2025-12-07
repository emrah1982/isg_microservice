import axiosInstance from '@utils/axiosInstance';

export interface ControlFormTemplateDto {
  id?: number;
  templateName: string;
  machineType: string;
  model?: string;
  serialNumber?: string;
  defaultStatus?: 'Pending' | 'Completed' | 'Failed';
  defaultNotes?: string;
  period?: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly' | 'Custom';
  periodDays?: number;
  checklistItemsJson: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export async function listControlFormTemplates(params?: { q?: string; machineType?: string; onlyActive?: boolean }) {
  const { data } = await axiosInstance.get<ControlFormTemplateDto[]>('/api/controlformtemplates', { params });
  return data;
}

export async function getControlFormTemplate(id: number) {
  const { data } = await axiosInstance.get<ControlFormTemplateDto>(`/api/controlformtemplates/${id}`);
  return data;
}

export async function createControlFormTemplate(payload: ControlFormTemplateDto) {
  const { data } = await axiosInstance.post<ControlFormTemplateDto>('/api/controlformtemplates', payload);
  return data;
}

export async function updateControlFormTemplate(id: number, payload: ControlFormTemplateDto) {
  const { data } = await axiosInstance.put<ControlFormTemplateDto>(`/api/controlformtemplates/${id}`, payload);
  return data;
}

export async function deleteControlFormTemplate(id: number) {
  await axiosInstance.delete(`/api/controlformtemplates/${id}`);
}
