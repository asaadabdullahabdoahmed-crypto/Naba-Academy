import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../../identity/infrastructure/persistence/entities/user.entity';

export type CatalogStatus = 'active' | 'inactive';
export type AcademicTermStatus = 'planned' | 'active' | 'completed' | 'cancelled';
export type CourseOfferingStatus = 'planned' | 'open' | 'closed' | 'cancelled';

abstract class TimestampedCatalogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 64 })
  code!: string;

  @Column({ type: 'varchar', length: 255, name: 'name_ar' })
  nameAr!: string;

  @Column({ type: 'varchar', length: 255, name: 'name_en' })
  nameEn!: string;

  @Column({ type: 'varchar', length: 16, default: 'active' })
  status!: CatalogStatus;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;
}

@Entity('colleges')
@Index('uq_colleges_code_ci', { synchronize: false })
@Index('idx_colleges_university_id', { synchronize: false })
@Check(`"status" IN ('active', 'inactive')`)
export class CollegeEntity extends TimestampedCatalogEntity {
  @Column({ type: 'uuid', nullable: true, name: 'university_id' })
  universityId!: string | null;

  @ManyToOne(() => UniversityEntity, (university) => university.colleges, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'university_id' })
  university!: UniversityEntity | null;
}

@Entity('universities')
@Index('uq_universities_code_ci', { synchronize: false })
@Check(`"status" IN ('active', 'inactive')`)
export class UniversityEntity extends TimestampedCatalogEntity {
  @OneToMany(() => CollegeEntity, (college) => college.university)
  colleges!: CollegeEntity[];
}

@Entity('departments')
@Index('uq_departments_college_code_ci', { synchronize: false })
@Check(`"status" IN ('active', 'inactive')`)
export class DepartmentEntity extends TimestampedCatalogEntity {
  @Column({ type: 'uuid', name: 'college_id' })
  collegeId!: string;

  @ManyToOne(() => CollegeEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'college_id' })
  college!: CollegeEntity;

  @OneToMany(() => AcademicProgramEntity, (program) => program.department)
  programs!: AcademicProgramEntity[];
}

@Entity('credential_levels')
@Index('uq_credential_levels_code_ci', { synchronize: false })
@Check(`"status" IN ('active', 'inactive')`)
@Check(`"sort_order" >= 0`)
export class CredentialLevelEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 32 })
  code!: string;

  @Column({ type: 'varchar', length: 120, name: 'name_ar' })
  nameAr!: string;

  @Column({ type: 'varchar', length: 120, name: 'name_en' })
  nameEn!: string;

  @Column({ type: 'integer', default: 0, name: 'sort_order' })
  sortOrder!: number;

  @Column({ type: 'varchar', length: 16, default: 'active' })
  status!: CatalogStatus;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;

  @OneToMany(() => AcademicProgramEntity, (program) => program.credentialLevel)
  programs!: AcademicProgramEntity[];
}

@Entity('academic_programs')
@Index('uq_academic_programs_department_code_ci', { synchronize: false })
@Index('idx_academic_programs_credential_level_id', { synchronize: false })
@Check(`"status" IN ('active', 'inactive')`)
export class AcademicProgramEntity extends TimestampedCatalogEntity {
  @Column({ type: 'uuid', name: 'department_id' })
  departmentId!: string;

  @ManyToOne(() => DepartmentEntity, (department) => department.programs, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'department_id' })
  department!: DepartmentEntity;

  @Column({ type: 'uuid', name: 'credential_level_id' })
  credentialLevelId!: string;

  @ManyToOne(() => CredentialLevelEntity, (credentialLevel) => credentialLevel.programs, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'credential_level_id' })
  credentialLevel!: CredentialLevelEntity;

  @OneToMany(() => StudentAcademicPlacementEntity, (placement) => placement.program)
  placements!: StudentAcademicPlacementEntity[];
}

@Entity('student_academic_placements')
@Index('uq_student_academic_placements_current_user', { synchronize: false })
@Index('idx_student_academic_placements_user_history', { synchronize: false })
@Index('idx_student_academic_placements_program_id', { synchronize: false })
@Check(`"effective_to" IS NULL OR "effective_to" > "effective_from"`)
export class StudentAcademicPlacementEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => UserEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ type: 'uuid', name: 'academic_program_id' })
  academicProgramId!: string;

  @ManyToOne(() => AcademicProgramEntity, (program) => program.placements, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'academic_program_id' })
  program!: AcademicProgramEntity;

  @Column({ type: 'date', name: 'effective_from' })
  effectiveFrom!: string;

  @Column({ type: 'date', nullable: true, name: 'effective_to' })
  effectiveTo!: string | null;

  @Column({ type: 'timestamptz', default: () => 'now()', name: 'recorded_at' })
  recordedAt!: Date;

  @Column({ type: 'uuid', nullable: true, name: 'created_by_user_id' })
  createdByUserId!: string | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_user_id' })
  createdBy!: UserEntity | null;
}

@Entity('academic_terms')
@Index('uq_academic_terms_code_ci', { synchronize: false })
@Check(`"status" IN ('planned', 'active', 'completed', 'cancelled')`)
@Check(`"ends_on" >= "starts_on"`)
export class AcademicTermEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 64 })
  code!: string;

  @Column({ type: 'varchar', length: 255, name: 'name_ar' })
  nameAr!: string;

  @Column({ type: 'varchar', length: 255, name: 'name_en' })
  nameEn!: string;

  @Column({ type: 'date', name: 'starts_on' })
  startsOn!: string;

  @Column({ type: 'date', name: 'ends_on' })
  endsOn!: string;

  @Column({ type: 'varchar', length: 16, default: 'planned' })
  status!: AcademicTermStatus;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;

  @OneToMany(() => CourseOfferingEntity, (offering) => offering.term)
  offerings!: CourseOfferingEntity[];
}

@Entity('courses')
@Index('uq_courses_department_code_ci', { synchronize: false })
@Check(`"status" IN ('active', 'inactive')`)
export class CourseEntity extends TimestampedCatalogEntity {
  @Column({ type: 'uuid', name: 'department_id' })
  departmentId!: string;

  @ManyToOne(() => DepartmentEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'department_id' })
  department!: DepartmentEntity;

  @OneToMany(() => CourseOfferingEntity, (offering) => offering.course)
  offerings!: CourseOfferingEntity[];
}

@Entity('course_offerings')
@Index('uq_course_offerings_term_course_code_ci', { synchronize: false })
@Index('idx_course_offerings_course_term', { synchronize: false })
@Check(`"status" IN ('planned', 'open', 'closed', 'cancelled')`)
export class CourseOfferingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'course_id' })
  courseId!: string;

  @ManyToOne(() => CourseEntity, (course) => course.offerings, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'course_id' })
  course!: CourseEntity;

  @Column({ type: 'uuid', name: 'academic_term_id' })
  academicTermId!: string;

  @ManyToOne(() => AcademicTermEntity, (term) => term.offerings, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'academic_term_id' })
  term!: AcademicTermEntity;

  @Column({ type: 'varchar', length: 64 })
  code!: string;

  @Column({ type: 'varchar', length: 16, default: 'planned' })
  status!: CourseOfferingStatus;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;
}

export const ACADEMIC_ENTITIES = [
  UniversityEntity,
  CollegeEntity,
  DepartmentEntity,
  CredentialLevelEntity,
  AcademicProgramEntity,
  StudentAcademicPlacementEntity,
  AcademicTermEntity,
  CourseEntity,
  CourseOfferingEntity,
];
