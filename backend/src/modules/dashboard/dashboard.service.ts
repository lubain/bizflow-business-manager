import { Injectable } from '@nestjs/common';
import { InvoicesService } from '../invoices/invoices.service';
import { ExpensesService } from '../expenses/expenses.service';
import { ClientsService } from '../clients/clients.service';
import { ProductsService } from '../products/products.service';

export interface DashboardStats {
  revenue: {
    total: number;
    pending: number;
    monthly: { month: string; total: number }[];
  };
  expenses: {
    total: number;
    monthly: { month: string; total: number }[];
    byCategory: { category: string; total: number }[];
  };
  invoices: {
    byStatus: Record<string, number>;
  };
  clients: {
    total: number;
  };
  products: {
    total: number;
    lowStock: number;
  };
  profit: {
    net: number;
  };
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly expensesService: ExpensesService,
    private readonly clientsService: ClientsService,
    private readonly productsService: ProductsService,
  ) {}

  async getStats(): Promise<DashboardStats> {
    const [
      totalRevenue,
      pendingRevenue,
      monthlyRevenue,
      totalExpenses,
      monthlyExpenses,
      expensesByCategory,
      invoicesByStatus,
      totalClients,
      totalProducts,
      lowStockCount,
    ] = await Promise.all([
      this.invoicesService.getTotalRevenue(),
      this.invoicesService.getPendingRevenue(),
      this.invoicesService.getMonthlyRevenue(),
      this.expensesService.getTotalExpenses(),
      this.expensesService.getMonthlyExpenses(),
      this.expensesService.findByCategory(),
      this.invoicesService.countByStatus(),
      this.clientsService.count(),
      this.productsService.count(),
      this.productsService.countLowStock(),
    ]);

    return {
      revenue: {
        total: totalRevenue,
        pending: pendingRevenue,
        monthly: monthlyRevenue,
      },
      expenses: {
        total: totalExpenses,
        monthly: monthlyExpenses,
        byCategory: expensesByCategory,
      },
      invoices: {
        byStatus: invoicesByStatus,
      },
      clients: {
        total: totalClients,
      },
      products: {
        total: totalProducts,
        lowStock: lowStockCount,
      },
      profit: {
        net: totalRevenue - totalExpenses,
      },
    };
  }

  async getRevenueVsExpenses(): Promise<
    { month: string; revenue: number; expenses: number; profit: number }[]
  > {
    const [monthlyRevenue, monthlyExpenses] = await Promise.all([
      this.invoicesService.getMonthlyRevenue(),
      this.expensesService.getMonthlyExpenses(),
    ]);

    // Merge by month
    const monthMap = new Map<string, { revenue: number; expenses: number }>();

    monthlyRevenue.forEach(({ month, total }) => {
      monthMap.set(month, { revenue: Number(total), expenses: 0 });
    });

    monthlyExpenses.forEach(({ month, total }) => {
      const existing = monthMap.get(month) || { revenue: 0, expenses: 0 };
      monthMap.set(month, { ...existing, expenses: Number(total) });
    });

    return Array.from(monthMap.entries())
      .map(([month, { revenue, expenses }]) => ({
        month,
        revenue,
        expenses,
        profit: revenue - expenses,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
}
