import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../modules/users/entities/user.entity';
import { Client } from '../modules/clients/entities/client.entity';
import { Product } from '../modules/products/entities/product.entity';
import { Expense } from '../modules/expenses/entities/expense.entity';
import {
  Invoice,
  InvoiceStatus,
} from '../modules/invoices/entities/invoice.entity';
import { InvoiceItem } from '../modules/invoices/entities/invoice-item.entity';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
  const clientRepo = app.get<Repository<Client>>(getRepositoryToken(Client));
  const productRepo = app.get<Repository<Product>>(getRepositoryToken(Product));
  const expenseRepo = app.get<Repository<Expense>>(getRepositoryToken(Expense));
  const invoiceRepo = app.get<Repository<Invoice>>(getRepositoryToken(Invoice));
  const itemRepo = app.get<Repository<InvoiceItem>>(
    getRepositoryToken(InvoiceItem),
  );

  console.log('🌱 Initialisation des données de démonstration...\n');

  // ── Utilisateur admin ──────────────────────────────────
  const existingUser = await userRepo.findOne({
    where: { email: 'admin@example.com' },
  });
  if (!existingUser) {
    const admin = userRepo.create({
      nom: 'Admin',
      prenom: 'Système',
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123', 10),
      role: UserRole.ADMIN,
    });
    await userRepo.save(admin);
    console.log('✅ Utilisateur admin créé  →  admin@example.com / admin123');
  } else {
    console.log('ℹ️  Utilisateur admin déjà existant');
  }

  // ── Clients ────────────────────────────────────────────
  const clientsData = [
    {
      name: 'Société Ravinala',
      email: 'contact@ravinala.mg',
      phone: '+261 34 11 111 11',
      address: 'Analakely, Antananarivo',
    },
    {
      name: 'Tech Solutions MG',
      email: 'info@techsolutions.mg',
      phone: '+261 33 22 222 22',
      address: 'Andraharo, Antananarivo',
    },
    {
      name: 'Madagascar Import',
      email: 'commercial@madimport.mg',
      phone: '+261 20 22 333 33',
      address: 'Tamatave, Madagascar',
    },
  ];
  const clients: Client[] = [];
  for (const data of clientsData) {
    const existing = await clientRepo.findOne({ where: { email: data.email } });
    if (!existing) {
      const c = await clientRepo.save(clientRepo.create(data));
      clients.push(c);
    } else {
      clients.push(existing);
    }
  }
  console.log(`✅ ${clients.length} clients chargés`);

  // ── Produits ───────────────────────────────────────────
  const productsData = [
    {
      name: 'Ordinateur portable Dell',
      price: 1_200_000,
      stock: 15,
      minStock: 3,
    },
    { name: 'Écran 24 pouces', price: 450_000, stock: 8, minStock: 2 },
    { name: 'Clavier sans fil', price: 85_000, stock: 2, minStock: 5 },
    { name: 'Souris ergonomique', price: 60_000, stock: 0, minStock: 5 },
    { name: 'Switch réseau 8 ports', price: 320_000, stock: 4, minStock: 2 },
    { name: 'Imprimante laser', price: 780_000, stock: 6, minStock: 2 },
  ];
  const products: Product[] = [];
  for (const data of productsData) {
    const existing = await productRepo.findOne({ where: { name: data.name } });
    if (!existing) {
      const p = await productRepo.save(productRepo.create(data));
      products.push(p);
    } else {
      products.push(existing);
    }
  }
  console.log(`✅ ${products.length} produits chargés`);

  // ── Dépenses ───────────────────────────────────────────
  const expensesData = [
    {
      description: 'Loyer bureau janvier',
      amount: 500_000,
      date: '2024-01-05',
      category: 'Loyer',
    },
    {
      description: 'Facture électricité',
      amount: 85_000,
      date: '2024-01-10',
      category: 'Charges',
    },
    {
      description: 'Achat fournitures bureau',
      amount: 120_000,
      date: '2024-01-15',
      category: 'Fournitures',
    },
    {
      description: 'Loyer bureau février',
      amount: 500_000,
      date: '2024-02-05',
      category: 'Loyer',
    },
    {
      description: 'Abonnement internet',
      amount: 45_000,
      date: '2024-02-10',
      category: 'Charges',
    },
    {
      description: 'Déplacement client Tamatave',
      amount: 180_000,
      date: '2024-02-20',
      category: 'Transport',
    },
    {
      description: 'Loyer bureau mars',
      amount: 500_000,
      date: '2024-03-05',
      category: 'Loyer',
    },
    {
      description: 'Maintenance informatique',
      amount: 250_000,
      date: '2024-03-12',
      category: 'Informatique',
    },
  ];
  let expenseCount = 0;
  for (const data of expensesData) {
    const existing = await expenseRepo.findOne({
      where: { description: data.description, date: data.date },
    });
    if (!existing) {
      await expenseRepo.save(expenseRepo.create(data));
      expenseCount++;
    }
  }
  console.log(`✅ ${expenseCount} dépenses chargées`);

  // ── Factures ───────────────────────────────────────────
  const invoiceCount = await invoiceRepo.count();
  if (invoiceCount === 0 && clients.length > 0 && products.length > 0) {
    const inv1 = invoiceRepo.create({
      clientId: clients[0].id,
      clientName: clients[0].name,
      issueDate: '2024-01-20',
      dueDate: '2024-02-20',
      subtotal: 1_200_000,
      taxRate: 20,
      taxAmount: 240_000,
      total: 1_440_000,
      status: InvoiceStatus.PAID,
    });
    inv1.items = [
      itemRepo.create({
        productId: products[0].id,
        productName: products[0].name,
        quantity: 1,
        unitPrice: 1_200_000,
        total: 1_200_000,
      }),
    ];
    await invoiceRepo.save(inv1);

    const inv2 = invoiceRepo.create({
      clientId: clients[1].id,
      clientName: clients[1].name,
      issueDate: '2024-02-15',
      dueDate: '2024-03-15',
      subtotal: 535_000,
      taxRate: 20,
      taxAmount: 107_000,
      total: 642_000,
      status: InvoiceStatus.PENDING,
    });
    inv2.items = [
      itemRepo.create({
        productId: products[1].id,
        productName: products[1].name,
        quantity: 1,
        unitPrice: 450_000,
        total: 450_000,
      }),
      itemRepo.create({
        productId: products[2].id,
        productName: products[2].name,
        quantity: 1,
        unitPrice: 85_000,
        total: 85_000,
      }),
    ];
    await invoiceRepo.save(inv2);

    const inv3 = invoiceRepo.create({
      clientId: clients[2].id,
      clientName: clients[2].name,
      issueDate: '2024-01-10',
      dueDate: '2024-01-25',
      subtotal: 780_000,
      taxRate: 20,
      taxAmount: 156_000,
      total: 936_000,
      status: InvoiceStatus.LATE,
    });
    inv3.items = [
      itemRepo.create({
        productId: products[5].id,
        productName: products[5].name,
        quantity: 1,
        unitPrice: 780_000,
        total: 780_000,
      }),
    ];
    await invoiceRepo.save(inv3);

    console.log('✅ 3 factures de démonstration créées');
  } else {
    console.log('ℹ️  Factures déjà existantes, seed ignoré');
  }

  console.log('\n✨ Seed terminé avec succès !');
  await app.close();
}

seed().catch((err) => {
  console.error('❌ Erreur durant le seed:', err);
  process.exit(1);
});
