import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Video,
  Plus,
  Search,
  Play,
  Clock,
  ArrowRight,
  ArrowLeft,
  Calendar,
} from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface InstructorLecturesPageProps {
  locale: Locale;
}

export const InstructorLecturesPage: React.FC<InstructorLecturesPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('ALL');

  // Honest data-driven container: empty until real backend data is connected
  const lectures: any[] = [];

  return (
    <PortalPage
      title={isAr ? 'المحاضرات والتسجيلات التعليمية' : 'Lectures & Recordings Management'}
      subtitle={
        isAr
          ? 'إدارة جدول المحاضرات التفاعلية، التسجيلات المؤرشفة، ومحتوى البث'
          : 'Manage scheduled lectures, archived recordings, and broadcast content'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة المحاضر' : 'Faculty Portal', path: `/${locale}/instructor/dashboard` },
        { label: isAr ? 'المحاضرات والدروس' : 'Lectures' },
      ]}
      locale={locale}
      actions={
        <div className="flex items-center gap-2">
          <Link
            to={`/${locale}/instructor/live-session`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#082B50] hover:bg-[#061E38] text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            <Video size={14} className="text-[#D6A53A]" />
            <span>{isAr ? 'استوديو البث المباشر' : 'Live Studio'}</span>
          </Link>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#082B50]/40 text-white/50 rounded-lg text-xs font-semibold cursor-not-allowed border border-[#DCE3EB]"
            title={isAr ? 'رفع المحاضرات يتطلب اتصال خدمة التخزين' : 'Upload requires storage connection'}
          >
            <Plus size={14} className="text-[#D6A53A]/60" />
            <span>{isAr ? 'رفع محاضرة جديدة' : 'Upload Lecture'}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Search & Course Filters */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-[#607086]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAr ? 'بحث بعنوان المحاضرة أو رقمها...' : 'Search by lecture title or number...'}
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

        {/* Lectures Content Container */}
        {lectures.length > 0 ? (
          <div className="space-y-3">
            {/* Populated when real lectures exist */}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
              <Video size={28} />
            </div>
            <h3 className="text-base font-bold text-[#102033] mb-1">
              {isAr ? 'لا توجد محاضرات مسجلة حالياً' : 'No recorded lectures available.'}
            </h3>
            <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed mb-6">
              {isAr
                ? 'ستظهر هنا التسجيلات السحابية ومحاضرات البث المباشر المؤرشفة للشُعب المكلفة فور تسجيلها.'
                : 'Cloud recordings and archived lecture broadcasts will appear here once recorded.'}
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
