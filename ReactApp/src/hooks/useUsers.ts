import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createUser, deleteUser, fetchUserById, fetchUsers, updateUser, User } from '@api/usersApi';

export const useUsers = () => {
  const qc = useQueryClient();

  const list = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
  const getById = (id: string) => useQuery({ queryKey: ['users', id], queryFn: () => fetchUserById(id) });

  const create = useMutation({
    mutationFn: (payload: Partial<User>) => createUser(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<User> }) => updateUser(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['users', id] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  return { list, getById, create, update, remove };
};
