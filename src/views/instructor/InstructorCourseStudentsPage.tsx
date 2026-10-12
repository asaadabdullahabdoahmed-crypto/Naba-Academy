import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Search,
  Users,
  Download,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface InstructorCourseStudentsPageProps {
  locale: Locale;
}

export const InstructorCourseStudentsPage: React.FC<InstructorCourseStudentsPageProps> = ({ locale }) => {
  const { courseId } = useParams<{ courseId: string }>();
  const { isAr } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  // Data-driven student roster container: empty until real backend data is connected
  const students: any[] = [];

  return (
    <PortalPage
      title={isAr ? `قائمة طلاب المقرر: ${courseId || 'المقرر'}` : `Student Roster: ${courseId || 'Course'}`}
      subtitle={
        isAr
          ? 'سجل الطلاب المسجلين، نسب الحضور التراكمية، وحالة القيد الأكاديمي'
          : 'Enrolled students, cumulative attendance records, and enrollment status'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة المحاضر' : 'Faculty Portal', path: `/${locale}/instructor/dashboard` },
        { label: isAr ? 'المقررات المكلفة' : 'Courses', path: `/${locale}/instructor/courses` },
        { label: courseId || (isAr ? 'المقرر' : 'Course'), path: `/${locale}/instructor/courses/${courseId || 'default'}` },
        { label: isAr ? 'قائمة الطلاب' : 'Students' },
      ]}
      locale={locale}
      actions={
        <button
          type="button"
          disabled={students.length === 0}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 border rounded-lg text-xs font-bold transition-colors shadow-xs ${
            students.length === 0
              ? 'bg-[#EFF3F8] border-[#DCE3EB] text-[#607086]/60 cursor-not-allowed'
              : 'bg-white hover:bg-[#EFF3F8] border-[#DCE3EB] text-[#082B50]'
          }`}
          title={students.length === 0 ? (isAr ? 'غير متاح دون سجلات طلاب' : 'Unavailable without student records') : undefined}
        >
          <Download size={14} />
          <span>{isAr ? 'تصدير الكشف (Excel)' : 'Export Roster (Excel)'}</span>
        </button>
      }
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-4 shadow-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-[#607086]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAr ? 'بحث بالاسم أو الرقم الأكاديمي...' : 'Search by student name or ID...'}
              className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg ps-9 pe-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
            />
          </div>
        </div>

        {/* Content or Honest Empty State */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] shadow-xs overflow-hidden">
          {students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-start text-xs">
                <thead className="bg-[#EFF3F8] border-b border-[#DCE3EB] text-[#607086] font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4 text-start">{isAr ? 'الرقم الجامعي' : 'Student ID'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'اسم الطالب' : 'Student Name'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'نسبة الحضور' : 'Attendance Rate'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'الحالة الأكاديمية' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE3EB]" />
              </table>
            </div>
          ) : (
            <div className="py-16 px-4 text-center max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
                <Users size={24} />
              </div>
              <h4 className="text-sm font-bold text-[#102033] mb-1">
                {isAr ? 'لا توجد سجلات طلاب مسجلة لهذا المقرر حالياً' : 'No enrolled students found for this course.'}
              </h4>
              <p className="text-xs text-[#607086] leading-relaxed mb-4">
                {isAr
                  ? 'ستظهر هنا بيانات الطلاب المسجلين فور اكتمال فترة التسجيل الأكاديمي واعتماد الشعبة.'
                  : 'Student records will appear here once enrollment registration is finalized.'}
              </p>
              <Link
                to={`/${locale}/instructor/courses`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] rounded-lg text-xs font-bold transition-colors"
              >
                <span>{isAr ? 'العودة لقائمة المقررات' : 'Back to Courses'}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </PortalPage>
  );
};
