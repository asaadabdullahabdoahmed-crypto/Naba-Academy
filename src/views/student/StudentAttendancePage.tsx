import React from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, CheckCircle2, AlertTriangle, Clock, ArrowRight, ArrowLeft, ShieldCheck, FileText } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface StudentAttendancePageProps {
  locale: Locale;
}

export const StudentAttendancePage: React.FC<StudentAttendancePageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <PortalPage
      title={isAr ? 'سجل الحضور والغياب' : 'Attendance & Absence Record'}
      subtitle={
        isAr
          ? 'متابعة نسب حضور المحاضرات الرقمية المباشرة وحالات الأعذار المقبولة'
          : 'Track virtual lecture attendance rates and accepted excused absences'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الطالب' : 'Student Portal', path: `/${locale}/student/dashboard` },
        { label: isAr ? 'سجل الحضور' : 'Attendance' },
      ]}
      locale={locale}
      actions={
        <Link
          to={`/${locale}/student/appeals`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] rounded-lg text-xs font-bold transition-colors shadow-xs"
        >
          <FileText size={14} className="text-[#D6A53A]" />
          <span>{isAr ? 'تقديم عذر غياب' : 'Submit Absence Excuse'}</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Attendance Regulation Overview Banner */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center shrink-0 border border-[#DCE3EB]">
            <ShieldCheck size={22} className="text-[#D6A53A]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#102033]">
              {isAr ? 'ضوابط الحضور في التعليم الإلكتروني' : 'E-Learning Attendance Guidelines'}
            </h3>
            <p className="text-xs text-[#607086] mt-1 leading-relaxed">
              {isAr
                ? 'يتم رصد الحضور إلكترونيًا أثناء بث المحاضرات التفاعلية والأنشطة التعليمية وفق السياسات الأكاديمية للمقرر.'
                : 'Attendance is recorded automatically during virtual classroom sessions and educational activities in accordance with course policies.'}
            </p>
          </div>
        </div>

        {/* Status Indicators (Factual, no fabricated percentages) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 text-center shadow-xs">
            <span className="text-xs text-[#607086] font-medium block">
              {isAr ? 'نسبة الحضور الإجمالية' : 'Overall Attendance'}
            </span>
            <div className="text-2xl font-black text-[#082B50] mt-1 font-mono">
              —
            </div>
            <span className="text-[11px] text-[#607086] mt-1 block">
              {isAr ? 'تحسب من الفصول الافتراضية' : 'Calculated from virtual classes'}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 text-center shadow-xs">
            <span className="text-xs text-[#607086] font-medium block">
              {isAr ? 'الأعذار المقبولة' : 'Excused Absences'}
            </span>
            <div className="text-2xl font-black text-[#082B50] mt-1 font-mono">
              —
            </div>
            <span className="text-[11px] text-[#607086] mt-1 block">
              {isAr ? 'عبر البوابة الأكاديمية' : 'Via academic portal'}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 text-center shadow-xs">
            <span className="text-xs text-[#607086] font-medium block">
              {isAr ? 'حالة السجل الأكاديمي' : 'Attendance Standing'}
            </span>
            <div className="text-2xl font-black text-[#082B50] mt-1 font-mono">
              —
            </div>
            <span className="text-[11px] text-[#607086] font-medium mt-1 block">
              {isAr ? 'حسب السجل الأكاديمي' : 'Per academic record'}
            </span>
          </div>
        </div>

        {/* Factual Academic Empty State */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-10 md:p-16 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
            <UserCheck size={28} className="text-[#082B50]" />
          </div>

          <h3 className="text-base md:text-lg font-bold text-[#102033] mb-2">
            {isAr ? 'لا توجد سجلات غياب مسجلة لهذا الفصل الدراسي' : 'No absence records logged for this semester'}
          </h3>

          <p className="text-xs text-[#607086] max-w-lg mx-auto mb-6 leading-relaxed">
            {isAr
              ? 'تُحدث بيانات حضور المحاضرات الرقمية ومجموع الساعات التفاعلية آلياً فور انعقاد الجلسات التدريسية للمقررات.'
              : 'Classroom attendance data and interactive lecture hours update automatically upon completion of teaching sessions.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to={`/${locale}/student/schedule`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#082B50] hover:bg-[#061E38] text-white text-xs font-bold transition-colors shadow-xs"
            >
              <span>{isAr ? 'استعراض الجدول الأسبوعي' : 'View Class Timetable'}</span>
              <ArrowIcon size={14} />
            </Link>

            <Link
              to={`/${locale}/student/courses`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] text-xs font-semibold transition-colors"
            >
              <span>{isAr ? 'المقررات الدراسية' : 'My Courses'}</span>
            </Link>
          </div>
        </div>
      </div>
    </PortalPage>
  );
};
