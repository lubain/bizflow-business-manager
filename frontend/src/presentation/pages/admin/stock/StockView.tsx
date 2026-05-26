import { Plus, X, Package, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/presentation/components/ui/Button";
import { Input } from "@/presentation/components/ui/Input";
import { useProductState } from "@/presentation/hooks/product/use-product-state";
import ListDataGrid from "@/presentation/components/common/listDataGrid/ListDataGrid";

export default function StockView() {
  const {
    adjustmentData,
    isAdding,
    newItem,
    products,
    setIsAdding,
    setAdjustmentData,
    handleStockAdjustment,
    handleSubmit,
    setNewItem,
  } = useProductState();
  const lowCount = products.filter(
    (p) => Number(p.stock) <= Number(p.minStock),
  ).length;
  const outCount = products.filter((p) => Number(p.stock) === 0).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="animate-fade-up flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Gestion de Stock
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            {products.length} produit{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button icon={Plus} variant="success" onClick={() => setIsAdding(true)}>
          Ajouter un produit
        </Button>
      </div>

      <div
        className="grid grid-cols-3 gap-4 animate-fade-up"
        style={{ animationDelay: ".05s" }}
      >
        {[
          {
            label: "Total produits",
            value: products.length,
            text: "text-blue-700 dark:text-blue-300",
            bg: "bg-blue-50 dark:bg-blue-900/20",
            border: "border-blue-100 dark:border-blue-900/30",
          },
          {
            label: "Stock faible",
            value: lowCount,
            text: "text-amber-700 dark:text-amber-300",
            bg: "bg-amber-50 dark:bg-amber-900/20",
            border: "border-amber-100 dark:border-amber-900/30",
          },
          {
            label: "En rupture",
            value: outCount,
            text: "text-rose-700 dark:text-rose-300",
            bg: "bg-rose-50 dark:bg-rose-900/20",
            border: "border-rose-100 dark:border-rose-900/30",
          },
        ].map(({ label, value, text, bg, border }) => (
          <div
            key={label}
            className={`${bg} border ${border} rounded-2xl p-4 text-center`}
          >
            <p className={`text-2xl font-black ${text}`}>{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Stock adjustment modal */}
      {adjustmentData.product && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm animate-fade-up overflow-hidden border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Package
                    size={16}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white">
                  Ajuster le stock
                </h3>
              </div>
              <button
                onClick={() =>
                  setAdjustmentData({ ...adjustmentData, product: null })
                }
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="mb-5 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                  Produit
                </p>
                <p className="font-bold text-slate-900 dark:text-white">
                  {adjustmentData.product.name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Stock actuel :{" "}
                  <span className="font-bold text-slate-800 dark:text-white">
                    {adjustmentData.product.stock}
                  </span>
                </p>
              </div>
              <form onSubmit={handleStockAdjustment} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {(["add", "remove"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setAdjustmentData({ ...adjustmentData, type })
                      }
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                        adjustmentData.type === type
                          ? type === "add"
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                            : "border-rose-500 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300"
                          : "border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500"
                      }`}
                    >
                      {type === "add" ? (
                        <TrendingUp size={16} />
                      ) : (
                        <TrendingDown size={16} />
                      )}
                      {type === "add" ? "Entrée" : "Sortie"}
                    </button>
                  ))}
                </div>
                <Input
                  label="Quantité"
                  type="number"
                  min="1"
                  value={adjustmentData.quantity}
                  onChange={(e: any) =>
                    setAdjustmentData({
                      ...adjustmentData,
                      quantity: parseInt(e.target.value) || 0,
                    })
                  }
                  autoFocus
                />
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="ghost"
                    type="button"
                    className="flex-1"
                    onClick={() =>
                      setAdjustmentData({ ...adjustmentData, product: null })
                    }
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    variant={
                      adjustmentData.type === "add" ? "success" : "danger"
                    }
                  >
                    Valider
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="animate-slide-down bg-white dark:bg-slate-800 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-900/30">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 gradient-emerald rounded-lg flex items-center justify-center">
                <Plus size={14} className="text-white" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                Nouveau produit
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
                label="Nom du produit"
                placeholder="Ex: Laptop Dell"
                containerClassName="sm:col-span-2"
                value={newItem.name}
                onChange={(e: any) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                required
              />
              <Input
                label="Prix (€)"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newItem.price}
                onChange={(e: any) =>
                  setNewItem({
                    ...newItem,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
              <Input
                label="Stock initial"
                type="number"
                placeholder="0"
                value={newItem.stock}
                onChange={(e: any) =>
                  setNewItem({
                    ...newItem,
                    stock: parseInt(e.target.value) || 0,
                  })
                }
                required
              />
              <Input
                label="Alerte min."
                type="number"
                placeholder="5"
                value={newItem.minStock}
                onChange={(e: any) =>
                  setNewItem({
                    ...newItem,
                    minStock: parseInt(e.target.value) || 0,
                  })
                }
                required
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
              <Button type="submit" variant="success">
                Ajouter le produit
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="animate-fade-up" style={{ animationDelay: ".1s" }}>
        <ListDataGrid
          type="stock"
          data={products}
          onAdjust={(p) =>
            setAdjustmentData({ product: p, type: "add", quantity: 1 })
          }
        />
      </div>
    </div>
  );
}
