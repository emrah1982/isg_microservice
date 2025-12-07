import { useQuery } from '@tanstack/react-query';
import { fetchLatestVisionResults } from '@api/visionApi';

export const useVision = () => {
  const list = useQuery({ queryKey: ['vision', 'results'], queryFn: fetchLatestVisionResults });
  return { list };
};
