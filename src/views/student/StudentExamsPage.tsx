import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  ShieldCheck,
  CalendarCheck,
  AlertCircle,
  Calendar,
  ArrowRight,
  ArrowLeft,
  CheckSquare,
  ShieldAlert,
} from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface StudentExamsPageProps {
  locale: Locale;
}

export const StudentExamsPage: React.FC<StudentExamsPageProps> = ({ locale }) => {
  const { examId } = useParams<{ examId?: string }>();
  const { isAr } = useTranslation();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const isDetailView = Boolean(examId);

  return (
    <PortalPage
      title={
        isDetailView
          ? (isAr ? 'تفاصيل الاختبار الأكاديمي' : 'Examination Overview')
          : (isAr ? 'جدول الاختبارات الأكاديمية' : 'Examination Schedule')
      }
      subtitle={
        isDetailView
          ? (isAr
              ? `بيانات وضوابط الاختبار الإلكتروني — ${examId}`
              : `Proctored Examination Guidelines & Overview — ${examId}`)
          : (isAr
              ? 'متابعة مواعيد الاختبارات النصفية والنهائية وضوابط المراقبة الإلكترونية'
              : 'Official midterm and final examination schedule and proctoring rules')
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الطالب' : 'Student Portal', path: `/${locale}/student/dashboard` },
        { label: isAr ? 'الاختبارات' : 'Exams', path: isDetailView ? `/${locale}/student/exams` : undefined },
        ...(isDetailView ? [{ label: examId || (isAr ? 'تفاصيل الاختبار' : 'Exam Details') }] : []),
      ]}
      locale={locale}
      actions={
        isDetailView ? (
          <Link
            to={`/${locale}/student/exams`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            <ArrowIcon size={14} />
            <span>{isAr ? 'العودة لجدول الاختبارات' : 'Back to Exams'}</span>
          </Link>
        ) : (
          <Link
            to={`/${locale}/student/exams/exam-system/precheck`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#082B50] hover:bg-[#061E38] text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            <ShieldCheck size={14} className="text-[#D6A53A]" />
            <span>{isAr ? 'فحص جاهزية النظام' : 'System Pre-Check'}</span>
          </Link>
        )
      }
    >
      <div className="space-y-6">
        {/* Proctored Environment Notice */}
        <div className="p-5 rounded-2xl bg-[#EFF3F8] border border-[#DCE3EB] flex items-start gap-4 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#082B50] text-[#D6A53A] flex items-center justify-center shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-[#082B50]">
              {isAr ? 'ضوابط بيئة الاختبارات الإلكترونية المراقبة' : 'Proctored Examination Regulations'}
            </h3>
            <p className="text-xs text-[#607086] mt-1 leading-relaxed">
              {isAr
                ? 'تتطلب جميع الاختبارات النهائية والنصفيّة اتصالاً مستقرًا بالإنترنت، كاميرا ويب وميكروفون مفعلين، واجتياز الفحص البيئي قبل الدخول.'
                : 'All proctored examinations require an active webcam, working microphone, stable internet connection, and completed pre-check.'}
            </p>
          </div>
        </div>

        {isDetailView ? (
          /* Single Exam Detail Shell */
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 md:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#DCE3EB]">
              <div>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#EFF3F8] text-[#082B50] mb-2 inline-block">
                  {examId}
                </span>
                <h3 className="text-base md:text-lg font-bold text-[#102033]">
                  {isAr ? 'الاختبار الأكاديمي' : 'Academic Examination'}
                </h3>
                <p className="text-xs text-[#607086] mt-1">
                  {isAr ? 'نظام الاختبارات الإلكترونية المراقبة — أكاديمية نبا' : 'NABA Academy Proctored Examination System'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to={`/${locale}/student/exams/${examId}/precheck`}
                  className="px-4 py-2 bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  {isAr ? 'فحص المتطلبات' : 'Run Pre-Check'}
                </Link>
                <Link
                  to={`/${locale}/student/exams/${examId}/attempt`}
                  className="px-4 py-2 bg-[#082B50] hover:bg-[#061E38] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  {isAr ? 'بدء الاختبار' : 'Start Attempt'}
                </Link>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#DCE3EB] text-xs text-[#607086] space-y-2">
              <span className="font-bold text-[#082B50] block">
                {isAr ? 'تعليمات ما قبل بدء الجلسة:' : 'Pre-Exam Instructions:'}
              </span>
              <ul className="list-disc list-inside space-y-1">
                <li>{isAr ? 'التأكد من التواجد في بيئة هادئة ومضاءة جيدًا دون وجود أشخاص آخرين' : 'Ensure you are in a quiet, well-lit environment without other individuals'}</li>
                <li>{isAr ? 'إغلاق كافة التطبيقات والمتصفحات الأخرى قبل بدء مؤقت الاختبار' : 'Close all background applications and secondary tabs before the timer starts'}</li>
                <li>{isAr ? 'لا يُسمح بإيقاف مؤقت الاختبار بعد بدئه' : 'The examination timer cannot be paused once initiated'}</li>
              </ul>
            </div>
          </div>
        ) : (
          /* Main Exams List Empty State */
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-10 md:p-16 text-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
              <CalendarCheck size={28} className="text-[#082B50]" />
            </div>

            <h3 className="text-base md:text-lg font-bold text-[#102033] mb-2">
              {isAr ? 'لا توجد اختبارات مجدولة حاليًا' : 'No examinations currently scheduled'}
            </h3>

            <p className="text-xs text-[#607086] max-w-lg mx-auto mb-6 leading-relaxed">
              {isAr
                ? 'سيتم إعلان جداول الاختبارات الفصلية والنهائية فور اعتماد المواعيد من الشؤون الأكاديمية.'
                : 'Midterm and final examination schedules will be posted here once finalized by Academic Affairs.'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to={`/${locale}/student/exams/exam-system/precheck`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#082B50] hover:bg-[#061E38] text-white text-xs font-bold transition-colors shadow-xs"
              >
                <ShieldCheck size={14} className="text-[#D6A53A]" />
                <span>{isAr ? 'إجراء فحص الجاهزية التجريبي' : 'Run System Pre-Check'}</span>
              </Link>

              <Link
                to={`/${locale}/student/courses`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] text-xs font-semibold transition-colors"
              >
                <span>{isAr ? 'استعراض المقررات' : 'View Courses'}</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </PortalPage>
  );
};
