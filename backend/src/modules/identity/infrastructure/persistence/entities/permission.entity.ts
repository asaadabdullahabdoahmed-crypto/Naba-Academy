import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('permissions')
export class PermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 120, unique: true, name: 'code' })
  code!: string;

  @Column({ type: 'varchar', length: 160, name: 'name_ar' })
  nameAr!: string;

  @Column({ type: 'varchar', length: 160, name: 'name_en' })
  nameEn!: string;

  @Column({ type: 'text', nullable: true, name: 'description_ar' })
  descriptionAr!: string | null;

  @Column({ type: 'text', nullable: true, name: 'description_en' })
  descriptionEn!: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
