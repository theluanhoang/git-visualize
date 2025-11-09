import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { CommonEntity } from '../../shared/entities/common.entity';
import { User } from '../users/user.entity';
import { SessionType } from './session.interface';
import { OAuthProviderType } from '../users/oauth.interface';

@Entity('session')
export class Session extends CommonEntity {
  @Column()
  @Index()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ name: 'refresh_token_hash' })
  refreshTokenHash: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip: string | null;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt: Date | null;

  @Column({ 
    name: 'session_type', 
    type: 'enum', 
    enum: SessionType, 
    default: SessionType.PASSWORD 
  })
  sessionType: SessionType;

  @Column({ name: 'oauth_provider', type: 'enum', enum: OAuthProviderType, nullable: true })
  oauthProvider?: OAuthProviderType;

  @Column({ name: 'oauth_provider_id', nullable: true })
  oauthProviderId?: string;

  @Column({ name: 'oauth_access_token_hash', nullable: true })
  oauthAccessTokenHash?: string;

  @Column({ name: 'oauth_refresh_token_hash', nullable: true })
  oauthRefreshTokenHash?: string;

  @Column({ name: 'oauth_token_expires_at', type: 'timestamptz', nullable: true })
  oauthTokenExpiresAt?: Date;
}


