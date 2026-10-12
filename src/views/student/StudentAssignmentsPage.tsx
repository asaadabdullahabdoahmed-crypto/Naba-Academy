import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  Calendar,
  BookOpen,
} from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface StudentAssignmentsPageProps {
  locale: Locale;
}

export const StudentAssignmentsPage: React.FC<StudentAssignmentsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'submitted'>('all');

  return (
    <PortalPage
      title={isAr ? 'التكليفات والواجبات الأكاديمية' : 'Assignments & Coursework'}
      subtitle={
        isAr
          ? 'متابعة الواجبات الدراسية، تسليم التكليفات، ومراجعة التقييمات'
          : 'Track academic coursework, submit assignments, and review grades'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الطالب' : 'Student Portal', path: `/${locale}/student/dashboard` },
        { label: isAr ? 'التكليفات والواجبات' : 'Assignments' },
      ]}
      locale={locale}
      actions={
        <Link
          to={`/${locale}/student/courses`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#082B50] hover:bg-[#061E38] text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
        >
          <BookOpen size={14} className="text-[#D6A53A]" />
          <span>{isAr ? 'المقررات الدراسية' : 'My Courses'}</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3.5 text-[#607086]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAr ? 'البحث في عناوين التكليفات أو المقررات...' : 'Search assignments or courses...'}
              className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl ps-10 pe-4 py-2.5 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="inline-flex p-1 bg-[#F7F9FC] rounded-xl border border-[#DCE3EB] text-xs">
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  filterStatus === 'all'
                    ? 'bg-[#082B50] text-white shadow-xs'
                    : 'text-[#607086] hover:text-[#102033]'
                }`}
              >
                {isAr ? 'الكل' : 'All'}
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('pending')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  filterStatus === 'pending'
                    ? 'bg-[#082B50] text-white shadow-xs'
                    : 'text-[#607086] hover:text-[#102033]'
                }`}
              >
                {isAr ? 'قيد التسليم' : 'Pending'}
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('submitted')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  filterStatus === 'submitted'
                    ? 'bg-[#082B50] text-white shadow-xs'
                    : 'text-[#607086] hover:text-[#102033]'
                }`}
              >
                {isAr ? 'تم التسليم' : 'Submitted'}
              </button>
            </div>
          </div>
        </div>

        {/* Factual Academic Empty State */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-10 md:p-16 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
            <ClipboardList size={28} className="text-[#082B50]" />
          </div>

          <h3 className="text-base md:text-lg font-bold text-[#102033] mb-2">
            {isAr ? 'لا توجد تكليفات أو واجبات مستحقة حالياً' : 'No assignments or coursework due at this time'}
          </h3>

          <p className="text-xs text-[#607086] max-w-lg mx-auto mb-6 leading-relaxed">
            {isAr
              ? 'ستظهر هنا الواجبات والمشاريع المحددة مع مواعيد التسليم ودرجات التقييم فور اعتمادها ونشرها من قبل أساتذة المقررات.'
              : 'Coursework tasks, submission deadlines, and evaluation marks will appear here once published by course instructors.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to={`/${locale}/student/courses`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#082B50] hover:bg-[#061E38] text-white text-xs font-bold transition-colors shadow-xs"
            >
              <span>{isAr ? 'استعراض المقررات' : 'Go to Courses'}</span>
              <ArrowIcon size={14} />
            </Link>

            <Link
              to={`/${locale}/student/grades`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] text-xs font-semibold transition-colors"
            >
              <CheckCircle2 size={14} />
              <span>{isAr ? 'سجل الدرجات والتقييم' : 'View Grades Record'}</span>
            </Link>
          </div>
        </div>
      </div>
    </PortalPage>
  );
};
