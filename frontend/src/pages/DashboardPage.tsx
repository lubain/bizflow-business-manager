import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  Users,
  Package,
} from "lucide-react";
import { apiGet } from "@/utils/apiClient";
import { DashboardData } from "@/types";
import {
  formatCurrency,
  formatChange,
  formatDate,
  getClientDisplayName,
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
  cn,
} from "@/utils/helpers";

// ─── KPI card ─────────────────────────────────
function KpiCard({
  label,
  value,
  change,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  change: number;
  icon: React.ElementType;
  color: string;
}) {
  const positive = change >= 0;
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-card">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className={cn("p-2 rounded-lg", color)}>
          <Icon size={16} />
        </div>
      </div>
      <p className="text-2xl font-semibold text-gray-900 mb-1">{value}</p>
      <div
        className={cn(
          "flex items-center gap-1 text-sm font-medium",
          positive ? "text-green-600" : "text-red-600",
        )}
      >
        {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        <span>{formatChange(change)} vs mois dernier</span>
      </div>
    </div>
  );
}

// ─── Custom tooltip ───────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-soft p-3 text-sm">
      <p className="font-medium text-gray-700 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-gray-600">{p.name}:</span>
          <span className="font-medium">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => apiGet("/dashboard"),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  const kpis = data?.kpis;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Tableau de bord
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Vue d'ensemble de votre activité
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <KpiCard
          label="Chiffre d'affaires"
          value={formatCurrency(kpis?.revenue.current ?? 0)}
          change={kpis?.revenue.change ?? 0}
          icon={TrendingUp}
          color="bg-brand-50 text-brand-600"
        />
        <KpiCard
          label="Dépenses"
          value={formatCurrency(kpis?.expenses.current ?? 0)}
          change={kpis?.expenses.change ?? 0}
          icon={TrendingDown}
          color="bg-red-50 text-red-600"
        />
        <KpiCard
          label="Bénéfice net"
          value={formatCurrency(kpis?.profit.current ?? 0)}
          change={kpis?.profit.change ?? 0}
          icon={TrendingUp}
          color="bg-green-50 text-green-600"
        />
      </div>

      {/* Alert cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Factures en attente",
            value: kpis?.invoicesPending ?? 0,
            sub: formatCurrency(kpis?.invoicesPendingAmount ?? 0),
            icon: Clock,
            color: "text-blue-500 bg-blue-50",
          },
          {
            label: "Factures en retard",
            value: kpis?.invoicesOverdue ?? 0,
            sub: formatCurrency(kpis?.invoicesOverdueAmount ?? 0),
            icon: AlertTriangle,
            color: "text-orange-500 bg-orange-50",
          },
          {
            label: "Nouveaux clients",
            value: kpis?.newClients ?? 0,
            sub: "ce mois",
            icon: Users,
            color: "text-purple-500 bg-purple-50",
          },
          {
            label: "Stock bas",
            value: kpis?.lowStockProducts ?? 0,
            sub: "produits",
            icon: Package,
            color: "text-red-500 bg-red-50",
          },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-gray-200 p-4 shadow-card flex items-center gap-4"
          >
            <div className={cn("p-3 rounded-lg", color)}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-xs font-medium text-gray-700">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-card">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Évolution CA & Dépenses
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart
              data={data?.monthlyRevenue ?? []}
              margin={{ top: 5, right: 5, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4c6ef5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4c6ef5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                name="CA"
                stroke="#4c6ef5"
                strokeWidth={2}
                fill="url(#revGrad)"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name="Dépenses"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#expGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top clients */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-card">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Top clients
          </h2>
          <div className="space-y-3">
            {(data?.topClients ?? []).map(({ client, total }, idx) => (
              <div key={client.id} className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-400 w-4">
                  {idx + 1}
                </span>
                <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-semibold flex-shrink-0">
                  {getClientDisplayName(client)[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {getClientDisplayName(client)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                  {formatCurrency(total)}
                </p>
              </div>
            ))}
            {!data?.topClients?.length && (
              <p className="text-sm text-gray-400">
                Aucun client pour l'instant
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent invoices — responsive */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden">
        <div className="px-4 md:px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            Factures récentes
          </h2>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {[
                  "Numéro",
                  "Client",
                  "Date",
                  "Échéance",
                  "Montant",
                  "Statut",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(data?.recentInvoices ?? []).map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-brand-700 font-medium">
                    {inv.number}
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-900">
                    {getClientDisplayName(inv.client)}
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {formatDate(inv.issueDate)}
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {formatDate(inv.dueDate)}
                  </td>
                  <td className="px-5 py-3 font-semibold text-gray-900">
                    {formatCurrency(inv.totalTTC)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        INVOICE_STATUS_COLORS[inv.status],
                      )}
                    >
                      {INVOICE_STATUS_LABELS[inv.status]}
                    </span>
                  </td>
                </tr>
              ))}
              {!data?.recentInvoices?.length && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-6 text-center text-gray-400 text-sm"
                  >
                    Aucune facture pour l'instant
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {(data?.recentInvoices ?? []).map((inv) => (
            <div key={inv.id} className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-brand-700 font-medium">
                  {inv.number}
                </span>
                <span
                  className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    INVOICE_STATUS_COLORS[inv.status],
                  )}
                >
                  {INVOICE_STATUS_LABELS[inv.status]}
                </span>
              </div>
              <p className="font-medium text-gray-900 text-sm mb-1">
                {getClientDisplayName(inv.client)}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{formatDate(inv.issueDate)}</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(inv.totalTTC)}
                </span>
              </div>
            </div>
          ))}
          {!data?.recentInvoices?.length && (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">
              Aucune facture pour l'instant
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
