import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  HelpCircle,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CalendarCheck,
} from 'lucide-react';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import { NabaLogo } from '../../components/common/NabaLogo';

interface StudentExamAttemptPageProps {
  locale: Locale;
}

export const StudentExamAttemptPage: React.FC<StudentExamAttemptPageProps> = ({ locale }) => {
  const { examId } = useParams<{ examId: string }>();
  const { isAr } = useTranslation();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#102033] flex flex-col font-sans select-none">
      {/* Secure Exam Topbar Shell */}
      <header className="bg-[#061E38] text-white border-b border-[#082B50] px-4 md:px-6 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <NabaLogo variant="light" size="sm" showSubtitle={false} />
            <div className="hidden sm:block border-s border-white/20 ps-3">
              <span className="text-xs font-bold text-white block">
                {isAr ? 'جلسة الاختبار الأكاديمي' : 'Academic Examination Session'}
              </span>
              <span className="text-[10px] text-[#D6A53A] font-mono">
                {examId || 'EXAM-SESSION'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-white/80">
              <ShieldCheck size={14} className="text-[#D6A53A]" />
              <span className="text-[11px] font-bold">
                {isAr ? 'بوابة الاختبارات الإلكترونية' : 'Digital Examination Portal'}
              </span>
            </div>

            <Link
              to={`/${locale}/student/exams`}
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              <span>{isAr ? 'العودة للاختبارات' : 'Back to Exams'}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Examination Workspace Shell */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 flex items-center justify-center">
        <div className="w-full bg-white rounded-2xl border border-[#DCE3EB] p-10 md:p-16 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
            <HelpCircle size={32} className="text-[#082B50]" />
          </div>

          {/* Exact required messaging */}
          <h2 className="text-lg md:text-xl font-bold text-[#102033] mb-2">
            {isAr ? 'لا تتوفر بيانات الاختبار حاليًا.' : 'Exam data is currently unavailable.'}
          </h2>

          <p className="text-xs text-[#607086] max-w-md mx-auto mb-6 leading-relaxed">
            {isAr
              ? 'لم يتم تحميل نماذج الأسئلة من الخادم الأكاديمي أو لم تبدأ الجلسة المجدولة للاختبار بعد.'
              : 'Examination question items could not be loaded from the academic backend or the scheduled session has not commenced.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to={`/${locale}/student/exams`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#082B50] hover:bg-[#061E38] text-white text-xs font-bold transition-colors shadow-xs"
            >
              <span>{isAr ? 'العودة إلى جدول الاختبارات' : 'Return to Exam Schedule'}</span>
              <ArrowIcon size={14} />
            </Link>

            <Link
              to={`/${locale}/student/dashboard`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] text-xs font-semibold transition-colors"
            >
              <CalendarCheck size={14} />
              <span>{isAr ? 'لوحة التحكم الرئيسية' : 'Student Dashboard'}</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
