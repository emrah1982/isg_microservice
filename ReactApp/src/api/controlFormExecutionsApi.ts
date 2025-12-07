import axiosInstance from '@utils/axiosInstance';

export interface ChecklistResponse {
  itemId: number;
  itemText: string;
  isRequired: boolean;
  responseType: 'checkbox' | 'text' | 'number' | 'select';
  booleanValue?: boolean;
  textValue?: string;
  numberValue?: number;
  selectValue?: string;
  notes?: string;
  isCompliant: boolean;
  isCritical: boolean;
  score?: number;
  responseDate: string;
}

export interface ControlFormExecutionAttachmentDto {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  description?: string;
  uploadedAt: string;
}

export interface ControlFormExecutionDto {
  id: number;
  controlFormTemplateId: number;
  templateName?: string;
  executionNumber: string;
  machineId?: number;
  machineName?: string;
  machineModel?: string;
  machineSerialNumber?: string;
  location?: string;
  executionDate: string;
  executedByPersonnelId?: number;
  executedByPersonName?: string;
  status: 'InProgress' | 'Completed' | 'Cancelled';
  notes?: string;
  checklistResponses: ChecklistResponse[];
  totalScore?: number;
  maxScore?: number;
  successPercentage?: number;
  hasCriticalIssues: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
  attachments: ControlFormExecutionAttachmentDto[];
}

export interface CreateControlFormExecutionDto {
  controlFormTemplateId: number;
  machineId?: number;
  machineName?: string;
  machineModel?: string;
  machineSerialNumber?: string;
  location?: string;
  executionDate?: string;
  executedByPersonnelId?: number;
  executedByPersonName?: string;
  notes?: string;
}

export interface UpdateControlFormExecutionDto {
  executionDate?: string;
  executedByPersonnelId?: number;
  executedByPersonName?: string;
  status?: 'InProgress' | 'Completed' | 'Cancelled';
  notes?: string;
  checklistResponses?: ChecklistResponse[];
}

export interface ControlFormTemplateDto {
  id: number;
  templateName: string;
  machineType: string;
  model?: string;
  serialNumber?: string;
  checklistItems: ChecklistItem[];
}

export interface ChecklistItem {
  id: number;
  item: string;
  isRequired: boolean;
  notes?: string;
  responseType?: 'checkbox' | 'text' | 'number' | 'select';
  selectOptions?: string[];
  isCritical?: boolean;
}

export interface ControlFormExecutionFilters {
  q?: string;
  status?: string;
  templateId?: number;
  machineId?: number;
  startDate?: string;
  endDate?: string;
}

// API Functions
export const listControlFormExecutions = async (filters: ControlFormExecutionFilters = {}): Promise<ControlFormExecutionDto[]> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.q) params.append('q', filters.q);
    if (filters.status) params.append('status', filters.status);
    if (filters.templateId) params.append('templateId', filters.templateId.toString());
    if (filters.machineId) params.append('machineId', filters.machineId.toString());
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await axiosInstance.get(`/api/controlformexecutions?${params.toString()}`);
    const items = (response.data || []) as any[];
    // Map raw backend to DTO expected by UI
    const mapped: ControlFormExecutionDto[] = items.map((r: any) => {
      const parsedResponses: ChecklistResponse[] = r.checklistResponses
        ? r.checklistResponses
        : (r.checklistResponsesJson ? JSON.parse(r.checklistResponsesJson) : []);

      return {
        id: r.id,
        controlFormTemplateId: r.controlFormTemplateId,
        templateName: r.templateName || r.template?.templateName,
        executionNumber: r.executionNumber,
        machineId: r.machineId,
        machineName: r.machineName || r.machine?.name,
        machineModel: r.machineModel || r.machine?.model,
        machineSerialNumber: r.machineSerialNumber || r.machine?.serialNumber,
        location: r.location,
        executionDate: r.executionDate,
        executedByPersonnelId: r.executedByPersonnelId,
        executedByPersonName: r.executedByPersonName,
        status: r.status,
        notes: r.notes,
        checklistResponses: parsedResponses || [],
        totalScore: r.totalScore,
        maxScore: r.maxScore,
        successPercentage: r.successPercentage,
        hasCriticalIssues: r.hasCriticalIssues ?? false,
        completedAt: r.completedAt,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        attachments: r.attachments || []
      };
    });

    return mapped;
  } catch (error) {
    console.error('API Hatası - ControlFormExecutions listesi alınamadı:', error);
    // Backend hazır olmadığında boş liste döndür
    return [];
  }
};

