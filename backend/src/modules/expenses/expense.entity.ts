import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type ExpenseCategory =
  | 'rent'
  | 'utilities'
  | 'salaries'
  | 'marketing'
  | 'travel'
  | 'supplies'
  | 'equipment'
  | 'software'
  | 'insurance'
  | 'taxes'
  | 'other';
export type ExpenseStatus = 'pending' | 'approved' | 'rejected';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({
    type: 'enum',
    enum: [
      'rent',
      'utilities',
      'salaries',
      'marketing',
      'travel',
      'supplies',
      'equipment',
      'software',
      'insurance',
      'taxes',
      'other',
    ],
  })
  category: ExpenseCategory;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  vatAmount: number;

  @Column('decimal', { precision: 5, scale: 2, default: 20 })
  vatRate: number;

  @Column({ type: 'date' })
  date: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status: ExpenseStatus;

  @Column({ nullable: true })
  supplier: string | null;

  @Column({ nullable: true })
  receiptUrl: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ nullable: true })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
