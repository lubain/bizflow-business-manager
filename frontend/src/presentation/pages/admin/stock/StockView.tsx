import { Plus, X } from "lucide-react";
import { Card } from "@/presentation/components/ui/Card";
import { Button } from "@/presentation/components/ui/Button";
import { Input } from "@/presentation/components/ui/Input";
import { useProductState } from "@/presentation/hooks/product/use-product-state";
import ListDataGrid from "@/presentation/components/common/listDataGrid/ListDataGrid";

const StockView = () => {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          Gestion de Stock
        </h2>
        <Button icon={Plus} onClick={() => setIsAdding(true)}>
          Ajouter Produit
        </Button>
      </div>

      {adjustmentData.product && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-white w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Ajuster le stock</h3>
              <button
                onClick={() =>
                  setAdjustmentData({ ...adjustmentData, product: null })
                }
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mb-4 p-3 bg-slate-50 rounded text-sm text-slate-600">
              Produit :{" "}
              <span className="font-bold text-slate-800">
                {adjustmentData.product.name}
              </span>
              <br />
              Stock actuel :{" "}
              <span className="font-bold">{adjustmentData.product.stock}</span>
            </div>
            <form onSubmit={handleStockAdjustment} className="space-y-4">
              <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() =>
                    setAdjustmentData({ ...adjustmentData, type: "add" })
                  }
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    adjustmentData.type === "add"
                      ? "bg-white text-green-700 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  + Entrée
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setAdjustmentData({ ...adjustmentData, type: "remove" })
                  }
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    adjustmentData.type === "remove"
                      ? "bg-white text-red-700 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  - Sortie
                </button>
              </div>
              <Input
                label="Quantité"
                type="number"
                min="1"
                value={adjustmentData.quantity}
                onChange={(e) =>
                  setAdjustmentData({
                    ...adjustmentData,
                    quantity: parseInt(e.target.value) || 0,
                  })
                }
                autoFocus
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() =>
                    setAdjustmentData({ ...adjustmentData, product: null })
                  }
                >
                  Annuler
                </Button>
                <Button type="submit">Valider</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {isAdding && (
        <Card className="bg-white p-6 border-blue-100">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div className="md:col-span-4 font-bold mb-2">
              Nouveau Produit / Service
            </div>
            <Input
              label="Nom"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              required
              className="md:col-span-2"
            />
            <Input
              label="Prix (€)"
              type="number"
              step="0.01"
              value={newItem.price}
              onChange={(e) =>
                setNewItem({
                  ...newItem,
                  price: parseFloat(e.target.value) || 0,
                })
              }
              required
            />
            <Input
              label="Stock Initial"
              type="number"
              value={newItem.stock}
              onChange={(e) =>
                setNewItem({ ...newItem, stock: parseInt(e.target.value) || 0 })
              }
              required
            />
            <Input
              label="Alerte Min."
              type="number"
              value={newItem.minStock}
              onChange={(e) =>
                setNewItem({
                  ...newItem,
                  minStock: parseInt(e.target.value) || 0,
                })
              }
              required
            />
            <div className="md:col-span-4 flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setIsAdding(false)}
                type="button"
              >
                Annuler
              </Button>
              <Button type="submit">Ajouter</Button>
            </div>
          </form>
        </Card>
      )}

      <ListDataGrid
        type="stock"
        data={products}
        onAdjust={(p) =>
          setAdjustmentData({ product: p, type: "add", quantity: 1 })
        }
      />
    </div>
  );
};

export default StockView;
