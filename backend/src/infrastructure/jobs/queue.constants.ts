import { JobsOptions } from 'bullmq';

/**
 * Foundational queue naming registry for Naba Academy.
 * Actual queue processors will be activated only by the specific domain modules
 * that own them (e.g. NotificationsModule, MediaModule) in subsequent steps.
 */
export enum QueueName {
  NOTIFICATIONS = 'notifications',
  EMAILS = 'emails',
  MEDIA_PROCESSING = 'media-processing',
  DOCUMENT_GENERATION = 'document-generation',
}

/**
 * Standard job metadata envelope for auditing, tracing, and idempotency.
 */
export interface JobMetadata {
  traceId?: string;
  triggeredByUserId?: string;
  idempotencyKey?: string;
  createdAt: string;
}

/**
 * Safe foundational default retry and retention policy.
 * - attempts: 3 (bounded retries to prevent unbounded queue saturation)
 * - backoff: exponential starting at 1000ms
 * - removeOnComplete: retain last 100 jobs for operational monitoring
 * - removeOnFail: retain last 500 jobs for dead-letter analysis
 */
export const DEFAULT_JOB_OPTIONS: JobsOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
  removeOnComplete: 100,
  removeOnFail: 500,
};
