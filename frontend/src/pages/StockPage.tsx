import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiGet, apiPost } from "@/utils/apiClient";
import { Product, StockMovement, PaginatedResponse } from "@/types";
import {
  formatCurrency,
  formatDate,
  PRODUCT_CATEGORY_LABELS,
  MOVEMENT_TYPE_LABELS,
  MOVEMENT_TYPE_COLORS,
  cn,
} from "@/utils/helpers";
import {
  ResponsiveTable,
  TablePagination,
  Column,
} from "@/components/layout/ResponsiveTable";

const movementSchema = z.object({
  productId: z.string().min(1, "Produit requis"),
  type: z.enum(["in", "out", "adjustment", "return"]),
  quantity: z.coerce.number().min(0.01),
  reason: z.string().optional(),
});
type MovementForm = z.infer<typeof movementSchema>;

function MovementModal({
  products,
  onClose,
}: {
  products: Product[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MovementForm>({
    resolver: zodResolver(movementSchema),
    defaultValues: { type: "in" },
  });
  const mutation = useMutation({
    mutationFn: (data: MovementForm) => apiPost("/stock/movements", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["movements"] });
      toast.success("Mouvement enregistré");
      onClose();
    },
    onError: () => toast.error("Erreur"),
  });
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            Nouveau mouvement
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
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
              Produit *
            </label>
            <select
              {...register("productId")}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Sélectionner…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.stockQuantity} {p.unit})
                </option>
              ))}
            </select>
            {errors.productId && (
              <p className="text-xs text-red-500 mt-1">
                {errors.productId.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              {...register("type")}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="in">Entrée</option>
              <option value="out">Sortie</option>
              <option value="adjustment">Ajustement</option>
              <option value="return">Retour</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantité *
            </label>
            <input
              type="number"
              step="0.01"
              {...register("quantity")}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {errors.quantity && (
              <p className="text-xs text-red-500 mt-1">
                {errors.quantity.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motif
            </label>
            <input
              {...register("reason")}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
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

export default function StockPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"products" | "movements">(
    "products",
  );

  const { data: productsData, isLoading } = useQuery<
    PaginatedResponse<Product>
  >({
    queryKey: ["products", search, showLowStock],
    queryFn: () =>
      apiGet("/products", {
        search: search || undefined,
        lowStock: showLowStock || undefined,
      }),
  });
  const { data: movementsData, isLoading: movLoading } = useQuery<
    PaginatedResponse<StockMovement>
  >({
    queryKey: ["movements"],
    queryFn: () => apiGet("/stock/movements", { limit: 50 }),
    enabled: activeTab === "movements",
  });

  const products = productsData?.data ?? [];
  const movements = movementsData?.data ?? [];
  const lowStockCount = products.filter(
    (p) => !p.isService && Number(p.stockQuantity) <= Number(p.minStock),
  ).length;

  const productColumns: Column<Product>[] = [
    {
      key: "ref",
      header: "Référence",
      hideOnMobile: true,
      render: (p) => (
        <span className="font-mono text-xs text-gray-600">{p.reference}</span>
      ),
    },
    {
      key: "name",
      header: "Produit",
      render: (p) => (
        <div>
          <p className="font-medium text-gray-900">{p.name}</p>
          {p.isService && (
            <span className="text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
              Service
            </span>
          )}
        </div>
      ),
    },
    {
      key: "category",
      header: "Catégorie",
      hideOnMobile: true,
      render: (p) => (
        <span className="text-gray-500 text-sm">
          {PRODUCT_CATEGORY_LABELS[p.category]}
        </span>
      ),
    },
    {
      key: "price",
      header: "Prix vente",
      render: (p) => (
        <span className="font-medium text-gray-900">
          {formatCurrency(Number(p.unitPrice))}
        </span>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      mobileLabel: "Stock",
      render: (p) => {
        const isLow =
          !p.isService && Number(p.stockQuantity) <= Number(p.minStock);
        return (
          <div className="flex items-center gap-1.5">
            {isLow && (
              <AlertTriangle
                size={13}
                className="text-orange-500 flex-shrink-0"
              />
            )}
            <span
              className={cn(
                "font-semibold text-sm",
                isLow ? "text-orange-600" : "text-gray-900",
              )}
            >
              {Number(p.stockQuantity)} {p.unit}
            </span>
          </div>
        );
      },
    },
    {
      key: "value",
      header: "Valeur stock",
      hideOnMobile: true,
      render: (p) => (
        <span className="text-gray-700">
          {formatCurrency(Number(p.stockQuantity) * Number(p.purchasePrice))}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (p) => (
        <button
          onClick={() => navigate(`/stock/products/${p.id}/edit`)}
          className="text-xs text-brand-600 hover:text-brand-800 font-medium whitespace-nowrap"
        >
          Modifier
        </button>
      ),
    },
  ];

  const movementColumns: Column<StockMovement>[] = [
    {
      key: "date",
      header: "Date",
      hideOnMobile: true,
      render: (mv) => (
        <span className="text-gray-500 text-sm">
          {formatDate(mv.createdAt)}
        </span>
      ),
    },
    {
      key: "product",
      header: "Produit",
      render: (mv) => (
        <span className="font-medium text-gray-900">{mv.product.name}</span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (mv) => (
        <span
          className={cn(
            "font-medium text-sm flex items-center gap-1",
            MOVEMENT_TYPE_COLORS[mv.type],
          )}
        >
          {mv.type === "in" ? (
            <TrendingUp size={13} />
          ) : (
            <TrendingDown size={13} />
          )}
          {MOVEMENT_TYPE_LABELS[mv.type]}
        </span>
      ),
    },
    {
      key: "qty",
      header: "Quantité",
      render: (mv) => (
        <span
          className={cn(
            "font-semibold text-sm",
            mv.type === "out" ? "text-red-600" : "text-green-600",
          )}
        >
          {mv.type === "out" ? "-" : "+"}
          {mv.quantity}
        </span>
      ),
    },
    {
      key: "reason",
      header: "Motif",
      hideOnMobile: true,
      render: (mv) => (
        <span className="text-gray-500 text-sm">{mv.reason ?? "—"}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4 md:space-y-5">
      {showMovementModal && (
        <MovementModal
          products={products.filter((p) => !p.isService)}
          onClose={() => setShowMovementModal(false)}
        />
      )}

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
            Stock
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {productsData?.meta.total ?? 0} produits
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setShowMovementModal(true)}
            className="flex items-center gap-1.5 border border-brand-300 text-brand-700 hover:bg-brand-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Minus size={15} />
            <span className="hidden sm:inline">Mouvement</span>
          </button>
          <button
            onClick={() => navigate("/stock/products/new")}
            className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Nouveau produit</span>
            <span className="sm:hidden">Nouveau</span>
          </button>
        </div>
      </div>

      {lowStockCount > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertTriangle size={18} className="text-orange-500 flex-shrink-0" />
          <p className="text-sm text-orange-800">
            <strong>
              {lowStockCount} produit{lowStockCount > 1 ? "s" : ""}
            </strong>{" "}
            sous le seuil minimum.
          </p>
          <button
            onClick={() => setShowLowStock(true)}
            className="ml-auto text-xs text-orange-700 underline whitespace-nowrap"
          >
            Voir
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {(["products", "movements"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-3 md:px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
              activeTab === tab
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            {tab === "products" ? "Produits" : "Mouvements"}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
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
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer whitespace-nowrap">
          <input
            type="checkbox"
            checked={showLowStock}
            onChange={(e) => setShowLowStock(e.target.checked)}
            className="rounded"
          />
          Stock bas
        </label>
      </div>

      {activeTab === "products" && (
        <ResponsiveTable
          columns={productColumns}
          data={products}
          keyExtractor={(p) => p.id}
          emptyMessage="Aucun produit"
          loading={isLoading}
        />
      )}
      {activeTab === "movements" && (
        <ResponsiveTable
          columns={movementColumns}
          data={movements}
          keyExtractor={(mv) => mv.id}
          emptyMessage="Aucun mouvement"
          loading={movLoading}
        />
      )}
    </div>
  );
}
