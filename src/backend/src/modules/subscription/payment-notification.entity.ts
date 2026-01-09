import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { CommonEntity } from '../../shared/entities/common.entity';
import { User } from '../users/user.entity';
import { Payment } from './payment.entity';

export enum ENotificationStatus {
  PENDING = 'PENDING',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

export enum ENotificationChannel {
  WEBSOCKET = 'WEBSOCKET',
  POLLING = 'POLLING',
}

@Entity('payment_notification')
@Index(['userId'])
@Index(['paymentId'])
@Index(['status'])
@Index(['createdAt'])
export class PaymentNotification extends CommonEntity {
  @Column({ name: 'userId' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ name: 'paymentId' })
  paymentId: string;

  @ManyToOne(() => Payment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'paymentId' })
  payment: Payment;

  @Column({
    type: 'enum',
    enum: ENotificationStatus,
    default: ENotificationStatus.PENDING,
  })
  status: ENotificationStatus;

  @Column({
    type: 'enum',
    enum: ENotificationChannel,
    nullable: true,
  })
  channel: ENotificationChannel | null;

  @Column({ type: 'jsonb', nullable: true })
  eventData: {
    paymentId: string;
    status: string;
    amount: number;
    subscriptionId: string | null;
  } | null;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date | null;

  @Column({ type: 'int', default: 0 })
  deliveryAttempts: number;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;
}

