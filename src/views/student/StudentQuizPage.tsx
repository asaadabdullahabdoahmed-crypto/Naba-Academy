import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  Award,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  HelpCircle,
  BookOpen,
  Layers,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface StudentQuizPageProps {
  locale: Locale;
}

export const StudentQuizPage: React.FC<StudentQuizPageProps> = ({ locale }) => {
  const { courseId, lessonId } = useParams<{ courseId?: string; lessonId?: string }>();
  const { isAr } = useTranslation();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const displayCourseCode = courseId ? courseId.toUpperCase() : (isAr ? 'المقرر الدراسي' : 'Academic Course');

  return (
    <PortalPage
      title={isAr ? 'الاختبار القصير للمقرر' : 'Module Assessment Quiz'}
      subtitle={
        isAr
          ? `تقييم الاستيعاب والفهم الأكاديمي — ${displayCourseCode}`
          : `Comprehension and Academic Evaluation — ${displayCourseCode}`
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الطالب' : 'Student Portal', path: `/${locale}/student/dashboard` },
        { label: isAr ? 'المقررات الدراسية' : 'Courses', path: `/${locale}/student/courses` },
        {
          label: displayCourseCode,
          path: courseId ? `/${locale}/student/courses/${courseId}` : `/${locale}/student/courses`,
        },
        { label: isAr ? 'الاختبار القصير' : 'Quiz' },
      ]}
      locale={locale}
      actions={
        <Link
          to={courseId ? `/${locale}/student/courses/${courseId}` : `/${locale}/student/courses`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] rounded-lg text-xs font-bold transition-colors"
        >
          <ArrowIcon size={14} />
          <span>{isAr ? 'العودة للمقرر' : 'Back to Course'}</span>
        </Link>
      }
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Academic Assessment Guidelines Shell */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center shrink-0 border border-[#DCE3EB]">
              <ShieldCheck size={24} className="text-[#D6A53A]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#EFF3F8] text-[#082B50]">
                  {displayCourseCode}
                </span>
                <span className="text-[11px] text-[#607086]">
                  {isAr ? 'نظام التقييم والواجبات الإلكترونية' : 'Digital Assessment System'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#102033]">
                {isAr ? 'ضوابط الاختبارات الدورية القصيرة' : 'Quiz & Assessment Regulations'}
              </h3>
              <p className="text-xs text-[#607086] mt-1 leading-relaxed">
                {isAr
                  ? 'تُجرى الاختبارات القصيرة إلكترونيًا لقياس فهم المحاضرات والوحدات الدراسية. تُحتسب الدرجات فور اعتماد مدرس المقرر للاختبار.'
                  : 'Quizzes evaluate module comprehension and are scored automatically in accordance with course syllabus specifications.'}
              </p>
            </div>
          </div>
        </div>

        {/* Honest, Factual Empty State (No Fabricated Questions) */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-10 md:p-14 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
            <HelpCircle size={30} className="text-[#082B50]" />
          </div>

          <h3 className="text-base font-bold text-[#102033] mb-2">
            {isAr ? 'لا يوجد اختبار قصير متاح حاليًا' : 'No quiz is currently available for this module'}
          </h3>

          <p className="text-xs text-[#607086] max-w-md mx-auto mb-6 leading-relaxed">
            {isAr
              ? 'سيتم تفعيل الاختبار القصير تلقائيًا بمجرد إتاحته من أستاذ المقرر وفق الخطة الزمنية للمنهج.'
              : 'The quiz will be automatically enabled once published by the course instructor per syllabus schedule.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to={courseId ? `/${locale}/student/courses/${courseId}` : `/${locale}/student/courses`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#082B50] hover:bg-[#061E38] text-white text-xs font-bold transition-colors shadow-xs"
            >
              <span>{isAr ? 'العودة إلى محتوى المقرر' : 'Return to Course Content'}</span>
            </Link>

            <Link
              to={`/${locale}/student/schedule`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] text-xs font-semibold transition-colors"
            >
              <Clock size={14} />
              <span>{isAr ? 'مراجعة التقويم الدراسي' : 'Review Academic Calendar'}</span>
            </Link>
          </div>
        </div>
      </div>
    </PortalPage>
  );
};
