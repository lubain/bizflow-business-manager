import { Suspense, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useRestoreAuth } from "@/presentation/hooks/authentification/use-restore-auth";
import LoadingSpinner from "@/presentation/components/common/LoadingSpinner";
import PageNotFound from "@/presentation/components/common/NotFoundPage";
import AuthWrapper from "@/presentation/components/common/AuthWrapper";
import BaseLayout from "@/presentation/components/layouts/BaseLayout";
import PrivateRoute from "@/presentation/components/layouts/PrivateRoute";
import ToastContainer from "@/presentation/components/common/toast/Toast";
import { useToast } from "@/presentation/hooks/use-toast";
import { useSettings } from "@/presentation/hooks/useSettings";

import DashboardView from "@/presentation/pages/admin/dashboard/DashboardView";
import ClientsView from "@/presentation/pages/admin/client/ClientsView";
import InvoicesView from "@/presentation/pages/admin/invoices/InvoicesView";
import StockView from "@/presentation/pages/admin/stock/StockView";
import ExpensesView from "@/presentation/pages/admin/expense/ExpensesView";
import {
  AdminRoutesNavigations,
  PublicRoutesNavigation,
} from "@/shared/constants/AppRoutesNavigation";
import LoginView from "../pages/authentification/login/LoginView";

const AppRoutes = () => {
  const { isRestoreDone } = useRestoreAuth();
  const { settings } = useSettings();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [wasDisconnected, setWasDisconnected] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const update = () => setIsConnected(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    update();
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => {
    if (isConnected === false) {
      setWasDisconnected(true);
      toast.warning("Vous êtes hors ligne.");
    } else if (isConnected === true && wasDisconnected)
      toast.success("Connexion rétablie !");
  }, [isConnected]);

  useEffect(() => {
    const isDark = settings.theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  }, [settings.theme]);

  if (!isRestoreDone) return <LoadingSpinner />;

  return (
    <BrowserRouter>
      <AuthWrapper>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public */}
            <Route
              path={PublicRoutesNavigation.MAIN_PAGE}
              element={<LoginView />}
            />

            {/* Protected */}
            <Route element={<PrivateRoute />}>
              <Route element={<BaseLayout />}>
                <Route
                  path={`/${AdminRoutesNavigations.DASHBOARD}`}
                  element={<DashboardView />}
                />
                <Route
                  path={`/${AdminRoutesNavigations.INVOICES}`}
                  element={<InvoicesView />}
                />
                <Route
                  path={`/${AdminRoutesNavigations.STOCK}`}
                  element={<StockView />}
                />
                <Route
                  path={`/${AdminRoutesNavigations.CLIENTS}`}
                  element={<ClientsView />}
                />
                <Route
                  path={`/${AdminRoutesNavigations.EXPENSE}`}
                  element={<ExpensesView />}
                />
              </Route>
            </Route>

            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Suspense>
        <ToastContainer />
      </AuthWrapper>
    </BrowserRouter>
  );
};

export default AppRoutes;
