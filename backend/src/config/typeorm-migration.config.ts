/**
 * Configuration TypeORM dédiée aux migrations (CLI)
 * Usage:
 *   npm run migration:generate -- src/database/migrations/NomMigration
 *   npm run migration:run
 *   npm run migration:revert
 */
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Admin } from '../modules/auth/entities/admin.entity';
import { Client } from '../modules/clients/entities/client.entity';
import { Product } from '../modules/products/entities/product.entity';
import { Invoice } from '../modules/invoices/entities/invoice.entity';
import { InvoiceItem } from '../modules/invoices/entities/invoice-item.entity';
import { Expense } from '../modules/expenses/entities/expense.entity';

dotenv.config();

const dbUrl = process.env.DATABASE_URL;

export const AppDataSource = new DataSource(
  dbUrl
    ? {
        type: 'postgres',
        url: dbUrl,
        ssl: { rejectUnauthorized: false },
        entities: [Admin, Client, Product, Invoice, InvoiceItem, Expense],
        migrations: ['src/database/migrations/*.ts'],
        synchronize: false,
      }
    : {
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'gestion_entreprises',
        ssl: false,
        entities: [Admin, Client, Product, Invoice, InvoiceItem, Expense],
        migrations: ['src/database/migrations/*.ts'],
        synchronize: false,
      },
);
