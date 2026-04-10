import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Package,
  Users,
  TrendingDown,
  Menu,
  X,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { AdminRoutesNavigations } from "@/shared/constants/AppRoutesNavigation";
import ToastContainer from "../common/toast/Toast";
import { useSettings } from "@/presentation/hooks/useSettings";

const NAV_ITEMS = [
  {
    path: AdminRoutesNavigations.DASHBOARD,
    label: "Tableau de bord",
    icon: LayoutDashboard,
  },
  {
    path: AdminRoutesNavigations.INVOICES,
    label: "Facturation",
    icon: FileText,
  },
  { path: AdminRoutesNavigations.STOCK, label: "Stock", icon: Package },
  { path: AdminRoutesNavigations.CLIENTS, label: "Clients", icon: Users },
  {
    path: AdminRoutesNavigations.EXPENSE,
    label: "Dépenses",
    icon: TrendingDown,
  },
];

export default function BaseLayout() {
  const [open, setOpen] = useState(true);
  const { settings, setSettings } = useSettings();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const sidebarW = open ? "w-60" : "w-16";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* ── Header — fixed, always full width, never shifted ── */}
      <header className="fixed top-0 left-0 right-0 h-14 z-30 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen((v) => !v)}
            className="cursor-pointer p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {open ? <Menu size={20} /> : <X size={20} />}
          </button>
          <span className="text-slate-400 text-sm dark:text-slate-300">
            Bienvenue,{" "}
            <span className="font-semibold text-slate-700 dark:text-white">
              {user?.nom} {user?.prenom}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            aria-label="Light theme"
            onClick={() =>
              setSettings((s) => ({
                ...s,
                theme: s.theme === "light" ? "dark" : "light",
              }))
            }
            className="cursor-pointer p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {settings.theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* ── Body below header ── */}
      <div className="flex pt-14 h-screen">
        {/* Sidebar */}
        <aside
          className={`fixed top-14 left-0 bottom-0 z-20 flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white transition-all duration-300 ${sidebarW}`}
        >
          {/* Nav */}
          <nav className="flex-1 py-4 overflow-y-auto">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={`/${path}`}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 mx-2 rounded-lg overflow-hidden transition-colors text-sm font-medium ${
                    isActive
                      ? "bg-blue-100 dark:bg-blue-600 dark:text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                  }`
                }
              >
                <Icon size={18} className="shrink-0" />
                <span className="min-w-0 whitespace-nowrap">{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t border-slate-200 dark:border-slate-700 overflow-hidden">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-5 px-4 py-3 mx-2 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300 transition-colors text-sm"
            >
              <LogOut size={18} className="shrink-0" />
              <span className="min-w-0 whitespace-nowrap">Déconnexion</span>
            </button>
          </div>
        </aside>

        {/* Main content — offset by sidebar width */}
        <main
          className={`flex-1 overflow-y-auto p-6 transition-all duration-300 ${
            open ? "ml-60" : "ml-16"
          }`}
        >
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
