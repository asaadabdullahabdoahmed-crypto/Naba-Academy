/**
 * Shared Student Domain Types
 * Naba Academy — أكاديمية نبأ للتعلم الإلكتروني
 */

import type { EntityId, IsoDateString } from './common';

export type StudentAcademicStatus =
  | 'active'
  | 'graduated'
  | 'suspended'
  | 'probation'
  | 'withdrawn';

export type AcademicStanding =
  | 'excellent_first_honors'
  | 'excellent_second_honors'
  | 'very_good'
  | 'good'
  | 'probation'
  | 'suspended';

export interface StudentProfile {
  studentId: string;
  nameAr: string;
  nameEn: string;
  email: string;
  phone: string;
  collegeAr: string;
  collegeEn: string;
  programAr: string;
  programEn: string;
  academicLevel: number;
  gpa: number;
  totalCreditsCompleted: number;
  academicStandingAr: string;
  academicStandingEn: string;
  advisorAr: string;
  advisorEn: string;
  avatar: string;
}

/**
 * AlumniProfile represents the lifecycle state of a graduated student.
 * It is not a separate authentication identity.
 */
export interface AlumniProfile {
  alumniId: string;
  certificateId?: string;
  nameAr: string;
  nameEn: string;
  degreeAr: string;
  degreeEn: string;
  graduationYearAr: string;
  graduationYearEn: string;
  currentJobAr: string;
  currentJobEn: string;
  companyAr: string;
  companyEn: string;
  email: string;
  avatar: string;
  verificationHash: string;
}

export interface StudentSummary {
  studentId: string;
  nameAr: string;
  nameEn: string;
  email: string;
  programCode: string;
  level: number;
  gpa: number;
  standing: string;
  status: StudentAcademicStatus;
}

export interface CourseGrade {
  courseCode: string;
  courseTitleAr: string;
  courseTitleEn: string;
  credits: number;
  letterGrade: string;
  numericGrade: number;
  term: string;
  points: number;
}

export type GradeSummary = CourseGrade;

export interface AttendanceRecord {
  id: EntityId;
  courseCode: string;
  lectureNumber: number;
  date: IsoDateString;
  status: 'present' | 'absent' | 'excused' | 'late';
  notes?: string;
}

export type AttendanceSummary = AttendanceRecord;

export interface AssignmentSummary {
  id: EntityId;
  courseCode: string;
  titleAr: string;
  titleEn: string;
  dueDate: IsoDateString;
  maxScore: number;
  submittedScore?: number;
  status: 'pending' | 'submitted' | 'graded' | 'late';
}

export interface ExamSummary {
  id: EntityId;
  courseCode: string;
  titleAr: string;
  titleEn: string;
  date: IsoDateString;
  score?: number;
  maxScore: number;
  status: 'upcoming' | 'completed' | 'missed';
}
