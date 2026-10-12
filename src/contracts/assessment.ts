/**
 * API Transport Contracts — Assessments & Examinations
 * Naba Academy — أكاديمية نبأ للتعلم الإلكتروني
 *
 * Target API Version: /api/v1
 *
 * Wire contracts for examinations, quizzes, and proctoring pre-checks.
 * Note: Grading formulas, timers, and scoring weights remain strictly server-side authoritative.
 */

import type { ExamItem, QuizQuestion } from '../types/assessment';

/**
 * List of scheduled/available exams for student
 * GET /api/v1/assessments/exams
 */
export interface ExamListResponse {
  exams: ExamItem[];
}

/**
 * Detailed examination specification
 * GET /api/v1/assessments/exams/:examId
 */
export interface ExamDetailResponse {
  exam: ExamItem;
  instructionsAr: string[];
  instructionsEn: string[];
  proctoringGuidelinesAr?: string[];
  proctoringGuidelinesEn?: string[];
  systemRequirements: {
    browserCompatible: boolean;
    cameraRequired: boolean;
    micRequired: boolean;
    screenShareRequired: boolean;
  };
}

/**
 * Technical Pre-check Verification Request
 * POST /api/v1/assessments/exams/:examId/precheck
 */
export interface ExamPrecheckRequest {
  cameraVerified: boolean;
  micVerified: boolean;
  identityPhotoSubmitted: boolean;
  networkLatencyMs: number;
}

/**
 * Pre-check Verification Response
 */
export interface ExamPrecheckResponse {
  eligible: boolean;
  tokenOrSessionId: string;
  message: string;
}

/**
 * Exam Attempt Bootstrap Response (begins the timed attempt)
 * POST /api/v1/assessments/exams/:examId/start
 */
export interface ExamAttemptBootstrapResponse {
  attemptId: string;
  examId: string;
  startTime: string;
  durationMinutes: number;
  remainingSeconds: number;
  questions: {
    id: string;
    questionNumber: number;
    textAr: string;
    textEn: string;
    optionsAr: string[];
    optionsEn: string[];
    points: number;
  }[];
}

/**
 * Single question answer submission during active attempt
 * PUT /api/v1/assessments/attempts/:attemptId/answer
 */
export interface AnswerSubmissionRequest {
  questionId: string;
  selectedOptionIndex: number;
  timestamp: string;
}

export interface AnswerSubmissionResponse {
  saved: boolean;
  questionId: string;
  savedAt: string;
}

/**
 * Final Exam Submission Request
 * POST /api/v1/assessments/attempts/:attemptId/submit
 */
export interface ExamSubmissionRequest {
  submissionTimestamp: string;
  anomalyEventsCount?: number;
}

export interface ExamSubmissionResponse {
  attemptId: string;
  submittedAt: string;
  isCompleted: boolean;
  status: 'SUBMITTED' | 'UNDER_GRADING' | 'PUBLISHED';
  message: string;
}

/**
 * Lesson Quiz Questions Response
 * GET /api/v1/assessments/quizzes/:quizId
 */
export interface LessonQuizResponse {
  quizId: string;
  lessonId: string;
  titleAr: string;
  titleEn: string;
  questions: QuizQuestion[];
  passingScore: number;
  maxAttempts: number;
}

/**
 * Lesson Quiz Submission Request
 * POST /api/v1/assessments/quizzes/:quizId/submit
 */
export interface QuizSubmissionRequest {
  lessonId: string;
  answers: Record<string, number>;
}

/**
 * Lesson Quiz Result Response
 */
export interface QuizSubmissionResponse {
  quizId: string;
  score: number;
  totalMarks: number;
  passed: boolean;
  feedbackAr: string;
  feedbackEn: string;
}
