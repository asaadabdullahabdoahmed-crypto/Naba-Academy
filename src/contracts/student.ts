/**
 * API Transport Contracts — Student Portal & Academic Record
 * Naba Academy — أكاديمية نبأ للتعلم الإلكتروني
 *
 * Target API Version: /api/v1
 *
 * Wire contracts for current student product flows.
 * Note: Calculations (GPA, standing, attendance warning thresholds) are executed server-side.
 */

import type { StudentProfile, CourseGrade, AttendanceRecord } from '../types/student';
import type { Course } from '../types/academic';

/**
 * Student Profile Response
 * GET /api/v1/student/profile
 */
export interface StudentProfileResponse {
  profile: StudentProfile;
}

/**
 * Student Dashboard aggregated telemetry
 * GET /api/v1/student/dashboard
 */
export interface StudentDashboardResponse {
  profile: StudentProfile;
  activeCourses: Course[];
  upcomingDeadlinesCount: number;
  unpaidFeesAmount: number;
  overallAttendancePercentage: number;
  latestNotice?: {
    titleAr: string;
    titleEn: string;
    date: string;
  };
}

/**
 * Enrolled courses for current student
 * GET /api/v1/student/courses
 */
export interface StudentCoursesResponse {
  termCode: string;
  courses: Course[];
}

/**
 * Detailed enrolled course data (lessons, assignments, instructor)
 * GET /api/v1/student/courses/:courseId
 */
export interface StudentCourseDetailResponse {
  course: Course;
  modulesCount: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  instructor: {
    nameAr: string;
    nameEn: string;
    email: string;
    officeHoursAr?: string;
    officeHoursEn?: string;
  };
}

/**
 * Student Attendance history and warnings
 * GET /api/v1/student/attendance
 */
export interface StudentAttendanceResponse {
  termCode: string;
  overallAttendancePercentage: number;
  records: AttendanceRecord[];
  absenceWarnings: {
    courseCode: string;
    courseTitleAr: string;
    courseTitleEn: string;
    absencePercentage: number;
    warningLevel: 'first' | 'second' | 'denial';
  }[];
}

/**
 * Student Grades for active term
 * GET /api/v1/student/grades
 */
export interface StudentGradesResponse {
  termCode: string;
  termGpa: number;
  cumulativeGpa: number;
  grades: CourseGrade[];
}

/**
 * Transcript Term Representation for wire transmission
 */
export interface TranscriptTermContract {
  termCode: string;
  termNameAr: string;
  termNameEn: string;
  termGpa: number;
  cumulativeGpa: number;
  creditsEarned: number;
  courses: CourseGrade[];
}

/**
 * Complete Academic Transcript
 * GET /api/v1/student/transcript
 */
export interface StudentTranscriptResponse {
  studentId: string;
  nationalId: string;
  nameAr: string;
  nameEn: string;
  programTitleAr: string;
  programTitleEn: string;
  cumulativeGpa: number;
  totalCreditsEarned: number;
  academicStandingAr: string;
  academicStandingEn: string;
  terms: TranscriptTermContract[];
}

/**
 * Student Course Registration Options & Available Sections
 * GET /api/v1/student/registration/options
 */
export interface StudentRegistrationOptionsResponse {
  termCode: string;
  registrationOpen: boolean;
  maxCreditsAllowed: number;
  currentlyRegisteredCredits: number;
  availableCourses: {
    courseId: string;
    courseCode: string;
    courseTitleAr: string;
    courseTitleEn: string;
    credits: number;
    prerequisitesMet: boolean;
    sections: {
      sectionId: string;
      sectionNumber: string;
      instructorNameAr: string;
      instructorNameEn: string;
      scheduleDays: string[];
      timeSlot: string;
      capacity: number;
      enrolledCount: number;
      isAvailable: boolean;
    }[];
  }[];
}

/**
 * Course Registration Request
 * POST /api/v1/student/registration
 */
export interface StudentRegistrationRequest {
  termCode: string;
  selectedSectionIds: string[];
}

/**
 * Course Registration Response
 */
export interface StudentRegistrationResponse {
  termCode: string;
  registeredSectionIds: string[];
  totalCreditsEnrolled: number;
  message: string;
}

/**
 * Student Financial Account Summary
 * GET /api/v1/student/finance/summary
 */
export interface StudentFinanceSummaryResponse {
  studentId: string;
  totalTuitionAmount: number;
  paidAmount: number;
  outstandingBalance: number;
  hasFinancialHold: boolean;
  holdReasonAr?: string;
  holdReasonEn?: string;
  nextPaymentDeadline?: string;
}
