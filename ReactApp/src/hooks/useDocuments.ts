import { useQuery } from '@tanstack/react-query';
import { fetchDocuments } from '@api/documentsApi';

export const useDocuments = () => {
  const list = useQuery({ queryKey: ['documents'], queryFn: fetchDocuments });
  return { list };
};
