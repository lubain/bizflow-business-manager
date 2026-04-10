import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1700000000000 implements MigrationInterface {
  name = 'InitSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── admins ─────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "admins" (
        "id"         SERIAL PRIMARY KEY,
        "email"      VARCHAR NOT NULL UNIQUE,
        "nom"        VARCHAR NOT NULL,
        "prenom"     VARCHAR NOT NULL,
        "password"   VARCHAR NOT NULL,
        "isActive"   BOOLEAN NOT NULL DEFAULT true,
        "createdAt"  TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"  TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // ── clients ────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "clients" (
        "id"         SERIAL PRIMARY KEY,
        "name"       VARCHAR NOT NULL,
        "email"      VARCHAR NOT NULL UNIQUE,
        "phone"      VARCHAR NOT NULL,
        "address"    VARCHAR NOT NULL,
        "createdAt"  TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"  TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // ── products ───────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "products" (
        "id"         SERIAL PRIMARY KEY,
        "name"       VARCHAR NOT NULL,
        "price"      NUMERIC(10,2) NOT NULL,
        "stock"      INTEGER NOT NULL DEFAULT 0,
        "min_stock"  INTEGER NOT NULL DEFAULT 0,
        "createdAt"  TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"  TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // ── invoices ───────────────────────────────────────────
    await queryRunner.query(`
      CREATE TYPE "invoices_status_enum" AS ENUM ('payée', 'en_attente', 'en_retard')
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "invoices" (
        "id"           SERIAL PRIMARY KEY,
        "client_id"    INTEGER NOT NULL REFERENCES "clients"("id") ON DELETE RESTRICT,
        "client_name"  VARCHAR NOT NULL,
        "issue_date"   DATE NOT NULL,
        "due_date"     DATE NOT NULL,
        "subtotal"     NUMERIC(10,2) NOT NULL,
        "tax_rate"     NUMERIC(5,2) NOT NULL,
        "tax_amount"   NUMERIC(10,2) NOT NULL,
        "total"        NUMERIC(10,2) NOT NULL,
        "status"       "invoices_status_enum" NOT NULL DEFAULT 'en_attente',
        "createdAt"    TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"    TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // ── invoice_items ──────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "invoice_items" (
        "id"           SERIAL PRIMARY KEY,
        "invoice_id"   INTEGER NOT NULL REFERENCES "invoices"("id") ON DELETE CASCADE,
        "product_id"   INTEGER NOT NULL REFERENCES "products"("id"),
        "productName"  VARCHAR NOT NULL,
        "quantity"     INTEGER NOT NULL,
        "unit_price"   NUMERIC(10,2) NOT NULL,
        "total"        NUMERIC(10,2) NOT NULL
      )
    `);

    // ── expenses ───────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "expenses" (
        "id"          SERIAL PRIMARY KEY,
        "description" VARCHAR NOT NULL,
        "amount"      NUMERIC(10,2) NOT NULL,
        "date"        DATE NOT NULL,
        "category"    VARCHAR NOT NULL,
        "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"   TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "invoice_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "invoices"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "invoices_status_enum"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "expenses"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "products"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "clients"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "admins"`);
  }
}
