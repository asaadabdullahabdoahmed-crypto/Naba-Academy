/**
 * API Transport Contracts — Identity & Access
 * Naba Academy — أكاديمية نبأ للتعلم الإلكتروني
 *
 * Target API Version: /api/v1
 *
 * Canonical v1 Authorization Roles:
 * - system_admin
 * - department_head
 * - instructor
 * - student
 *
 * NOTE: Alumni is NOT an authentication identity or auth role; it represents a graduate
 * lifecycle status of a student account.
 */

import type { UserRole } from '../types/identity';

/**
 * Lightweight user summary crossing HTTP boundaries (e.g. lists, headers)
 */
export interface UserSummaryContract {
  id: string;
  nationalId: string;
  nameAr: string;
  nameEn: string;
  email: string;
  role: UserRole;
  avatar?: string;
  status: 'active' | 'suspended' | 'pending';
}

/**
 * Detailed user profile crossing HTTP boundaries
 */
export interface UserProfileContract {
  id: string;
  nationalId: string;
  nameAr: string;
  nameEn: string;
  email: string;
  phone?: string;
  role: UserRole;
  departmentId?: string;
  departmentAr?: string;
  departmentEn?: string;
  collegeAr?: string;
  collegeEn?: string;
  status: 'active' | 'suspended' | 'pending';
  avatar?: string;
  createdAt: string;
  lastLoginAt?: string;
}

/**
 * Role assignment representation for security/administrative inspection
 */
export interface RoleAssignmentContract {
  userId: string;
  role: UserRole;
  assignedAt: string;
  assignedByUserId: string;
  scope?: {
    collegeId?: string;
    departmentId?: string;
    courseId?: string;
    sectionId?: string;
  };
}

/**
 * Active session/device contract for user security settings
 */
export interface UserSessionContract {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  location?: string;
  createdAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
}
