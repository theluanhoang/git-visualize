import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { CommonEntity } from '../../shared/entities/common.entity';
import { User } from '../users/user.entity';
import { Subscription } from './subscription.entity';

export enum EPaymentMethod {
  CASSO = 'CASSO',
  MANUAL = 'MANUAL',
}

export enum EPaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

@Entity('payment')
@Index(['userId'])
@Index(['subscriptionId'])
@Index(['status'])
@Index(['paymentMethod'])
@Index(['transactionId'])
export class Payment extends CommonEntity {
  @Column({ name: 'userId' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ name: 'subscriptionId', nullable: true })
  subscriptionId: string | null;

  @ManyToOne(() => Subscription, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'subscriptionId' })
  subscription: Subscription | null;

  @Column({
    type: 'enum',
    enum: EPaymentMethod,
  })
  paymentMethod: EPaymentMethod;

  @Column({
    type: 'enum',
    enum: EPaymentStatus,
    default: EPaymentStatus.PENDING,
  })
  status: EPaymentStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  currency: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  transactionId: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'timestamp', nullable: true })
  paymentDate: Date | null;

  @Column({ type: 'text', nullable: true })
  paymentUrl: string | null;

  @Column({ type: 'text', nullable: true })
  qrCode: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  bankAccount: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  bankName: string | null;

  @Column({ type: 'text', nullable: true })
  cassoTransactionId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  cassoWebhookData: any | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}

