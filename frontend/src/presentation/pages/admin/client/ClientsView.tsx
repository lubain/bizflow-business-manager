import { Users, Plus } from "lucide-react";
import { Card } from "@/presentation/components/ui/Card";
import { Button } from "@/presentation/components/ui/Button";
import { Input } from "@/presentation/components/ui/Input";
import { Client } from "@/domain/models";
import { useClientState } from "@/presentation/hooks/client/use-client-state";

const ClientsView = () => {
  const {
    isAdding,
    newClient,
    clients,
    setIsAdding,
    setNewClient,
    handleSubmit,
  } = useClientState();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          Clients
        </h2>
        <Button icon={Plus} onClick={() => setIsAdding(true)}>
          Nouveau Client
        </Button>
      </div>

      {isAdding && (
        <Card className="bg-white p-6 bg-blue-50 border-blue-100 animate-in slide-in-from-top-4">
          <h3 className="font-bold mb-4">Ajouter un client</h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <Input
              placeholder="Nom complet"
              value={newClient.name}
              onChange={(e) =>
                setNewClient({ ...newClient, name: e.target.value })
              }
              required
            />
            <Input
              placeholder="Email"
              type="email"
              value={newClient.email}
              onChange={(e) =>
                setNewClient({ ...newClient, email: e.target.value })
              }
            />
            <Input
              placeholder="Téléphone"
              value={newClient.phone}
              onChange={(e) =>
                setNewClient({ ...newClient, phone: e.target.value })
              }
              required
            />
            <Input
              placeholder="Adresse"
              value={newClient.address}
              onChange={(e) =>
                setNewClient({ ...newClient, address: e.target.value })
              }
            />
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
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
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((c: Client) => (
          <Card
            key={c.id}
            className="bg-white dark:bg-slate-800 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                  {c.name}
                </h3>
                <p className="text-slate-500 dark:text-white text-sm flex items-center gap-1 mt-1">
                  <Users size={14} /> {c.phone}
                </p>
                <p className="text-slate-500 dark:text-white text-sm mt-1">
                  {c.email}
                </p>
              </div>
              <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold">
                {c.name.charAt(0)}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400 dark:text-white">
              {c.address || "Aucune adresse"}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
export default ClientsView;
