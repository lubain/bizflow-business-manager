import { create } from "zustand";
import { api } from "@/infrastructure/api/client";
import { Product } from "@/domain/models";

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;

  getAll: () => Promise<void>;
  create: (data: Omit<Product, "id">) => Promise<void>;
  update: (id: number, data: Partial<Product>) => Promise<void>;
  updateStock: (items: { id: number; newStock: number }[]) => Promise<void>;
  remove: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  loading: false,
  error: null,

  getAll: async () => {
    set({ loading: true, error: null });
    try {
      const products = await api.get<Product[]>("/products");
      set({ products, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  create: async (data) => {
    set({ loading: true, error: null });
    try {
      const created = await api.post<Product>("/products", data);
      set((s) => ({ products: [created, ...s.products], loading: false }));
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  update: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updated = await api.patch<Product>(`/products/${id}`, data);
      set((s) => ({
        products: s.products.map((p) => (p.id === id ? updated : p)),
        loading: false,
      }));
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  updateStock: async (items) => {
    // For each item, call PATCH /products/:id/stock with delta
    // Backend expects { quantity: delta }, we receive newStock so we compute delta
    // We re-fetch products after to keep sync simple
    try {
      const current = await api.get<Product[]>("/products");
      await Promise.all(
        items.map((item) => {
          const existing = current.find((p) => p.id === item.id);
          const delta = existing ? item.newStock - Number(existing.stock) : 0;
          return api.patch(`/products/${item.id}/stock`, { quantity: delta });
        }),
      );
      const refreshed = await api.get<Product[]>("/products");
      set({ products: refreshed });
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  remove: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/products/${id}`);
      set((s) => ({
        products: s.products.filter((p) => p.id !== id),
        loading: false,
      }));
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
