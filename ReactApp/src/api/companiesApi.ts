import { axiosInstance } from '@utils/axiosInstance';

export type Company = {
  id: number;
  name: string;
  taxNumber?: string | null;
  address?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export async function listCompanies(): Promise<Company[]> {
  const { data } = await axiosInstance.get('/api/companies');
  return Array.isArray(data) ? data : [];
}

export async function getCompany(id: number): Promise<Company> {
  const { data } = await axiosInstance.get(`/api/companies/${id}`);
  return data;
}

export async function createCompany(payload: Partial<Company>): Promise<Company> {
  const { data } = await axiosInstance.post('/api/companies', payload);
  return data;
}

export async function updateCompany(id: number, payload: Partial<Company>): Promise<Company> {
  const { data } = await axiosInstance.put(`/api/companies/${id}`, payload);
  return data;
}

export async function deleteCompany(id: number): Promise<void> {
  await axiosInstance.delete(`/api/companies/${id}`);
}
