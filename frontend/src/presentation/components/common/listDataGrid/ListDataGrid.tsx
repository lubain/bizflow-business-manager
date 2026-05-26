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
  Search,
} from "lucide-react";
import { Badge } from "@/presentation/components/ui/Badge";

export function StatusBadge({ status }: { status: string }) {
  const map: Record<
    string,
    { label: string; color: "green" | "yellow" | "red" }
  > = {
    payée: { label: "Payée", color: "green" },
    en_attente: { label: "En attente", color: "yellow" },
    en_retard: { label: "En retard", color: "red" },
  };
  const s = map[status] ?? { label: status, color: "slate" as any };
  return <Badge label={s.label} color={s.color} dot />;
}

const wrap =
  "bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden";
const thead = "bg-slate-50 dark:bg-slate-700/50 text-left";
const th =
  "px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap";
const tr =
  "hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors group";
const td = "px-4 py-3.5";
const div_y = "divide-y divide-slate-50 dark:divide-slate-700";

function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative flex-1 max-w-xs">
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Rechercher..."
        className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
      />
    </div>
  );
}

function usePagination<T>(data: T[], pageSize = 8) {
  const [page, setPage] = useState(0);
  const total = Math.max(1, Math.ceil(data.length / pageSize));
  const safePage = Math.min(page, total - 1);
  return {
    slice: data.slice(safePage * pageSize, (safePage + 1) * pageSize),
    page: safePage,
    total,
    setPage,
  };
}

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
    <div className="flex items-center justify-between px-6 py-3 border-t border-slate-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30 text-sm text-slate-500 dark:text-slate-400">
      <span className="text-xs">
        {count} entrée{count !== 1 ? "s" : ""}
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-600 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`h-7 w-7 rounded-lg text-xs font-semibold transition-colors ${i === page ? "bg-blue-600 text-white" : "hover:bg-white dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400"}`}
          >
            {i + 1}
          </button>
        ))}
        <button
          disabled={page >= total - 1}
          onClick={() => setPage(page + 1)}
          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-600 disabled:opacity-30 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
      <div className="h-12 w-12 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-1">
        <Search size={20} className="opacity-40" />
      </div>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

