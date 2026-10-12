import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderPlus, Plus, Search, BookOpen, Layers } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface InstructorContentPageProps {
  locale: Locale;
}

export const InstructorContentPage: React.FC<InstructorContentPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const [selectedCourse, setSelectedCourse] = useState('ALL');

  // Honest data-driven container: empty until real content modules exist
  const modules: any[] = [];

  return (
    <PortalPage
      title={isAr ? 'منشئ المحتوى والخطة الدراسية' : 'Course Content & Syllabus Builder'}
      subtitle={
        isAr
          ? 'تنظيم الوحدات التعليمية، الخطة الدراسية، والمحتوى الرقمي للمقررات'
          : 'Organize modular course units, syllabus schedule, and instructional content'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة المحاضر' : 'Faculty Portal', path: `/${locale}/instructor/dashboard` },
        { label: isAr ? 'المحتوى والدروس' : 'Content Builder' },
      ]}
      locale={locale}
      actions={
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#082B50]/40 text-white/50 rounded-lg text-xs font-semibold cursor-not-allowed border border-[#DCE3EB]"
          title={isAr ? 'إنشاء الوحدات متاح عند ربط نظام إدارة المقررات' : 'Module authoring available upon LMS connection'}
        >
          <Plus size={14} className="text-[#D6A53A]/60" />
          <span>{isAr ? 'إنشاء وحدة جديدة' : 'Create Module'}</span>
        </button>
      }
    >
      <div className="space-y-4">
        {/* Course Filter */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-4 shadow-xs">
          <label className="block text-[11px] font-semibold text-[#607086] mb-1">
            {isAr ? 'اختر المقرر لتعديل الخطة والمحتوى' : 'Select Course to Manage Syllabus'}
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full sm:w-80 bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
          >
            <option value="ALL">{isAr ? 'جميع المقررات المكلفة' : 'All Assigned Courses'}</option>
          </select>
        </div>

        {/* Modules Shell or Honest Empty State */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] shadow-xs overflow-hidden">
          {modules.length > 0 ? (
            <div className="p-6" />
          ) : (
            <div className="py-16 px-4 text-center max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
                <FolderPlus size={24} />
              </div>
              <h4 className="text-sm font-bold text-[#102033] mb-1">
                {isAr ? 'لا توجد وحدات أو مخرجات مضافة حالياً' : 'No syllabus modules added yet.'}
              </h4>
              <p className="text-xs text-[#607086] leading-relaxed mb-4">
                {isAr
                  ? 'ستظهر هنا الوحدات التعليمية ومخرجات التعلم المعتمدة للمقرر فور اعتمادها.'
                  : 'Curriculum units, module outlines, and course learning outcomes will appear here.'}
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
