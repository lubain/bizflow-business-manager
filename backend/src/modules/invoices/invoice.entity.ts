import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Client } from '../clients/client.entity';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'cancelled' | 'overdue';

// ─── Invoice déclaré EN PREMIER ───────────────
// InvoiceLine en dessous pourra le référencer via lazy arrow () => Invoice
@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  number: string;

  @Column({
    type: 'enum',
    enum: ['draft', 'sent', 'paid', 'cancelled', 'overdue'],
    default: 'draft',
  })
  status: InvoiceStatus;

  @Column('uuid')
  clientId: string;

  @ManyToOne(() => Client, { eager: true })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  // lazy ref vers InvoiceLine — ok car arrow function évaluée après le fichier entier
  @OneToMany(() => InvoiceLine, (line) => line.invoice, {
    cascade: true,
    eager: true,
  })
  lines: InvoiceLine[];

  @Column({ type: 'date' })
  issueDate: string;

  @Column({ type: 'date' })
  dueDate: string;

  @Column({ type: 'date', nullable: true })
  paymentDate: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  subtotalHT: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  totalVAT: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  totalTTC: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  totalDiscount: number;

  @Column({ default: 30 })
  paymentTerms: number;

  @Column({ nullable: true })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  calculateTotals() {
    if (this.lines?.length) {
      this.subtotalHT = this.lines.reduce((s, l) => s + Number(l.totalHT), 0);
      this.totalVAT = this.lines.reduce(
        (s, l) => s + (Number(l.totalHT) * Number(l.vatRate)) / 100,
        0,
      );
      this.totalTTC = this.subtotalHT + this.totalVAT;
      this.totalDiscount = this.lines.reduce(
        (s, l) =>
          s +
          (Number(l.quantity) * Number(l.unitPrice) * Number(l.discount)) / 100,
        0,
      );
    }
  }
}

// ─── InvoiceLine déclaré APRÈS Invoice ────────
// Peut maintenant référencer Invoice sans problème
@Entity('invoice_lines')
export class InvoiceLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: true })
  productId: string | null;

  @Column()
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;

  @Column('decimal', { precision: 5, scale: 2, default: 20 })
  vatRate: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  discount: number;

  @Column('decimal', { precision: 12, scale: 2 })
  totalHT: number;

  @Column('decimal', { precision: 12, scale: 2 })
  totalTTC: number;

  @Column('uuid')
  invoiceId: string;

  // Invoice est déjà défini au-dessus → pas de ReferenceError
  @ManyToOne(() => Invoice, (invoice) => invoice.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;
}
