/**
 * Shared Communication & News Types
 * Naba Academy — أكاديمية نبأ للتعلم الإلكتروني
 */

import type { EntityId, IsoDateString } from './common';

export interface NewsItem {
  id: string;
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  date: string;
  category?: string;
  categoryAr: string;
  categoryEn: string;
  image?: string;
}

export interface AnnouncementItem {
  id: EntityId;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  date: IsoDateString;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  senderAr: string;
  senderEn: string;
  targetPortal?: string;
}

export type JobType = 'full-time' | 'part-time' | 'remote' | 'internship';

export interface JobOffer {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  postedDate?: string;
  companyAr: string;
  companyEn: string;
  locationAr: string;
  locationEn: string;
  type: JobType;
  deadline: string;
  departmentMatch: string;
}

export type JobItem = JobOffer;

export interface ContactMessage {
  id: EntityId;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  submittedAt: IsoDateString;
  status: 'new' | 'in_review' | 'resolved';
}

export interface ForumThreadItem {
  id: string | number;
  titleAr: string;
  titleEn?: string;
  course: string;
  authorAr: string;
  authorEn?: string;
  replies: number;
  likes: number;
  lastActive: string;
  hasFacultyReply: boolean;
}

export interface InstructorAnnouncementItem {
  id: number | string;
  titleAr: string;
  course: string;
  date: string;
  textAr: string;
}

export interface AlumniDirectoryRecord {
  nameAr: string;
  nameEn: string;
  degreeAr: string;
  degreeEn: string;
  year: string;
  jobAr: string;
  jobEn: string;
  companyAr: string;
  companyEn: string;
  locationAr: string;
  locationEn: string;
}

export interface AlumniEventItem {
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
}

export interface AlumniDocumentRecord {
  title: string;
  type: string;
  date: string;
  id: string;
}

export interface AlumniBenefitItem {
  title: string;
  desc: string;
}
