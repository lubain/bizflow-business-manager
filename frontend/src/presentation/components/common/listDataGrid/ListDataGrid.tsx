import { useState } from "react";
import { Expense, Invoice, Product } from "@/domain/models";
import { useInvoice } from "@/presentation/hooks/invoice/use-invoice";
import { useExpense } from "@/presentation/hooks/expense/use-expense";
import { useProductStore } from "@/store/productStore";
import { useToast } from "@/presentation/hooks/use-toast";
import {
  Trash2,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Edit2,
} from "lucide-react";

/* ── Status badge ───────────────────────────────────────── */
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    payée: "bg-green-100 text-green-700",
    en_attente: "bg-yellow-100 text-yellow-700",
    en_retard: "bg-red-100 text-red-700",
  };
  const label: Record<string, string> = {
    payée: "Payée",
    en_attente: "En attente",
    en_retard: "En retard",
  };
  return (
    <span
      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
        map[status] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {label[status] ?? status}
    </span>
  );
}

/* ── Pagination helper ──────────────────────────────────── */
function usePagination<T>(data: T[], pageSize = 8) {
  const [page, setPage] = useState(0);
  const total = Math.ceil(data.length / pageSize);
  const slice = data.slice(page * pageSize, (page + 1) * pageSize);
  return { slice, page, total, setPage };
}

/* ── Invoice table ──────────────────────────────────────── */
function InvoiceTable({ data }: { data: Invoice[] }) {
  const { markAsPaid, remove } = useInvoice();
  const toast = useToast();
  const { slice, page, total, setPage } = usePagination(data);

  const handleMarkPaid = async (id: number) => {
    try {
      await markAsPaid(id);
      toast.success("Facture marquée comme payée");
    } catch (e) {
      toast.error(e.message);
    }
  };
  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette facture ?")) return;
    try {
      await remove(id);
      toast.success("Facture supprimée");
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-xs uppercase">
            <tr>
              {[
                "#",
                "Client",
                "Émission",
                "Échéance",
                "Total TTC",
                "Statut",
                "Actions",
              ].map((h) => (
                <th key={h} className="px-4 py-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {slice.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  Aucune facture
                </td>
              </tr>
            )}
            {slice.map((inv) => (
              <tr
                key={inv.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <td className="px-4 py-3 font-mono text-slate-400">
                  #{inv.id}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">
                  {inv.clientName}
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-300">
                  {inv.issueDate}
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-300">
                  {inv.dueDate}
                </td>
                <td className="px-4 py-3 font-bold text-slate-700 dark:text-white">
                  {Number(inv.total).toFixed(2)} €
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={inv.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {inv.status !== "payée" && (
                      <button
                        onClick={() => handleMarkPaid(inv.id)}
                        title="Marquer payée"
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(inv.id)}
                      title="Supprimer"
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        total={total}
        setPage={setPage}
        count={data.length}
      />
    </div>
  );
}

/* ── Expense table ──────────────────────────────────────── */
function ExpenseTable({ data }: { data: Expense[] }) {
  const { remove } = useExpense();
  const toast = useToast();
  const { slice, page, total, setPage } = usePagination(data);

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette dépense ?")) return;
    try {
      await remove(id);
      toast.success("Dépense supprimée");
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-xs uppercase">
            <tr>
              {["Date", "Description", "Catégorie", "Montant", "Actions"].map(
                (h) => (
                  <th key={h} className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {slice.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  Aucune dépense
                </td>
              </tr>
            )}
            {slice.map((exp) => (
              <tr
                key={exp.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <td className="px-4 py-3 text-slate-500 dark:text-slate-300">
                  {exp.date}
                </td>
                <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">
                  {exp.description}
                </td>
                <td className="px-4 py-3">
                  <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full">
                    {exp.category}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-red-600">
                  {Number(exp.amount).toFixed(2)} €
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        total={total}
        setPage={setPage}
        count={data.length}
      />
    </div>
  );
}

/* ── Stock table ────────────────────────────────────────── */
function StockTable({
  data,
  onAdjust,
}: {
  data: Product[];
  onAdjust: (p: Product) => void;
}) {
  const { remove } = useProductStore();
  const toast = useToast();
  const { slice, page, total, setPage } = usePagination(data);

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce produit ?")) return;
    try {
      await remove(id);
      toast.success("Produit supprimé");
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-xs uppercase">
            <tr>
              {[
                "Produit",
                "Prix (€)",
                "Stock",
                "Seuil min.",
                "État",
                "Actions",
              ].map((h) => (
                <th key={h} className="px-4 py-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {slice.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  Aucun produit
                </td>
              </tr>
            )}
            {slice.map((p) => {
              const isLow = Number(p.stock) <= Number(p.minStock);
              return (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">
                    {p.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {Number(p.price).toFixed(2)}
                  </td>
                  <td
                    className={`px-4 py-3 font-bold ${
                      isLow ? "text-red-600" : "text-slate-700 dark:text-white"
                    }`}
                  >
                    {p.stock}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-300">
                    {p.minStock}
                  </td>
                  <td className="px-4 py-3">
                    {isLow ? (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                        ⚠ Faible
                      </span>
                    ) : (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                        OK
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onAdjust(p)}
                        title="Ajuster stock"
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        title="Supprimer"
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        total={total}
        setPage={setPage}
        count={data.length}
      />
    </div>
  );
}

/* ── Pagination bar ─────────────────────────────────────── */
function Pagination({
  page,
  total,
  setPage,
  count,
}: {
  page: number;
  total: number;
  setPage: (p: number) => void;
  count: number;
}) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-700 text-sm text-slate-500">
      <span>{count} entrées</span>
      <div className="flex items-center gap-1">
        <button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="px-2">
          Page {page + 1} / {total}
        </span>
        <button
          disabled={page >= total - 1}
          onClick={() => setPage(page + 1)}
          className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* ── Main export ────────────────────────────────────────── */
interface ListDataGridProps {
  type: "invoice" | "expense" | "stock";
  data: Invoice[] | Expense[] | Product[];
  onAdjust?: (p: Product) => void;
}

export default function ListDataGrid({
  type,
  data,
  onAdjust,
}: ListDataGridProps) {
  if (type === "invoice") return <InvoiceTable data={data as Invoice[]} />;
  if (type === "expense") return <ExpenseTable data={data as Expense[]} />;
  if (type === "stock")
    return (
      <StockTable data={data as Product[]} onAdjust={onAdjust ?? (() => {})} />
    );
  return null;
}
