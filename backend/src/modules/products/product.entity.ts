import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type ProductCategory =
  | 'electronics'
  | 'clothing'
  | 'food'
  | 'services'
  | 'software'
  | 'office'
  | 'other';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: false })
  reference: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: [
      'electronics',
      'clothing',
      'food',
      'services',
      'software',
      'office',
      'other',
    ],
    default: 'other',
  })
  category: ProductCategory;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  purchasePrice: number;

  @Column('decimal', { precision: 5, scale: 2, default: 20 })
  vatRate: number;

  @Column({ default: 'unité' })
  unit: string;

  @Column('decimal', { precision: 10, scale: 3, default: 0 })
  stockQuantity: number;

  @Column('decimal', { precision: 10, scale: 3, default: 0 })
  minStock: number;

  @Column({ default: false })
  isService: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
