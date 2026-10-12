/**
 * Shared Common & Foundation Types
 * Naba Academy — أكاديمية نبأ للتعلم الإلكتروني
 */

export type EntityId = string;
export type IsoDateString = string;

export interface LocalizedText {
  ar: string;
  en: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export type SortDirection = 'asc' | 'desc';

export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface DateRange {
  startDate: IsoDateString;
  endDate: IsoDateString;
}

export type LoadState = 'idle' | 'loading' | 'success' | 'error';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: unknown;
}

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';
export type DialogVariant = 'danger' | 'primary' | 'warning';
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface StatItem {
  title: string;
  label?: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
  iconName?: string;
  accentColor?: string;
}
