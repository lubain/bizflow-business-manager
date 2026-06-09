import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Building2,
  User,
  Mail,
  Phone,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiGet, apiPost } from "@/utils/apiClient";
import { Client, PaginatedResponse } from "@/types";
import {
  formatCurrency,
  formatDate,
  getClientDisplayName,
  cn,
} from "@/utils/helpers";

const clientSchema = z.object({
  type: z.enum(["individual", "business"]),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  siret: z.string().optional(),
  vatNumber: z.string().optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  notes: z.string().optional(),
});

type ClientForm = z.infer<typeof clientSchema>;

function NewClientModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [clientType, setClientType] = useState<"individual" | "business">(
    "business",
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
    defaultValues: { type: "business" },
  });

  const mutation = useMutation({
    mutationFn: (data: ClientForm) => apiPost("/clients", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Client créé avec succès");
      onClose();
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message ?? "Erreur lors de la création"),
  });

  const handleTypeChange = (type: "individual" | "business") => {
    setClientType(type);
    setValue("type", type);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Nouveau client
          </h2>
        </div>
        <form
          onSubmit={handleSubmit((d) => mutation.mutate(d))}
          className="p-6 space-y-5"
        >
          {/* Type selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de client
            </label>
            <div className="flex gap-3">
              {(["business", "individual"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors",
                    clientType === t
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50",
                  )}
                >
                  {t === "business" ? (
                    <Building2 size={16} />
                  ) : (
                    <User size={16} />
                  )}
                  {t === "business" ? "Entreprise" : "Particulier"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {clientType === "business" ? (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'entreprise *
                </label>
                <input
                  {...register("companyName")}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom
                  </label>
                  <input
                    {...register("firstName")}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    {...register("lastName")}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                {...register("email")}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                {...register("phone")}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {clientType === "business" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SIRET
                  </label>
                  <input
                    {...register("siret")}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    N° TVA intracommunautaire
                  </label>
                  <input
                    {...register("vatNumber")}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </>
            )}

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <input
                {...register("address.street")}
                placeholder="Rue..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 mb-2"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  {...register("address.postalCode")}
                  placeholder="Code postal"
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <input
                  {...register("address.city")}
                  placeholder="Ville"
                  className="col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                {...register("notes")}
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-60"
            >
              {mutation.isPending ? "Création…" : "Créer le client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────
export default function ClientsPage() {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "business" | "individual"
  >("all");
  const navigate = useNavigate();

  const { data, isLoading } = useQuery<PaginatedResponse<Client>>({
    queryKey: ["clients", search, typeFilter],
    queryFn: () =>
      apiGet("/clients", {
        search: search || undefined,
        type: typeFilter !== "all" ? typeFilter : undefined,
      }),
  });

  const clients = data?.data ?? [];

  return (
    <div className="space-y-5">
      {showModal && <NewClientModal onClose={() => setShowModal(false)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data?.meta.total ?? 0} client
            {(data?.meta.total ?? 0) > 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Nouveau client
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Rechercher un client…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-64"
          />
        </div>
        {(["all", "business", "individual"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={cn(
              "px-3 py-2 rounded-lg text-xs font-medium transition-colors",
              typeFilter === t
                ? "bg-brand-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            )}
          >
            {t === "all"
              ? "Tous"
              : t === "business"
                ? "Entreprises"
                : "Particuliers"}
          </button>
        ))}
      </div>

      {/* Grid of client cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-40 bg-gray-200 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => {
            const initials = getClientDisplayName(client)
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();
            return (
              <div
                key={client.id}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-card hover:shadow-soft transition-shadow cursor-pointer group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {getClientDisplayName(client)}
                    </p>
                    <span
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded font-medium",
                        client.type === "business"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-purple-50 text-purple-600",
                      )}
                    >
                      {client.type === "business"
                        ? "Entreprise"
                        : "Particulier"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="flex-shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="flex-shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.address?.city && (
                    <div className="flex items-center gap-2 text-xs">
                      <span>
                        {client.address.city}, {client.address.country}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => navigate(`/invoices?clientId=${client.id}`)}
                    className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800 transition-colors"
                  >
                    <FileText size={12} />
                    Voir les factures
                  </button>
                  <p className="text-xs text-gray-400">
                    Depuis {formatDate(client.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
          {!clients.length && (
            <div className="col-span-3 py-16 text-center text-gray-400 text-sm">
              <Users size={40} className="mx-auto mb-3 opacity-30" />
              Aucun client pour l'instant
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Missing import fix
import { Users } from "lucide-react";
