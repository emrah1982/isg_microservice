import { axiosInstance } from '@utils/axiosInstance';

export type Incident = {
  id: string;
  title: string;
  type?: string;
  severity: string;
  occurredAt: string;
  location?: string;
  status?: string;
  description?: string;
};

export async function fetchActionDescriptions(): Promise<string[]> {
  const { data } = await axiosInstance.get<ApiResponse<string[]>>('/api/incidents/actions/descriptions');
  return Array.isArray(data?.data) ? data.data : [];
}

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
};

type BackendIncident = {
  id: number;
  title: string;
  description?: string | null;
  incidentDate: string;
  type: string;
  severity: string;
  location?: string | null;
  status: string;
};

export async function fetchIncidents(): Promise<Incident[]> {
  const { data } = await axiosInstance.get<ApiResponse<BackendIncident[]>>('/api/incidents');
  const list = Array.isArray(data?.data) ? data.data : [];
  return list.map(i => ({
    id: String(i.id),
    title: i.title,
    type: i.type ?? undefined,
    severity: i.severity ?? '',
    occurredAt: i.incidentDate,
    location: i.location ?? undefined,
    status: i.status ?? undefined,
    description: i.description ?? undefined,
  }));
}

// Create types aligned with backend IncidentCreateDto
export type CreateIncidentInput = {
  title: string;
  description?: string;
  incidentDate: string; // ISO
  type: string; // required by DTO
  severity: string; // e.g., Low/Medium/High/Critical
  location?: string;
  involvedPersonId?: number;
  rootCause?: string;
  correctiveActions?: string;
  requiresReporting?: boolean;
  reportingDeadline?: string;
};

export async function createIncident(payload: CreateIncidentInput): Promise<Incident> {
  const { data } = await axiosInstance.post<ApiResponse<BackendIncident>>('/api/incidents', payload);
  const i = data.data;
  return {
    id: String(i.id),
    title: i.title,
    type: i.type ?? undefined,
    severity: i.severity ?? '',
    occurredAt: i.incidentDate,
    location: i.location ?? undefined,
    status: i.status ?? undefined,
    description: i.description ?? undefined,
  };
}

export async function fetchIncidentById(id: string): Promise<Incident> {
  const { data } = await axiosInstance.get<ApiResponse<BackendIncident>>(`/api/incidents/${id}`);
  const i = data.data;
  return {
    id: String(i.id),
    title: i.title,
    type: i.type ?? undefined,
    severity: i.severity ?? '',
    occurredAt: i.incidentDate,
    location: i.location ?? undefined,
    status: i.status ?? undefined,
    description: i.description ?? undefined,
  };
}
