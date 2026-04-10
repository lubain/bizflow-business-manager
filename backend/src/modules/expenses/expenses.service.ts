import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
  ) {}

  async findAll(): Promise<Expense[]> {
    return this.expenseRepository.find({ order: { date: 'DESC' } });
  }

  async findOne(id: number): Promise<Expense> {
    const expense = await this.expenseRepository.findOne({ where: { id } });
    if (!expense) {
      throw new NotFoundException(`Dépense #${id} introuvable`);
    }
    return expense;
  }

  async findByCategory(): Promise<{ category: string; total: number }[]> {
    return this.expenseRepository
      .createQueryBuilder('expense')
      .select('expense.category', 'category')
      .addSelect('SUM(expense.amount)', 'total')
      .groupBy('expense.category')
      .orderBy('total', 'DESC')
      .getRawMany();
  }

  async create(createExpenseDto: CreateExpenseDto): Promise<Expense> {
    const expense = this.expenseRepository.create(createExpenseDto);
    return this.expenseRepository.save(expense);
  }

  async update(
    id: number,
    updateExpenseDto: UpdateExpenseDto,
  ): Promise<Expense> {
    const expense = await this.findOne(id);
    Object.assign(expense, updateExpenseDto);
    return this.expenseRepository.save(expense);
  }

  async remove(id: number): Promise<void> {
    const expense = await this.findOne(id);
    await this.expenseRepository.remove(expense);
  }

  async getTotalExpenses(): Promise<number> {
    const result = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total')
      .getRawOne();
    return parseFloat(result?.total || '0');
  }

  async getMonthlyExpenses(): Promise<{ month: string; total: number }[]> {
    return this.expenseRepository
      .createQueryBuilder('expense')
      .select("TO_CHAR(CAST(expense.date AS DATE), 'YYYY-MM')", 'month')
      .addSelect('SUM(expense.amount)', 'total')
      .where("CAST(expense.date AS DATE) >= NOW() - INTERVAL '12 months'")
      .groupBy("TO_CHAR(CAST(expense.date AS DATE), 'YYYY-MM')")
      .orderBy('month', 'ASC')
      .getRawMany();
  }
}
