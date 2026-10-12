import React from 'react';
import { Calendar, Clock, AlertCircle, BookOpen, Layers } from 'lucide-react';
import { Locale } from '../../i18n/dictionaries';
import { useTranslation } from '../../i18n/useTranslation';

interface AcademicCalendarPageProps {
  locale: Locale;
}

export const AcademicCalendarPage: React.FC<AcademicCalendarPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-16 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#082B50]/10 text-[#082B50] text-xs font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D6A53A]" />
          <span>{isAr ? 'المواعيد والتقويم' : 'Academic Schedule'}</span>
        </div>
        <h1 className="text-3xl font-black text-[#082B50]">
          {isAr ? 'التقويم الأكاديمي الجامعي' : 'University Academic Calendar'}
        </h1>
        <p className="text-xs md:text-sm text-[#607086]">
          {isAr
            ? 'المواعيد الرسمية المعتمدة للفصول الدراسية وفترات التسجيل والاختبارات'
            : 'Official academic term schedules, registration periods, and examination windows'}
        </p>
      </div>

      {/* Institutional Pending Term Schedule State */}
      <div className="bg-white rounded-3xl border border-[#DCE3EB] p-8 md:p-12 shadow-xs text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#082B50]/10 text-[#082B50] flex items-center justify-center mx-auto">
          <Calendar size={32} />
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-lg font-bold text-[#102033]">
            {isAr ? 'مواعيد الفصول الأكاديمية قيد الإعلان الرسمي' : 'Term Schedule Pending Official Publishing'}
          </h3>
          <p className="text-xs text-[#607086] leading-relaxed">
            {isAr
              ? 'تتم مراجعة المواعيد التفصيلية لفترات التسجيل، وبداية المحاضرات، والاختبارات الفصلية والنهائية بالتنسيق مع المجلس الأكاديمي، وسيتم نشر التقويم فور اعتماده.'
              : 'Detailed operational dates for registration windows, class commencement, and exam periods are maintained centrally and will appear here upon official term scheduling.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-start">
          <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#DCE3EB] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#082B50]">
              <Clock size={15} />
              <span>{isAr ? 'فترة تسجيل المقررات' : 'Registration Window'}</span>
            </div>
            <p className="text-xs text-[#607086]">
              {isAr ? 'تحدد قبل انطلاق الفصل الدراسي' : 'Announced prior to term start'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#DCE3EB] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#174F89]">
              <BookOpen size={15} />
              <span>{isAr ? 'المحاضرات التفاعلية' : 'Lecture Sessions'}</span>
            </div>
            <p className="text-xs text-[#607086]">
              {isAr ? 'وفق الجداول المعتمدة لكل شعبة' : 'Per approved section schedules'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#DCE3EB] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#D6A53A]">
              <Layers size={15} />
              <span>{isAr ? 'فترة الاختبارات' : 'Examination Period'}</span>
            </div>
            <p className="text-xs text-[#607086]">
              {isAr ? 'تنشر في جدول الاختبارات الرسمي' : 'Published in official exam timetable'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
