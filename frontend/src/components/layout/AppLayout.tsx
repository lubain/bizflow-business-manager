import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Package,
  Users,
  Receipt,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  Settings,
  TrendingUp,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { cn } from "@/utils/helpers";

const NAV_ITEMS = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
  { path: "/invoices", icon: FileText, label: "Factures" },
  { path: "/stock", icon: Package, label: "Stock" },
  { path: "/clients", icon: Users, label: "Clients" },
  { path: "/expenses", icon: Receipt, label: "Dépenses" },
];

const HEADER_H = 56;

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // fermé par défaut sur mobile
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavClick = () => {
    // Fermer la sidebar sur mobile après navigation
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ═══ HEADER FIXE pleine largeur ══════════ */}
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 flex items-center px-3 md:px-4 gap-3"
        style={{ height: HEADER_H }}
      >
        {/* Toggle sidebar */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          <span className="font-semibold text-gray-900 tracking-tight text-base">
            BizFlow
          </span>
        </div>

        <div className="h-5 w-px bg-gray-200 flex-shrink-0 hidden sm:block" />

        {user?.companyName && (
          <span className="text-sm text-gray-500 truncate hidden sm:block max-w-48">
            {user.companyName}
          </span>
        )}

        <div className="flex-1" />

        {/* Actions droite */}
        <div className="flex items-center gap-1">
          <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors hidden sm:flex"
          >
            <Settings size={18} />
          </button>
          <div className="h-5 w-px bg-gray-200 mx-1" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-semibold flex-shrink-0">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-gray-900 leading-tight truncate max-w-32">
                {user?.firstName} {user?.lastName}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Se déconnecter"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* ═══ Overlay mobile (ferme sidebar au clic extérieur) ═════════ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          style={{ top: HEADER_H }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex" style={{ paddingTop: HEADER_H }}>
        {/* ═══ SIDEBAR ══════════════════════════════════════════════════ */}
        <aside
          className={cn(
            "fixed left-0 bottom-0 bg-white border-r border-gray-200 flex flex-col z-40 transition-all duration-300 ease-in-out",
            // Mobile : slide in/out, largeur fixe 240px
            sidebarOpen ? "translate-x-0 w-60" : "-translate-x-full w-60",
            // Desktop : toujours visible, largeur selon état
            "md:translate-x-0",
            sidebarOpen ? "md:w-60" : "md:w-16",
          )}
          style={{ top: HEADER_H }}
        >
          <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                    isActive
                      ? "bg-brand-50 text-brand-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      className={cn(
                        "flex-shrink-0",
                        isActive
                          ? "text-brand-600"
                          : "text-gray-400 group-hover:text-gray-600",
                      )}
                    />
                    {sidebarOpen && <span className="truncate">{label}</span>}
                    {sidebarOpen && isActive && (
                      <ChevronRight
                        size={14}
                        className="ml-auto text-brand-400 flex-shrink-0"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {sidebarOpen && (
            <div className="px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">BizFlow v1.0.0</p>
            </div>
          )}
        </aside>

        {/* ═══ MAIN CONTENT ══════════════════════════════════════════════ */}
        <main
          className={cn(
            "flex-1 min-w-0 transition-all duration-300 ease-in-out",
            // Desktop : décale selon sidebar
            sidebarOpen ? "md:ml-60" : "md:ml-16",
          )}
        >
          <div className="p-4 md:p-6 min-h-screen">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
