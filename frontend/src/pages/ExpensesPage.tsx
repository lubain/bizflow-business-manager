import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Receipt,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { apiGet, apiPost, apiPatch } from "@/utils/apiClient";
import {
  Expense,
  ExpenseCategory,
  ExpenseStatus,
  PaginatedResponse,
} from "@/types";
import {
  formatCurrency,
  formatDate,
  EXPENSE_CATEGORY_LABELS,
  cn,
} from "@/utils/helpers";
import { ResponsiveTable, Column } from "@/components/layout/ResponsiveTable";
import { usePortalPopover } from "@/hooks/usePortalPopover";

// ─── Couleurs catégories ───────────────────────
const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  rent: "#4c6ef5",
  utilities: "#339af0",
  salaries: "#20c997",
  marketing: "#f59f00",
  travel: "#ff6b6b",
  supplies: "#845ef7",
  equipment: "#74c0fc",
  software: "#51cf66",
  insurance: "#ff922b",
  taxes: "#e64980",
  other: "#868e96",
};

// ─── Statuts ──────────────────────────────────
const STATUS_BADGE: Record<ExpenseStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};
const STATUS_LABELS: Record<ExpenseStatus, string> = {
  pending: "En attente",
  approved: "Approuvée",
  rejected: "Rejetée",
};

const STATUS_ACTIONS: Record<
  ExpenseStatus,
  {
    status: ExpenseStatus;
    label: string;
    icon: React.ElementType;
    color: string;
  }[]
> = {
  pending: [
    {
      status: "approved",
      label: "Approuver",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      status: "rejected",
      label: "Rejeter",
      icon: XCircle,
      color: "text-red-500",
    },
  ],
  approved: [
    {
      status: "pending",
      label: "Repasser en attente",
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      status: "rejected",
      label: "Rejeter",
      icon: XCircle,
      color: "text-red-500",
    },
  ],
  rejected: [
    {
      status: "pending",
      label: "Repasser en attente",
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      status: "approved",
      label: "Approuver",
      icon: CheckCircle,
      color: "text-green-600",
    },
  ],
};