/* ── Invoice table ── */
function InvoiceTable({ data }: { data: Invoice[] }) {
  const { markAsPaid, remove } = useInvoice();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const filtered = data.filter(
    (inv) =>
      inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
      String(inv.id).includes(search),
  );
  const { slice, page, total, setPage } = usePagination(filtered);

  return (
    <div className={wrap}>
      <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-700 flex items-center gap-3">
        <SearchBar value={search} onChange={setSearch} />
        <span className="text-xs text-slate-400 ml-auto">
          {filtered.length} facture{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className={thead}>
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
                <th key={h} className={th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={div_y}>
            {slice.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <EmptyState message="Aucune facture trouvée" />
                </td>
              </tr>
            ) : (
              slice.map((inv, i) => (
                <tr
                  key={inv.id}
                  style={{ animationDelay: `${i * 0.03}s` }}
                  className={`animate-fade-up ${tr}`}
                >
                  <td className={td}>
                    <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-lg">
                      #{inv.id}
                    </span>
                  </td>
                  <td className={td}>
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 gradient-blue rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {inv.clientName.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-white text-sm">
                        {inv.clientName}
                      </span>
                    </div>
                  </td>
                  <td
                    className={`${td} text-slate-500 dark:text-slate-400 text-xs`}
                  >
                    {inv.issueDate}
                  </td>
                  <td
                    className={`${td} text-slate-500 dark:text-slate-400 text-xs`}
                  >
                    {inv.dueDate}
                  </td>
                  <td
                    className={`${td} font-bold text-slate-900 dark:text-white`}
                  >
                    {Number(inv.total).toLocaleString("fr-FR")} €
                  </td>
                  <td className={td}>
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className={td}>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {inv.status !== "payée" && (
                        <button
                          onClick={async () => {
                            try {
                              await markAsPaid(inv.id);
                              toast.success("Facture marquée payée");
                            } catch (e: any) {
                              toast.error(e.message);
                            }
                          }}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                          title="Marquer payée"
                        >
                          <CheckCircle size={15} />
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          if (!confirm("Supprimer ?")) return;
                          try {
                            await remove(inv.id);
                            toast.success("Supprimée");
                          } catch (e: any) {
                            toast.error(e.message);
                          }
                        }}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        total={total}
        setPage={setPage}
        count={filtered.length}
      />
    </div>
  );
}

/* ── Expense table ── */
function ExpenseTable({ data }: { data: Expense[] }) {
  const { remove } = useExpense();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const filtered = data.filter(
    (e) =>
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase()),
  );
  const { slice, page, total, setPage } = usePagination(filtered);
  const catColors: Record<string, string> = {
    Loyer: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    Charges:
      "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
    Fournitures:
      "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
    Transport:
      "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300",
    Informatique:
      "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    Salaires: "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300",
  };

  return (
    <div className={wrap}>
      <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-700 flex items-center gap-3">
        <SearchBar value={search} onChange={setSearch} />
        <span className="text-xs text-slate-400 ml-auto">
          {filtered.length} dépense{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className={thead}>
            <tr>
              {["Date", "Description", "Catégorie", "Montant", ""].map(
                (h, i) => (
                  <th key={i} className={th}>
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className={div_y}>
            {slice.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState message="Aucune dépense trouvée" />
                </td>
              </tr>
            ) : (
              slice.map((exp, i) => (
                <tr
                  key={exp.id}
                  style={{ animationDelay: `${i * 0.03}s` }}
                  className={`animate-fade-up ${tr}`}
                >
                  <td
                    className={`${td} text-slate-500 dark:text-slate-400 text-xs font-mono`}
                  >
                    {exp.date}
                  </td>
                  <td
                    className={`${td} font-medium text-slate-800 dark:text-white`}
                  >
                    {exp.description}
                  </td>
                  <td className={td}>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${catColors[exp.category] ?? "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}
                    >
                      {exp.category}
                    </span>
                  </td>
                  <td
                    className={`${td} font-bold text-rose-600 dark:text-rose-400`}
                  >
                    {Number(exp.amount).toLocaleString("fr-FR")} €
                  </td>
                  <td className={td}>
                    <button
                      onClick={async () => {
                        if (!confirm("Supprimer ?")) return;
                        try {
                          await remove(exp.id);
                          toast.success("Supprimée");
                        } catch (e: any) {
                          toast.error(e.message);
                        }
                      }}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        total={total}
        setPage={setPage}
        count={filtered.length}
      />
    </div>
  );
}

/* ── Stock table ── */
function StockTable({
  data,
  onAdjust,
}: {
  data: Product[];
  onAdjust: (p: Product) => void;
}) {
  const { remove } = useProductStore();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const filtered = data.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );
  const { slice, page, total, setPage } = usePagination(filtered);

  return (
    <div className={wrap}>
      <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-700 flex items-center gap-3">
        <SearchBar value={search} onChange={setSearch} />
        <span className="text-xs text-slate-400 ml-auto">
          {filtered.length} produit{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className={thead}>
            <tr>
              {[
                "Produit",
                "Prix",
                "Stock",
                "Seuil min.",
                "Statut",
                "Actions",
              ].map((h) => (
                <th key={h} className={th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={div_y}>
            {slice.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState message="Aucun produit trouvé" />
                </td>
              </tr>
            ) : (
              slice.map((p, i) => {
                const isOut = Number(p.stock) === 0;
                const isLow = Number(p.stock) <= Number(p.minStock);
                const pct =
                  Number(p.minStock) > 0
                    ? Math.min(
                        100,
                        Math.round(
                          (Number(p.stock) / Number(p.minStock)) * 100,
                        ),
                      )
                    : 100;
                return (
                  <tr
                    key={p.id}
                    style={{ animationDelay: `${i * 0.03}s` }}
                    className={`animate-fade-up ${tr}`}
                  >
                    <td className={td}>
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 text-xs font-bold shrink-0">
                          {p.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-white text-sm">
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td
                      className={`${td} text-slate-600 dark:text-slate-300 font-medium`}
                    >
                      {Number(p.price).toLocaleString("fr-FR")} €
                    </td>
                    <td className={td}>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-base font-black ${isOut ? "text-rose-600" : isLow ? "text-amber-600" : "text-slate-900 dark:text-white"}`}
                        >
                          {p.stock}
                        </span>
                        <div className="hidden sm:block w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${isOut ? "bg-rose-500" : isLow ? "bg-amber-400" : "bg-emerald-500"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className={`${td} text-slate-400 text-sm`}>
                      {p.minStock}
                    </td>
                    <td className={td}>
                      {isOut ? (
                        <Badge label="Rupture" color="red" dot />
                      ) : isLow ? (
                        <Badge label="Stock faible" color="yellow" dot />
                      ) : (
                        <Badge label="Disponible" color="green" dot />
                      )}
                    </td>
                    <td className={td}>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onAdjust(p)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Ajuster"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm("Supprimer ?")) return;
                            try {
                              await remove(p.id);
                              toast.success("Supprimé");
                            } catch (e: any) {
                              toast.error(e.message);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        total={total}
        setPage={setPage}
        count={filtered.length}
      />
    </div>
  );
}

interface Props {
  type: "invoice" | "expense" | "stock";
  data: any[];
  onAdjust?: (p: Product) => void;
}
export default function ListDataGrid({ type, data, onAdjust }: Props) {
  if (type === "invoice") return <InvoiceTable data={data as Invoice[]} />;
  if (type === "expense") return <ExpenseTable data={data as Expense[]} />;
  if (type === "stock")
    return (
      <StockTable data={data as Product[]} onAdjust={onAdjust ?? (() => {})} />
    );
  return null;
}
