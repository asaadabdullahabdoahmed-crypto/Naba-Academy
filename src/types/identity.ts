/**
 * Shared Identity & Access Control Types
 * Naba Academy — أكاديمية نبأ للتعلم الإلكتروني
 *
 * Approved Canonical V1 Roles (ADR-05, ADR-13/14/15):
 * - system_admin
 * - department_head
 * - instructor
 * - student
 *
 * Note: Alumni is NOT a separate authentication identity; it represents a lifecycle/portal
 * state of an existing user after graduation.
 */

import type { EntityId, IsoDateString } from './common';

/**
 * Approved canonical v1 roles
 */
export type UserRole = 'system_admin' | 'department_head' | 'instructor' | 'student';

export const V1_USER_ROLES: readonly UserRole[] = [
  'system_admin',
  'department_head',
  'instructor',
  'student',
] as const;

/**
 * Frontend portal navigation areas
 */
export type PortalArea =
  | 'public'
  | 'auth'
  | 'student'
  | 'instructor'
  | 'department'
  | 'admin'
  | 'alumni';

/**
 * User account status
 */
export type AccountStatus = 'active' | 'suspended' | 'pending';

/**
 * Legacy/Mock system user role representations in frontend views
 */
export type SystemUserRole =
  | 'STUDENT'
  | 'INSTRUCTOR'
  | 'DEPT_HEAD'
  | 'ADMIN'
  | 'ALUMNI'
  | 'DEPARTMENT_HEAD';

/**
 * Maps system/legacy roles to canonical v1 UserRole
 */
export function mapToCanonicalRole(role: SystemUserRole | string): UserRole {
  switch (role) {
    case 'ADMIN':
      return 'system_admin';
    case 'DEPT_HEAD':
    case 'DEPARTMENT_HEAD':
      return 'department_head';
    case 'INSTRUCTOR':
      return 'instructor';
    case 'STUDENT':
    case 'ALUMNI':
    default:
      return 'student';
  }
}

/**
 * Canonical user entity
 */
export interface User {
  id: EntityId;
  nationalId: string;
  nameAr: string;
  nameEn: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  avatar?: string;
  departmentId?: string;
  departmentAr?: string;
  departmentEn?: string;
  createdAt?: IsoDateString;
  updatedAt?: IsoDateString;
}

/**
 * Lightweight user summary for tables and lists
 */
export interface UserSummary {
  id: EntityId;
  nameAr: string;
  nameEn: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  avatar?: string;
}

/**
 * System user representation as used in mock and admin users views
 */
export interface SystemUser {
  id: string;
  nationalId: string;
  nameAr: string;
  nameEn: string;
  email: string;
  role: SystemUserRole;
  status: AccountStatus;
  lastActive: string;
  avatar?: string;
  departmentAr?: string;
  departmentEn?: string;
  lastLogin?: string;
}

/**
 * Admin profile representation
 */
export interface AdminProfile {
  adminId: string;
  nameAr: string;
  nameEn: string;
  roleAr: string;
  roleEn: string;
  titleAr?: string;
  titleEn?: string;
  departmentAr?: string;
  departmentEn?: string;
  email: string;
  phone: string;
  avatar: string;
  totalUsersCount: number;
  activeSessionsCount: number;
}

/**
 * Department Head profile representation
 */
export interface DeptHeadProfile {
  headId: string;
  nameAr: string;
  nameEn: string;
  titleAr: string;
  titleEn: string;
  email: string;
  phone: string;
  departmentAr: string;
  departmentEn: string;
  collegeAr: string;
  collegeEn: string;
  avatar: string;
  facultyCount: number;
  programsCount: number;
  enrolledStudentsCount: number;
}

export type DepartmentHeadProfile = DeptHeadProfile;
export type UserAccount = SystemUser;

/**
 * Instructor profile representation
 */
export interface InstructorProfile {
  instructorId: string;
  nameAr: string;
  nameEn: string;
  titleAr: string;
  titleEn: string;
  email: string;
  phone: string;
  departmentAr: string;
  departmentEn: string;
  collegeAr: string;
  collegeEn: string;
  avatar: string;
  activeCoursesCount: number;
  assignedCoursesCount?: number;
  pendingGradingCount?: number;
  totalStudentsCount: number;
}

/**
 * Active session summary
 */
export interface SessionSummary {
  sessionId: string;
  userId: EntityId;
  userName: string;
  ipAddress: string;
  browser: string;
  operatingSystem: string;
  loginTime: IsoDateString;
  lastActiveTime: IsoDateString;
  isCurrentSession: boolean;
}

/**
 * Device session representation
 */
export interface DeviceSession {
  id: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  deviceName: string;
  ipAddress: string;
  lastUsedAt: IsoDateString;
  isTrusted: boolean;
}
