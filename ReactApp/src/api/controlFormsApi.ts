import axiosInstance from '@utils/axiosInstance';

export interface ChecklistItem {
  item: string;
  checked: boolean; // true = OK, false = Eksik
  notes?: string;
  category?: string;
  isRequired?: boolean;
}

export interface ControlFormAttachmentDto {
  id?: number;
  controlFormId?: number;
  fileName: string;
  storedPath: string;
  contentType?: string;
  fileSize: number;
  fileType: 'Document' | 'Image';
  uploadedAt?: string;
}

export interface ControlFormDto {
  id?: number;
  formNumber: string;
  machineName: string;
  machineModel?: string;
  machineSerialNumber?: string;
  location?: string;
  controlDate: string;
  controlledByPersonName?: string;
  controlledByPersonnelId?: number;
  status: 'Pending' | 'Completed' | 'Failed';
  notes?: string;
  checklistItemsJson?: string;
  checklistItems?: ChecklistItem[];
  createdAt?: string;
  updatedAt?: string;
  attachments?: ControlFormAttachmentDto[];
}

export async function listControlForms(params?: { q?: string; status?: string }) {
  const { data } = await axiosInstance.get<ControlFormDto[]>('/api/controlforms', { params });
  return data.map(form => ({
    ...form,
    checklistItems: form.checklistItemsJson ? JSON.parse(form.checklistItemsJson) : []
  }));
}

export async function getControlForm(id: number) {
  const { data } = await axiosInstance.get<ControlFormDto>(`/api/controlforms/${id}`);
  return {
    ...data,
    checklistItems: data.checklistItemsJson ? JSON.parse(data.checklistItemsJson) : []
  };
}

export async function createControlForm(payload: ControlFormDto) {
  const toSend = {
    ...payload,
    checklistItemsJson: payload.checklistItems ? JSON.stringify(payload.checklistItems) : undefined
  };
  const { data } = await axiosInstance.post<ControlFormDto>('/api/controlforms', toSend);
  return data;
}

export async function updateControlForm(id: number, payload: ControlFormDto) {
  const toSend = {
    ...payload,
    checklistItemsJson: payload.checklistItems ? JSON.stringify(payload.checklistItems) : undefined
  };
  const { data } = await axiosInstance.put<ControlFormDto>(`/api/controlforms/${id}`, toSend);
  return data;
}

export async function deleteControlForm(id: number) {
  await axiosInstance.delete(`/api/controlforms/${id}`);
}

export async function uploadAttachment(formId: number, file: File, fileType: 'Document' | 'Image') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileType', fileType);
  
  const { data } = await axiosInstance.post<ControlFormAttachmentDto>(
    `/api/controlforms/${formId}/attachments`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data;
}

export async function deleteAttachment(attachmentId: number) {
  await axiosInstance.delete(`/api/controlforms/attachments/${attachmentId}`);
}
