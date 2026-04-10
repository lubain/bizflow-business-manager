import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/infrastructure/api/client";

export interface AuthUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (
    nom: string,
    prenom: string,
    email: string,
    password: string
  ) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const data = await api.post<{ access_token: string; user: AuthUser }>(
            "/auth/login",
            { email, password }
          );
          localStorage.setItem("access_token", data.access_token);
          set({ user: data.user, token: data.access_token, loading: false });
        } catch (err: any) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      register: async (nom, prenom, email, password) => {
        set({ loading: true, error: null });
        try {
          const data = await api.post<{ access_token: string; user: AuthUser }>(
            "/auth/register",
            { nom, prenom, email, password }
          );
          localStorage.setItem("access_token", data.access_token);
          set({ user: data.user, token: data.access_token, loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      logout: () => {
        localStorage.removeItem("access_token");
        set({ user: null, token: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
