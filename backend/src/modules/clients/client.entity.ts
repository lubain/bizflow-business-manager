import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ['individual', 'business'],
    default: 'business',
  })
  type: 'individual' | 'business';

  @Column({ nullable: true })
  firstName: string | null;

  @Column({ nullable: true })
  lastName: string | null;

  @Column({ nullable: true })
  companyName: string | null;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string | null;

  @Column({ nullable: true })
  siret: string | null;

  @Column({ nullable: true })
  vatNumber: string | null;

  @Column({ nullable: true })
  street: string | null;

  @Column({ nullable: true })
  city: string | null;

  @Column({ nullable: true })
  postalCode: string | null;

  @Column({ default: 'France' })
  country: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ nullable: true })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
