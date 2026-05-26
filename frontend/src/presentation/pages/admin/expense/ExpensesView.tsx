import { Plus, X, TrendingDown } from "lucide-react";
import { Button } from "@/presentation/components/ui/Button";
import { Input } from "@/presentation/components/ui/Input";
import { Select } from "@/presentation/components/ui/Select";
import { useExpenseState } from "@/presentation/hooks/expense/use-expense-state";
import ListDataGrid from "@/presentation/components/common/listDataGrid/ListDataGrid";

const CATEGORIES = [
  "Loyer",
  "Charges",
  "Fournitures",
  "Salaires",
  "Transport",
  "Informatique",
  "Impôts",
  "Autre",
];

export default function ExpensesView() {
  const { isAdding, newExp, expenses, setIsAdding, handleSubmit, setNewExp } =
    useExpenseState();
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="animate-fade-up flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Dépenses
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Total :{" "}
            <span className="font-bold text-rose-600 dark:text-rose-400">
              {total.toLocaleString("fr-FR")} €
            </span>
          </p>
        </div>
        <Button icon={Plus} variant="danger" onClick={() => setIsAdding(true)}>
          Nouvelle dépense
        </Button>
      </div>

      {isAdding && (
        <div className="animate-slide-down bg-white dark:bg-slate-800 rounded-2xl border border-rose-100 dark:border-rose-900/40 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 bg-rose-50 dark:bg-rose-900/20 border-b border-rose-100 dark:border-rose-900/30">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 gradient-rose rounded-lg flex items-center justify-center">
                <TrendingDown size={14} className="text-white" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                Nouvelle dépense
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                label="Description"
                placeholder="Ex: Loyer janvier"
                containerClassName="sm:col-span-2"
                value={newExp.description}
                onChange={(e: any) =>
                  setNewExp({ ...newExp, description: e.target.value })
                }
                required
              />
              <Input
                label="Montant (€)"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newExp.amount}
                onChange={(e: any) =>
                  setNewExp({
                    ...newExp,
                    amount: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
              <Input
                label="Date"
                type="date"
                value={newExp.date}
                onChange={(e: any) =>
                  setNewExp({ ...newExp, date: e.target.value })
                }
                required
              />
              <Select
                label="Catégorie"
                value={newExp.category}
                onChange={(v) => setNewExp({ ...newExp, category: v })}
                options={CATEGORIES.map((c) => ({ value: c, label: c }))}
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setIsAdding(false)}
              >
                Annuler
              </Button>
              <Button type="submit" variant="danger">
                Enregistrer
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="animate-fade-up" style={{ animationDelay: ".1s" }}>
        <ListDataGrid type="expense" data={[...expenses].reverse()} />
      </div>
    </div>
  );
}
