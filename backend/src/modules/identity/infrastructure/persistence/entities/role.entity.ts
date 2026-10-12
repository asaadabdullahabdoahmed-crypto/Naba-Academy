import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('roles')
export class RoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 64, unique: true, name: 'code' })
  code!: string;

  @Column({ type: 'varchar', length: 120, name: 'name_ar' })
  nameAr!: string;

  @Column({ type: 'varchar', length: 120, name: 'name_en' })
  nameEn!: string;

  @Column({ type: 'boolean', default: true, name: 'is_system' })
  isSystem!: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
