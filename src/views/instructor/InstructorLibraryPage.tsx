import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Library, Plus, Search } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface InstructorLibraryPageProps {
  locale: Locale;
}

export const InstructorLibraryPage: React.FC<InstructorLibraryPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Honest data-driven container: empty until real library items exist
  const resources: any[] = [];

  return (
    <PortalPage
      title={isAr ? 'المراجع والمكتبة الرقمية لعضو هيئة التدريس' : 'Faculty Library & Digital References'}
      subtitle={
        isAr
          ? 'المستودع الرقمي للكتب المنهجية، الأوراق البحثية، والمصادر الإثرائية للمقررات'
          : 'Digital repository of textbooks, journal papers, and supplementary course references'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة المحاضر' : 'Faculty Portal', path: `/${locale}/instructor/dashboard` },
        { label: isAr ? 'المراجع العلمية' : 'Library' },
      ]}
      locale={locale}
      actions={
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#082B50]/40 text-white/50 rounded-lg text-xs font-semibold cursor-not-allowed border border-[#DCE3EB]"
          title={isAr ? 'رفع المراجع يتطلب تفعيل المستودع السحابي' : 'Uploading references requires repository connection'}
        >
          <Plus size={14} className="text-[#D6A53A]/60" />
          <span>{isAr ? 'إضافة مرجع أو كتاب' : 'Add Reference'}</span>
        </button>
      }
    >
      <div className="space-y-4">
        {/* Search & Categories */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-[#607086]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAr ? 'بحث في العناوين أو المؤلفين أو الكلمات المفتاحية...' : 'Search by title, author, or keyword...'}
              className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg ps-9 pe-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-56 bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
          >
            <option value="ALL">{isAr ? 'كافة التصنيفات والمقررات' : 'All Categories'}</option>
            <option value="TEXTBOOK">{isAr ? 'الكتب المنهجية المعتمدة' : 'Official Textbooks'}</option>
            <option value="RESEARCH">{isAr ? 'الأبحاث والمقالات العلمية' : 'Research Papers'}</option>
            <option value="SLIDES">{isAr ? 'عروض المحاضرات والملخصات' : 'Lecture Slides'}</option>
          </select>
        </div>

        {/* Library Content or Honest Empty State */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] shadow-xs overflow-hidden">
          {resources.length > 0 ? (
            <div className="p-6" />
          ) : (
            <div className="py-16 px-4 text-center max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
                <Library size={24} />
              </div>
              <h4 className="text-sm font-bold text-[#102033] mb-1">
                {isAr ? 'لا توجد مراجع أو مصادر مرفوعة حالياً' : 'No references or resources uploaded yet.'}
              </h4>
              <p className="text-xs text-[#607086] leading-relaxed mb-4">
                {isAr
                  ? 'ستظهر هنا المراجع الرقمية والكتب التفاعلية المخصصة لمقرراتك الدراسية عند إضافتها.'
                  : 'Digital textbooks and syllabus resources attached to your courses will appear here once added.'}
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
