import React from 'react';
import { CreditCard, Wallet, Download, AlertCircle, Receipt } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface AdminFinancePageProps {
  locale: Locale;
}

export const AdminFinancePage: React.FC<AdminFinancePageProps> = ({ locale }) => {
  const { isAr } = useTranslation();

  // Factual overview metrics (without inventing fake revenue amounts or active channel counts)
  const metrics = [
    {
      titleAr: 'إجمالي الإيرادات المسجلة',
      titleEn: 'Total Recorded Revenue',
      value: '—',
      subtitleAr: 'بانتظار اكتمال تسوية الدورة المالية',
      subtitleEn: 'Awaiting financial cycle reconciliation',
    },
    {
      titleAr: 'المستحقات المعلقة',
      titleEn: 'Pending Receivables',
      value: '—',
      subtitleAr: 'تُحدث آلياً بعد فترات الحذف والإضافة',
      subtitleEn: 'Updated following add/drop closure',
    },
    {
      titleAr: 'قنوات التحصيل المعتمدة',
      titleEn: 'Payment Gateway Integration',
      value: '—',
      subtitleAr: 'بانتظار تهيئة مزود الدفع الإلكتروني',
      subtitleEn: 'Pending payment provider configuration',
    },
  ];

  const paymentGateways = [
    {
      nameAr: 'بوابة الدفع الإلكتروني (Cards / Web)',
      nameEn: 'Payment Gateway (Cards / Web)',
      providerAr: 'مزود خدمة الدفع',
      providerEn: 'Payment Service Provider',
      statusAr: 'غير مهيأ',
      statusEn: 'Not Configured',
    },
    {
      nameAr: 'نظام الفوترة والتسوية المالية',
      nameEn: 'Invoicing & Settlement Service',
      providerAr: 'المنظومة المالية',
      providerEn: 'Financial Ledger Service',
      statusAr: 'غير مهيأ',
      statusEn: 'Not Configured',
    },
  ];

  return (
    <PortalPage
      title={isAr ? 'الشؤون المالية والرسوم' : 'Financial Operations & Billing'}
      subtitle={
        isAr
          ? 'متابعة الرسوم الدراسية، بوابات الدفع الإلكتروني، وسجلات الفوترة'
          : 'Tuition fees, payment gateway integration status, and billing records'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الإدارة' : 'Admin Portal', path: `/${locale}/admin/dashboard` },
        { label: isAr ? 'الشؤون المالية' : 'Financial Ops' },
      ]}
      locale={locale}
      actions={
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF3F8] text-[#607086] text-xs font-semibold border border-[#DCE3EB]">
            <AlertCircle size={14} className="text-[#607086]" />
            <span>{isAr ? 'في انتظار ربط الواجهة الخلفية' : 'Pending Backend Integration'}</span>
          </div>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#DCE3EB] text-[#607086] cursor-not-allowed rounded-lg text-xs font-bold transition-colors"
            title={isAr ? 'يتطلب ربط الواجهة الخلفية لتفعيل التصدير' : 'Requires backend connection to export'}
          >
            <Download size={14} />
            <span>{isAr ? 'تصدير التقرير المالي' : 'Export Financials'}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {metrics.map((m, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs space-y-1">
              <span className="text-xs text-[#607086] font-medium block">
                {isAr ? m.titleAr : m.titleEn}
              </span>
              <div className="text-2xl font-black text-[#082B50] font-mono py-1">
                {m.value}
              </div>
              <span className="text-[11px] text-[#607086] block">
                {isAr ? m.subtitleAr : m.subtitleEn}
              </span>
            </div>
          ))}
        </div>

        {/* Payment Gateways */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EB]">
            <div>
              <h3 className="text-sm font-bold text-[#102033]">
                {isAr ? 'بوابات السداد والربط المالي' : 'Payment Gateways & Financial Integration'}
              </h3>
              <p className="text-xs text-[#607086] mt-0.5">
                {isAr ? 'حالة تهيئة خدمات الدفع الإلكتروني والتحصيل' : 'Configuration state of payment and settlement gateways'}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EFF3F8] text-[#607086] text-[11px] font-bold border border-[#DCE3EB]">
              <AlertCircle size={13} />
              <span>{isAr ? 'غير مهيأ' : 'Not Configured'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {paymentGateways.map((gw, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#EFF3F8]/50 border border-[#DCE3EB] space-y-2">
                <span className="font-bold text-xs text-[#102033] block">
                  {isAr ? gw.nameAr : gw.nameEn}
                </span>
                <span className="text-[11px] text-[#607086] block">
                  {isAr ? gw.providerAr : gw.providerEn}
                </span>
                <div className="pt-2 border-t border-[#DCE3EB] flex items-center gap-1.5 text-[11px] text-[#607086] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#607086]" />
                  <span>{isAr ? gw.statusAr : gw.statusEn}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invoicing Ledger Empty State */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-8 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
            <Receipt size={26} />
          </div>
          <h4 className="text-sm font-bold text-[#102033] mb-1">
            {isAr ? 'لا توجد فواتير مسجلة حالياً' : 'No Invoices Recorded'}
          </h4>
          <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed">
            {isAr
              ? 'ستظهر فواتير الرسوم الدراسية وحالات السداد هنا عند تسجيل الطلاب وربط قاعدة البيانات.'
              : 'Tuition invoices and payment records will populate here once student registrations are recorded.'}
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF3F8] text-[#607086] text-[11px] font-semibold border border-[#DCE3EB]">
            <AlertCircle size={14} className="text-[#607086]" />
            <span>{isAr ? 'في انتظار ربط الواجهة الخلفية' : 'Pending Backend Integration'}</span>
          </div>
        </div>
      </div>
    </PortalPage>
  );
};
