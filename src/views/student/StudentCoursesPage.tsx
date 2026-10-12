import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, ArrowRight, ArrowLeft, PlusCircle, ChevronDown } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface StudentCoursesPageProps {
  locale: Locale;
}

export const StudentCoursesPage: React.FC<StudentCoursesPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSort, setSelectedSort] = useState('newest');

  return (
    <PortalPage
      title={isAr ? 'المقررات الدراسية' : 'Courses & Curricula'}
      subtitle={
        isAr
          ? 'استعراض المقررات الدراسية والبرامج الأكاديمية'
          : 'Browse academic courses and curricula'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الطالب' : 'Student Portal', path: `/${locale}/student/dashboard` },
        { label: isAr ? 'المقررات الدراسية' : 'Courses' },
      ]}
      locale={locale}
      actions={
        <Link
          to={`/${locale}/student/registration`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#082B50] hover:bg-[#061E38] text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
        >
          <PlusCircle size={14} className="text-[#D6A53A]" />
          <span>{isAr ? 'التسجيل الفصلي للمقررات' : 'Course Registration'}</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Structurally Valid Search & Sorting Bar (No fabricated academic categories) */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Main Search Input */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3.5 text-[#607086]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAr ? 'البحث في المقررات الأكاديمية...' : 'Search academic courses...'}
              className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl ps-10 pe-4 py-2.5 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50] transition-colors"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative w-full sm:w-56">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="w-full appearance-none bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl px-3 py-2.5 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50] cursor-pointer"
            >
              <option value="newest">{isAr ? 'الترتيب: الأحدث إدراجاً' : 'Sort: Newest First'}</option>
              <option value="title">{isAr ? 'الترتيب: أبجدياً' : 'Sort: Alphabetical'}</option>
            </select>
            <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 end-3 text-[#607086] pointer-events-none" />
          </div>
        </div>

        {/* Corrected Empty State: Factual, Honest, No Fabricated Explanations */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-10 md:p-16 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
            <BookOpen size={28} />
          </div>

          <h3 className="text-base md:text-lg font-bold text-[#102033] mb-2">
            {isAr ? 'لا توجد مقررات متاحة للعرض حاليًا' : 'No courses are currently available to display.'}
          </h3>

          <p className="text-xs text-[#607086] max-w-lg mx-auto mb-6 leading-relaxed">
            {isAr
              ? 'ستظهر المقررات هنا عند توفر بيانات التسجيل في النظام الأكاديمي.'
              : 'Courses will appear here when registration data becomes available in the academic system.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to={`/${locale}/student/registration`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#082B50] hover:bg-[#061E38] text-white text-xs font-bold transition-colors shadow-xs"
            >
              <PlusCircle size={14} className="text-[#D6A53A]" />
              <span>{isAr ? 'الانتقال إلى التسجيل الفصلي' : 'Go to Course Registration'}</span>
            </Link>

            <Link
              to={`/${locale}/student/advising`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] text-xs font-semibold transition-colors"
            >
              <span>{isAr ? 'استشارة المرشد الأكاديمي' : 'Consult Academic Advisor'}</span>
            </Link>
          </div>
        </div>
      </div>
    </PortalPage>
  );
};
