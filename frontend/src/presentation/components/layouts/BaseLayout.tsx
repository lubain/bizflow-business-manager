import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Package,
  Users,
  TrendingDown,
  Menu,
  LogOut,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { AdminRoutesNavigations } from "@/shared/constants/AppRoutesNavigation";
import ToastContainer from "../common/toast/Toast";

const NAV = [
  {
    path: AdminRoutesNavigations.DASHBOARD,
    label: "Tableau de bord",
    icon: LayoutDashboard,
    color: "text-blue-400",
  },
  {
    path: AdminRoutesNavigations.INVOICES,
    label: "Facturation",
    icon: FileText,
    color: "text-violet-400",
  },
  {
    path: AdminRoutesNavigations.STOCK,
    label: "Stock",
    icon: Package,
    color: "text-emerald-400",
  },
  {
    path: AdminRoutesNavigations.CLIENTS,
    label: "Clients",
    icon: Users,
    color: "text-amber-400",
  },
  {
    path: AdminRoutesNavigations.EXPENSE,
    label: "Dépenses",
    icon: TrendingDown,
    color: "text-rose-400",
  },
];

const PAGE_TITLES: Record<string, string> = {
  [AdminRoutesNavigations.DASHBOARD]: "Tableau de bord",
  [AdminRoutesNavigations.INVOICES]: "Facturation",
  [AdminRoutesNavigations.STOCK]: "Gestion de Stock",
  [AdminRoutesNavigations.CLIENTS]: "Clients",
  [AdminRoutesNavigations.EXPENSE]: "Dépenses",
};

const SIDEBAR_W_OPEN = 240; // px — w-60
const SIDEBAR_W_CLOSED = 68; // px — w-[68px]

export default function BaseLayout() {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark",
  );
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-collapse on small screens
  useEffect(() => {
    const check = () => {
      if (window.innerWidth < 768) setOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const currentPage = PAGE_TITLES[location.pathname.replace("/", "")] ?? "";
  const initials = user
    ? `${user.nom.charAt(0)}${user.prenom.charAt(0)}`.toUpperCase()
    : "A";
  const sidebarW = open ? SIDEBAR_W_OPEN : SIDEBAR_W_CLOSED;

  /* ── Sidebar inner content (shared desktop + mobile) ── */
  const SidebarInner = ({ forceFull = false }: { forceFull?: boolean }) => {
    const showLabel = open || forceFull;
    return (
      <div className="flex flex-col h-full">
        {/* Brand */}
        <div
          className={`flex items-center gap-3 px-4 h-16 border-b border-white/5 shrink-0 ${!showLabel ? "justify-center" : ""}`}
        >
          <div className="h-8 w-8 shrink-0 gradient-blue rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-sm">{initials}</span>
          </div>
          {showLabel && (
            <div className="animate-fade-in min-w-0">
              <p className="text-white text-xs font-semibold truncate">
                {user.nom} {user.prenom}
              </p>
              <p className="text-slate-400 text-xs truncate">{user.email}</p>
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {NAV.map(({ path, label, icon: Icon, color }, i) => (
            <NavLink
              key={path}
              to={`/${path}`}
              style={{ animationDelay: `${i * 0.04}s` }}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group animate-slide-right",
                  showLabel ? "px-3" : "px-0 justify-center",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={[
                      "flex items-center justify-center h-8 w-8 rounded-lg shrink-0 transition-colors",
                      isActive ? "bg-white/10" : "group-hover:bg-white/5",
                    ].join(" ")}
                  >
                    <Icon
                      size={17}
                      className={isActive ? "text-white" : color}
                    />
                  </div>
                  {showLabel && (
                    <span className="flex-1 truncate">{label}</span>
                  )}
                  {showLabel && isActive && (
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/5 p-3 space-y-1 shrink-0">
          {/* Logout */}
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className={[
              "flex items-center gap-3 w-full py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all text-sm",
              showLabel ? "px-3" : "px-0 justify-center",
            ].join(" ")}
          >
            <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
              <LogOut size={16} />
            </div>
            {showLabel && <span>Déconnexion</span>}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* ── Desktop Sidebar — fixed, width driven by inline style ── */}
      <aside
        className="hidden md:block gradient-sidebar fixed top-0 left-0 bottom-0 z-30 overflow-hidden transition-all duration-300"
        style={{ width: sidebarW }}
      >
        <SidebarInner />
      </aside>

      {/* ── Mobile overlay drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 gradient-sidebar animate-slide-right">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-3 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors z-10"
            >
              <X size={18} />
            </button>
            <SidebarInner forceFull />
          </aside>
        </div>
      )}

      {/* ── Main wrapper — margin-left mirrors sidebar width ── */}
      <div
        className="flex flex-col min-h-screen transition-all duration-300"
        style={{
          marginLeft:
            typeof window !== "undefined" && window.innerWidth >= 768
              ? sidebarW
              : 0,
        }}
      >
        {/* Header — sticky, full width of the content area */}
        <header className="sticky top-0 z-20 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 flex items-center px-4 md:px-6 gap-3 shrink-0">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu size={20} />
          </button>

          {/* Desktop toggle — plier/déplier */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="hidden md:flex items-center justify-center p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-all"
            aria-label={open ? "Replier le menu" : "Déplier le menu"}
            title={open ? "Replier" : "Déplier"}
          >
            <Menu size={18} />
          </button>

          {/* Page title */}
          <h1 className="flex-1 text-base font-bold text-slate-800 dark:text-white truncate">
            {currentPage}
          </h1>

          <div className="h-8 w-8 gradient-blue rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
            {/* Dark mode */}
            <button
              onClick={() => setDark((d) => !d)}
              className={[
                "flex items-center gap-3 w-full py-2.5 rounded-xl transition-all text-sm",
              ].join(" ")}
            >
              <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0">
                {dark ? <Sun size={16} /> : <Moon size={16} />}
              </div>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
