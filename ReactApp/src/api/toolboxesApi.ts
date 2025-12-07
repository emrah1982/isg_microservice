import axiosInstance from '@utils/axiosInstance';

export type ToolboxDto = {
  id?: number;
  title: string;
  content?: string | null;
  category?: string | null;
  keywords?: string | null;
  createdByPersonnelId?: number | null;
  createdByPersonName?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
};

export async function listToolboxes(params: { q?: string } = {}) {
  const search = new URLSearchParams();
  if (params.q) search.append('q', params.q);
  const { data } = await axiosInstance.get<ToolboxDto[]>(`/api/toolboxes${search.toString() ? `?${search}` : ''}`);
  return data;
}

export async function getToolbox(id: number) {
  const { data } = await axiosInstance.get<ToolboxDto>(`/api/toolboxes/${id}`);
  return data;
}

export async function createToolbox(payload: ToolboxDto) {
  const { data } = await axiosInstance.post<ToolboxDto>('/api/toolboxes', payload);
  return data;
}

export async function updateToolbox(id: number, payload: ToolboxDto) {
  const { data } = await axiosInstance.put<ToolboxDto>(`/api/toolboxes/${id}`, payload);
  return data;
}

export async function deleteToolbox(id: number) {
  await axiosInstance.delete(`/api/toolboxes/${id}`);
}
