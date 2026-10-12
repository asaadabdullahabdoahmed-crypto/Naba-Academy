/**
 * Shared Academic Domain Types
 * Naba Academy — أكاديمية نبأ للتعلم الإلكتروني
 */

import type { EntityId, IsoDateString } from './common';

export type CourseStatus = 'active' | 'completed' | 'upcoming';

export interface Course {
  id: string;
  code: string;
  titleAr: string;
  titleEn: string;
  departmentAr: string;
  departmentEn: string;
  credits: number;
  instructorAr: string;
  instructorEn: string;
  instructorNameAr?: string;
  instructorNameEn?: string;
  enrolledCount?: number;
  progress: number;
  grade?: string;
  status: CourseStatus;
  bannerGradient: string;
  category: string;
  lessonsCount: number;
  examsCount: number;
  assignmentsCount: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  titleAr: string;
  titleEn: string;
  duration: string;
  order: number;
  isCompleted: boolean;
  videoUrl: string;
  summaryAr: string;
  summaryEn: string;
}

export interface AcademicProgram {
  id: string;
  code: string;
  titleAr: string;
  titleEn: string;
  degreeAr: string;
  degreeEn: string;
  departmentAr: string;
  departmentEn: string;
  credits: number;
  totalCredits: number;
  careerPathsAr?: string[];
  careerPathsEn?: string[];
  durationYears: number;
  tuitionPerTerm: number;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
}

export interface FacultyMember {
  id: string;
  nameAr: string;
  nameEn: string;
  titleAr: string;
  titleEn: string;
  rankAr?: string;
  rankEn?: string;
  departmentAr: string;
  departmentEn: string;
  email: string;
  avatar: string;
  coursesCount: number;
  assignedCoursesCount?: number;
  loadHours?: number;
  adviseesCount?: number;
}

export interface DepartmentItem {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  headNameAr: string;
  headNameEn: string;
  facultyCount: number;
  programsCount: number;
  studentsCount: number;
}

export type Department = DepartmentItem;

export interface AcademicTerm {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  academicYear: string;
  startDate: IsoDateString;
  endDate: IsoDateString;
  isCurrent: boolean;
  registrationOpen: boolean;
  gradingOpen: boolean;
}

export type StudyTerm = AcademicTerm;

export type EnrollmentStatus =
  | 'enrolled'
  | 'waitlisted'
  | 'dropped'
  | 'completed'
  | 'withdrawn';

export interface Enrollment {
  id: EntityId;
  studentId: string;
  courseId: string;
  termId: string;
  status: EnrollmentStatus;
  enrolledAt: IsoDateString;
  grade?: string;
  numericScore?: number;
}

export interface CourseOffering {
  id: string;
  courseId: string;
  courseCode: string;
  termId: string;
  instructorId: string;
  sectionNumber: string;
  capacity: number;
  enrolledCount: number;
  room?: string;
  scheduleAr: string;
  scheduleEn: string;
}

export type Section = CourseOffering;

export interface OfficeHoursAppointment {
  id: number | string;
  student: string;
  time: string;
  date: string;
  topic: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
}

export interface DepartmentEnrollmentPetition {
  id: string;
  student: string;
  studentId: string;
  type: string;
  gpa: string;
  date: string;
}

export interface DepartmentStudentAppeal {
  id: string;
  student: string;
  course: string;
  instructor: string;
  reason: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export interface DepartmentQualityKpi {
  title: string;
  val: string;
}

export interface DepartmentReport {
  title: string;
  size: string;
  date: string;
}
