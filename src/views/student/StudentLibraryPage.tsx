import React, { useState } from 'react';
import { BookOpen, Search, Download, Bookmark, ExternalLink, ArrowRight, ArrowLeft } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface StudentLibraryPageProps {
  locale: Locale;
}

export const StudentLibraryPage: React.FC<StudentLibraryPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <PortalPage
      title={isAr ? 'المكتبة والمصادر الرقمية' : 'Digital Library & Academic Repository'}
      subtitle={
        isAr
          ? 'المراجع العلمية، الكتب المقررة، وقواعد البيانات والبحوث الأكاديمية'
          : 'Textbooks, course references, scholarly research papers, and digital catalogs'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الطالب' : 'Student Portal', path: `/${locale}/student/dashboard` },
        { label: isAr ? 'المكتبة' : 'Library' },
      ]}
      locale={locale}
    >
      <div className="space-y-6">
        {/* Search Toolbar */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-4 shadow-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3.5 text-[#607086]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAr ? 'البحث في المراجع الدراسية، الكتب المقررة، والأبحاث...' : 'Search textbooks, references, and scholarly works...'}
              className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl ps-10 pe-4 py-2.5 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50] transition-colors"
            />
          </div>
        </div>

        {/* Factual Academic Empty State */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-10 md:p-16 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
            <BookOpen size={28} className="text-[#082B50]" />
          </div>

          <h3 className="text-base md:text-lg font-bold text-[#102033] mb-2">
            {isAr ? 'المستودع الرقمي للمكتبة قيد التحديث' : 'Digital library catalog is currently being updated'}
          </h3>

          <p className="text-xs text-[#607086] max-w-lg mx-auto mb-6 leading-relaxed">
            {isAr
              ? 'تُدرج المراجع والمصادر الإثرائية لكل مقرر دراسي في صفحة تفاصيل المقرر عند إتاحتها من مدرس المادة.'
              : 'Course references and textbooks are published directly under Course Details once assigned by instructors.'}
          </p>

          <div className="flex justify-center">
            <a
              href={`/${locale}/student/courses`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#082B50] hover:bg-[#061E38] text-white text-xs font-bold transition-colors shadow-xs"
            >
              <span>{isAr ? 'استعراض مصادر المقررات الحالية' : 'View Current Course Resources'}</span>
              <ArrowIcon size={14} />
            </a>
          </div>
        </div>
      </div>
    </PortalPage>
  );
};
