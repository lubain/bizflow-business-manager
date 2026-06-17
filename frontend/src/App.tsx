import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import InvoicesPage from "./pages/InvoicesPage";
import InvoiceFormPage from "./pages/InvoiceFormPage";
import StockPage from "./pages/StockPage";
import ProductFormPage from "./pages/ProductFormPage";
import ExpensesPage from "./pages/ExpensesPage";
import ClientsPage from "./pages/ClientsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { useAuthStore } from "./store/authStore";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function RequireGuest({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return !isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/dashboard" replace />
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Pages publiques */}
          <Route
            path="/login"
            element={
              <RequireGuest>
                <LoginPage />
              </RequireGuest>
            }
          />
          <Route
            path="/register"
            element={
              <RequireGuest>
                <RegisterPage />
              </RequireGuest>
            }
          />

          {/* Pages protégées */}
          <Route
            path="/"
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />

            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="invoices/new" element={<InvoiceFormPage />} />
            <Route path="invoices/:id/edit" element={<InvoiceFormPage />} />

            <Route path="stock" element={<StockPage />} />
            <Route path="stock/products/new" element={<ProductFormPage />} />
            <Route
              path="stock/products/:id/edit"
              element={<ProductFormPage />}
            />

            <Route path="clients" element={<ClientsPage />} />
            <Route path="expenses" element={<ExpensesPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          style: { borderRadius: "10px", fontSize: "14px" },
          success: { iconTheme: { primary: "#4c6ef5", secondary: "white" } },
          duration: 4000,
        }}
      />
    </QueryClientProvider>
  );
}
