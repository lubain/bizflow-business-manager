import { useClientStore } from "@/store/clientStore";

export const useClient = () => {
  const { clients, loading, error, getAll, create, update, remove } =
    useClientStore();
  return { clients, loading, error, getAll, create, update, remove };
};
