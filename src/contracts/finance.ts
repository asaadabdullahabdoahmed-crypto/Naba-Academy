/**
 * API Transport Contracts — Finance & Student Billing
 * Naba Academy — أكاديمية نبأ للتعلم الإلكتروني
 *
 * Target API Version: /api/v1
 *
 * Wire contracts for tuition invoices, payments, and financial holds.
 * Note: Double-entry ledger logic and payment gateway transactions (ADR-08) execute server-side.
 */

import type { StudentInvoice } from '../types/finance';

/**
 * Invoices List Response
 * GET /api/v1/finance/invoices
 */
export interface InvoiceListResponse {
  invoices: StudentInvoice[];
  totalDue: number;
  totalPaid: number;
}

/**
 * Detailed Invoice with line items
 * GET /api/v1/finance/invoices/:invoiceId
 */
export interface InvoiceDetailResponse {
  invoice: StudentInvoice;
  paymentInstructionsAr: string;
  paymentInstructionsEn: string;
  sadadBillNumber?: string;
}

/**
 * Financial Account and Payment Summary
 * GET /api/v1/finance/summary
 */
export interface PaymentSummaryResponse {
  studentId: string;
  nationalId: string;
  balanceDue: number;
  totalPaidToDate: number;
  lastPaymentDate?: string;
  hasScholarship: boolean;
  scholarshipPercentage?: number;
}

/**
 * Financial Hold Status Summary
 * GET /api/v1/finance/holds
 */
export interface FinancialHoldSummaryResponse {
  hasHold: boolean;
  holds: {
    id: string;
    reasonAr: string;
    reasonEn: string;
    placedAt: string;
    amountDue: number;
    blocksRegistration: boolean;
    blocksTranscript: boolean;
  }[];
}
