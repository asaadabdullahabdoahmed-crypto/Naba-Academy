import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Search, Filter, Calendar, Users, Clock, Download, ArrowRight, ArrowLeft } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface InstructorAttendancePageProps {
  locale: Locale;
}

export const InstructorAttendancePage: React.FC<InstructorAttendancePageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Honest data-driven container: empty until real sessions exist
  const attendanceSessions: any[] = [];

  return (
    <PortalPage
      title={isAr ? 'رصد وتحضير المحاضرات' : 'Lecture Attendance & Rosters'}
      subtitle={
        isAr
          ? 'تسجيل حضور وغياب الطلاب للمحاضرات التفاعلية، وإدارة سجلات الحضور للشعب المكلفة'
          : 'Record attendance for live sessions and track academic presence across course sections'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة المحاضر' : 'Faculty Portal', path: `/${locale}/instructor/dashboard` },
        { label: isAr ? 'سجل الحضور' : 'Attendance' },
      ]}
      locale={locale}
      actions={
        <button
          type="button"
          disabled={attendanceSessions.length === 0}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 border rounded-lg text-xs font-bold transition-colors shadow-xs ${
            attendanceSessions.length === 0
              ? 'bg-[#EFF3F8] border-[#DCE3EB] text-[#607086]/60 cursor-not-allowed'
              : 'bg-white hover:bg-[#EFF3F8] border-[#DCE3EB] text-[#082B50]'
          }`}
          title={attendanceSessions.length === 0 ? (isAr ? 'غير متاح دون سجلات حضور' : 'Unavailable without attendance records') : undefined}
        >
          <Download size={14} />
          <span>{isAr ? 'تصدير كشف الحضور' : 'Export Attendance'}</span>
        </button>
      }
    >
      <div className="space-y-4">
        {/* Course & Date Filters */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-4 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#607086] mb-1">
              {isAr ? 'المقرر والشعبة' : 'Course & Section'}
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
            >
              <option value="ALL">{isAr ? 'جميع المقررات المكلفة' : 'All Assigned Courses'}</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#607086] mb-1">
              {isAr ? 'تاريخ جلسة المحاضرة' : 'Lecture Date'}
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
            />
          </div>
        </div>

        {/* Content or Honest Empty State */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] shadow-xs overflow-hidden">
          {attendanceSessions.length > 0 ? (
            <div className="overflow-x-auto" />
          ) : (
            <div className="py-16 px-4 text-center max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
                <CheckCircle size={24} />
              </div>
              <h4 className="text-sm font-bold text-[#102033] mb-1">
                {isAr ? 'لا توجد جلسات حضور مسجلة حالياً' : 'No attendance sessions recorded currently.'}
              </h4>
              <p className="text-xs text-[#607086] leading-relaxed mb-4">
                {isAr
                  ? 'يتم رصد الحضور تلقائياً أثناء جلسات البث المباشر التفاعلية أو يدوياً عبر جدول المحاضرات المعتمد.'
                  : 'Attendance is recorded automatically during live broadcast sessions or logged manually for scheduled classes.'}
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
