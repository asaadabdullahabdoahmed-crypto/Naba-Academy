import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RoleEntity } from './role.entity';
import { PermissionEntity } from './permission.entity';

@Entity('role_permissions')
export class RolePermissionEntity {
  @PrimaryColumn({ type: 'uuid', name: 'role_id' })
  roleId!: string;

  @PrimaryColumn({ type: 'uuid', name: 'permission_id' })
  permissionId!: string;

  @ManyToOne(() => RoleEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'role_id' })
  role?: RoleEntity;

  @ManyToOne(() => PermissionEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'permission_id' })
  permission?: PermissionEntity;

  @CreateDateColumn({ type: 'timestamptz', name: 'granted_at' })
  grantedAt!: Date;
}
