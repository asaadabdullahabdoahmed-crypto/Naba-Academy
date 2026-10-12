/**
 * API Transport Contracts — Academic Structure
 * Naba Academy — أكاديمية نبأ للتعلم الإلكتروني
 *
 * Target API Version: /api/v1
 *
 * Fundamental academic HTTP boundaries:
 * - Departments, Programs, Courses, Offerings, Sections, Calendar/Terms.
 * Note: Database-internal columns (created_by_id, deleted_at, row_version) are intentionally excluded.
 */

import type { PaginatedResponse } from './common';

/**
 * Department Summary for list views
 */
export interface DepartmentSummaryContract {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  headNameAr?: string;
  headNameEn?: string;
  facultyCount: number;
  programsCount: number;
  studentsCount: number;
}

/**
 * Detailed Department Response
 */
export interface DepartmentDetailResponse {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  headNameAr?: string;
  headNameEn?: string;
  email?: string;
  phone?: string;
  programs: ProgramSummaryContract[];
  facultyCount: number;
  enrolledStudentsCount: number;
}

export type DepartmentListResponse = PaginatedResponse<DepartmentSummaryContract>;

/**
 * Academic Program Summary Contract
 */
export interface ProgramSummaryContract {
  id: string;
  code: string;
  titleAr: string;
  titleEn: string;
  degreeAr: string;
  degreeEn: string;
  departmentCode: string;
  departmentNameAr: string;
  departmentNameEn: string;
  credits: number;
  durationYears: number;
  tuitionPerTerm: number;
}

/**
 * Detailed Academic Program Response
 */
export interface ProgramDetailResponse extends ProgramSummaryContract {
  descriptionAr: string;
  descriptionEn: string;
  careerPathsAr: string[];
  careerPathsEn: string[];
  coursesCount: number;
  accredited: boolean;
}

export type ProgramListResponse = PaginatedResponse<ProgramSummaryContract>;

/**
 * Course Summary Contract for catalog and listings
 */
export interface CourseSummaryContract {
  id: string;
  code: string;
  titleAr: string;
  titleEn: string;
  credits: number;
  departmentCode: string;
  level: number;
  prerequisites: string[];
  hasLab: boolean;
}

/**
 * Course Detail Response
 */
export interface CourseDetailResponse extends CourseSummaryContract {
  descriptionAr: string;
  descriptionEn: string;
  syllabusOverviewAr?: string;
  syllabusOverviewEn?: string;
  weeklyHours: {
    lecture: number;
    lab: number;
  };
}

export type CourseListResponse = PaginatedResponse<CourseSummaryContract>;

/**
 * Course Offering Summary (A course opened in a specific academic term)
 */
export interface CourseOfferingSummaryContract {
  offeringId: string;
  courseId: string;
  courseCode: string;
  courseTitleAr: string;
  courseTitleEn: string;
  termCode: string;
  credits: number;
  sectionsCount: number;
  capacityTotal: number;
  enrolledTotal: number;
}

export type CourseOfferingListResponse = CourseOfferingSummaryContract[];

/**
 * Course Section Summary
 */
export interface SectionSummaryContract {
  sectionId: string;
  sectionNumber: string;
  courseCode: string;
  courseTitleAr: string;
  courseTitleEn: string;
  instructorNameAr: string;
  instructorNameEn: string;
  scheduleDays: string[];
  timeSlot: string;
  capacity: number;
  enrolledCount: number;
  roomOrVirtualUrl?: string;
  status: 'OPEN' | 'CLOSED' | 'WAITLIST';
}

export type SectionListResponse = SectionSummaryContract[];

/**
 * Academic Year and Term summary
 */
export interface AcademicTermSummaryContract {
  termCode: string;
  nameAr: string;
  nameEn: string;
  academicYear: string;
  isCurrent: boolean;
  registrationOpen: boolean;
  startDate: string;
  endDate: string;
  dropDeadline: string;
}

export interface AcademicCalendarResponse {
  currentTerm: AcademicTermSummaryContract;
  terms: AcademicTermSummaryContract[];
}
