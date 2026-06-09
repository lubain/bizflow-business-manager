import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, ArrowLeft, Save, Send } from "lucide-react";
import { toast } from "react-hot-toast";
import { apiGet, apiPost, apiPatch } from "@/utils/apiClient";
import { Client, Product, Invoice, PaginatedResponse } from "@/types";
import { formatCurrency, calcLineHT, calcLineTTC, cn } from "@/utils/helpers";

// ─── Schema ───────────────────────────────────
const lineSchema = z.object({
  productId: z.string().optional(),
  description: z.string().min(1, "Description requise"),
  quantity: z.coerce.number().min(0.01, "Quantité > 0"),
  unitPrice: z.coerce.number().min(0, "Prix ≥ 0"),
  vatRate: z.coerce.number().min(0).max(100).default(20),
  discount: z.coerce.number().min(0).max(100).default(0),
});

const invoiceSchema = z.object({
  clientId: z.string().min(1, "Client requis"),
  issueDate: z.string().min(1, "Date requise"),
  dueDate: z.string().min(1, "Échéance requise"),
  paymentTerms: z.coerce.number().min(0).default(30),
  notes: z.string().optional(),
  lines: z.array(lineSchema).min(1, "Au moins une ligne requise"),
});

type InvoiceForm = z.infer<typeof invoiceSchema>;

const today = () => new Date().toISOString().split("T")[0];
const addDays = (days: number) =>
  new Date(Date.now() + days * 86400000).toISOString().split("T")[0];

