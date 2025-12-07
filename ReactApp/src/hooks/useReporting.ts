import { useQuery } from '@tanstack/react-query';
import { fetchReports } from '@api/reportingApi';

export const useReporting = () => {
  const list = useQuery({ queryKey: ['reports'], queryFn: fetchReports });
  return { list };
};
