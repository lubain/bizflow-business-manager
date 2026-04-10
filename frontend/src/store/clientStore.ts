import { create } from "zustand";
import { api } from "@/infrastructure/api/client";
import { Client } from "@/domain/models";

interface ClientState {
  clients: Client[];
  loading: boolean;
  error: string | null;

  getAll: () => Promise<void>;
  create: (data: Omit<Client, "id">) => Promise<void>;
  update: (id: number, data: Partial<Client>) => Promise<void>;
  remove: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  loading: false,
  error: null,

  getAll: async () => {
    set({ loading: true, error: null });
    try {
      const clients = await api.get<Client[]>("/clients");
      set({ clients, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  create: async (data) => {
    set({ loading: true, error: null });
    try {
      const created = await api.post<Client>("/clients", data);
      set((s) => ({ clients: [created, ...s.clients], loading: false }));
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  update: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updated = await api.patch<Client>(`/clients/${id}`, data);
      set((s) => ({
        clients: s.clients.map((c) => (c.id === id ? updated : c)),
        loading: false,
      }));
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  remove: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/clients/${id}`);
      set((s) => ({
        clients: s.clients.filter((c) => c.id !== id),
        loading: false,
      }));
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
