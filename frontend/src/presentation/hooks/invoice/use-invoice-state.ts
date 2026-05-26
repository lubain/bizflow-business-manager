import { useEffect, useState } from "react";
import { useInvoice } from "./use-invoice";
import { useProduct } from "../product/use-product";
import { useClient } from "../client/use-client";
import { useToast } from "@/presentation/hooks/use-toast";
import { Client, InvoiceItem, Product } from "@/domain/models";

export const useInvoiceState = () => {
  const { products, updateStock, getAll: getAllProducts } = useProduct();
  const { clients, getAll: getAllClients } = useClient();
  const { invoices, create: addInvoice, getAll } = useInvoice();
  const toast = useToast();
  const [view, setView] = useState<"list" | "create">("list");
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [cart, setCart] = useState<InvoiceItem[]>([]);
  const [stockUpdates, setStockUpdates] = useState<
    { id: number; newStock: number }[]
  >([]);
  const [currentProduct, setCurrentProduct] = useState<number | null>(null);
  const [qty, setQty] = useState(1);
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [enableTax, setEnableTax] = useState(true);
  const [taxRate, setTaxRate] = useState(20);

  useEffect(() => {
    getAll();
    getAllProducts();
    getAllClients();
  }, []);

  const addToCart = () => {
    const product = products.find((p: Product) => p.id === currentProduct);
    if (!product) return;
    const newStock = Math.max(0, Number(product.stock) - qty);
    setStockUpdates((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      return existing
        ? prev.map((p) => (p.id === product.id ? { ...p, newStock } : p))
        : [...prev, { id: product.id, newStock }];
    });
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id
            ? {
                ...i,
                quantity: i.quantity + qty,
                total: (i.quantity + qty) * i.unitPrice,
              }
            : i,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          quantity: qty,
          unitPrice: Number(product.price),
          total: qty * Number(product.price),
        },
      ];
    });
    setQty(1);
    setCurrentProduct(null);
  };

  const removeFromCart = (pId: number) => {
    setCart((prev) => prev.filter((i) => i.productId !== pId));
    setStockUpdates((prev) => prev.filter((p) => p.id !== pId));
  };

  const handleSaveInvoice = async () => {
    if (!selectedClient || cart.length === 0) return;
    const client = clients.find((c: Client) => c.id === selectedClient);
    const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
    const finalTaxRate = enableTax ? taxRate : 0;
    const taxAmount = subtotal * (finalTaxRate / 100);
    const total = subtotal + taxAmount;
    try {
      await addInvoice({
        clientId: selectedClient,
        clientName: client?.name || "Inconnu",
        issueDate,
        dueDate,
        subtotal,
        taxRate: finalTaxRate,
        taxAmount,
        total,
        status: "en_attente",
        items: cart,
      } as any);
      await updateStock(stockUpdates);
      toast.success("Facture créée avec succès");
      setView("list");
      setCart([]);
      setStockUpdates([]);
      setSelectedClient(null);
    } catch (err) {
      toast.error(err.message || "Erreur lors de la création de la facture");
    }
  };

  return {
    view,
    cart,
    selectedClient,
    clients,
    currentProduct,
    products,
    qty,
    invoices,
    enableTax,
    taxRate,
    issueDate,
    dueDate,
    setView,
    setTaxRate,
    setEnableTax,
    setSelectedClient,
    setCurrentProduct,
    setQty,
    addToCart,
    removeFromCart,
    handleSaveInvoice,
    setIssueDate,
    setDueDate,
  };
};
