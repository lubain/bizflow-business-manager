import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

// Entities
import { Admin } from './modules/auth/entities/admin.entity';
import { Client } from './modules/clients/entities/client.entity';
import { Product } from './modules/products/entities/product.entity';
import { Invoice } from './modules/invoices/entities/invoice.entity';
import { InvoiceItem } from './modules/invoices/entities/invoice-item.entity';
import { Expense } from './modules/expenses/entities/expense.entity';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { ClientsModule } from './modules/clients/clients.module';
import { ProductsModule } from './modules/products/products.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { HealthModule } from './modules/health/health.module';

const ENTITIES = [Admin, Client, Product, Invoice, InvoiceItem, Expense];

@Module({
  imports: [
    // ── Config ──────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
      envFilePath: '.env',
    }),

    // ── Rate limiting (100 req / 60s par IP) ────────────
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

    // ── Base de données ──────────────────────────────────
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => {
        const isProd = process.env.NODE_ENV === 'production';
        const dbUrl = cfg.get<string>('database.url');

        // Production (Supabase) : connexion via URL
        if (isProd && dbUrl) {
          return {
            type: 'postgres',
            url: dbUrl,
            ssl: { rejectUnauthorized: false },
            entities: ENTITIES,
            synchronize: false, // migrations en prod
            logging: false,
          };
        }

        // Développement local : fallback host/port ou URL
        return {
          type: 'postgres',
          ...(dbUrl
            ? { url: dbUrl }
            : {
                host: cfg.get<string>('database.host'),
                port: cfg.get<number>('database.port'),
                username: cfg.get<string>('database.username'),
                password: cfg.get<string>('database.password'),
                database: cfg.get<string>('database.name'),
              }),
          ssl: false,
          entities: ENTITIES,
          synchronize: true, // auto-sync en dev uniquement
          logging: true,
        };
      },
      inject: [ConfigService],
    }),

    // ── Feature modules ──────────────────────────────────
    AuthModule,
    ClientsModule,
    ProductsModule,
    InvoicesModule,
    ExpensesModule,
    DashboardModule,
    HealthModule,
  ],
})
export class AppModule {}
