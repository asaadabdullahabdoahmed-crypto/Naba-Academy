/**
 * API Transport Contracts — Communication & Notifications
 * Naba Academy — أكاديمية نبأ للتعلم الإلكتروني
 *
 * Target API Version: /api/v1
 *
 * Wire contracts for institutional announcements, news, and student notifications.
 */

import type { NewsItem, AnnouncementItem } from '../types/communication';
import type { PaginatedResponse } from './common';

/**
 * Public and Institutional News
 * GET /api/v1/communication/news
 */
export type NewsListResponse = PaginatedResponse<NewsItem>;

/**
 * News Article Detail
 * GET /api/v1/communication/news/:newsId
 */
export interface NewsDetailResponse {
  news: NewsItem;
  relatedNews: NewsItem[];
}

/**
 * Targeted Announcements List
 * GET /api/v1/communication/announcements
 */
export interface AnnouncementListResponse {
  announcements: AnnouncementItem[];
  unreadCount: number;
}

/**
 * In-app Notification Summary
 * GET /api/v1/communication/notifications
 */
export interface NotificationSummaryResponse {
  unreadCount: number;
  notifications: {
    id: string;
    titleAr: string;
    titleEn: string;
    bodyAr: string;
    bodyEn: string;
    createdAt: string;
    read: boolean;
    type: 'ACADEMIC' | 'FINANCIAL' | 'SYSTEM' | 'EXAM';
    actionUrl?: string;
  }[];
}

/**
 * Public Contact Us Message Request
 * POST /api/v1/communication/contact
 */
export interface ContactMessageRequest {
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

/**
 * Contact Us Message Response
 */
export interface ContactMessageResponse {
  ticketNumber: string;
  receivedAt: string;
  message: string;
}
