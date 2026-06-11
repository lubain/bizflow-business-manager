import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from '../products/product.entity';

export type MovementType = 'in' | 'out' | 'adjustment' | 'return';

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  productId: string;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'enum', enum: ['in', 'out', 'adjustment', 'return'] })
  type: MovementType;

  @Column('decimal', { precision: 10, scale: 3 })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  unitPrice: number | null;

  @Column({ nullable: true })
  reason: string | null;

  @Column({ nullable: true })
  reference: string | null;

  @Column({ nullable: true })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;
}
