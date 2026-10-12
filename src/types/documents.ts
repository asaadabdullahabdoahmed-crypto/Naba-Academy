/**
 * Shared Documents & Digital Assets Types
 * Naba Academy — أكاديمية نبأ للتعلم الإلكتروني
 */

import type { EntityId, IsoDateString } from './common';

export type BookFormat = 'PDF' | 'EPUB' | 'INTERACTIVE';

export interface LibraryBook {
  id: string;
  titleAr: string;
  titleEn: string;
  author: string;
  courseCode: string;
  edition: string;
  format: BookFormat;
  downloadUrl: string;
  coverUrl: string;
  category?: string;
  year?: string;
  fileSize?: string;
}

export type VerificationStatus = 'valid' | 'invalid' | 'revoked';

export interface AcademicCertificate {
  id: EntityId;
  certificateNumber: string;
  studentId: string;
  studentNameAr: string;
  studentNameEn: string;
  degreeAr: string;
  degreeEn: string;
  majorAr: string;
  majorEn: string;
  issueDate: IsoDateString;
  gpa: number;
  verificationHash: string;
  status: VerificationStatus;
}

export interface OfficialTranscript {
  id: EntityId;
  studentId: string;
  issueDate: IsoDateString;
  cumulativeGpa: number;
  totalCreditsEarned: number;
  academicStandingAr: string;
  academicStandingEn: string;
  verificationHash: string;
}
