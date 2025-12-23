import axiosInstance from '@utils/axiosInstance';

// Types
export type CorrectiveAction = {
  id?: number;
  isgReportId?: number | null;
  observationId?: number | null;
  incidentId?: number | null;
  actionType?: string; // 'Corrective'
  title: string;
  description?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical' | string;
  status?: 'Planned' | 'InProgress' | 'Completed' | 'Cancelled' | string;
  assignedToPersonnelId?: number | null;
  assignedToPersonName?: string;
  createdByPersonnelId?: number | null;
  createdByPersonName?: string;
  plannedStartDate?: string | null;
  plannedCompletionDate?: string | null;
  actualStartDate?: string | null;
  actualCompletionDate?: string | null;
  estimatedCost?: number | null;
  actualCost?: number | null;
  resources?: string;
  completionNotes?: string;
  effectivenessEvaluation?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CommunicationLetter = {
  id?: number;
  letterNumber?: string;
  personnelId?: number | null;
  companyId?: number | null;
  companyName?: string;
  senderName?: string;
  receiverName?: string;
  sentDate?: string;
  medium?: string; // Email/Telefon/Yazı
  subject?: string;
  content?: string;
  status?: string; // Open/Closed/Archived
  attachmentPath?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PreventiveAction = {
  id?: number;
  isgReportId?: number | null;
  actionType?: string; // 'Preventive'
  category?: string;
  title: string;
  description?: string;
  objective?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical' | string;
  status?: 'Planned' | 'InProgress' | 'Completed' | 'Cancelled' | string;
  assignedToPersonnelId?: number | null;
  assignedToPersonName?: string;
  createdByPersonnelId?: number | null;
  createdByPersonName?: string;
  plannedStartDate?: string | null;
  plannedCompletionDate?: string | null;
  actualStartDate?: string | null;
  actualCompletionDate?: string | null;
  estimatedCost?: number | null;
  actualCost?: number | null;
  resources?: string;
  successMetrics?: string;
  completionNotes?: string;
  effectivenessEvaluation?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
  nextScheduledDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ActivityPhoto = {
  id: number;
  entityType: string;
  entityId: number;
  fileName: string;
  storedPath: string; // relative path under wwwroot
  contentType: string;
  fileSize: number;
  caption?: string | null;
  createdAt: string;
};

export type Warning = {
  id?: number;
  warningNumber?: string;
  personnelId?: number | null;
  personnelName?: string;
  personnelTcNo?: string;
  personnelPosition?: string;
  companyId?: number | null;
  companyName?: string;
  issuedByPersonnelId?: number | null;
  issuedByPersonName?: string;
  warningDate?: string;
  warningType?: string;
  category?: string;
  violationType?: string;
  description?: string;
  location?: string;
  incidentDateTime?: string | null;
  witnesses?: string;
  immediateActions?: string;
  expectedImprovement?: string;
  followUpDate?: string | null;
  followUpNotes?: string;
  status?: string;
  isAcknowledged?: boolean;
  acknowledgedDate?: string | null;
  personnelResponse?: string;
  attachmentPath?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Penalty = {
  id?: number;
  penaltyNumber?: string;
  personnelId?: number | null;
  personnelName?: string;
  personnelTcNo?: string;
  personnelPosition?: string;
  companyId?: number | null;
  companyName?: string;
  issuedByPersonnelId?: number | null;
  issuedByPersonName?: string;
  penaltyDate?: string;
  penaltyType?: string;
  category?: string;
  violationType?: string;
  description?: string;
  location?: string;
  incidentDateTime?: string | null;
  severity?: string;
  financialPenalty?: number | null;
  suspensionDays?: number | null;
  suspensionStartDate?: string | null;
  suspensionEndDate?: string | null;
  legalBasis?: string;
  witnesses?: string;
  evidence?: string;
  defenseStatement?: string;
  defenseDate?: string | null;
  decisionReason?: string;
  status?: string;
  isAppealed?: boolean;
  appealDate?: string | null;
  appealReason?: string;
  appealDecision?: string;
  appealDecisionDate?: string | null;
  attachmentPath?: string;
  createdAt?: string;
  updatedAt?: string;
};

// Helpers
function apiKeyHeaders() {
  const key = localStorage.getItem('activitiesApiKey');
  return key ? { 'X-Api-Key': key } : {};
}

// Corrective Actions
export async function listCorrective(params: { q?: string; status?: string; priority?: string } = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) search.append(k, String(v)); });
  const { data } = await axiosInstance.get(`/api/correctiveactions${search.toString() ? `?${search}` : ''}`);
  return data as CorrectiveAction[];
}

export async function getCorrective(id: number) {
  const { data } = await axiosInstance.get(`/api/correctiveactions/${id}`);
  return data as CorrectiveAction;
}

export async function createCorrective(payload: CorrectiveAction) {
  const { data } = await axiosInstance.post('/api/correctiveactions', payload);
  return data as CorrectiveAction;
}

export async function updateCorrective(id: number, payload: CorrectiveAction) {
  const { data } = await axiosInstance.put(`/api/correctiveactions/${id}`, payload);
  return data as CorrectiveAction;
}

export async function deleteCorrective(id: number) {
  await axiosInstance.delete(`/api/correctiveactions/${id}`);
}

// Preventive Actions
export async function listPreventive(params: { q?: string; status?: string; priority?: string } = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) search.append(k, String(v)); });
  const { data } = await axiosInstance.get(`/api/preventiveactions${search.toString() ? `?${search}` : ''}`);
  return data as PreventiveAction[];
}

