import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Plus,
  Calendar,
  Search,
  Award,
} from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface InstructorExamsPageProps {
  locale: Locale;
}

export const InstructorExamsPage: React.FC<InstructorExamsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  // Honest data-driven container: empty until real exams are scheduled
  const exams: any[] = [];

  return (
    <PortalPage
      title={isAr ? 'إدارة ومواعيد الاختبارات' : 'Course Examinations & Schedules'}
      subtitle={
        isAr
          ? 'جدولة الاختبارات الدورية والنصفيّة والنهائية للشُعب المكلفة'
          : 'Schedule midterm and final examinations for assigned course sections'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة المحاضر' : 'Faculty Portal', path: `/${locale}/instructor/dashboard` },
        { label: isAr ? 'إدارة الاختبارات' : 'Exams' },
      ]}
      locale={locale}
      actions={
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#082B50]/40 text-white/50 rounded-lg text-xs font-semibold cursor-not-allowed border border-[#DCE3EB]"
          title={isAr ? 'جدولة الاختبارات تخضع للتقويم الزمني المعتمد من عمادة الكلية' : 'Exam scheduling is configured according to the academic calendar'}
        >
          <Plus size={14} className="text-[#D6A53A]/60" />
          <span>{isAr ? 'إنشاء اختبار جديد' : 'Create Exam'}</span>
        </button>
      }
    >
      <div className="space-y-4">
        {/* Search Filter */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-4 shadow-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-[#607086]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAr ? 'بحث بعنوان الاختبار أو المقرر...' : 'Search by exam title or course...'}
              className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg ps-9 pe-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
            />
          </div>
        </div>

        {/* Exams Content Container or Honest Empty State */}
        {exams.length > 0 ? (
          <div className="space-y-3">
            {/* Populated when real exams exist */}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
              <Award size={28} />
            </div>
            <h3 className="text-base font-bold text-[#102033] mb-1">
              {isAr ? 'لا توجد اختبارات مجدولة حالياً' : 'No exams currently scheduled.'}
            </h3>
            <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed mb-6">
              {isAr
                ? 'ستظهر هنا مواعيد الاختبارات النصفية والنهائية للشُعب المكلفة فور اعتمادها في التقويم الأكاديمي.'
                : 'Midterm and final exam schedules for your assigned sections will appear here once approved.'}
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
