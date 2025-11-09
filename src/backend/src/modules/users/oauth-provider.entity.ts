import { Column, Entity, ManyToOne, JoinColumn, Index } from 'typeorm';
import { CommonEntity } from '../../shared/entities/common.entity';
import { User } from './user.entity';
import { OAuthProviderType } from './oauth.interface';

@Entity('oauth_provider')
@Index(['provider', 'providerId'], { unique: true })
export class OAuthProvider extends CommonEntity {
  @Column({ type: 'varchar', length: 20 })
  provider: OAuthProviderType;

  @Column({ name: 'provider_id' })
  providerId: string;

  @Column({ name: 'provider_email' })
  providerEmail: string;

  @Column({ name: 'provider_name', nullable: true })
  providerName?: string;

  @Column({ name: 'provider_avatar', nullable: true })
  providerAvatar?: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.oauthProviders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}