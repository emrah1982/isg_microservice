import { useQuery } from '@tanstack/react-query';
import { fetchRisks } from '@api/riskAnalysisApi';

export const useRiskAnalysis = () => {
  const list = useQuery({ queryKey: ['risks'], queryFn: fetchRisks });
  return { list };
};
