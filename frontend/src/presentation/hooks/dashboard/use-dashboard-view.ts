import { useEffect } from "react";
import { useExpense } from "../expense/use-expense";
import { useProduct } from "../product/use-product";
import { useClient } from "../client/use-client";
import { useInvoice } from "../invoice/use-invoice";
import { Expense, Invoice, Product } from "@/domain/models";

export const useDashboardView = () => {
  const { invoices, getAll: getAllInvoices } = useInvoice();
  const { expenses, getAll: getAllExpenses } = useExpense();
  const { products, getAll: getAllProducts } = useProduct();
  const { clients, getAll: getAllClients } = useClient();

  const totalSales = invoices
    .filter((inv: Invoice) => inv.status === "payée")
    .reduce((acc: number, inv: Invoice) => acc + Number(inv.total), 0);

  const totalExpenses = expenses.reduce(
    (acc: number, exp: Expense) => acc + Number(exp.amount),
    0
  );

  const lowStockItems = products.filter(
    (p: Product) => Number(p.stock) <= Number(p.minStock)
  );

  useEffect(() => {
    getAllExpenses();
    getAllClients();
    getAllProducts();
    getAllInvoices();
  }, []);

  return { totalExpenses, totalSales, lowStockItems, clients, invoices };
};
