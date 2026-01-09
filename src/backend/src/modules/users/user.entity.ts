import { Column, Entity, OneToMany } from 'typeorm';
import { CommonEntity } from '../../shared/entities/common.entity';
import { OAuthProvider } from './oauth-provider.entity';
import { EUserRole } from './user.interface';

export enum EUserSubscriptionStatus {
  FREE = 'FREE',
  PRO = 'PRO',
  EXPIRED = 'EXPIRED',
}

@Entity('user')
export class User extends CommonEntity {
  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash', nullable: true })
  passwordHash?: string;

  @Column({
    type: 'enum',
    enum: EUserRole,
    default: EUserRole.USER,
  })
  role: EUserRole;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: EUserSubscriptionStatus,
    name: 'subscriptionStatus',
    default: EUserSubscriptionStatus.FREE,
  })
  subscriptionStatus: EUserSubscriptionStatus;

  @Column({ name: 'subscriptionExpiresAt', type: 'timestamp', nullable: true })
  subscriptionExpiresAt?: Date;

  @OneToMany(() => OAuthProvider, (provider) => provider.user)
  oauthProviders: OAuthProvider[];
}
