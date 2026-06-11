import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Invoice } from '../invoices/invoice.entity';
import { Expense } from '../expenses/expense.entity';
import { Client } from '../clients/client.entity';
import { Product } from '../products/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, Expense, Client, Product])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
