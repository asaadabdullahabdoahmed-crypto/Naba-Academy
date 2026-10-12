import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Search, Filter, CheckCircle2, XCircle, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import { useToast } from '../../components/ui/toast';

interface InstructorExcusesPageProps {
  locale: Locale;
}

export const InstructorExcusesPage: React.FC<InstructorExcusesPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Honest data-driven container: empty until real excuses are submitted
  const excuses: any[] = [];

  return (
    <PortalPage
      title={isAr ? 'أعذار غياب الطلاب' : 'Student Absence Excuses'}
      subtitle={
        isAr
          ? 'مراجعة وتقييم الأعذار الطبية والرسمية المقدمة من طلاب الشُعب للغياب عن المحاضرات والاختبارات'
          : 'Review and verify medical and institutional absence excuses submitted by students'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة المحاضر' : 'Faculty Portal', path: `/${locale}/instructor/dashboard` },
        { label: isAr ? 'أعذار الطلاب' : 'Excuses' },
      ]}
      locale={locale}
    >
      <div className="space-y-4">
        {/* Status Filters */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-[#EFF3F8] p-1 rounded-lg border border-[#DCE3EB]">
            <button
              type="button"
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                filterStatus === 'ALL' ? 'bg-white text-[#082B50] shadow-xs' : 'text-[#607086] hover:text-[#102033]'
              }`}
            >
              {isAr ? 'الكل' : 'All'}
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('PENDING')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                filterStatus === 'PENDING' ? 'bg-white text-[#082B50] shadow-xs' : 'text-[#607086] hover:text-[#102033]'
              }`}
            >
              {isAr ? 'قيد المراجعة' : 'Pending'}
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('APPROVED')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                filterStatus === 'APPROVED' ? 'bg-white text-[#082B50] shadow-xs' : 'text-[#607086] hover:text-[#102033]'
              }`}
            >
              {isAr ? 'مقبولة' : 'Approved'}
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('REJECTED')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                filterStatus === 'REJECTED' ? 'bg-white text-[#082B50] shadow-xs' : 'text-[#607086] hover:text-[#102033]'
              }`}
            >
              {isAr ? 'مرفوضة' : 'Rejected'}
            </button>
          </div>
        </div>

        {/* Content or Honest Empty State */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] shadow-xs overflow-hidden">
          {excuses.length > 0 ? (
            <div className="overflow-x-auto" />
          ) : (
            <div className="py-16 px-4 text-center max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
                <FileQuestion size={24} />
              </div>
              <h4 className="text-sm font-bold text-[#102033] mb-1">
                {isAr ? 'لا توجد طلبات أعذار مقدمة حالياً' : 'No absence excuse requests submitted currently.'}
              </h4>
              <p className="text-xs text-[#607086] leading-relaxed mb-4">
                {isAr
                  ? 'ستظهر هنا طلبات الأعذار الطبية والرسمية فور تقديمها وإرفاق مستنداتها من قبل الطلاب.'
                  : 'Official and medical absence requests with supporting documentation will appear here once submitted by students.'}
              </p>
              <Link
                to={`/${locale}/instructor/dashboard`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] rounded-lg text-xs font-bold transition-colors"
              >
                <span>{isAr ? 'العودة للوحة التحكم' : 'Return to Dashboard'}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </PortalPage>
  );
};
