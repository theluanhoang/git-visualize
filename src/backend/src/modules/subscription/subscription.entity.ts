import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { CommonEntity } from '../../shared/entities/common.entity';
import { User } from '../users/user.entity';

export enum ESubscriptionPlanType {
    MONTHLY = 'MONTHLY',
    YEARLY = 'YEARLY',
}

export enum ESubscriptionStatus {
    ACTIVE = 'ACTIVE',
    CANCELLED = 'CANCELLED',
    EXPIRED = 'EXPIRED',
    PENDING = 'PENDING',
}

@Entity('subscription')
@Index(['userId'])
@Index(['status'])
@Index(['planType'])
@Index(['endDate'])
export class Subscription extends CommonEntity {
    @Column({ name: 'userId' })
    userId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({
        type: 'enum',
        enum: ESubscriptionPlanType,
        name: 'planType',
    })
    planType: ESubscriptionPlanType;

    @Column({
        type: 'enum',
        enum: ESubscriptionStatus,
        default: ESubscriptionStatus.PENDING,
    })
    status: ESubscriptionStatus;

    @Column({ name: 'startDate', type: 'timestamp' })
    startDate: Date;

    @Column({ name: 'endDate', type: 'timestamp' })
    endDate: Date;

    @Column({ name: 'autoRenew', default: true })
    autoRenew: boolean;
}

