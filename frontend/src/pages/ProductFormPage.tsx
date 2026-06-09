import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "react-hot-toast";
import { apiGet, apiPost, apiPatch } from "@/utils/apiClient";
import { Product } from "@/types";
import { PRODUCT_CATEGORY_LABELS, cn } from "@/utils/helpers";

// ─── Schema ───────────────────────────────────
const productSchema = z.object({
  reference: z.string().min(1, "Référence requise"),
  name: z.string().min(1, "Nom requis"),
  description: z.string().optional(),
  category: z.enum([
    "electronics",
    "clothing",
    "food",
    "services",
    "software",
    "office",
    "other",
  ]),
  unitPrice: z.coerce.number().min(0, "Prix ≥ 0"),
  purchasePrice: z.coerce.number().min(0).default(0),
  vatRate: z.coerce.number().min(0).max(100).default(20),
  unit: z.string().default("unité"),
  stockQuantity: z.coerce.number().min(0).default(0),
  minStock: z.coerce.number().min(0).default(0),
  isService: z.boolean().default(false),
});

type ProductForm = z.infer<typeof productSchema>;

export default function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      category: "other",
      vatRate: 20,
      unit: "unité",
      stockQuantity: 0,
      minStock: 0,
      isService: false,
      purchasePrice: 0,
    },
  });

  const isService = watch("isService");

  // Load existing product if editing
  const { data: existingProduct } = useQuery<Product>({
    queryKey: ["product", id],
    queryFn: () => apiGet(`/products/${id}`),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingProduct) {
      reset({
        reference: existingProduct.reference,
        name: existingProduct.name,
        description: existingProduct.description ?? "",
        category: existingProduct.category,
        unitPrice: Number(existingProduct.unitPrice),
        purchasePrice: Number(existingProduct.purchasePrice),
        vatRate: Number(existingProduct.vatRate),
        unit: existingProduct.unit,
        stockQuantity: Number(existingProduct.stockQuantity),
        minStock: Number(existingProduct.minStock),
        isService: existingProduct.isService,
      });
    }
  }, [existingProduct, reset]);

  // Auto-set unit to "prestation" for services
  useEffect(() => {
    if (isService) setValue("unit", "prestation");
    else if (watch("unit") === "prestation") setValue("unit", "unité");
  }, [isService]);

  const createMutation = useMutation({
    mutationFn: (data: ProductForm) => apiPost<Product>("/products", data),
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(`Produit "${product.name}" créé`);
      navigate("/stock");
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? "Erreur lors de la création"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProductForm) =>
      apiPatch<Product>(`/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produit mis à jour");
      navigate("/stock");
    },
    onError: (err: any) =>
      toast.error(
        err.response?.data?.message ?? "Erreur lors de la mise à jour",
      ),
  });

  const onSubmit = (data: ProductForm) => {
    if (isEdit) updateMutation.mutate(data);
    else createMutation.mutate(data);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  // Computed margin
  const unitPrice = watch("unitPrice") || 0;
  const purchasePrice = watch("purchasePrice") || 0;
  const margin =
    unitPrice > 0 ? ((unitPrice - purchasePrice) / unitPrice) * 100 : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/stock")}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEdit ? "Modifier le produit" : "Nouveau produit"}
          </h1>
          {existingProduct && (
            <p className="text-sm text-gray-500 mt-0.5 font-mono">
              {existingProduct.reference}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Type toggle */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-card p-5">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  {...register("isService")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-checked:bg-brand-600 rounded-full transition-colors peer" />
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {isService ? "🛎 Service / Prestation" : "📦 Produit physique"}
              </span>
            </label>
            <p className="text-xs text-gray-400">
              {isService
                ? "Pas de gestion de stock"
                : "Stock suivi automatiquement"}
            </p>
          </div>
        </div>

        {/* Identité */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Informations générales
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Référence <span className="text-red-500">*</span>
              </label>
              <input
                {...register("reference")}
                placeholder="REF-001"
                className={cn(
                  "w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500",
                  errors.reference ? "border-red-300" : "border-gray-200",
                )}
              />
              {errors.reference && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.reference.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie <span className="text-red-500">*</span>
              </label>
              <select
                {...register("category")}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {Object.entries(PRODUCT_CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                {...register("name")}
                placeholder="Nom du produit ou service"
                className={cn(
                  "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500",
                  errors.name ? "border-red-300" : "border-gray-200",
                )}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={2}
                placeholder="Description détaillée…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Tarif */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Tarification
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix de vente HT (€) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register("unitPrice")}
                placeholder="0.00"
                className={cn(
                  "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500",
                  errors.unitPrice ? "border-red-300" : "border-gray-200",
                )}
              />
              {errors.unitPrice && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.unitPrice.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix d'achat HT (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register("purchasePrice")}
                placeholder="0.00"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taux de TVA
              </label>
              <select
                {...register("vatRate")}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {[0, 5.5, 10, 20].map((r) => (
                  <option key={r} value={r}>
                    {r}%
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unité
              </label>
              <input
                {...register("unit")}
                placeholder="unité, kg, m², heure…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Margin indicator */}
            {purchasePrice > 0 && unitPrice > 0 && (
              <div className="col-span-2 bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                <span className="text-sm text-gray-600">Marge calculée</span>
                <span
                  className={cn(
                    "text-sm font-semibold",
                    margin >= 30
                      ? "text-green-600"
                      : margin >= 10
                        ? "text-orange-500"
                        : "text-red-600",
                  )}
                >
                  {margin.toFixed(1)}%
                  <span className="font-normal text-gray-500 ml-1">
                    ({(unitPrice - purchasePrice).toFixed(2)} € / unité)
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stock (hidden for services) */}
        {!isService && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-card p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Gestion du stock
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock initial
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  {...register("stockQuantity")}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Quantité disponible actuellement
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock minimum (alerte)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  {...register("minStock")}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Alerte déclenchée en dessous de ce seuil
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/stock")}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <Save size={15} />
            {isPending
              ? "Enregistrement…"
              : isEdit
                ? "Mettre à jour"
                : "Créer le produit"}
          </button>
        </div>
      </form>
    </div>
  );
}
