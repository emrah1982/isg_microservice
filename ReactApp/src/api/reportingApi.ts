import { axiosInstance } from '@utils/axiosInstance';

export type ReportSummary = {
  id: string;
  title: string;
  createdAt: string;
};

export async function fetchReports(): Promise<ReportSummary[]> {
  const { data } = await axiosInstance.get('/api/reports/dashboard');
  return data;
}
