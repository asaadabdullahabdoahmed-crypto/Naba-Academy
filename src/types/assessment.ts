/**
 * Shared Assessment & Examination Types
 * Naba Academy — أكاديمية نبأ للتعلم الإلكتروني
 */

import type { EntityId, IsoDateString } from './common';

export type ExamStatus = 'upcoming' | 'in-progress' | 'completed';

export interface ExamItem {
  id: string;
  courseCode: string;
  courseTitleAr: string;
  courseTitleEn: string;
  examTypeAr: string;
  examTypeEn: string;
  durationMinutes: number;
  totalMarks: number;
  date: string;
  time: string;
  status: ExamStatus;
  isProctored: boolean;
  questionsCount: number;
}

export interface QuizQuestion {
  id: string;
  questionAr: string;
  questionEn: string;
  optionsAr: string[];
  optionsEn: string[];
  correctIndex: number;
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

export interface QuizSummary {
  id: EntityId;
  courseCode: string;
  titleAr: string;
  titleEn: string;
  totalQuestions: number;
  durationMinutes: number;
  dueDate: IsoDateString;
  maxScore: number;
}

export interface ExamAttempt {
  attemptId: EntityId;
  examId: string;
  studentId: string;
  startedAt: IsoDateString;
  submittedAt?: IsoDateString;
  score?: number;
  maxScore: number;
  status: 'not_started' | 'in_progress' | 'submitted' | 'graded';
}

export type AttemptSummary = ExamAttempt;
