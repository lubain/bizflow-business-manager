import { create } from "zustand";
import { api } from "@/infrastructure/api/client";
import { Invoice } from "@/domain/models";

interface InvoiceState {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;

  getAll: () => Promise<void>;
  create: (data: Omit<Invoice, "id">) => Promise<void>;
  update: (id: number, data: Partial<Invoice>) => Promise<void>;
  markAsPaid: (id: number) => Promise<void>;
  remove: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useInvoiceStore = create<InvoiceState>((set) => ({
  invoices: [],
  loading: false,
  error: null,

  getAll: async () => {
    set({ loading: true, error: null });
    try {
      const invoices = await api.get<Invoice[]>("/invoices");
      set({ invoices, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  create: async (data) => {
    set({ loading: true, error: null });
    try {
      const created = await api.post<Invoice>("/invoices", data);
      set((s) => ({ invoices: [created, ...s.invoices], loading: false }));
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  update: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updated = await api.patch<Invoice>(`/invoices/${id}`, data);
      set((s) => ({
        invoices: s.invoices.map((inv) => (inv.id === id ? updated : inv)),
        loading: false,
      }));
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  markAsPaid: async (id) => {
    set({ loading: true, error: null });
    try {
      const updated = await api.patch<Invoice>(`/invoices/${id}/mark-as-paid`);
      set((s) => ({
        invoices: s.invoices.map((inv) => (inv.id === id ? updated : inv)),
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
      await api.delete(`/invoices/${id}`);
      set((s) => ({
        invoices: s.invoices.filter((inv) => inv.id !== id),
        loading: false,
      }));
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
