import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense, ExpenseCategory, ExpenseStatus } from './expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseQueryDto } from './dto/expense-query.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense) private expenseRepo: Repository<Expense>,
  ) {}

  async create(dto: CreateExpenseDto, userId: string): Promise<Expense> {
    const vatAmount = dto.vatAmount ?? (dto.amount * (dto.vatRate ?? 20)) / 100;

    // Cast explicite pour satisfaire TypeORM DeepPartial
    const expense = this.expenseRepo.create({
      title: dto.title,
      category: dto.category as ExpenseCategory,
      amount: dto.amount,
      vatAmount,
      vatRate: dto.vatRate ?? 20,
      date: dto.date,
      supplier: dto.supplier ?? null,
      notes: dto.notes ?? null,
      status: 'pending' as ExpenseStatus,
      userId,
    });

    return this.expenseRepo.save(expense);
  }

  async findAll(query: ExpenseQueryDto, userId: string) {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      status,
      dateFrom,
      dateTo,
    } = query;

    const qb = this.expenseRepo
      .createQueryBuilder('e')
      .where('e.userId = :userId', { userId });

    if (search)
      qb.andWhere('(e.title ILIKE :s OR e.supplier ILIKE :s)', {
        s: `%${search}%`,
      });
    if (category) qb.andWhere('e.category = :category', { category });
    if (status) qb.andWhere('e.status = :status', { status });
    if (dateFrom) qb.andWhere('e.date >= :dateFrom', { dateFrom });
    if (dateTo) qb.andWhere('e.date <= :dateTo', { dateTo });

    const [data, total] = await qb
      .orderBy('e.date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, userId: string): Promise<Expense> {
    const e = await this.expenseRepo.findOne({ where: { id, userId } });
    if (!e) throw new NotFoundException('Dépense introuvable');
    return e;
  }

  async update(
    id: string,
    dto: UpdateExpenseDto,
    userId: string,
  ): Promise<Expense> {
    const expense = await this.findOne(id, userId);

    // Merge manuellement pour garder les types stricts
    if (dto.title !== undefined) expense.title = dto.title;
    if (dto.category !== undefined)
      expense.category = dto.category as ExpenseCategory;
    if (dto.amount !== undefined) expense.amount = dto.amount;
    if (dto.vatRate !== undefined) expense.vatRate = dto.vatRate;
    if (dto.vatAmount !== undefined) expense.vatAmount = dto.vatAmount;
    if (dto.date !== undefined) expense.date = dto.date;
    if (dto.supplier !== undefined) expense.supplier = dto.supplier ?? null;
    if (dto.notes !== undefined) expense.notes = dto.notes ?? null;

    return this.expenseRepo.save(expense);
  }

  async updateStatus(
    id: string,
    status: 'approved' | 'rejected',
    userId: string,
  ): Promise<Expense> {
    const expense = await this.findOne(id, userId);
    expense.status = status as ExpenseStatus;
    return this.expenseRepo.save(expense);
  }

  async remove(id: string, userId: string): Promise<void> {
    const expense = await this.findOne(id, userId);
    await this.expenseRepo.remove(expense);
  }

  async getReport(userId: string, year: number) {
    const expenses = await this.expenseRepo.find({ where: { userId } });

    const byCategory = expenses.reduce(
      (acc, e) => {
        if (!acc[e.category]) acc[e.category] = 0;
        acc[e.category] += Number(e.amount);
        return acc;
      },
      {} as Record<string, number>,
    );

    const byMonth = expenses.reduce(
      (acc, e) => {
        const month = e.date.slice(0, 7);
        if (!acc[month]) acc[month] = 0;
        acc[month] += Number(e.amount);
        return acc;
      },
      {} as Record<string, number>,
    );

    const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const totalVAT = expenses.reduce((s, e) => s + Number(e.vatAmount), 0);

    return {
      total: Math.round(total * 100) / 100,
      totalVAT: Math.round(totalVAT * 100) / 100,
      byCategory,
      byMonth,
    };
  }
}
