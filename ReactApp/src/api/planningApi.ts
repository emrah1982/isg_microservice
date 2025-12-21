import { axiosInstance } from '@utils/axiosInstance';

const PLANNING_BASE = (import.meta as any)?.env?.VITE_PLANNING_API || 'http://localhost:8094';

// Risk Assessment
export type RiskAssessment = {
  id: number;
  title: string;
  description?: string;
  companyId?: number;
  department?: string;
  location?: string;
  hazardType?: string;
  riskSource?: string;
  probabilityScore?: number;
  severityScore?: number;
  riskScore?: number;
  riskLevel?: string;
  controlMeasures?: string;
  assessmentDate?: string;
  assessedBy?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function listRiskAssessments(): Promise<RiskAssessment[]> {
  const { data } = await axiosInstance.get(`${PLANNING_BASE}/api/RiskAssessments`);
  return Array.isArray(data) ? data : [];
}

export async function createRiskAssessment(payload: Partial<RiskAssessment>): Promise<RiskAssessment> {
  const { data } = await axiosInstance.post(`${PLANNING_BASE}/api/RiskAssessments`, payload);
  return data;
}

export async function updateRiskAssessment(id: number, payload: Partial<RiskAssessment>): Promise<void> {
  await axiosInstance.put(`${PLANNING_BASE}/api/RiskAssessments/${id}`, payload);
}

export async function deleteRiskAssessment(id: number): Promise<void> {
  await axiosInstance.delete(`${PLANNING_BASE}/api/RiskAssessments/${id}`);
}

// Emergency Team Member
export type EmergencyTeamMember = {
  id: number;
  companyId?: number;
  teamType: string;
  personnelId: number;
  personnelName?: string;
  personnelTcNo?: string;
  role?: string;
  phone?: string;
  assignmentDate?: string;
  isActive: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function listEmergencyTeamMembers(teamType?: string): Promise<EmergencyTeamMember[]> {
  const params = teamType ? `?teamType=${teamType}` : '';
  const { data } = await axiosInstance.get(`${PLANNING_BASE}/api/EmergencyTeamMembers${params}`);
  return Array.isArray(data) ? data : [];
}

export async function createEmergencyTeamMember(payload: Partial<EmergencyTeamMember>): Promise<EmergencyTeamMember> {
  const { data } = await axiosInstance.post(`${PLANNING_BASE}/api/EmergencyTeamMembers`, payload);
  return data;
}

export async function updateEmergencyTeamMember(id: number, payload: Partial<EmergencyTeamMember>): Promise<void> {
  await axiosInstance.put(`${PLANNING_BASE}/api/EmergencyTeamMembers/${id}`, payload);
}

export async function deleteEmergencyTeamMember(id: number): Promise<void> {
  await axiosInstance.delete(`${PLANNING_BASE}/api/EmergencyTeamMembers/${id}`);
}

// Emergency Plan
export type EmergencyPlan = {
  id: number;
  title: string;
  description?: string;
  companyId?: number;
  emergencyType?: string;
  responsiblePerson?: string;
  planDate?: string;
  reviewDate?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function listEmergencyPlans(): Promise<EmergencyPlan[]> {
  const { data } = await axiosInstance.get(`${PLANNING_BASE}/api/EmergencyPlans`);
  return Array.isArray(data) ? data : [];
}

// Corporate Planning
export type CorporatePlanning = {
  id: number;
  title: string;
  description?: string;
  companyId?: number;
  planType?: string;
  startDate?: string;
  endDate?: string;
  objectives?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function listCorporatePlannings(): Promise<CorporatePlanning[]> {
  const { data } = await axiosInstance.get(`${PLANNING_BASE}/api/CorporatePlannings`);
  return Array.isArray(data) ? data : [];
}

// Annual Work Plan
export type AnnualWorkPlan = {
  id: number;
  companyId?: number;
  year: number;
  category?: string;
  sequenceNumber?: number;
  activityName: string;
  relatedLegislation?: string;
  activityDescription?: string;
  department?: string;
  responsiblePerson?: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  budget?: string;
  resources?: string;
  priority: string; // Low, Medium, High, Critical
  status: string; // Planned, InProgress, Completed, Delayed, Cancelled
  completionPercentage?: number;
  notes?: string;
  january?: boolean;
  february?: boolean;
  march?: boolean;
  april?: boolean;
  may?: boolean;
  june?: boolean;
  july?: boolean;
  august?: boolean;
  september?: boolean;
  october?: boolean;
  november?: boolean;
  december?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export async function listAnnualWorkPlans(year?: number): Promise<AnnualWorkPlan[]> {
  const params = year ? `?year=${year}` : '';
  const { data } = await axiosInstance.get(`${PLANNING_BASE}/api/AnnualWorkPlans${params}`);
  return Array.isArray(data) ? data : [];
}

export async function getAnnualWorkPlan(id: number): Promise<AnnualWorkPlan> {
  const { data } = await axiosInstance.get(`${PLANNING_BASE}/api/AnnualWorkPlans/${id}`);
  return data;
}

export async function createAnnualWorkPlan(plan: Partial<AnnualWorkPlan>): Promise<AnnualWorkPlan> {
  const { data } = await axiosInstance.post(`${PLANNING_BASE}/api/AnnualWorkPlans`, plan);
  return data;
}

export async function updateAnnualWorkPlan(id: number, plan: Partial<AnnualWorkPlan>): Promise<AnnualWorkPlan> {
  const { data } = await axiosInstance.put(`${PLANNING_BASE}/api/AnnualWorkPlans/${id}`, plan);
  return data;
}

export async function deleteAnnualWorkPlan(id: number): Promise<void> {
  await axiosInstance.delete(`${PLANNING_BASE}/api/AnnualWorkPlans/${id}`);
}

export async function copyAnnualWorkPlansYear(sourceYear: number, targetYear: number): Promise<{ copiedCount: number; targetYear: number }> {
  const { data } = await axiosInstance.post(`${PLANNING_BASE}/api/AnnualWorkPlans/copy-year`, {
    sourceYear,
    targetYear
  });
  return data;
}

// Activity List
export type ActivityList = {
  id: number;
  title: string;
  description?: string;
  companyId?: number;
  activityType?: string;
  plannedDate?: string;
  completedDate?: string;
  assignedTo?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function listActivityLists(): Promise<ActivityList[]> {
  const { data } = await axiosInstance.get(`${PLANNING_BASE}/api/ActivityLists`);
  return Array.isArray(data) ? data : [];
}

// Control Matrix
export type ControlMatrix = {
  id: number;
  title: string;
  description?: string;
  companyId?: number;
  controlType?: string;
  frequency?: string;
  responsiblePerson?: string;
  lastCheckDate?: string;
  nextCheckDate?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function listControlMatrices(): Promise<ControlMatrix[]> {
  const { data } = await axiosInstance.get(`${PLANNING_BASE}/api/ControlMatrices`);
  return Array.isArray(data) ? data : [];
}
