import { axiosInstance } from '@utils/axiosInstance';

export type PpeItem = { id: number; name: string; category?: string; standard?: string; size?: string; isActive: boolean; stockQuantity: number };
export type PpeAssignment = { id: number; personnelId: number; ppeItemId: number; quantity: number; assignedAt: string; assignedBy?: string; status: string; dueDate?: string; returnedAt?: string };
export type EnrichedAssignment = {
  id: number;
  personnelId: number;
  personnelName?: string | null;
  title?: string | null;
  department?: string | null;
  ppeItemId: number;
  itemName?: string | null;
  quantity: number;
  assignedAt: string;
  assignedBy?: string | null;
  status: string;
  dueDate?: string | null;
  returnedAt?: string | null;
};
export type PpeIssue = { id: number; assignmentId: number; type: string; notes?: string; reportedAt: string; reportedBy?: string };

// Items
export async function listPpeItems(q?: string): Promise<PpeItem[]> {
  const url = q ? `/api/ppeitems?q=${encodeURIComponent(q)}` : '/api/ppeitems';
  const { data } = await axiosInstance.get(url);
  return Array.isArray((data as any)?.data)
    ? (data as any).data
    : Array.isArray(data)
    ? (data as any)
    : [];
}

export async function listPpeAssignmentsEnriched(params?: { personnelId?: number }): Promise<EnrichedAssignment[]> {
  const search = new URLSearchParams();
  if (params?.personnelId) search.set('personnelId', String(params.personnelId));
  const suffix = search.toString() ? `?${search.toString()}` : '';
  const { data } = await axiosInstance.get(`/api/ppeassignments/enriched${suffix}`);
  return Array.isArray(data) ? (data as EnrichedAssignment[]) : [];
}

export async function createPpeItem(payload: Partial<PpeItem>): Promise<PpeItem> {
  const { data } = await axiosInstance.post('/api/ppeitems', payload);
  return data;
}

export async function updatePpeItem(id: number, payload: Partial<PpeItem>): Promise<PpeItem> {
  const { data } = await axiosInstance.put(`/api/ppeitems/${id}`, payload);
  return data;
}

export async function deletePpeItem(id: number): Promise<void> {
  await axiosInstance.delete(`/api/ppeitems/${id}`);
}

// Assignments
export async function listPpeAssignments(params?: { personnelId?: number; itemId?: number }): Promise<PpeAssignment[]> {
  const search = new URLSearchParams();
  if (params?.personnelId) search.set('personnelId', String(params.personnelId));
  if (params?.itemId) search.set('itemId', String(params.itemId));
  const suffix = search.toString() ? `?${search.toString()}` : '';
  const { data } = await axiosInstance.get(`/api/ppeassignments${suffix}`);
  return Array.isArray(data) ? data : [];
}

export async function createPpeAssignment(payload: { personnelId: number; ppeItemId: number; quantity?: number; dueDate?: string; assignedBy?: string }): Promise<PpeAssignment> {
  const { data } = await axiosInstance.post('/api/ppeassignments', payload);
  return data;
}

export async function returnPpeAssignment(id: number): Promise<PpeAssignment> {
  const { data } = await axiosInstance.put(`/api/ppeassignments/${id}/return`, {});
  return data;
}

// Issues
export async function listPpeIssues(assignmentId?: number): Promise<PpeIssue[]> {
  const url = assignmentId ? `/api/ppeissues?assignmentId=${assignmentId}` : '/api/ppeissues';
  const { data } = await axiosInstance.get(url);
  return Array.isArray(data) ? data : [];
}

export async function createPpeIssue(payload: { assignmentId: number; type?: string; notes?: string; reportedBy?: string }): Promise<PpeIssue> {
  const { data } = await axiosInstance.post('/api/ppeissues', payload);
  return data;
}
