import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/authStore";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// ─── Request interceptor: attach Bearer token ─
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response interceptor: refresh on 401 ─────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (v: string) => void;
  reject: (e: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = useAuthStore.getState().refreshToken;
      const { data } = await axios.post(`${API_URL}/auth/refresh`, {
        refreshToken,
      });
      const { accessToken } = data;
      useAuthStore.getState().setTokens(accessToken, refreshToken!);
      processQueue(null, accessToken);
      original.headers.Authorization = `Bearer ${accessToken}`;
      return api(original);
    } catch (err) {
      processQueue(err, null);
      useAuthStore.getState().logout();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

// ─── Typed helpers ────────────────────────────
export const apiGet = <T>(url: string, params?: Record<string, unknown>) =>
  api.get<T>(url, { params }).then((r) => r.data);

export const apiPost = <T>(url: string, body?: unknown) =>
  api.post<T>(url, body).then((r) => r.data);

export const apiPatch = <T>(url: string, body?: unknown) =>
  api.patch<T>(url, body).then((r) => r.data);

export const apiDelete = <T>(url: string) =>
  api.delete<T>(url).then((r) => r.data);
