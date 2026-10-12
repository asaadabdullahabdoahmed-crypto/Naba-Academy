import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { AccountStatus } from '../../../domain/identity.types';

@Entity('user_account_status_events')
@Check(`"new_status" IN ('pending_verification', 'active', 'disabled')`)
@Check(`"previous_status" IS NULL OR "previous_status" IN ('pending_verification', 'active', 'disabled')`)
@Index('idx_user_status_events_user_created', ['userId', 'createdAt'])
export class UserAccountStatusEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  @Column({
    type: 'varchar',
    length: 32,
    nullable: true,
    name: 'previous_status',
  })
  previousStatus!: AccountStatus | null;

  @Column({
    type: 'varchar',
    length: 32,
    name: 'new_status',
  })
  newStatus!: AccountStatus;

  @Column({ type: 'uuid', nullable: true, name: 'actor_user_id' })
  actorUserId!: string | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'actor_user_id' })
  actorUser?: UserEntity | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'reason' })
  reason!: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}
