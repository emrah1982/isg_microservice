import { useQuery } from '@tanstack/react-query';
import { fetchTrainingById, fetchTrainings } from '@api/trainingsApi';

export const useTrainings = () => {
  const list = useQuery({ queryKey: ['trainings'], queryFn: fetchTrainings });
  const getById = (id: string) => useQuery({ queryKey: ['trainings', id], queryFn: () => fetchTrainingById(id) });
  return { list, getById };
};
