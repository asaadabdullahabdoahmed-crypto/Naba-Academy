/**
 * Naba Academy — Identity Domain Types & Constants
 * 
 * Defines canonical domain types, allowed status values, and scope types
 * for the Naba Academy Identity & Access subsystem.
 */

export type AccountStatus = 'pending_verification' | 'active' | 'disabled';

export const ACCOUNT_STATUSES: readonly AccountStatus[] = [
  'pending_verification',
  'active',
  'disabled',
] as const;

export type IdentityScopeType =
  | 'global'
  | 'department'
  | 'program'
  | 'course_offering';

export const IDENTITY_SCOPE_TYPES: readonly IdentityScopeType[] = [
  'global',
  'department',
  'program',
  'course_offering',
] as const;

export type CanonicalRoleCode =
  | 'system_admin'
  | 'department_head'
  | 'instructor'
  | 'student';

export const CANONICAL_ROLE_CODES: readonly CanonicalRoleCode[] = [
  'system_admin',
  'department_head',
  'instructor',
  'student',
] as const;

export interface CanonicalRoleDefinition {
  code: CanonicalRoleCode;
  nameAr: string;
  nameEn: string;
}

export const CANONICAL_ROLES: readonly CanonicalRoleDefinition[] = [
  {
    code: 'system_admin',
    nameAr: 'مدير النظام',
    nameEn: 'System Administrator',
  },
  {
    code: 'department_head',
    nameAr: 'رئيس القسم',
    nameEn: 'Department Head',
  },
  {
    code: 'instructor',
    nameAr: 'مدرس',
    nameEn: 'Instructor',
  },
  {
    code: 'student',
    nameAr: 'طالب',
    nameEn: 'Student',
  },
] as const;
