import { axiosInstance } from '@utils/axiosInstance';

export type VisionResult = {
  id: string;
  imageUrl: string;
  detections: { label: string; confidence: number; bbox: number[] }[];
};

export async function fetchLatestVisionResults(): Promise<VisionResult[]> {
  const { data } = await axiosInstance.get('/api/vision/infer');
  return data;
}