export const getControlFormExecution = async (id: number): Promise<ControlFormExecutionDto> => {
  try {
    const response = await axiosInstance.get(`/api/controlformexecutions/${id}`);
    const r = response.data;
    const parsedResponses: ChecklistResponse[] = r.checklistResponses
      ? r.checklistResponses
      : (r.checklistResponsesJson ? JSON.parse(r.checklistResponsesJson) : []);

    const mapped: ControlFormExecutionDto = {
      id: r.id,
      controlFormTemplateId: r.controlFormTemplateId,
      templateName: r.templateName || r.template?.templateName,
      executionNumber: r.executionNumber,
      machineId: r.machineId,
      machineName: r.machineName || r.machine?.name,
      machineModel: r.machineModel || r.machine?.model,
      machineSerialNumber: r.machineSerialNumber || r.machine?.serialNumber,
      location: r.location,
      executionDate: r.executionDate,
      executedByPersonnelId: r.executedByPersonnelId,
      executedByPersonName: r.executedByPersonName,
      status: r.status,
      notes: r.notes,
      checklistResponses: parsedResponses || [],
      totalScore: r.totalScore,
      maxScore: r.maxScore,
      successPercentage: r.successPercentage,
      hasCriticalIssues: r.hasCriticalIssues ?? false,
      completedAt: r.completedAt,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      attachments: r.attachments || []
    };

    return mapped;
  } catch (error) {
    console.error('API Hatası - ControlFormExecution detayı alınamadı:', error);
    throw error;
  }
};

export const createControlFormExecution = async (dto: CreateControlFormExecutionDto): Promise<ControlFormExecutionDto> => {
  try {
    const response = await axiosInstance.post(`/api/controlformexecutions`, dto);
    return response.data;
  } catch (error) {
    console.error('API Hatası - ControlFormExecution oluşturulamadı:', error);
    throw error;
  }
};

export const updateControlFormExecution = async (id: number, dto: UpdateControlFormExecutionDto): Promise<void> => {
  try {
    // checklistResponses array'ini JSON string'e çevir
    const payload = {
      ...dto,
      checklistResponsesJson: dto.checklistResponses ? JSON.stringify(dto.checklistResponses) : undefined,
      checklistResponses: undefined // Backend bu alanı beklemez
    };
    
    const response = await axiosInstance.put(`/api/controlformexecutions/${id}`, payload);
  } catch (error: any) {
    console.error('API Hatası - ControlFormExecution güncellenemedi:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
};

export const deleteControlFormExecution = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/controlformexecutions/${id}`);
  } catch (error) {
    console.error('API Hatası - ControlFormExecution silinemedi:', error);
    throw error;
  }
};

export interface BulkExecutionDto {
  controlFormTemplateId: number;
  machineIds: number[];
  executedByPersonName?: string;
  notes?: string;
}

export const createBulkExecutions = async (dto: BulkExecutionDto): Promise<{ message: string; executions: ControlFormExecutionDto[] }> => {
  try {
    const response = await axiosInstance.post(`/api/controlformexecutions/bulk`, dto);
    return response.data;
  } catch (error) {
    console.error('API Hatası - Toplu ControlFormExecution oluşturulamadı:', error);
    throw error;
  }
};

export const getTemplatesForExecution = async (): Promise<ControlFormTemplateDto[]> => {
  try {
    const response = await axiosInstance.get(`/api/controlformtemplates`);
    
    // Backend'den gelen veriyi frontend formatına çevir
    const templates: ControlFormTemplateDto[] = response.data.map((template: any) => ({
      id: template.id,
      templateName: template.templateName,
      machineType: template.machineType,
      model: template.model,
      checklistItems: template.checklistItemsJson ? JSON.parse(template.checklistItemsJson) : []
    }));
    
    return templates;
  } catch (error) {
    console.error('API Hatası - ControlFormTemplates listesi alınamadı:', error);
    // Backend hazır olmadığında boş liste döndür
    return [];
  }
};

// Utility functions
export const getStatusText = (status: string): string => {
  switch (status) {
    case 'InProgress':
      return 'Devam Ediyor';
    case 'Completed':
      return 'Tamamlandı';
    case 'Cancelled':
      return 'İptal Edildi';
    default:
      return status;
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'InProgress':
      return '#ff9800';
    case 'Completed':
      return '#4caf50';
    case 'Cancelled':
      return '#f44336';
    default:
      return '#666';
  }
};

export const calculateCompletionRate = (responses: ChecklistResponse[]): number => {
  if (!responses || responses.length === 0) return 0;
  
  const completedCount = responses.filter(r => {
    // Checkbox tipi: true veya false (null değil)
    if (r.responseType === 'checkbox') {
      return r.booleanValue !== null && r.booleanValue !== undefined;
    }
    // Text tipi: boş olmayan string
    if (r.responseType === 'text') {
      return r.textValue && r.textValue.trim() !== '';
    }
    // Number tipi: null olmayan sayı
    if (r.responseType === 'number') {
      return r.numberValue !== null && r.numberValue !== undefined;
    }
    // Select tipi: boş olmayan seçim
    if (r.responseType === 'select') {
      return r.selectValue && r.selectValue.trim() !== '';
    }
    return false;
  }).length;
  
  return Math.round((completedCount / responses.length) * 100);
};

export const hasCriticalIssues = (responses: ChecklistResponse[]): boolean => {
  return responses.some(r => r.isCritical && !r.isCompliant);
};
