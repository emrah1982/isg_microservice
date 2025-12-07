import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createIncident, fetchIncidents, CreateIncidentInput } from '@api/incidentsApi';

export const useIncidents = () => {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ['incidents'], queryFn: fetchIncidents });

  const create = useMutation({
    mutationFn: (payload: CreateIncidentInput) => createIncident(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['incidents'] });
    },
  });

  return { list, create };
};
