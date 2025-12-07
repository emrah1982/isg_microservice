import { axiosInstance } from '@utils/axiosInstance';

const PERSONNEL_BASE = (import.meta as any)?.env?.VITE_PERSONNEL_API || 'http://localhost:8089';

export type Personnel = {
  id: number;
  userId?: number | null;
  nationalId?: string;
  companyId?: number | null;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  department?: string;
  title?: string;
  position?: string;
  startDate?: string; // ISO
  status?: 'Active' | 'Inactive' | string;
  createdAt?: string;
  updatedAt?: string;
};

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
  const { data } = await axiosInstance.get(`/api/personnel${params.toString() ? `?${params}` : ''}`);
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

export async function deletePersonnel(id: number): Promise<void> {
  await axiosInstance.delete(`/api/personnel/${id}`);
}

export async function loginPersonnel(nationalId: string, phone: string) {
  const { data } = await axiosInstance.post(`/api/auth/login`, { nationalId, phone });
  return data;
}
