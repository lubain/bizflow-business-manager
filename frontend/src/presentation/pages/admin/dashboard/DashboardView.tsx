import { useDashboardView } from "@/presentation/hooks/dashboard/use-dashboard-view";
import { Invoice, Product } from "@/domain/models";
import { Badge } from "@/presentation/components/ui/Badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Package,
  FileText,
  Activity,
} from "lucide-react";

const statusConfig: Record<
  string,
  { label: string; color: "green" | "yellow" | "red" }
> = {
  payée: { label: "Payée", color: "green" },
  en_attente: { label: "En attente", color: "yellow" },
  en_retard: { label: "En retard", color: "red" },
};

const card =
  "bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm";

function KPICard({
  title,
  value,
  sub,
  icon: Icon,
  gradient,
  delay = 0,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: any;
  gradient: string;
  delay?: number;
}) {
  return (
    <div
      style={{ animationDelay: `${delay}s` }}
      className={`animate-fade-up ${card} p-6 flex items-start justify-between group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
    >
      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {title}
        </p>
        <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {value}
        </p>
        {sub && (
          <p className="text-xs text-slate-400 dark:text-slate-500">{sub}</p>
        )}
      </div>
      <div
        className={`h-12 w-12 ${gradient} rounded-2xl flex items-center justify-center shadow-sm shrink-0 group-hover:scale-110 transition-transform`}
      >
        <Icon size={22} className="text-white" />
      </div>
    </div>
  );
}

export default function DashboardView() {
  const { totalExpenses, totalSales, lowStockItems, clients, invoices } =
    useDashboardView();
  const profit = totalSales - totalExpenses;
  const recentInvoices = [...invoices].reverse().slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="animate-fade-up bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 flex items-center justify-between overflow-hidden relative">
        <div
          className="absolute right-0 top-0 bottom-0 w-64 opacity-10"
          style={{
            background:
              "radial-gradient(circle at right, #3b82f6, transparent)",
          }}
        />
        <div>
          <p className="text-slate-400 text-sm mb-1">Vue d'ensemble</p>
          <h2 className="text-white text-xl font-black">Tableau de bord</h2>
        </div>
        <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
          <Activity size={16} className="text-blue-400" />
          <span className="text-white text-sm font-medium">En ligne</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          title="Chiffre d'affaires"
          value={`${totalSales.toLocaleString("fr-FR")} €`}
          sub="Factures payées"
          icon={DollarSign}
          gradient="gradient-blue"
          delay={0}
        />
        <KPICard
          title="Dépenses totales"
          value={`${totalExpenses.toLocaleString("fr-FR")} €`}
          sub="Toutes catégories"
          icon={TrendingDown}
          gradient="gradient-rose"
          delay={0.05}
        />
        <KPICard
          title="Bénéfice net"
          value={`${profit.toLocaleString("fr-FR")} €`}
          sub={profit >= 0 ? "Résultat positif ✓" : "Résultat négatif"}
          icon={profit >= 0 ? TrendingUp : TrendingDown}
          gradient={profit >= 0 ? "gradient-emerald" : "gradient-rose"}
          delay={0.1}
        />
        <KPICard
          title="Clients actifs"
          value={String(clients.length)}
          sub="Dans votre base"
          icon={Users}
          gradient="gradient-amber"
          delay={0.15}
        />
      </div>

      {/* Middle */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent invoices */}
        <div
          style={{ animationDelay: ".2s" }}
          className={`animate-fade-up xl:col-span-2 ${card} overflow-hidden`}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-violet-50 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                <FileText
                  size={16}
                  className="text-violet-600 dark:text-violet-400"
                />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white">
                Dernières factures
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {invoices.length} au total
            </span>
          </div>
          {recentInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <FileText size={32} className="opacity-30" />
              <p className="text-sm">Aucune facture émise</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-700">
              {recentInvoices.map((inv: Invoice, i) => {
                const sc = statusConfig[inv.status] ?? {
                  label: inv.status,
                  color: "slate",
                };
                return (
                  <div
                    key={inv.id}
                    style={{ animationDelay: `${0.25 + i * 0.05}s` }}
                    className="animate-fade-up flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="h-9 w-9 gradient-blue rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {inv.clientName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-white text-sm truncate">
                        {inv.clientName}
                      </p>
                      <p className="text-xs text-slate-400">{inv.issueDate}</p>
                    </div>
                    <Badge label={sc.label} color={sc.color} dot />
                    <p className="font-bold text-slate-800 dark:text-white text-sm shrink-0">
                      {Number(inv.total).toLocaleString("fr-FR")} €
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Low stock */}
        <div
          style={{ animationDelay: ".25s" }}
          className={`animate-fade-up ${card} overflow-hidden`}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <AlertTriangle
                  size={16}
                  className="text-amber-600 dark:text-amber-400"
                />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white">
                Alertes stock
              </h3>
            </div>
            {lowStockItems.length > 0 && (
              <span className="h-5 w-5 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center">
                {lowStockItems.length}
              </span>
            )}
          </div>
          {lowStockItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <Package size={32} className="opacity-30" />
              <p className="text-sm">Tout est en ordre ✓</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-700 p-2">
              {lowStockItems.map((p: Product, i) => (
                <div
                  key={p.id}
                  style={{ animationDelay: `${0.3 + i * 0.05}s` }}
                  className="animate-fade-up flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="h-8 w-8 bg-rose-50 dark:bg-rose-900/30 rounded-lg flex items-center justify-center shrink-0">
                    <Package size={14} className="text-rose-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                      {p.name}
                    </p>
                    <p className="text-xs text-slate-400">Min : {p.minStock}</p>
                  </div>
                  <span
                    className={`text-sm font-black ${Number(p.stock) === 0 ? "text-rose-600" : "text-amber-600"}`}
                  >
                    {p.stock}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom stats */}
      <div
        style={{ animationDelay: ".35s" }}
        className="animate-fade-up grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          {
            label: "Factures émises",
            value: invoices.length,
            icon: FileText,
            color: "text-violet-600 dark:text-violet-400",
            bg: "bg-violet-50 dark:bg-violet-900/20",
          },
          {
            label: "Stock faible",
            value: lowStockItems.length,
            icon: AlertTriangle,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-900/20",
          },
          {
            label: "Factures impayées",
            value: invoices.filter((i: Invoice) => i.status !== "payée").length,
            icon: ArrowUpRight,
            color: "text-rose-600 dark:text-rose-400",
            bg: "bg-rose-50 dark:bg-rose-900/20",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`${card} p-5 flex items-center gap-4`}>
            <div
              className={`h-10 w-10 ${bg} rounded-xl flex items-center justify-center shrink-0`}
            >
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {label}
              </p>
              <p className="text-xl font-black text-slate-800 dark:text-white">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
