import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../../identity/infrastructure/persistence/entities/user.entity';
import { CourseOfferingEntity } from './academic-catalog.entity';

export type AcademicSectionStatus = 'planned' | 'open' | 'closed';
export type AcademicAssignmentStatus = 'active' | 'revoked';
export type AcademicEnrollmentStatus = 'active' | 'cancelled';

export interface AcademicSectionMeeting {
  dayOfWeek: number;
  startsAt: string;
  endsAt: string;
  location?: string;
}

export interface AcademicOperationAuditDetails {
  code?: string;
  capacity?: number;
  scheduleUpdated?: boolean;
  enrollmentOpensAt?: string | null;
  enrollmentClosesAt?: string | null;
  status?: string;
  assignmentId?: string;
  enrollmentId?: string;
  reason?: string | null;
}

@Entity('academic_sections')
@Index('uq_academic_sections_offering_code_ci', { synchronize: false })
@Index('idx_academic_sections_offering_status', { synchronize: false })
@Check(`"capacity" > 0`)
@Check(`"status" IN ('planned', 'open', 'closed')`)
@Check(`("enrollment_opens_at" IS NULL) = ("enrollment_closes_at" IS NULL)`)
@Check(`"enrollment_closes_at" IS NULL OR "enrollment_closes_at" > "enrollment_opens_at"`)
export class AcademicSectionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'course_offering_id' })
  courseOfferingId!: string;

  @ManyToOne(() => CourseOfferingEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'course_offering_id' })
  courseOffering!: CourseOfferingEntity;

  @Column({ type: 'varchar', length: 64 })
  code!: string;

  @Column({ type: 'integer' })
  capacity!: number;

  @Column({ type: 'varchar', length: 16, default: 'planned' })
  status!: AcademicSectionStatus;

  @Column({ type: 'jsonb', nullable: true })
  schedule!: AcademicSectionMeeting[] | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'enrollment_opens_at' })
  enrollmentOpensAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'enrollment_closes_at' })
  enrollmentClosesAt!: Date | null;

  @Column({ type: 'uuid', name: 'created_by_user_id' })
  createdByUserId!: string;

  @ManyToOne(() => UserEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'created_by_user_id' })
  createdBy!: UserEntity;

  @Column({ type: 'uuid', name: 'updated_by_user_id' })
  updatedByUserId!: string;

  @ManyToOne(() => UserEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'updated_by_user_id' })
  updatedBy!: UserEntity;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}

@Entity('academic_teacher_section_assignments')
@Index('uq_academic_teacher_section_active', { synchronize: false })
@Index('idx_academic_teacher_section_teacher_status', { synchronize: false })
@Check(`"status" IN ('active', 'revoked')`)
@Check(`("status" = 'active' AND "revoked_at" IS NULL) OR ("status" = 'revoked' AND "revoked_at" IS NOT NULL)`)
export class AcademicTeacherSectionAssignmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'section_id' })
  sectionId!: string;

  @ManyToOne(() => AcademicSectionEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'section_id' })
  section!: AcademicSectionEntity;

  @Column({ type: 'uuid', name: 'teacher_user_id' })
  teacherUserId!: string;

  @ManyToOne(() => UserEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'teacher_user_id' })
  teacher!: UserEntity;

  @Column({ type: 'uuid', name: 'assigned_by_user_id' })
  assignedByUserId!: string;

  @ManyToOne(() => UserEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'assigned_by_user_id' })
  assignedBy!: UserEntity;

  @Column({ type: 'varchar', length: 16, default: 'active' })
  status!: AcademicAssignmentStatus;

  @CreateDateColumn({ type: 'timestamptz', name: 'assigned_at' })
  assignedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'revoked_at' })
  revokedAt!: Date | null;

  @Column({ type: 'uuid', nullable: true, name: 'revoked_by_user_id' })
  revokedByUserId!: string | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'revoked_by_user_id' })
  revokedBy!: UserEntity | null;
}

@Entity('academic_student_enrollments')
@Index('uq_academic_student_enrollment_active', { synchronize: false })
@Index('idx_academic_student_enrollment_student_status', { synchronize: false })
@Index('idx_academic_student_enrollment_section_status', { synchronize: false })
@Check(`"status" IN ('active', 'cancelled')`)
@Check(`("status" = 'active' AND "cancelled_at" IS NULL) OR ("status" = 'cancelled' AND "cancelled_at" IS NOT NULL)`)
export class AcademicStudentEnrollmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'section_id' })
  sectionId!: string;

  @ManyToOne(() => AcademicSectionEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'section_id' })
  section!: AcademicSectionEntity;

  @Column({ type: 'uuid', name: 'student_user_id' })
  studentUserId!: string;

  @ManyToOne(() => UserEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'student_user_id' })
  student!: UserEntity;

  @Column({ type: 'varchar', length: 16, default: 'active' })
  status!: AcademicEnrollmentStatus;

  @Column({ type: 'uuid', name: 'enrolled_by_user_id' })
  enrolledByUserId!: string;

  @ManyToOne(() => UserEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'enrolled_by_user_id' })
  enrolledBy!: UserEntity;

  @CreateDateColumn({ type: 'timestamptz', name: 'enrolled_at' })
  enrolledAt!: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'cancelled_at' })
  cancelledAt!: Date | null;

  @Column({ type: 'uuid', nullable: true, name: 'cancelled_by_user_id' })
  cancelledByUserId!: string | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'cancelled_by_user_id' })
  cancelledBy!: UserEntity | null;
}

@Entity('academic_operation_audit_events')
@Index('idx_academic_operation_audit_section_created', { synchronize: false })
@Index('idx_academic_operation_audit_actor_created', { synchronize: false })
export class AcademicOperationAuditEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true, name: 'section_id' })
  sectionId!: string | null;

  @ManyToOne(() => AcademicSectionEntity, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'section_id' })
  section!: AcademicSectionEntity | null;

  @Column({ type: 'uuid', nullable: true, name: 'target_user_id' })
  targetUserId!: string | null;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'target_user_id' })
  targetUser!: UserEntity | null;

  @Column({ type: 'uuid', name: 'actor_user_id' })
  actorUserId!: string;

  @ManyToOne(() => UserEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'actor_user_id' })
  actor!: UserEntity;

  @Column({ type: 'uuid', name: 'department_id' })
  departmentId!: string;

  @Column({ type: 'varchar', length: 64, name: 'event_type' })
  eventType!: string;

  @Column({ type: 'jsonb' })
  details!: AcademicOperationAuditDetails;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}

export const ACADEMIC_OPERATIONS_ENTITIES = [
  AcademicSectionEntity,
  AcademicTeacherSectionAssignmentEntity,
  AcademicStudentEnrollmentEntity,
  AcademicOperationAuditEventEntity,
];
