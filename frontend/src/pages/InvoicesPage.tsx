import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Download,
  Copy,
  Pencil,
  Send,
  CheckCircle,
  XCircle,
  ChevronDown,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { apiGet, apiPost, apiPatch } from "@/utils/apiClient";
import { Invoice, InvoiceStatus, PaginatedResponse } from "@/types";
import {
  formatCurrency,
  formatDate,
  getClientDisplayName,
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
  cn,
} from "@/utils/helpers";
import { generateInvoicePDF } from "@/utils/pdfGenerator";
import {
  ResponsiveTable,
  TablePagination,
  Column,
} from "@/components/layout/ResponsiveTable";
import { usePortalPopover } from "@/hooks/usePortalPopover";

const STATUS_FILTERS: { label: string; value: InvoiceStatus | "all" }[] = [
  { label: "Toutes", value: "all" },
  { label: "Brouillons", value: "draft" },
  { label: "Envoyées", value: "sent" },
  { label: "Payées", value: "paid" },
  { label: "En retard", value: "overdue" },
  { label: "Annulées", value: "cancelled" },
];

const STATUS_ACTIONS: Record<
  InvoiceStatus,
  { status: InvoiceStatus; label: string; icon: any; color: string }[]
> = {
  draft: [
    {
      status: "sent",
      label: "Marquer envoyée",
      icon: Send,
      color: "text-blue-600",
    },
    {
      status: "cancelled",
      label: "Annuler",
      icon: XCircle,
      color: "text-red-500",
    },
  ],
  sent: [
    {
      status: "paid",
      label: "Marquer payée",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      status: "cancelled",
      label: "Annuler",
      icon: XCircle,
      color: "text-red-500",
    },
  ],
  overdue: [
    {
      status: "paid",
      label: "Marquer payée",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      status: "cancelled",
      label: "Annuler",
      icon: XCircle,
      color: "text-red-500",
    },
  ],
  paid: [],
  cancelled: [],
};

function StatusMenu({
  invoice,
  onUpdate,
}: {
  invoice: Invoice;
  onUpdate: (id: string, s: InvoiceStatus) => void;
}) {
  const { open, toggle, anchorRef, portal, close, placement } =
    usePortalPopover();
  const actions = STATUS_ACTIONS[invoice.status] ?? [];

  if (!actions.length) {
    return (
      <span
        className={cn(
          "px-2.5 py-1 rounded-full text-xs font-medium",
          INVOICE_STATUS_COLORS[invoice.status],
        )}
      >
        {INVOICE_STATUS_LABELS[invoice.status]}
      </span>
    );
  }

  return (
    <>
      <button
        ref={anchorRef}
        onClick={toggle}
        className={cn(
          "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium hover:opacity-80 transition-opacity",
          INVOICE_STATUS_COLORS[invoice.status],
        )}
      >
        {INVOICE_STATUS_LABELS[invoice.status]}
        <ChevronDown
          size={11}
          className={cn(
            "transition-transform duration-200",
            open && placement === "bottom" && "rotate-180",
            open && placement === "top" && "rotate-0",
            !open && placement === "top" && "rotate-180",
          )}
        />
      </button>

      {portal(
        <div
          className="bg-white border border-gray-200 rounded-xl shadow-xl py-1 w-48"
          style={{
            animation: `${placement === "top" ? "bizflow-popover-in-up" : "bizflow-popover-in"} 120ms ease`,
            transformOrigin: placement === "top" ? "bottom left" : "top left",
          }}
        >
          <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1">
            Changer le statut
          </p>
          {actions.map(({ status, label, icon: Icon, color }) => (
            <button
              key={status}
              onClick={() => {
                onUpdate(invoice.id, status);
                close();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
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

export default function InvoicesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">(
    "all",
  );
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<PaginatedResponse<Invoice>>({
    queryKey: ["invoices", page, search, statusFilter],
    queryFn: () =>
      apiGet("/invoices", {
        page,
        limit: 15,
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: InvoiceStatus }) =>
      apiPatch(`/invoices/${id}/status`, { status }),
    onSuccess: (_, v) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(`Statut mis à jour`);
    },
    onError: (e: any) =>
      toast.error(e.response?.data?.message ?? "Transition invalide"),
  });

  const duplicate = useMutation({
    mutationFn: (id: string) => apiPost<Invoice>(`/invoices/${id}/duplicate`),
    onSuccess: (inv: Invoice) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Facture dupliquée");
      navigate(`/invoices/${inv.id}/edit`);
    },
  });

  const columns: Column<Invoice>[] = [
    {
      key: "number",
      header: "Numéro",
      render: (inv) => (
        <span className="font-mono text-xs text-brand-700 font-medium">
          {inv.number}
        </span>
      ),
    },
    {
      key: "client",
      header: "Client",
      render: (inv) => (
        <span className="font-medium text-gray-900">
          {getClientDisplayName(inv.client)}
        </span>
      ),
    },
    {
      key: "issueDate",
      header: "Date",
      hideOnMobile: true,
      render: (inv) => (
        <span className="text-gray-500">{formatDate(inv.issueDate)}</span>
      ),
    },
    {
      key: "dueDate",
      header: "Échéance",
      hideOnMobile: true,
      render: (inv) => (
        <span className="text-gray-500">{formatDate(inv.dueDate)}</span>
      ),
    },
    {
      key: "total",
      header: "Total TTC",
      render: (inv) => (
        <span className="font-semibold text-gray-900">
          {formatCurrency(inv.totalTTC)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (inv) => (
        <StatusMenu
          invoice={inv}
          onUpdate={(id, s) => updateStatus.mutate({ id, status: s })}
        />
      ),
    },
    {
      key: "actions",
      header: "",
      hideOnMobile: false,
      render: (inv) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/invoices/${inv.id}/edit`);
            }}
            className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors"
            title="Modifier"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              duplicate.mutate(inv.id);
            }}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Dupliquer"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              generateInvoicePDF(inv);
            }}
            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
            title="PDF"
          >
            <Download size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 md:space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
            Factures
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data?.meta.total ?? 0} au total
          </p>
        </div>
        <button
          onClick={() => navigate("/invoices/new")}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Nouvelle facture</span>
          <span className="sm:hidden">Nouveau</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 md:p-4 shadow-card space-y-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {STATUS_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => {
                setStatusFilter(value);
                setPage(1);
              }}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                statusFilter === value
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveTable
        columns={columns}
        data={data?.data ?? []}
        keyExtractor={(inv) => inv.id}
        emptyMessage="Aucune facture"
        loading={isLoading}
        footer={
          <TablePagination
            page={page}
            totalPages={data?.meta.totalPages ?? 1}
            onPrev={() => setPage((p) => p - 1)}
            onNext={() => setPage((p) => p + 1)}
          />
        }
      />
    </div>
  );
}
