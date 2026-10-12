import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Plus,
  FileText,
  Video,
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
  Layers,
  Calendar,
} from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface InstructorCoursesPageProps {
  locale: Locale;
}

export const InstructorCoursesPage: React.FC<InstructorCoursesPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('current');

  // Honest data-driven container: empty until real backend data is connected
  const courses: any[] = [];

  return (
    <PortalPage
      title={isAr ? 'المقررات الدراسية المكلفة' : 'Assigned Teaching Courses'}
      subtitle={
        isAr
          ? 'إدارة محتوى المقررات، الشُعب الدراسية، المحاضرات، وقوائم الطلاب'
          : 'Manage course syllabi, assigned sections, lectures, and enrolled students'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة المحاضر' : 'Faculty Portal', path: `/${locale}/instructor/dashboard` },
        { label: isAr ? 'المقررات المكلفة' : 'My Courses' },
      ]}
      locale={locale}
      actions={
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#082B50]/40 text-white/50 rounded-lg text-xs font-semibold cursor-not-allowed border border-[#DCE3EB]"
          title={isAr ? 'يتم توزيع المقررات والشُعب عبر عمادة الكلية وإدارة القسم الأكاديمي' : 'Course allocations are managed by the department'}
        >
          <Plus size={14} className="text-[#D6A53A]/60" />
          <span>{isAr ? 'طلب تكليف مقرر' : 'Request Course Section'}</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-[#607086]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث برمز أو اسم المقرر...' : 'Search by course code or title...'}
              className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg ps-9 pe-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50] w-full sm:w-auto"
            >
              <option value="current">{isAr ? 'الفصل الدراسي الحالي (خريف 2026)' : 'Current Term (Fall 2026)'}</option>
              <option value="upcoming">{isAr ? 'الفصل القادم (ربيع 2027)' : 'Upcoming Term (Spring 2027)'}</option>
            </select>
          </div>
        </div>

        {/* Courses Grid or Honest Empty State */}
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Populated when real courses exist */}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
              <BookOpen size={28} />
            </div>
            <h3 className="text-base font-bold text-[#102033] mb-1">
              {isAr ? 'لا توجد مقررات دراسية مكلفة حالياً' : 'No courses currently assigned.'}
            </h3>
            <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed mb-6">
              {isAr
                ? 'ستظهر هنا المقررات والشُعب المكلفة فور اعتماد جدول التدريس الفصلي من قبل رئيس القسم وعمادة الكلية.'
                : 'Assigned courses and sections will appear here once finalized by department administration.'}
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
