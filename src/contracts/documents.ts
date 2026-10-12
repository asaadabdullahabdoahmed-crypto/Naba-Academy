/**
 * API Transport Contracts — Documents & Verification
 * Naba Academy — أكاديمية نبأ للتعلم الإلكتروني
 *
 * Target API Version: /api/v1
 *
 * Wire contracts for official documents, requests, and digital verification.
 * Note: Storage implementation details and pre-signed S3 URLs (ADR-09) are managed by the server.
 */

import type { AcademicCertificate, OfficialTranscript } from '../types/documents';

/**
 * Standard summary of an issued student document
 */
export interface DocumentSummaryContract {
  id: string;
  documentType: 'ENROLLMENT_CERTIFICATE' | 'TRANSCRIPT' | 'COMPLETION_LETTER' | 'TUITION_RECEIPT';
  titleAr: string;
  titleEn: string;
  issueDate: string;
  verificationHash: string;
  status: 'valid' | 'invalid' | 'revoked';
  downloadUrl?: string;
}

/**
 * List of available/issued official documents for current student
 * GET /api/v1/documents
 */
export interface DocumentListResponse {
  documents: DocumentSummaryContract[];
  certificates: AcademicCertificate[];
  transcripts: OfficialTranscript[];
}

/**
 * Detailed Document Metadata Response
 * GET /api/v1/documents/:documentId
 */
export interface DocumentMetadataResponse {
  document: DocumentSummaryContract;
  verificationUrl: string;
  sha256Digest: string;
  signedByAr: string;
  signedByEn: string;
  downloadExpiresInSeconds: number;
}

/**
 * Document Issuance Request Payload
 * POST /api/v1/documents/request
 */
export interface DocumentRequestPayload {
  documentType: 'ENROLLMENT_CERTIFICATE' | 'TRANSCRIPT' | 'COMPLETION_LETTER' | 'TUITION_RECEIPT';
  purposeAr: string;
  addressedToAr?: string;
  addressedToEn?: string;
  includeGpa: boolean;
}

/**
 * Document Issuance Request Response
 */
export interface DocumentRequestResponse {
  requestId: string;
  documentType: string;
  status: 'PENDING' | 'GENERATED' | 'READY';
  estimatedProcessingTime: string;
  message: string;
}

/**
 * Public Digital Document Verification Result
 * GET /api/v1/documents/verify/:verificationCode
 */
export interface VerificationResultResponse {
  isValid: boolean;
  documentNumber: string;
  documentTitleAr: string;
  documentTitleEn: string;
  recipientNameAr: string;
  recipientNameEn: string;
  studentId: string;
  issuedAt: string;
  issuingAuthorityAr: string;
  issuingAuthorityEn: string;
  verificationHash: string;
  isRevoked: boolean;
}
