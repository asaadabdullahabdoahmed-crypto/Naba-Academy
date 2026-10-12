import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface InstructorOfficeHoursPageProps {
  locale: Locale;
}

export const InstructorOfficeHoursPage: React.FC<InstructorOfficeHoursPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();

  // Honest data-driven container: empty until real appointments exist
  const appointments: any[] = [];

  return (
    <PortalPage
      title={isAr ? 'الساعات المكتبية والإرشاد الأكاديمي' : 'Faculty Office Hours & Advising'}
      subtitle={
        isAr
          ? 'تنظيم فترات الإرشاد الفردي الافتراضي، حجز المواعيد، والتواصل المباشر مع الطلاب'
          : 'Configure virtual advising slots, manage appointments, and connect one-on-one with students'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة المحاضر' : 'Faculty Portal', path: `/${locale}/instructor/dashboard` },
        { label: isAr ? 'الساعات المكتبية' : 'Office Hours' },
      ]}
      locale={locale}
      actions={
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#082B50]/40 text-white/50 rounded-lg text-xs font-semibold cursor-not-allowed border border-[#DCE3EB]"
          title={isAr ? 'تخصيص الفترات متاح بعد اعتماد الجدول الأسبوعي' : 'Advising slot setup available once weekly schedule is approved'}
        >
          <Plus size={14} className="text-[#D6A53A]/60" />
          <span>{isAr ? 'إضافة فترة إرشادية' : 'Add Advising Slot'}</span>
        </button>
      }
    >
      <div className="space-y-4">
        {appointments.length > 0 ? (
          <div className="space-y-3">
            {/* Populated when real appointments exist */}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
              <Calendar size={28} />
            </div>
            <h3 className="text-base font-bold text-[#102033] mb-1">
              {isAr ? 'لا توجد مواعيد ساعات مكتبية مجدولة حالياً' : 'No office hours appointments scheduled currently.'}
            </h3>
            <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed mb-6">
              {isAr
                ? 'ستظهر هنا طلبات حجز المواعيد الإرشادية الفردية المقدمة من طلاب الشُعب الأكاديمية.'
                : 'Student requests for one-on-one virtual advising appointments will appear here.'}
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
    </PortalPage>
  );
};
