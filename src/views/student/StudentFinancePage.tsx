import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Download, CheckCircle2, Clock, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import { useToast } from '../../components/ui/toast';

interface StudentFinancePageProps {
  locale: Locale;
}

export const StudentFinancePage: React.FC<StudentFinancePageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const { toast } = useToast();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const handleDownloadStatement = () => {
    toast.info(
      isAr
        ? 'تصدير كشف الحساب المالي يتطلب ربط النظام المالي وقاعدة البيانات'
        : 'Financial statement export requires connection to financial backend services'
    );
  };

  return (
    <PortalPage
      title={isAr ? 'السجل والخدمات المالية' : 'Financial Services & Accounts'}
      subtitle={
        isAr
          ? 'متابعة الرسوم الدراسية، الفواتير، وسداد المستحقات'
          : 'Track academic tuition, invoices, and payment receipts'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الطالب' : 'Student Portal', path: `/${locale}/student/dashboard` },
        { label: isAr ? 'السجل المالي' : 'Finance' },
      ]}
      locale={locale}
      actions={
        <button
          type="button"
          onClick={handleDownloadStatement}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
        >
          <Download size={14} className="text-[#D6A53A]" />
          <span>{isAr ? 'كشف الحساب المالي' : 'Financial Statement'}</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Financial Status Summary Shell */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs">
            <span className="text-xs text-[#607086] font-medium block">
              {isAr ? 'الرصيد المستحق الحالي' : 'Outstanding Balance'}
            </span>
            <div className="text-2xl font-black text-[#082B50] mt-1 font-mono">
              —
            </div>
            <span className="text-[11px] text-[#607086] font-medium mt-1 block">
              {isAr ? 'حسب السجل المالي' : 'Per financial record'}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs">
            <span className="text-xs text-[#607086] font-medium block">
              {isAr ? 'حالة السداد الفصلي' : 'Term Payment Status'}
            </span>
            <div className="text-2xl font-black text-[#082B50] mt-1 font-mono">
              —
            </div>
            <span className="text-[11px] text-[#607086] mt-1 block">
              {isAr ? 'حسب السجل المالي' : 'Per financial record'}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs">
            <span className="text-xs text-[#607086] font-medium block">
              {isAr ? 'قنوات السداد المتاحة' : 'Payment Channels'}
            </span>
            <div className="text-sm font-bold text-[#082B50] mt-1">
              {isAr ? 'بوابة المدفوعات الإلكترونية' : 'Digital Electronic Gateway'}
            </div>
            <span className="text-[11px] text-[#607086] mt-1 block">
              {isAr ? 'سداد إلكتروني فوري وآمن' : 'Instant and secure payment'}
            </span>
          </div>
        </div>

        {/* Factual Academic Empty State */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-10 md:p-16 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
            <CreditCard size={28} className="text-[#082B50]" />
          </div>

          <h3 className="text-base md:text-lg font-bold text-[#102033] mb-2">
            {isAr ? 'لا توجد بيانات مالية متاحة حاليًا' : 'No financial data is currently available'}
          </h3>

          <p className="text-xs text-[#607086] max-w-lg mx-auto mb-6 leading-relaxed">
            {isAr
              ? 'تُصدر الفواتير والرسوم الدراسية وفق خطط السداد الرسمية عند اكتمال التسجيل الفصلي.'
              : 'Invoices and tuition items are generated according to official schedules upon term registration approval.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to={`/${locale}/student/registration`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#082B50] hover:bg-[#061E38] text-white text-xs font-bold transition-colors shadow-xs"
            >
              <span>{isAr ? 'متابعة التسجيل الفصلي' : 'View Course Registration'}</span>
              <ArrowIcon size={14} />
            </Link>

            <Link
              to={`/${locale}/student/support`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] text-xs font-semibold transition-colors"
            >
              <span>{isAr ? 'الدعم والاستفسارات المالية' : 'Financial Support'}</span>
            </Link>
          </div>
        </div>
      </div>
    </PortalPage>
  );
};
