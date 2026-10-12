import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Users,
  Download,
  ArrowRight,
  ArrowLeft,
  Mail,
  BookOpen,
} from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface InstructorStudentsPageProps {
  locale: Locale;
}

export const InstructorStudentsPage: React.FC<InstructorStudentsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('ALL');

  // Honest data-driven container: empty until real backend data is connected
  const students: any[] = [];

  return (
    <PortalPage
      title={isAr ? 'قوائم الطلاب والشُعب' : 'Master Students Directory'}
      subtitle={
        isAr
          ? 'استعراض سجلات جميع الطلاب المسجلين في الشُعب المكلفة، وسجلات الحضور'
          : 'Directory of all students enrolled across your assigned course sections'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة المحاضر' : 'Faculty Portal', path: `/${locale}/instructor/dashboard` },
        { label: isAr ? 'قوائم الطلاب' : 'Students' },
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
          <span>{isAr ? 'تصدير الكشوف الأكاديمية' : 'Export Master Roster'}</span>
        </button>
      }
    >
      <div className="space-y-4">
        {/* Search & Course Filter */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-[#607086]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAr ? 'بحث بالاسم، الرقم الجامعي، أو البريد...' : 'Search by name, student ID, or email...'}
              className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg ps-9 pe-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
            />
          </div>

          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full sm:w-56 bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
          >
            <option value="ALL">{isAr ? 'كافة الشُعب والمقررات' : 'All Sections & Courses'}</option>
          </select>
        </div>

        {/* Master Student Table or Honest Empty State */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] shadow-xs overflow-hidden">
          {students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-start text-xs">
                <thead className="bg-[#EFF3F8] border-b border-[#DCE3EB] text-[#607086] font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4 text-start">{isAr ? 'الرقم الأكاديمي' : 'Student ID'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'اسم الطالب' : 'Student Name'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'المقرر والشعبة' : 'Course & Section'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'البريد الأكاديمي' : 'Academic Email'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'نسبة الحضور' : 'Attendance'}</th>
                    <th className="py-3 px-4 text-end">{isAr ? 'الحالة' : 'Status'}</th>
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
                {isAr ? 'لا توجد سجلات طلاب متاحة حالياً' : 'No student records found.'}
              </h4>
              <p className="text-xs text-[#607086] leading-relaxed mb-4">
                {isAr
                  ? 'ستظهر هنا سجلات الطلاب المنضمين لمقرراتك الدراسية فور اكتمال الجداول وتوزيع الشُعب.'
                  : 'Enrolled students across your assigned courses will appear here once term schedules are finalized.'}
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
