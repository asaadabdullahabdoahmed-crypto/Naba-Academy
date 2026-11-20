import type { AcademicCatalogPage } from './academicCatalog';

export interface AcademicSectionMeeting {
  dayOfWeek: number;
  startsAt: string;
  endsAt: string;
  location?: string;
}

export interface AcademicSection {
  id: string;
  courseOfferingId: string;
  code: string;
  capacity: number;
  activeEnrollmentCount?: number;
  seatsAvailable?: number;
  status: 'planned' | 'open' | 'closed';
  schedule: AcademicSectionMeeting[] | null;
  enrollmentOpensAt: string | null;
  enrollmentClosesAt: string | null;
  course: {
    id: string;
    code: string;
    nameAr: string;
    nameEn: string;
    departmentId: string;
  };
  term: {
    id: string;
    code: string;
    nameAr: string;
    nameEn: string;
    startsOn: string;
    endsOn: string;
    status: 'planned' | 'active' | 'completed' | 'cancelled';
  };
}

export interface EligibleAcademicSection extends AcademicSection {
  canEnroll: boolean;
  eligibilityMessage: 'already_enrolled_in_offering' | 'enrollment_window_closed' | 'section_full' | null;
}

export interface AcademicTeacherAssignment {
  id: string;
  teacherUserId: string;
  teacherNameAr: string;
  teacherNameEn: string;
  status: 'active' | 'revoked';
  assignedAt: string;
  revokedAt: string | null;
}

export interface AcademicSectionStudent {
  enrollmentId: string;
  studentUserId: string;
  nameAr: string;
  nameEn: string;
  enrolledAt: string;
}

export interface AcademicEnrollment {
  enrollmentId: string;
  status: 'active' | 'cancelled';
  enrolledAt: string;
  cancelledAt: string | null;
  section: AcademicSection;
}

export type AcademicSectionPage = AcademicCatalogPage<AcademicSection>;
export type EligibleAcademicSectionPage = AcademicCatalogPage<EligibleAcademicSection>;
export type AcademicTeacherAssignmentPage = AcademicCatalogPage<AcademicTeacherAssignment>;
export type AcademicSectionStudentPage = AcademicCatalogPage<AcademicSectionStudent>;
export type AcademicEnrollmentPage = AcademicCatalogPage<AcademicEnrollment>;
