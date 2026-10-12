import React from 'react';
import { Link } from 'react-router-dom';
import { Award, FileText, CheckCircle2, ChevronRight, ChevronLeft, ArrowRight, ArrowLeft, Clock, ShieldCheck } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface StudentGradesPageProps {
  locale: Locale;
}

export const StudentGradesPage: React.FC<StudentGradesPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <PortalPage
      title={isAr ? 'السجل والدرجات الأكاديمية' : 'Course Grades & Evaluations'}
      subtitle={
        isAr
          ? 'استعراض درجات أعمال السنة، الاختبارات الفصلية، والمعدل التراكمي'
          : 'Review coursework scores, term assessments, and cumulative evaluations'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الطالب' : 'Student Portal', path: `/${locale}/student/dashboard` },
        { label: isAr ? 'السجل والدرجات' : 'Grades' },
      ]}
      locale={locale}
      actions={
        <Link
          to={`/${locale}/student/transcript`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#082B50] hover:bg-[#061E38] text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
        >
          <FileText size={14} className="text-[#D6A53A]" />
          <span>{isAr ? 'السجل الأكاديمي الشامل' : 'Official Transcript'}</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* GPA & Assessment Status Shell (Honest, factual data indicators) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 text-center shadow-xs">
            <span className="text-xs text-[#607086] font-medium block">
              {isAr ? 'المعدل الفصلي الحالي' : 'Current Term GPA'}
            </span>
            <div className="text-2xl font-black text-[#082B50] mt-1 font-mono">
              —
            </div>
            <span className="text-[11px] text-[#607086] mt-1 block">
              {isAr ? 'بانتظار رصد درجات الفصل' : 'Awaiting term grade finalization'}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 text-center shadow-xs">
            <span className="text-xs text-[#607086] font-medium block">
              {isAr ? 'المعدل التراكمي العام' : 'Cumulative GPA'}
            </span>
            <div className="text-2xl font-black text-[#082B50] mt-1 font-mono">
              —
            </div>
            <span className="text-[11px] text-[#607086] mt-1 block">
              {isAr ? 'حسب السجل الأكاديمي' : 'Per academic record'}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 text-center shadow-xs">
            <span className="text-xs text-[#607086] font-medium block">
              {isAr ? 'الساعات المعتمدة المجتازة' : 'Earned Credit Hours'}
            </span>
            <div className="text-2xl font-black text-[#082B50] mt-1 font-mono">
              —
            </div>
            <span className="text-[11px] text-[#607086] mt-1 block">
              {isAr ? 'حسب الخطة الدراسية' : 'Per study plan'}
            </span>
          </div>
        </div>

        {/* Course Grades Breakdown Factual Empty State */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-10 md:p-16 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
            <Award size={28} className="text-[#082B50]" />
          </div>

          <h3 className="text-base md:text-lg font-bold text-[#102033] mb-2">
            {isAr ? 'لا توجد درجات مرصودة لهذا الفصل الدراسي حالياً' : 'No grades recorded for this term currently'}
          </h3>

          <p className="text-xs text-[#607086] max-w-lg mx-auto mb-6 leading-relaxed">
            {isAr
              ? 'تُعلن الدرجات وتفاصيل أعمال السنة والاختبارات الفصلية فور تدقيقها واعتمادها من مجلس القسم الأكاديمي ولجنة الرصد.'
              : 'Grades, coursework marks, and final exam results will appear here once verified and approved by the academic department board.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to={`/${locale}/student/transcript`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#082B50] hover:bg-[#061E38] text-white text-xs font-bold transition-colors shadow-xs"
            >
              <FileText size={14} className="text-[#D6A53A]" />
              <span>{isAr ? 'استعراض السجل الأكاديمي' : 'View Academic Transcript'}</span>
            </Link>

            <Link
              to={`/${locale}/student/courses`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] text-xs font-semibold transition-colors"
            >
              <span>{isAr ? 'المقررات الدراسية المسجلة' : 'Registered Courses'}</span>
              <ArrowIcon size={14} />
            </Link>
          </div>
        </div>
      </div>
    </PortalPage>
  );
};
