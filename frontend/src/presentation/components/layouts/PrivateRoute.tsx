import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { PublicRoutesNavigation } from "@/shared/constants/AppRoutesNavigation";

export default function PrivateRoute() {
  const { user } = useAuthStore();
  if (!user) return <Navigate to={PublicRoutesNavigation.MAIN_PAGE} replace />;
  return <Outlet />;
}
