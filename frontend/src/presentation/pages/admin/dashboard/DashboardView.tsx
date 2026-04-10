import { AlertCircle } from "lucide-react";
import { Card } from "@/presentation/components/ui/Card";
import { Invoice, Product } from "@/domain/models";
import { useDashboardView } from "@/presentation/hooks/dashboard/use-dashboard-view";
import { StatusBadge } from "@/presentation/components/common/listDataGrid/ListDataGrid";

const DashboardView = () => {
  const { totalExpenses, totalSales, lowStockItems, clients, invoices } =
    useDashboardView();

  const toNumber = (value: unknown) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
        Tableau de Bord
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 bg-white p-4">
          <div className="text-sm font-medium text-red-500 dark:text-white">
            Chiffre d'Affaires
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-white">
            {totalSales.toFixed(2)} EUR
          </div>
        </Card>
        <Card className="border-l-4 border-l-red-500 bg-white p-4">
          <div className="text-sm font-medium text-slate-500 dark:text-white">
            Depenses
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-white">
            {totalExpenses.toFixed(2)} EUR
          </div>
        </Card>
        <Card className="border-l-4 border-l-green-500 bg-white p-4">
          <div className="text-sm font-medium text-slate-500 dark:text-white">
            Benefice Net
          </div>
          <div
            className={`text-2xl font-bold ${
              totalSales - totalExpenses >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {(totalSales - totalExpenses).toFixed(2)} EUR
          </div>
        </Card>
        <Card className="border-l-4 border-l-orange-500 bg-white p-4">
          <div className="text-sm font-medium text-slate-500 dark:text-white">
            Clients
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-white">
            {clients.length}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden bg-white p-0">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <h3 className="flex items-center gap-2 font-semibold">
              <AlertCircle size={18} className="text-orange-500" />
              <span className="text-slate-700 dark:text-white">Alertes Stock</span>
            </h3>
          </div>
          <div className="p-0">
            {lowStockItems.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-white">
                Tout va bien !
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="text-slate-500 dark:text-white">
                  <tr>
                    <th className="p-3">Produit</th>
                    <th className="p-3">Stock Actuel</th>
                    <th className="p-3">Min</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((p: Product) => (
                    <tr key={p.id} className="border-t border-slate-100">
                      <td className="p-3 font-medium text-slate-700 dark:text-white">
                        {p.name}
                      </td>
                      <td className="p-3 font-bold text-red-600">{p.stock}</td>
                      <td className="p-3 text-slate-500 dark:text-white">
                        {p.minStock}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>

        <Card className="overflow-hidden bg-white p-0">
          <div className="border-b border-slate-100 p-4">
            <h3 className="font-semibold text-slate-700 dark:text-white">
              Dernieres Factures
            </h3>
          </div>
          <div className="p-0">
            {invoices.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-white">
                Aucune facture emise.
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="text-slate-500 dark:text-white">
                  <tr>
                    <th className="p-3">Client</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3 text-right">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices
                    .slice(-5)
                    .reverse()
                    .map((inv: Invoice) => (
                      <tr
                        key={inv.id}
                        className="border-t border-slate-100 hover:bg-slate-50"
                      >
                        <td className="p-3 font-medium text-slate-700 dark:text-white">
                          {inv.clientName}
                        </td>
                        <td className="p-3 text-slate-500 dark:text-white">
                          <StatusBadge status={inv.status} />
                        </td>
                        <td className="p-3 text-right font-bold text-slate-700 dark:text-white">
                          {toNumber(inv.total).toFixed(2)} EUR
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardView;
