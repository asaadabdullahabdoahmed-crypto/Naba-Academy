import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Check,
} from 'typeorm';
import { AccountStatus } from '../../../domain/identity.types';

@Entity('users')
@Check(`"account_status" IN ('pending_verification', 'active', 'disabled')`)
@Check(`"failed_login_count" >= 0`)
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 20, unique: true, name: 'national_id' })
  nationalId!: string;

  @Column({ type: 'varchar', length: 255, name: 'name_ar' })
  nameAr!: string;

  @Column({ type: 'varchar', length: 255, name: 'name_en' })
  nameEn!: string;

  @Column({ type: 'varchar', length: 320, name: 'email' })
  email!: string;

  @Column({ type: 'varchar', length: 320, unique: true, name: 'normalized_email' })
  normalizedEmail!: string;

  @Column({ type: 'varchar', length: 30, nullable: true, name: 'phone' })
  phone!: string | null;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash!: string;

  @Column({ type: 'timestamptz', nullable: true, name: 'email_verified_at' })
  emailVerifiedAt!: Date | null;

  @Column({
    type: 'varchar',
    length: 32,
    default: 'pending_verification',
    name: 'account_status',
  })
  accountStatus!: AccountStatus;

  @Column({
    type: 'smallint',
    default: 0,
    name: 'failed_login_count',
  })
  failedLoginCount!: number;

  @Column({ type: 'timestamptz', nullable: true, name: 'locked_until' })
  lockedUntil!: Date | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'last_login_at' })
  lastLoginAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'password_changed_at' })
  passwordChangedAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'disabled_at' })
  disabledAt!: Date | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'disabled_reason' })
  disabledReason!: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'disabled_by_user_id' })
  disabledByUserId!: string | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'disabled_by_user_id' })
  disabledByUser?: UserEntity | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
