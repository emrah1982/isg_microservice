import axiosInstance from '@utils/axiosInstance';

export interface MachineDto {
  id?: number;
  machineType: string;
  name: string;
  model?: string;
  serialNumber?: string;
  location?: string;
  manufactureYear?: number;
  status: 'Active' | 'Maintenance' | 'Retired';
  customChecklistJson?: string;
  customChecklist?: Array<{
    item: string;
    checked?: boolean;
    notes?: string;
    category?: string;
    isRequired?: boolean;
  }>;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function listMachines(params?: { q?: string; status?: string; machineType?: string }) {
  const { data } = await axiosInstance.get<MachineDto[]>('/api/machines', { params });
  return data.map(m => ({
    ...m,
    customChecklist: m.customChecklistJson ? JSON.parse(m.customChecklistJson) : undefined
  }));
}

export async function getMachine(id: number) {
  const { data } = await axiosInstance.get<MachineDto>(`/api/machines/${id}`);
  return {
    ...data,
    customChecklist: data.customChecklistJson ? JSON.parse(data.customChecklistJson) : undefined
  };
}

export async function createMachine(payload: MachineDto) {
  const toSend = {
    ...payload,
    customChecklistJson: payload.customChecklist ? JSON.stringify(payload.customChecklist) : undefined
  };
  const { data } = await axiosInstance.post<MachineDto>('/api/machines', toSend);
  return data;
}

export async function updateMachine(id: number, payload: MachineDto) {
  const toSend = {
    ...payload,
    customChecklistJson: payload.customChecklist ? JSON.stringify(payload.customChecklist) : undefined
  };
  const { data } = await axiosInstance.put<MachineDto>(`/api/machines/${id}`, toSend);
  return data;
}

export async function deleteMachine(id: number) {
  await axiosInstance.delete(`/api/machines/${id}`);
}

export async function saveCustomChecklist(machineId: number, checklist: any[]) {
  const { data } = await axiosInstance.post(`/api/machines/${machineId}/checklist`, {
    checklistJson: JSON.stringify(checklist)
  });
  return data;
}

export async function getMachinesByType() {
  const { data } = await axiosInstance.get('/api/machines/by-type');
  return data;
}
