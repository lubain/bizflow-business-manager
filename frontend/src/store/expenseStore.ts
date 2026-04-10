import { create } from "zustand";
import { api } from "@/infrastructure/api/client";
import { Expense } from "@/domain/models";

interface ExpenseState {
  expenses: Expense[];
  loading: boolean;
  error: string | null;

  getAll: () => Promise<void>;
  create: (data: Omit<Expense, "id">) => Promise<void>;
  update: (id: number, data: Partial<Expense>) => Promise<void>;
  remove: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useExpenseStore = create<ExpenseState>((set) => ({
  expenses: [],
  loading: false,
  error: null,

  getAll: async () => {
    set({ loading: true, error: null });
    try {
      const expenses = await api.get<Expense[]>("/expenses");
      set({ expenses, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  create: async (data) => {
    set({ loading: true, error: null });
    try {
      const created = await api.post<Expense>("/expenses", data);
      set((s) => ({ expenses: [created, ...s.expenses], loading: false }));
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  update: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updated = await api.patch<Expense>(`/expenses/${id}`, data);
      set((s) => ({
        expenses: s.expenses.map((e) => (e.id === id ? updated : e)),
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
      await api.delete(`/expenses/${id}`);
      set((s) => ({
        expenses: s.expenses.filter((e) => e.id !== id),
        loading: false,
      }));
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
