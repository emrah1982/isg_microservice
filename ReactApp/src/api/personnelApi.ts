import { axiosInstance } from '@utils/axiosInstance';

const PERSONNEL_BASE = (import.meta as any)?.env?.VITE_PERSONNEL_API || 'http://localhost:8089';

export type Personnel = {
  id: number;
  userId?: number | null;
  nationalId?: string;
  tcNo?: string; // Alias for nationalId
  citizenshipType?: string; // TR | Foreign
  nationality?: string;
  foreignIdentityNumber?: string;
  passportNumber?: string;
  companyId?: number | null;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  department?: string;
  title?: string;
  position?: string;
  startDate?: string; // ISO
  endDate?: string; // ISO - for terminated employees
  isgTemelEgitimBelgesiTarihi?: string; // ISO
  status?: 'Active' | 'Inactive' | string;
  createdAt?: string;
  updatedAt?: string;
};

export type BlacklistEntry = {
  id: number;
  personnelId?: number | null;
  companyId?: number | null;
  fullName?: string | null;
  nationalId?: string | null;
  foreignIdentityNumber?: string | null;
  passportNumber?: string | null;
  nationality?: string | null;
  category: string;
  reason: string;
  riskLevel: string;
  source?: string | null;
  decisionNumber?: string | null;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type BlacklistQuery = {
  q?: string;
  isActive?: boolean;
  category?: string;
  riskLevel?: string;
  companyId?: number;
  from?: string;
  to?: string;
};

export async function listBlacklistEntries(query: BlacklistQuery = {}): Promise<BlacklistEntry[]> {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.append(k, String(v));
  });
  const { data } = await axiosInstance.get(`/api/personnel/blacklist${params.toString() ? `?${params}` : ''}`);
  return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
}

export async function createBlacklistEntry(payload: any): Promise<BlacklistEntry> {
  const { data } = await axiosInstance.post(`/api/personnel/blacklist`, payload);
  return data?.data ?? data;
}

export async function deactivateBlacklistEntry(id: number): Promise<BlacklistEntry> {
  const { data } = await axiosInstance.post(`/api/personnel/blacklist/${id}/deactivate`);
  return data?.data ?? data;
}

export async function activateBlacklistEntry(id: number): Promise<BlacklistEntry> {
  const { data } = await axiosInstance.post(`/api/personnel/blacklist/${id}/activate`);
  return data?.data ?? data;
}

export type PersonnelQuery = {
  department?: string;
  title?: string;
  q?: string;
  nationalId?: string; // TC kimlik no (opsiyonel)
  companyId?: number; // Firma filtresi
  page?: number;
  pageSize?: number;
};

export async function listPersonnel(query: PersonnelQuery = {}): Promise<Personnel[]> {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.append(k, String(v));
  });
  const { data } = await axiosInstance.get(`${PERSONNEL_BASE}/api/personnel${params.toString() ? `?${params}` : ''}`);
  // Some services wrap with { data: [...] }
  return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
}

export async function getPersonnel(id: number): Promise<Personnel> {
  const { data } = await axiosInstance.get(`/api/personnel/${id}`);
  return data?.data ?? data;
}

export async function createPersonnel(payload: Partial<Personnel>): Promise<Personnel> {
  const { data } = await axiosInstance.post(`/api/personnel`, payload);
  return data?.data ?? data;
}

export async function updatePersonnel(id: number, payload: Partial<Personnel>): Promise<Personnel> {
  try {
    const { data } = await axiosInstance.put(`/api/personnel/${id}`, payload);
    return data?.data ?? data;
  } catch (error: any) {
    console.error('Personnel update API error:', error?.response?.data || error);
    throw error;
  }
}

export async function importPersonnelExcel(file: File, opts?: { companyId?: number | null; department?: string; title?: string }): Promise<any> {
  const form = new FormData();
  form.append('file', file);
  if (opts?.companyId !== undefined && opts?.companyId !== null) form.append('companyId', String(opts.companyId));
  if (opts?.department) form.append('department', opts.department);
  if (opts?.title) form.append('title', opts.title);
  // optional: nationality selection
  if ((opts as any)?.citizenshipType) form.append('citizenshipType', String((opts as any).citizenshipType));
  if ((opts as any)?.nationality) form.append('nationality', String((opts as any).nationality));

  const { data } = await axiosInstance.post(`/api/personnel/import-excel`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
}

export async function importIsgTemelTrainingRenewalExcel(file: File, hazardClass: 'cok_tehlikeli' | 'tehlikeli' | 'az_tehlikeli'): Promise<any> {
  const form = new FormData();
  form.append('file', file);
  form.append('hazardClass', hazardClass);
  const { data } = await axiosInstance.post(`/api/personnel/reports/isg-temel-training-renewal/import-excel`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
}

export async function downloadIsgTemelTrainingRenewalTemplate(): Promise<Blob> {
  const res = await axiosInstance.get(`/api/personnel/reports/isg-temel-training-renewal/template`, {
    responseType: 'blob',
  });
  return res.data as Blob;
}

export async function applyIsgTemelTrainingRenewalExcelToPersonnel(file: File, overwriteExisting = true): Promise<any> {
  const form = new FormData();
  form.append('file', file);
  form.append('overwriteExisting', String(overwriteExisting));
  const { data } = await axiosInstance.post(`/api/personnel/reports/isg-temel-training-renewal/apply-excel`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
}

export async function deletePersonnel(id: number): Promise<void> {
  await axiosInstance.delete(`/api/personnel/${id}`);
}

export async function loginPersonnel(nationalId: string, phone: string) {
  const { data } = await axiosInstance.post(`/api/auth/login`, { nationalId, phone });
  return data;
}
