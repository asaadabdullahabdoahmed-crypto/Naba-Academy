/**
 * Shared System Administration & Infrastructure Types
 * Naba Academy — أكاديمية نبأ للتعلم الإلكتروني
 */

import type { EntityId, IsoDateString } from './common';

export type AuditLogStatus = 'success' | 'failed' | 'warning';

export interface AuditLogItem {
  id: string;
  action?: string;
  actionAr: string;
  actionEn: string;
  actorAr?: string;
  actorEn?: string;
  detailsAr?: string;
  detailsEn?: string;
  user: string;
  role: string;
  ip: string;
  timestamp: string;
  status: AuditLogStatus;
}

export type SystemHealthStatus = 'operational' | 'degraded' | 'outage' | 'maintenance';

export interface SystemHealthMetric {
  serviceName: string;
  status: SystemHealthStatus;
  latencyMs: number;
  uptimePercentage: number;
  lastChecked: IsoDateString;
}

export interface IntegrationService {
  id: EntityId;
  name: string;
  category: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSyncAt?: IsoDateString;
}

export interface AdminRoleItem {
  name: string;
  titleAr: string;
  count: number;
  perms: string[];
}

export interface AdminDepartmentSummary {
  code: string;
  nameAr: string;
  headAr: string;
  facultyCount: number;
  studentCount: number;
}

export interface AdminAdmissionApplication {
  id: string;
  name: string;
  program: string;
  highSchoolGrade: string;
  qudrat: string;
  tahsili: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export interface AdminServiceHealthItem {
  name: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE';
  uptime: string;
  latency: string;
}

export interface AdminSupportTicketItem {
  id: string;
  user: string;
  subject: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  time: string;
}

export interface AdminIntegrationItem {
  name: string;
  provider: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  lastSync: string;
}

export interface CmsStaticPageItem {
  title: string;
  path: string;
  updated: string;
}

export interface CmsBannerItem {
  title: string;
  status: 'ACTIVE' | 'INACTIVE';
  link: string;
}

export interface AdminReportItem {
  title: string;
  size: string;
  date: string;
}
