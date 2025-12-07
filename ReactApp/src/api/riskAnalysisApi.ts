import { axiosInstance } from '@utils/axiosInstance';

export type RiskItem = {
  id: string;
  name: string;
  level: number; // 1-5
};

export async function fetchRisks(): Promise<RiskItem[]> {
  const { data } = await axiosInstance.get('/api/risks');
  return data;
}
