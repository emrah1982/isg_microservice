import { axiosInstance } from '@utils/axiosInstance';

export type CertificateData = {
  personnelId: number;
  personnelName: string;
  personnelSurname: string;
  tcNo: string;
  trainingId: number;
  trainingTitle: string;
  trainingDate: string;
  trainingDuration: number;
  trainingCategory?: string;
  instructor?: string;
  examId?: number;
  examScore?: number;
  examPassed: boolean;
  examDate?: string;
};

export type CertificateFilter = {
  personnelName?: string;
  tcNo?: string;
  trainingTitle?: string;
  passedOnly?: boolean;
};

export async function getCertificates(filter: CertificateFilter = {}): Promise<CertificateData[]> {
  const params = new URLSearchParams();
  Object.entries(filter).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.append(k, String(v));
  });
  
  try {
    const { data } = await axiosInstance.get(`/api/trainings/certificates${params.toString() ? `?${params}` : ''}`);
    return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn('Certificate endpoint not available, using fallback logic');
    return [];
  }
}

export async function getPersonnelTrainingsWithExams(personnelId: number): Promise<any[]> {
  try {
    const { data } = await axiosInstance.get(`/api/personnel/${personnelId}/trainings-with-exams`);
    return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn('Personnel trainings endpoint not available');
    return [];
  }
}
