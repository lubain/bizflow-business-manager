import { useState } from "react";
import {
  Users,
  Plus,
  Mail,
  Phone,
  MapPin,
  Search,
  X,
  Building2,
} from "lucide-react";
import { useClientState } from "@/presentation/hooks/client/use-client-state";
import { useClient } from "@/presentation/hooks/client/use-client";
import { useToast } from "@/presentation/hooks/use-toast";
import { Input } from "@/presentation/components/ui/Input";
import { Button } from "@/presentation/components/ui/Button";
import { Client } from "@/domain/models";

const card =
  "bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm";

export default function ClientsView() {
  const {
    isAdding,
    newClient,
    clients,
    setIsAdding,
    setNewClient,
    handleSubmit,
  } = useClientState();
  const { remove } = useClient();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const filtered = clients.filter(
    (c: Client) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );
  const colors = [
    "gradient-blue",
    "gradient-emerald",
    "gradient-rose",
    "gradient-amber",
    "gradient-purple",
  ];
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Supprimer "${name}" ?`)) return;
    try {
      await remove(id);
      toast.success("Client supprimé");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="animate-fade-up flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Clients
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            {clients.length} client{clients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button icon={Plus} onClick={() => setIsAdding(true)}>
          Nouveau client
        </Button>
      </div>

      {isAdding && (
        <div className="animate-slide-down bg-white dark:bg-slate-800 rounded-2xl border border-blue-100 dark:border-blue-900/50 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/40">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 gradient-blue rounded-lg flex items-center justify-center">
                <Plus size={14} className="text-white" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                Nouveau client
              </h3>
            </div>
            <button
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nom / Raison sociale"
                placeholder="Société Exemple"
                icon={Building2}
                value={newClient.name}
                onChange={(e: any) =>
                  setNewClient({ ...newClient, name: e.target.value })
                }
                required
              />
              <Input
                label="Email"
                type="email"
                placeholder="contact@exemple.com"
                icon={Mail}
                value={newClient.email}
                onChange={(e: any) =>
                  setNewClient({ ...newClient, email: e.target.value })
                }
              />
              <Input
                label="Téléphone"
                placeholder="+261 34 00 000 00"
                icon={Phone}
                value={newClient.phone}
                onChange={(e: any) =>
                  setNewClient({ ...newClient, phone: e.target.value })
                }
                required
              />
              <Input
                label="Adresse"
                placeholder="Ville, Pays"
                icon={MapPin}
                value={newClient.address}
                onChange={(e: any) =>
                  setNewClient({ ...newClient, address: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="ghost"
                onClick={() => setIsAdding(false)}
                type="button"
              >
                Annuler
              </Button>
              <Button type="submit">Enregistrer</Button>
            </div>
          </form>
        </div>
      )}

      <div className="animate-fade-up" style={{ animationDelay: ".05s" }}>
        <Input
          placeholder="Rechercher un client..."
          icon={Search}
          value={search}
          onChange={(e: any) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div
          className={`animate-fade-up flex flex-col items-center justify-center py-16 text-slate-400 gap-3 ${card}`}
        >
          <Users size={40} className="opacity-30" />
          <p className="text-sm">
            {search ? "Aucun résultat" : "Aucun client"}
          </p>
          {!search && (
            <Button icon={Plus} size="sm" onClick={() => setIsAdding(true)}>
              Ajouter
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c: Client, i) => (
            <div
              key={c.id}
              style={{ animationDelay: `${i * 0.05}s` }}
              className={`animate-fade-up group ${card} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden`}
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div
                    className={`h-11 w-11 ${colors[i % colors.length]} rounded-xl flex items-center justify-center text-white font-black text-base shrink-0 shadow-sm`}
                  >
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                      {c.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Mail size={11} className="text-slate-400 shrink-0" />
                      <p className="text-slate-500 dark:text-slate-400 text-xs truncate">
                        {c.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Phone size={11} className="text-slate-400 shrink-0" />
                      <p className="text-slate-500 dark:text-slate-400 text-xs">
                        {c.phone}
                      </p>
                    </div>
                  </div>
                </div>
                {c.address && (
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-50 dark:border-slate-700">
                    <MapPin size={11} className="text-slate-400 shrink-0" />
                    <p className="text-xs text-slate-400 truncate">
                      {c.address}
                    </p>
                  </div>
                )}
              </div>
              <div className="border-t border-slate-50 dark:border-slate-700 px-4 py-2.5 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDelete(c.id, c.name)}
                  className="text-xs text-rose-500 hover:text-rose-700 font-medium transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
