import axiosInstance from '@utils/axiosInstance';

export interface MachineChecklistItemDto {
  id?: number;
  machineTemplateId?: number;
  itemText: string;
  category?: string;
  displayOrder: number;
  isRequired: boolean;
}

export interface MachineTemplateDto {
  id?: number;
  machineType: string;
  description?: string;
  isActive: boolean;
  checklistItems?: MachineChecklistItemDto[];
}

export async function listMachineTemplates() {
  const { data } = await axiosInstance.get<MachineTemplateDto[]>('/api/machinetemplates');
  return data;
}

export async function getMachineTemplate(id: number) {
  const { data } = await axiosInstance.get<MachineTemplateDto>(`/api/machinetemplates/${id}`);
  return data;
}

export async function createMachineTemplate(payload: { machineType: string; description?: string; isActive?: boolean }) {
  const body = {
    machineType: payload.machineType,
    description: payload.description ?? '',
    isActive: payload.isActive ?? true,
    checklistItems: [],
  } as MachineTemplateDto;
  const { data } = await axiosInstance.post<MachineTemplateDto>('/api/machinetemplates', body);
  return data;
}

export async function createMachineTemplateWithItems(payload: {
  machineType: string;
  description?: string;
  isActive?: boolean;
  items: Array<{ itemText: string; category?: string; isRequired?: boolean; displayOrder?: number }>;
}) {
  const checklistItems: MachineChecklistItemDto[] = payload.items.map((it, idx) => ({
    itemText: it.itemText,
    category: it.category,
    isRequired: it.isRequired ?? true,
    displayOrder: it.displayOrder ?? idx,
  }));

  const body: MachineTemplateDto = {
    machineType: payload.machineType,
    description: payload.description ?? '',
    isActive: payload.isActive ?? true,
    checklistItems,
  };

  const { data } = await axiosInstance.post<MachineTemplateDto>('/api/machinetemplates', body);
  return data;
}