// ─── Line row component ───────────────────────
function LineRow({
  index,
  register,
  control,
  errors,
  products,
  onRemove,
  watch,
}: any) {
  const qty = watch(`lines.${index}.quantity`) || 0;
  const price = watch(`lines.${index}.unitPrice`) || 0;
  const vat = watch(`lines.${index}.vatRate`) || 20;
  const discount = watch(`lines.${index}.discount`) || 0;
  const ht = calcLineHT(qty, price, discount);
  const ttc = calcLineTTC(ht, vat);

  const handleProductChange = (
    productId: string,
    onChange: (v: string) => void,
  ) => {
    onChange(productId);
    if (!productId) return;
    const product = products?.find((p: Product) => p.id === productId);
    if (product) {
      // Auto-fill description, price, VAT from product
      const form = (window as any).__invoiceForm;
      if (form) {
        form.setValue(`lines.${index}.description`, product.name);
        form.setValue(`lines.${index}.unitPrice`, product.unitPrice);
        form.setValue(`lines.${index}.vatRate`, product.vatRate);
      }
    }
  };

  return (
    <div className="grid grid-cols-12 gap-2 items-start py-3 border-b border-gray-100 last:border-0">
      {/* Product selector */}
      <div className="col-span-3">
        <Controller
          name={`lines.${index}.productId`}
          control={control}
          render={({ field }) => (
            <select
              {...field}
              onChange={(e) =>
                handleProductChange(e.target.value, field.onChange)
              }
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Produit (optionnel)</option>
              {(products ?? []).map((p: Product) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        />
      </div>

      {/* Description */}
      <div className="col-span-3">
        <input
          {...register(`lines.${index}.description`)}
          placeholder="Description *"
          className={cn(
            "w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500",
            errors?.lines?.[index]?.description
              ? "border-red-300"
              : "border-gray-200",
          )}
        />
        {errors?.lines?.[index]?.description && (
          <p className="text-xs text-red-500 mt-0.5">
            {errors.lines[index].description.message}
          </p>
        )}
      </div>

      {/* Qty */}
      <div className="col-span-1">
        <input
          type="number"
          step="0.01"
          min="0"
          {...register(`lines.${index}.quantity`)}
          placeholder="Qté"
          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Unit price */}
      <div className="col-span-2">
        <input
          type="number"
          step="0.01"
          min="0"
          {...register(`lines.${index}.unitPrice`)}
          placeholder="Prix HT"
          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* VAT */}
      <div className="col-span-1">
        <select
          {...register(`lines.${index}.vatRate`)}
          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {[0, 5.5, 10, 20].map((r) => (
            <option key={r} value={r}>
              {r}%
            </option>
          ))}
        </select>
      </div>

      {/* Discount */}
      <div className="col-span-1">
        <input
          type="number"
          step="0.1"
          min="0"
          max="100"
          {...register(`lines.${index}.discount`)}
          placeholder="Rem%"
          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Total TTC + delete */}
      <div className="col-span-1 flex items-center justify-between gap-1">
        <span className="text-xs font-semibold text-gray-900 whitespace-nowrap">
          {formatCurrency(ttc)}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="p-1 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────
export default function InvoiceFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<InvoiceForm>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      issueDate: today(),
      dueDate: addDays(30),
      paymentTerms: 30,
      lines: [
        {
          description: "",
          quantity: 1,
          unitPrice: 0,
          vatRate: 20,
          discount: 0,
        },
      ],
    },
  });

  // Expose form to LineRow for auto-fill
  useEffect(() => {
    (window as any).__invoiceForm = { setValue };
    return () => {
      delete (window as any).__invoiceForm;
    };
  }, [setValue]);

  const { fields, append, remove } = useFieldArray({ control, name: "lines" });

  // Load clients and products
  const { data: clientsData } = useQuery<PaginatedResponse<Client>>({
    queryKey: ["clients-select"],
    queryFn: () => apiGet("/clients", { limit: 100 }),
  });
  const { data: productsData } = useQuery<PaginatedResponse<Product>>({
    queryKey: ["products-select"],
    queryFn: () => apiGet("/products", { limit: 100 }),
  });

  // Load existing invoice if editing
  const { data: existingInvoice } = useQuery<Invoice>({
    queryKey: ["invoice", id],
    queryFn: () => apiGet(`/invoices/${id}`),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingInvoice) {
      reset({
        clientId: existingInvoice.clientId,
        issueDate: existingInvoice.issueDate,
        dueDate: existingInvoice.dueDate,
        paymentTerms: existingInvoice.paymentTerms,
        notes: existingInvoice.notes ?? "",
        lines: existingInvoice.lines.map((l) => ({
          productId: l.productId ?? "",
          description: l.description,
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
          vatRate: Number(l.vatRate),
          discount: Number(l.discount),
        })),
      });
    }
  }, [existingInvoice, reset]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: InvoiceForm) => apiPost<Invoice>("/invoices", data),
    onSuccess: (inv) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(`Facture ${inv.number} créée`);
      navigate("/invoices");
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? "Erreur création"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: InvoiceForm) =>
      apiPatch<Invoice>(`/invoices/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Facture mise à jour");
      navigate("/invoices");
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? "Erreur mise à jour"),
  });

  const onSubmit = (data: InvoiceForm) => {
    if (isEdit) updateMutation.mutate(data);
    else createMutation.mutate(data);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  // Live totals
  const lines = watch("lines") ?? [];
  const subtotalHT = lines.reduce(
    (s, l) =>
      s + calcLineHT(l.quantity || 0, l.unitPrice || 0, l.discount || 0),
    0,
  );
  const totalVAT = lines.reduce((s, l) => {
    const ht = calcLineHT(l.quantity || 0, l.unitPrice || 0, l.discount || 0);
    return s + (ht * (l.vatRate || 0)) / 100;
  }, 0);
  const totalTTC = subtotalHT + totalVAT;

  const clients = clientsData?.data ?? [];
  const products = productsData?.data ?? [];

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/invoices")}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEdit ? "Modifier la facture" : "Nouvelle facture"}
          </h1>
          {existingInvoice && (
            <p className="text-sm text-gray-500 mt-0.5">
              {existingInvoice.number}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Top section: client + dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Client */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-card p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Client</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                {...register("clientId")}
                className={cn(
                  "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500",
                  errors.clientId ? "border-red-300" : "border-gray-200",
                )}
              >
                <option value="">Sélectionner un client…</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName ||
                      `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim()}
                  </option>
                ))}
              </select>
              {errors.clientId && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.clientId.message}
                </p>
              )}
              {clients.length === 0 && (
                <p className="text-xs text-orange-500 mt-1">
                  Aucun client —{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/clients")}
                    className="underline"
                  >
                    en créer un
                  </button>
                </p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-card p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Dates & conditions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date d'émission *
                </label>
                <input
                  type="date"
                  {...register("issueDate")}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date d'échéance *
                </label>
                <input
                  type="date"
                  {...register("dueDate")}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Délai de paiement (jours)
                </label>
                <input
                  type="number"
                  {...register("paymentTerms")}
                  onChange={(e) => {
                    register("paymentTerms").onChange(e);
                    const days = parseInt(e.target.value) || 0;
                    setValue("dueDate", addDays(days));
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <input
                  {...register("notes")}
                  placeholder="Mentions légales, IBAN…"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lines */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              Lignes de facturation
            </h2>
            <button
              type="button"
              onClick={() =>
                append({
                  description: "",
                  quantity: 1,
                  unitPrice: 0,
                  vatRate: 20,
                  discount: 0,
                })
              }
              className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-800 font-medium transition-colors"
            >
              <Plus size={14} /> Ajouter une ligne
            </button>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-12 gap-2 px-5 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-3">Produit</div>
            <div className="col-span-3">Description</div>
            <div className="col-span-1">Qté</div>
            <div className="col-span-2">Prix HT</div>
            <div className="col-span-1">TVA</div>
            <div className="col-span-1">Rem.</div>
            <div className="col-span-1">Total TTC</div>
          </div>

          <div className="px-5">
            {fields.map((field, index) => (
              <LineRow
                key={field.id}
                index={index}
                register={register}
                control={control}
                errors={errors}
                products={products}
                onRemove={() => remove(index)}
                watch={watch}
              />
            ))}
          </div>

          {errors.lines?.root && (
            <p className="px-5 pb-3 text-xs text-red-500">
              {errors.lines.root.message}
            </p>
          )}

          {/* Totals */}
          <div className="border-t border-gray-100 px-5 py-4 flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total HT</span>
                <span className="font-medium">
                  {formatCurrency(subtotalHT)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>TVA</span>
                <span className="font-medium">{formatCurrency(totalVAT)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-gray-900 border-t border-gray-200 pt-2">
                <span>Total TTC</span>
                <span className="text-brand-700">
                  {formatCurrency(totalTTC)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/invoices")}
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
                : "Créer la facture"}
          </button>
        </div>
      </form>
    </div>
  );
}
