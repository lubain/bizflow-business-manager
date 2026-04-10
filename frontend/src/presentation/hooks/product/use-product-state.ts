import { useEffect, useState } from "react";
import { useProduct } from "./use-product";
import { useToast } from "@/presentation/hooks/use-toast";
import { Product } from "@/domain/models";

export const useProductState = () => {
  const { products, getAll, create: addProduct, updateStock } = useProduct();
  const toast = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    price: 0,
    stock: 0,
    minStock: 5,
  });
  const [adjustmentData, setAdjustmentData] = useState<{
    product: Product | null;
    type: "add" | "remove";
    quantity: number;
  }>({ product: null, type: "add", quantity: 1 });

  useEffect(() => {
    getAll();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addProduct(newItem);
      toast.success("Produit ajouté avec succès");
      setIsAdding(false);
      setNewItem({ name: "", price: 0, stock: 0, minStock: 5 });
    } catch (err) {
      toast.error(err.message || "Erreur lors de la création du produit");
    }
  };

  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustmentData.product) return;
    const { product, type, quantity } = adjustmentData;
    const qty = parseInt(String(quantity)) || 0;
    if (qty <= 0) return;
    const newStock =
      type === "add" ? product.stock + qty : Math.max(0, product.stock - qty);
    try {
      await updateStock([{ id: product.id, newStock }]);
      toast.success("Stock mis à jour");
      setAdjustmentData({ product: null, type: "add", quantity: 1 });
    } catch (err) {
      toast.error(err.message || "Erreur lors de la mise à jour du stock");
    }
  };

  return {
    adjustmentData,
    isAdding,
    newItem,
    products,
    setIsAdding,
    setAdjustmentData,
    handleStockAdjustment,
    handleSubmit,
    setNewItem,
  };
};