// ─── Menu statut dépense ───────────────────────
function ExpenseStatusMenu({
  expense,
  onUpdate,
}: {
  expense: Expense;
  onUpdate: (id: string, status: ExpenseStatus) => void;
}) {
  const { open, toggle, close, anchorRef, portal, placement } =
    usePortalPopover();
  const actions = STATUS_ACTIONS[expense.status] ?? [];

  return (
    <>
      <button
        ref={anchorRef}
        onClick={toggle}
        className={cn(
          "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
          "hover:opacity-80 transition-opacity cursor-pointer",
          STATUS_BADGE[expense.status],
        )}
      >
        {STATUS_LABELS[expense.status]}
        <ChevronDown
          size={11}
          className={cn(
            "transition-transform duration-150",
            open && placement === "bottom" ? "rotate-180" : "",
            !open && placement === "top" ? "rotate-180" : "",
          )}
        />
      </button>

      {portal(
        <div
          className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
          style={{
            animation: "popoverIn 120ms ease",
            transformOrigin: placement === "top" ? "bottom left" : "top left",
          }}
        >
          <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
            Changer le statut
          </p>
          {actions.map(({ status, label, icon: Icon, color }) => (
            <button
              key={status}
              onMouseDown={(e) => {
                e.preventDefault();
                onUpdate(expense.id, status);
                close();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Icon size={14} className={color} />
              {label}
            </button>
          ))}
        </div>,
      )}
    </>
  );
}

// ─── Schema nouvelle dépense ──────────────────
const expenseSchema = z.object({
  title: z.string().min(1, "Titre requis"),
  category: z.enum([
    "rent",
    "utilities",
    "salaries",
    "marketing",
    "travel",
    "supplies",
    "equipment",
    "software",
    "insurance",
    "taxes",
    "other",
  ]),
  amount: z.coerce.number().min(0.01, "Montant requis"),
  vatRate: z.coerce.number().min(0).max(100).default(20),
  date: z.string().min(1, "Date requise"),
  supplier: z.string().optional(),
  notes: z.string().optional(),
});
type ExpenseForm = z.infer<typeof expenseSchema>;

// ─── Modal nouvelle dépense ───────────────────
function NewExpenseModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      vatRate: 20,
      date: new Date().toISOString().split("T")[0],
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ExpenseForm) =>
      apiPost("/expenses", {
        ...data,
        vatAmount: (data.amount * data.vatRate) / 100,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Dépense enregistrée");
      onClose();
    },
    onError: () => toast.error("Erreur lors de l'enregistrement"),
  });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            Nouvelle dépense
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ✕
          </button>
        </div>
        <form
          onSubmit={handleSubmit((d) => mutation.mutate(d))}
          className="p-5 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre *
            </label>
            <input
              {...register("title")}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">
                {errors.title.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie *
              </label>
              <select
                {...register("category")}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {Object.entries(EXPENSE_CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                {...register("date")}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant TTC (€) *
              </label>
              <input
                type="number"
                step="0.01"
                {...register("amount")}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {errors.amount && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.amount.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                TVA (%)
              </label>
              <input
                type="number"
                step="0.1"
                {...register("vatRate")}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fournisseur
            </label>
            <input
              {...register("supplier")}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              {...register("notes")}
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-60"
            >
              {mutation.isPending ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page principale ───────────────────────────
export default function ExpensesPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ExpenseCategory | "all">("all");

  const { data, isLoading } = useQuery<PaginatedResponse<Expense>>({
    queryKey: ["expenses", search, category],
    queryFn: () =>
      apiGet("/expenses", {
        search: search || undefined,
        category: category !== "all" ? category : undefined,
      }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ExpenseStatus }) =>
      apiPatch(`/expenses/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Statut mis à jour");
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? "Erreur"),
  });

  const expenses = data?.data ?? [];
  const totalAmount = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalVAT = expenses.reduce((s, e) => s + Number(e.vatAmount), 0);

  const byCategory = Object.entries(EXPENSE_CATEGORY_LABELS)
    .map(([cat, label]) => ({
      name: label,
      value: expenses
        .filter((e) => e.category === cat)
        .reduce((s, e) => s + Number(e.amount), 0),
      color: CATEGORY_COLORS[cat as ExpenseCategory],
    }))
    .filter((d) => d.value > 0);

  const columns: Column<Expense>[] = [
    {
      key: "date",
      header: "Date",
      hideOnMobile: true,
      render: (e) => (
        <span className="text-gray-500 text-sm">{formatDate(e.date)}</span>
      ),
    },
    {
      key: "title",
      header: "Titre",
      render: (e) => (
        <span className="font-medium text-gray-900">{e.title}</span>
      ),
    },
    {
      key: "category",
      header: "Catégorie",
      hideOnMobile: true,
      render: (e) => (
        <span
          className="text-xs px-2 py-1 rounded-full font-medium"
          style={{
            background: CATEGORY_COLORS[e.category] + "22",
            color: CATEGORY_COLORS[e.category],
          }}
        >
          {EXPENSE_CATEGORY_LABELS[e.category]}
        </span>
      ),
    },
    {
      key: "supplier",
      header: "Fournisseur",
      hideOnMobile: true,
      render: (e) => (
        <span className="text-gray-500 text-sm">{e.supplier ?? "—"}</span>
      ),
    },
    {
      key: "vat",
      header: "TVA",
      hideOnMobile: true,
      render: (e) => (
        <span className="text-gray-500 text-sm">
          {formatCurrency(Number(e.vatAmount))}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Montant TTC",
      render: (e) => (
        <span className="font-semibold text-gray-900">
          {formatCurrency(Number(e.amount))}
        </span>
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (e) => (
        <ExpenseStatusMenu
          expense={e}
          onUpdate={(id, status) => updateStatus.mutate({ id, status })}
        />
      ),
    },
  ];

  return (
    <>
      <style>{`
        @keyframes popoverIn {
          from { opacity: 0; transform: scaleY(0.9); }
          to   { opacity: 1; transform: scaleY(1);   }
        }
      `}</style>

      {showModal && <NewExpenseModal onClose={() => setShowModal(false)} />}

      <div className="space-y-4 md:space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
              Dépenses
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {data?.meta.total ?? 0} entrées
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Nouvelle dépense</span>
            <span className="sm:hidden">Nouveau</span>
          </button>
        </div>

        {/* KPIs + graphique */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
            {[
              {
                label: "Total dépenses",
                value: formatCurrency(totalAmount),
                color: "text-red-600",
              },
              {
                label: "TVA récupérable",
                value: formatCurrency(totalVAT),
                color: "text-green-600",
              },
              {
                label: "Net HT",
                value: formatCurrency(totalAmount - totalVAT),
                color: "text-gray-900",
              },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="bg-white rounded-xl border border-gray-200 p-3 md:p-4 shadow-card"
              >
                <p className="text-xs font-medium text-gray-500 mb-1">
                  {label}
                </p>
                <p className={cn("text-lg font-semibold", color)}>{value}</p>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4 md:p-5 shadow-card">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              Répartition par catégorie
            </h2>
            {byCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={byCategory}
                    cx="40%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {byCategory.map((e) => (
                      <Cell key={e.name} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm gap-2">
                <Receipt size={24} className="opacity-30" /> Aucune dépense
              </div>
            )}
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-40">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Rechercher…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as ExpenseCategory | "all")
            }
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">Toutes catégories</option>
            {Object.entries(EXPENSE_CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <ResponsiveTable
          columns={columns}
          data={expenses}
          keyExtractor={(e) => e.id}
          emptyMessage="Aucune dépense"
          loading={isLoading}
        />
      </div>
    </>
  );
}
