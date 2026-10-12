import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('user_sessions')
@Index('idx_user_sessions_user_id', ['userId'])
@Index('idx_user_sessions_expires_at', ['expiresAt'])
@Index('idx_user_sessions_revoked_at', ['revokedAt'])
@Index('idx_user_sessions_active_lookup', ['userId', 'expiresAt', 'revokedAt'])
export class UserSessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  @Column({ type: 'varchar', length: 64, unique: true, name: 'token_hash' })
  tokenHash!: string;

  @Column({ type: 'varchar', length: 64, name: 'csrf_token_hash' })
  csrfTokenHash!: string;

  @Column({ type: 'text', nullable: true, name: 'user_agent' })
  userAgent!: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true, name: 'device_label' })
  deviceLabel!: string | null;

  @Column({ type: 'inet', nullable: true, name: 'ip_address' })
  ipAddress!: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', name: 'last_seen_at' })
  lastSeenAt!: Date;

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expiresAt!: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'revoked_at' })
  revokedAt!: Date | null;

  @Column({ type: 'varchar', length: 300, nullable: true, name: 'revoke_reason' })
  revokeReason!: string | null;
}
