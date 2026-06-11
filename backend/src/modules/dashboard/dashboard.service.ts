import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Invoice } from '../invoices/invoice.entity';
import { Expense } from '../expenses/expense.entity';
import { Client } from '../clients/client.entity';
import { Product } from '../products/product.entity';

// Helpers date sans dépendance externe
function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function subMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() - months);
  return d;
}

function formatMonth(date: Date): string {
  const months = [
    'jan',
    'fév',
    'mar',
    'avr',
    'mai',
    'jun',
    'jul',
    'aoû',
    'sep',
    'oct',
    'nov',
    'déc',
  ];
  return `${months[date.getMonth()]} ${String(date.getFullYear()).slice(2)}`;
}

function toDateStr(date: Date): string {
  return date.toISOString().split('T')[0];
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Invoice) private invoiceRepo: Repository<Invoice>,
    @InjectRepository(Expense) private expenseRepo: Repository<Expense>,
    @InjectRepository(Client) private clientRepo: Repository<Client>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  async getData(userId: string) {
    const now = new Date();
    const currentStart = startOfMonth(now);
    const currentEnd = endOfMonth(now);
    const previousStart = startOfMonth(subMonths(now, 1));
    const previousEnd = endOfMonth(subMonths(now, 1));

    const [kpis, monthlyRevenue, topClients, recentInvoices, lowStockProducts] =
      await Promise.all([
        this.getKPIs(
          userId,
          currentStart,
          currentEnd,
          previousStart,
          previousEnd,
        ),
        this.getMonthlyRevenue(userId),
        this.getTopClients(userId),
        this.getRecentInvoices(userId),
        this.getLowStockProducts(userId),
      ]);

    return {
      kpis,
      monthlyRevenue,
      topClients,
      recentInvoices,
      lowStockProducts,
    };
  }

  private async getKPIs(
    userId: string,
    currStart: Date,
    currEnd: Date,
    prevStart: Date,
    prevEnd: Date,
  ) {
    const calcChange = (curr: number, prev: number) =>
      prev === 0 ? 0 : Math.round(((curr - prev) / prev) * 1000) / 10;

    const [
      currRevInv,
      prevRevInv,
      currExp,
      prevExp,
      pendingInvoices,
      overdueInvoices,
    ] = await Promise.all([
      this.invoiceRepo.find({
        where: {
          userId,
          status: 'paid',
          paymentDate: Between(toDateStr(currStart), toDateStr(currEnd)) as any,
        },
      }),
      this.invoiceRepo.find({
        where: {
          userId,
          status: 'paid',
          paymentDate: Between(toDateStr(prevStart), toDateStr(prevEnd)) as any,
        },
      }),
      this.expenseRepo.find({
        where: {
          userId,
          date: Between(toDateStr(currStart), toDateStr(currEnd)) as any,
        },
      }),
      this.expenseRepo.find({
        where: {
          userId,
          date: Between(toDateStr(prevStart), toDateStr(prevEnd)) as any,
        },
      }),
      this.invoiceRepo.find({ where: { userId, status: 'sent' } }),
      this.invoiceRepo.find({ where: { userId, status: 'overdue' } }),
    ]);

    const currentRevenue = currRevInv.reduce(
      (s, i) => s + Number(i.totalTTC),
      0,
    );
    const previousRevenue = prevRevInv.reduce(
      (s, i) => s + Number(i.totalTTC),
      0,
    );
    const currentExpenses = currExp.reduce((s, e) => s + Number(e.amount), 0);
    const previousExpenses = prevExp.reduce((s, e) => s + Number(e.amount), 0);

    // Nouveaux clients ce mois
    const newClients = await this.clientRepo
      .createQueryBuilder('c')
      .where(
        'c.userId = :userId AND c.createdAt >= :start AND c.createdAt <= :end',
        {
          userId,
          start: currStart,
          end: currEnd,
        },
      )
      .getCount();

    // Stock bas
    const allProducts = await this.productRepo.find({
      where: { userId, isActive: true, isService: false },
    });
    const lowStockCount = allProducts.filter(
      (p) => Number(p.stockQuantity) <= Number(p.minStock),
    ).length;

    return {
      revenue: {
        current: currentRevenue,
        previous: previousRevenue,
        change: calcChange(currentRevenue, previousRevenue),
      },
      expenses: {
        current: currentExpenses,
        previous: previousExpenses,
        change: calcChange(currentExpenses, previousExpenses),
      },
      profit: {
        current: currentRevenue - currentExpenses,
        previous: previousRevenue - previousExpenses,
        change: calcChange(
          currentRevenue - currentExpenses,
          previousRevenue - previousExpenses,
        ),
      },
      invoicesPending: pendingInvoices.length,
      invoicesPendingAmount: pendingInvoices.reduce(
        (s, i) => s + Number(i.totalTTC),
        0,
      ),
      invoicesOverdue: overdueInvoices.length,
      invoicesOverdueAmount: overdueInvoices.reduce(
        (s, i) => s + Number(i.totalTTC),
        0,
      ),
      newClients,
      lowStockProducts: lowStockCount,
    };
  }

  private async getMonthlyRevenue(userId: string) {
    const months = Array.from({ length: 12 }, (_, i) =>
      subMonths(new Date(), 11 - i),
    );

    return Promise.all(
      months.map(async (month) => {
        const start = toDateStr(startOfMonth(month));
        const end = toDateStr(endOfMonth(month));

        const [invoices, expenses] = await Promise.all([
          this.invoiceRepo.find({
            where: {
              userId,
              status: 'paid',
              paymentDate: Between(start, end) as any,
            },
          }),
          this.expenseRepo.find({
            where: { userId, date: Between(start, end) as any },
          }),
        ]);

        const revenue = invoices.reduce((s, i) => s + Number(i.totalTTC), 0);
        const expense = expenses.reduce((s, e) => s + Number(e.amount), 0);

        return {
          month: formatMonth(month),
          revenue: Math.round(revenue * 100) / 100,
          expenses: Math.round(expense * 100) / 100,
          profit: Math.round((revenue - expense) * 100) / 100,
        };
      }),
    );
  }

  private async getTopClients(userId: string) {
    const invoices = await this.invoiceRepo.find({
      where: { userId, status: 'paid' },
      relations: ['client'],
    });

    const clientTotals = new Map<string, { client: any; total: number }>();
    for (const inv of invoices) {
      const existing = clientTotals.get(inv.clientId);
      if (existing) {
        existing.total += Number(inv.totalTTC);
      } else {
        clientTotals.set(inv.clientId, {
          client: inv.client,
          total: Number(inv.totalTTC),
        });
      }
    }

    return [...clientTotals.values()]
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map(({ client, total }) => ({
        client: {
          id: client.id,
          firstName: client.firstName,
          lastName: client.lastName,
          companyName: client.companyName,
        },
        total: Math.round(total * 100) / 100,
      }));
  }

  private async getRecentInvoices(userId: string) {
    return this.invoiceRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 8,
      relations: ['client'],
    });
  }

  private async getLowStockProducts(userId: string) {
    const products = await this.productRepo.find({
      where: { userId, isActive: true, isService: false },
    });
    return products
      .filter((p) => Number(p.stockQuantity) <= Number(p.minStock))
      .slice(0, 5);
  }
}
