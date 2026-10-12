/**
 * Shared Financial Domain Types
 * Naba Academy — أكاديمية نبأ للتعلم الإلكتروني
 *
 * Status types here are strictly distinct from AccountStatus or ExamStatus (Section 11).
 */

import type { EntityId, IsoDateString } from './common';

export type PaymentStatus =
  | 'paid'
  | 'pending'
  | 'overdue'
  | 'waived'
  | 'partially_paid';

export type InvoiceStatus =
  | 'issued'
  | 'paid'
  | 'partially_paid'
  | 'overdue'
  | 'cancelled';

export interface InvoiceLineItem {
  id?: EntityId;
  descriptionAr: string;
  descriptionEn: string;
  credits?: number;
  amount: number;
}

export interface StudentInvoice {
  id: EntityId;
  invoiceNumber: string;
  studentId: string;
  termId: string;
  termNameAr: string;
  termNameEn: string;
  issueDate: IsoDateString;
  dueDate: IsoDateString;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: InvoiceStatus;
  items: InvoiceLineItem[];
}

export type InvoiceSummary = StudentInvoice;

export type PaymentMethod = 'credit_card' | 'mada' | 'bank_transfer' | 'sadad';

export interface PaymentRecord {
  id: EntityId;
  invoiceNumber: string;
  studentId: string;
  transactionRef: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paidAt: IsoDateString;
  status: PaymentStatus;
}

export type PaymentSummary = PaymentRecord;

export interface FinancialHold {
  id: EntityId;
  studentId: string;
  reasonAr: string;
  reasonEn: string;
  amountDue: number;
  placedAt: IsoDateString;
  isResolved: boolean;
}
