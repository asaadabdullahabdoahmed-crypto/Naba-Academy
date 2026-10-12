import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Calendar,
} from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface InstructorAssignmentsPageProps {
  locale: Locale;
}

export const InstructorAssignmentsPage: React.FC<InstructorAssignmentsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('ALL');

  // Honest data-driven container: empty until real backend data is connected
  const assignments: any[] = [];

  return (
    <PortalPage
      title={isAr ? 'إدارة الواجبات والتكليفات الدراسية' : 'Coursework & Assignments Management'}
      subtitle={
        isAr
          ? 'إنشاء التكليفات الأكاديمية، تحديد مواعيد التسليم، وإدارة تسليمات الطلاب'
          : 'Create coursework items, set submission deadlines, and evaluate student submissions'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة المحاضر' : 'Faculty Portal', path: `/${locale}/instructor/dashboard` },
        { label: isAr ? 'التكليفات والواجبات' : 'Assignments' },
      ]}
      locale={locale}
      actions={
        <div className="flex items-center gap-2">
          <Link
            to={`/${locale}/instructor/grading`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            <span>{isAr ? 'مركز رصد الدرجات' : 'Grade Center'}</span>
          </Link>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#082B50]/40 text-white/50 rounded-lg text-xs font-semibold cursor-not-allowed border border-[#DCE3EB]"
            title={isAr ? 'إنشاء التكليفات متاح عند اتصال نظام التقييم' : 'Assignment creation available upon assessment system connection'}
          >
            <Plus size={14} className="text-[#D6A53A]/60" />
            <span>{isAr ? 'إنشاء واجب جديد' : 'New Assignment'}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Search & Filter */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-[#607086]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAr ? 'بحث بعنوان الواجب أو المقرر...' : 'Search by assignment title or course...'}
              className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg ps-9 pe-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
            />
          </div>

          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full sm:w-56 bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
          >
            <option value="ALL">{isAr ? 'جميع المقررات المكلفة' : 'All Assigned Courses'}</option>
          </select>
        </div>

        {/* Content Container or Honest Empty State */}
        {assignments.length > 0 ? (
          <div className="space-y-3">
            {/* Populated when real assignments exist */}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
              <FileText size={28} />
            </div>
            <h3 className="text-base font-bold text-[#102033] mb-1">
              {isAr ? 'لا توجد تكليفات أو واجبات منشورة حالياً' : 'No assignments published currently.'}
            </h3>
            <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed mb-6">
              {isAr
                ? 'ستظهر هنا كافة الواجبات والأنشطة الأكاديمية للشُعب المكلفة فور إضافتها للتقويم الفصلي.'
                : 'Assignments and coursework published for your sections will appear here.'}
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