export async function getPreventive(id: number) {
  const { data } = await axiosInstance.get(`/api/preventiveactions/${id}`);
  return data as PreventiveAction;
}

export async function createPreventive(payload: PreventiveAction) {
  const { data } = await axiosInstance.post('/api/preventiveactions', payload);
  return data as PreventiveAction;
}

export async function updatePreventive(id: number, payload: PreventiveAction) {
  const { data } = await axiosInstance.put(`/api/preventiveactions/${id}`, payload);
  return data as PreventiveAction;
}

export async function deletePreventive(id: number) {
  await axiosInstance.delete(`/api/preventiveactions/${id}`);
}

// Photos
export async function listPhotos(entityType: string, entityId: number) {
  const { data } = await axiosInstance.get(`/api/photos/${entityType}/${entityId}`);
  return data as ActivityPhoto[];
}

export async function uploadPhoto(entityType: string, entityId: number, file: File, caption?: string) {
  const form = new FormData();
  form.append('file', file);
  if (caption) form.append('caption', caption);
  const { data } = await axiosInstance.post(`/api/photos/${entityType}/${entityId}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data as ActivityPhoto;
}

export async function deletePhoto(photoId: number) {
  await axiosInstance.delete(`/api/photos/${photoId}`);
}

// Warnings
export async function listWarnings(params: { q?: string; status?: string; personnelId?: number } = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') search.append(k, String(v)); });
  const { data } = await axiosInstance.get(`/api/warnings${search.toString() ? `?${search}` : ''}`);
  return data as Warning[];
}

export async function getWarning(id: number) {
  const { data } = await axiosInstance.get(`/api/warnings/${id}`);
  return data as Warning;
}

export async function createWarning(payload: Warning) {
  const { data } = await axiosInstance.post('/api/warnings', payload);
  return data as Warning;
}

export async function updateWarning(id: number, payload: Warning) {
  const { data } = await axiosInstance.put(`/api/warnings/${id}`, payload);
  return data as Warning;
}

export async function deleteWarning(id: number) {
  await axiosInstance.delete(`/api/warnings/${id}`);
}

// Communications
export async function listCommunications(params: { q?: string; status?: string; personnelId?: number; companyName?: string; subject?: string } = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') search.append(k, String(v)); });
  const { data } = await axiosInstance.get<CommunicationLetter[]>(`/api/communications${search.toString() ? `?${search}` : ''}`);
  return data;
}

export async function getCommunication(id: number) {
  const { data } = await axiosInstance.get<CommunicationLetter>(`/api/communications/${id}`);
  return data;
}

export async function createCommunication(payload: CommunicationLetter) {
  const { data } = await axiosInstance.post<CommunicationLetter>('/api/communications', payload);
  return data;
}

export async function updateCommunication(id: number, payload: CommunicationLetter) {
  const { data } = await axiosInstance.put<CommunicationLetter>(`/api/communications/${id}`, payload);
  return data;
}

export async function deleteCommunication(id: number) {
  await axiosInstance.delete(`/api/communications/${id}`);
}

// Penalties
export async function listPenalties(params: { q?: string; status?: string; personnelId?: number } = {}) {
  const search = new URLSearchParams();
  const { data } = await axiosInstance.get(`/api/penalties${search.toString() ? `?${search}` : ''}`);
  return data as Penalty[];
}

export async function getPenalty(id: number) {
  const { data } = await axiosInstance.get(`/api/penalties/${id}`);
  return data as Penalty;
}

export async function createPenalty(payload: Penalty) {
  const { data } = await axiosInstance.post('/api/penalties', payload);
  return data as Penalty;
}

export async function updatePenalty(id: number, payload: Penalty) {
  const { data } = await axiosInstance.put(`/api/penalties/${id}`, payload);
  return data as Penalty;
}

export async function deletePenalty(id: number) {
  await axiosInstance.delete(`/api/penalties/${id}`);
}

// Personnel Search
export type PersonnelSearchResult = {
  id: number;
  tcNo?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  position?: string;
  department?: string;
  companyId?: number | null;
  companyName?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
};

export async function searchPersonnelByTcNo(tcNo: string) {
  const { data } = await axiosInstance.get(`/api/personnel/search/${tcNo}`);
  return data as PersonnelSearchResult;
}

export async function getCompanies() {
  const { data } = await axiosInstance.get('/api/personnel/companies');
  return data as { id: number; name: string; }[];
}

// Field Inspections
export type FieldInspection = {
  id: number;
  companyId?: number | null;
  date: string;
  location: string;
  hazardTitle: string;
  hazardDescription: string;
  legislation?: string;
  measures: string;
  riskTargets: string;
  severity: number;
  likelihood: number;
  riskScore: number;
  riskLevel: 'Dusuk' | 'Orta' | 'Yuksek' | 'Kabul Edilemez';
  beforeImageUrl?: string;
  afterImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type FieldInspectionFilters = {
  companyId?: number;
  search?: string;
  riskLevel?: string;
  startDate?: string;
  endDate?: string;
};

export async function getFieldInspections(filters?: FieldInspectionFilters) {
  const params = new URLSearchParams();
  if (filters?.companyId) params.append('companyId', filters.companyId.toString());
  if (filters?.search) params.append('search', filters.search);
  if (filters?.riskLevel) params.append('riskLevel', filters.riskLevel);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);

  const { data } = await axiosInstance.get(`/api/fieldinspections${params.toString() ? `?${params}` : ''}`);
  return data as FieldInspection[];
}

export async function getFieldInspection(id: number) {
  const { data } = await axiosInstance.get(`/api/fieldinspections/${id}`);
  return data as FieldInspection;
}

export async function createFieldInspection(payload: Omit<FieldInspection, 'id' | 'riskScore' | 'createdAt' | 'updatedAt'>) {
  const { data } = await axiosInstance.post('/api/fieldinspections', payload);
  return data as FieldInspection;
}

export async function updateFieldInspection(id: number, payload: Omit<FieldInspection, 'createdAt' | 'updatedAt'>) {
  const { data } = await axiosInstance.put(`/api/fieldinspections/${id}`, payload);
  return data as FieldInspection;
}

export async function deleteFieldInspection(id: number) {
  await axiosInstance.delete(`/api/fieldinspections/${id}`);
}
