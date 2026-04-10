import { useClientStore } from '@/store/clientStore';
import { Client } from '@/domain/models';

export const useClient = () => {
  const { clients, loading, error, getAll, create, update, remove } = useClientStore();
  return { clients, loading, error, getAll, create, update, remove };
};
