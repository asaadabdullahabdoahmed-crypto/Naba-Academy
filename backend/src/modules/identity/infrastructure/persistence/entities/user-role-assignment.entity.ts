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
import { RoleEntity } from './role.entity';
import { IdentityScopeType } from '../../../domain/identity.types';

@Entity('user_role_assignments')
@Check(`("scope_type" = 'global' AND "scope_id" IS NULL) OR ("scope_type" <> 'global' AND "scope_id" IS NOT NULL)`)
@Index('idx_user_role_assignments_user_id', ['userId'])
@Index('idx_user_role_assignments_role_id', ['roleId'])
export class UserRoleAssignmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  @Column({ type: 'uuid', name: 'role_id' })
  roleId!: string;

  @ManyToOne(() => RoleEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'role_id' })
  role?: RoleEntity;

  @Column({
    type: 'varchar',
    length: 32,
    default: 'global',
    name: 'scope_type',
  })
  scopeType!: IdentityScopeType;

  @Column({ type: 'uuid', nullable: true, name: 'scope_id' })
  scopeId!: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'assigned_by_user_id' })
  assignedByUserId!: string | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_by_user_id' })
  assignedByUser?: UserEntity | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'assigned_at' })
  assignedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'revoked_at' })
  revokedAt!: Date | null;

  @Column({ type: 'uuid', nullable: true, name: 'revoked_by_user_id' })
  revokedByUserId!: string | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'revoked_by_user_id' })
  revokedByUser?: UserEntity | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'revocation_reason' })
  revocationReason!: string | null;
}
