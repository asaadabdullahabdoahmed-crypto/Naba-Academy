import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Download, PlusCircle, ArrowRight, ArrowLeft, BookOpen } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import { useToast } from '../../components/ui/toast';

interface StudentSchedulePageProps {
  locale: Locale;
}

export const StudentSchedulePage: React.FC<StudentSchedulePageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const { toast } = useToast();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [activeDay, setActiveDay] = useState<number>(0);

  const daysAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleExport = () => {
    toast.info(
      isAr
        ? 'تصدير الجدول الدراسي يتطلب ربط نظام الجداول الأكاديمية'
        : 'Timetable export requires connection to the academic scheduling service'
    );
  };

  return (
    <PortalPage
      title={isAr ? 'الجدول الدراسي الأسبوعي' : 'Weekly Class Schedule'}
      subtitle={
        isAr
          ? 'مواعيد المحاضرات الافتراضية المباشرة والجلسات الأكاديمية'
          : 'Synchronous virtual lectures timetable and academic sessions'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الطالب' : 'Student Portal', path: `/${locale}/student/dashboard` },
        { label: isAr ? 'الجدول الأسبوعي' : 'Schedule' },
      ]}
      locale={locale}
      actions={
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
        >
          <Download size={14} className="text-[#D6A53A]" />
          <span>{isAr ? 'تصدير الجدول' : 'Export Schedule'}</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Days of Week Navigation */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-3 shadow-xs flex items-center gap-2 overflow-x-auto">
          {(isAr ? daysAr : daysEn).map((dayName, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveDay(idx)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeDay === idx
                  ? 'bg-[#082B50] text-[#D6A53A] shadow-xs'
                  : 'bg-[#F7F9FC] text-[#607086] hover:text-[#102033] hover:bg-[#EFF3F8]'
              }`}
            >
              {dayName}
            </button>
          ))}
        </div>

        {/* Factual Academic Empty State */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-10 md:p-16 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
            <Calendar size={28} className="text-[#082B50]" />
          </div>

          <h3 className="text-base md:text-lg font-bold text-[#102033] mb-2">
            {isAr ? 'لا توجد محاضرات مجدولة لهذا اليوم' : 'No lectures scheduled for this day'}
          </h3>

          <p className="text-xs text-[#607086] max-w-lg mx-auto mb-6 leading-relaxed">
            {isAr
              ? 'يظهر جدول المحاضرات الأسبوعية تلقائيًا بناءً على الشعب والمقررات المسجلة في خطتك الدراسية.'
              : 'The weekly timetable updates automatically in accordance with your registered course sections.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to={`/${locale}/student/registration`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#082B50] hover:bg-[#061E38] text-white text-xs font-bold transition-colors shadow-xs"
            >
              <PlusCircle size={14} className="text-[#D6A53A]" />
              <span>{isAr ? 'التسجيل الفصلي للمقررات' : 'Go to Course Registration'}</span>
            </Link>

            <Link
              to={`/${locale}/student/courses`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] text-xs font-semibold transition-colors"
            >
              <span>{isAr ? 'المقررات الدراسية' : 'View Courses'}</span>
              <ArrowIcon size={14} />
            </Link>
          </div>
        </div>
      </div>
    </PortalPage>
  );
};
