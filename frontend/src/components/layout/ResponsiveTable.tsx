import { cn } from "@/utils/helpers";

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  headerClassName?: string;
  render: (row: T) => React.ReactNode;
  mobileLabel?: string; // label affiché sur mobile (si omis = header)
  hideOnMobile?: boolean; // colonnes secondaires masquées sur mobile
}

interface ResponsiveTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  footer?: React.ReactNode;
}

export function ResponsiveTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "Aucune donnée",
  onRowClick,
  loading,
  footer,
}: ResponsiveTableProps<T>) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-card">
        <div className="p-8 text-center text-gray-400 text-sm">Chargement…</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden">
      {/* ─── Desktop : vraie table ────────────── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap",
                    col.headerClassName,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "hover:bg-gray-50 transition-colors group",
                  onRowClick && "cursor-pointer",
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn("px-5 py-3.5", col.className)}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
            {!data.length && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-10 text-center text-gray-400 text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Mobile : cartes ──────────────────── */}
      <div className="md:hidden divide-y divide-gray-100">
        {data.map((row) => {
          const visibleCols = columns.filter((c) => !c.hideOnMobile);
          const [primary, ...rest] = visibleCols;
          return (
            <div
              key={keyExtractor(row)}
              onClick={() => onRowClick?.(row)}
              className={cn(
                "px-4 py-4 hover:bg-gray-50 transition-colors",
                onRowClick && "cursor-pointer",
              )}
            >
              {/* Première colonne = titre principal */}
              {primary && <div className="mb-2">{primary.render(row)}</div>}
              {/* Autres colonnes en grille 2 colonnes */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {rest.map((col) => (
                  <div key={col.key}>
                    <p className="text-xs text-gray-400 mb-0.5">
                      {col.mobileLabel ?? col.header}
                    </p>
                    <div className="text-sm">{col.render(row)}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {!data.length && (
          <div className="px-4 py-10 text-center text-gray-400 text-sm">
            {emptyMessage}
          </div>
        )}
      </div>

      {/* Footer (pagination, etc.) */}
      {footer && <div className="border-t border-gray-100">{footer}</div>}
    </div>
  );
}

// ─── Pagination réutilisable ──────────────────
interface PaginationProps {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

export function TablePagination({
  page,
  totalPages,
  onPrev,
  onNext,
}: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="px-4 md:px-5 py-3 flex items-center justify-between text-sm text-gray-500">
      <span>
        Page {page} sur {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          onClick={onPrev}
          disabled={page === 1}
          className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs"
        >
          Précédent
        </button>
        <button
          onClick={onNext}
          disabled={page >= totalPages}
          className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
