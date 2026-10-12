import React from 'react';
import { Link } from 'react-router-dom';
import { Printer, Download, ShieldCheck, FileText, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import { useToast } from '../../components/ui/toast';
import { NabaLogo } from '../../components/common/NabaLogo';

interface StudentTranscriptPageProps {
  locale: Locale;
}

export const StudentTranscriptPage: React.FC<StudentTranscriptPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const { toast } = useToast();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const handlePrint = () => {
    toast.info(
      isAr
        ? 'جاري تجهيز مستند السجل الأكاديمي الرسمي للطباعة'
        : 'Preparing official academic transcript document for print'
    );
  };

  const handleDownloadPdf = () => {
    toast.info(
      isAr
        ? 'تصدير نسخة السجل الأكاديمي يتطلب ربط نظام شؤون الطلاب'
        : 'Transcript export requires connection to student records backend service'
    );
  };

  return (
    <PortalPage
      title={isAr ? 'السجل الأكاديمي الشامل (كشف الدرجات)' : 'Academic Transcript'}
      subtitle={
        isAr
          ? 'السجل الأكاديمي الرقمي للمقررات والمعدل التراكمي'
          : 'Digital academic transcript of coursework and cumulative GPA'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الطالب' : 'Student Portal', path: `/${locale}/student/dashboard` },
        { label: isAr ? 'السجل والدرجات' : 'Grades', path: `/${locale}/student/grades` },
        { label: isAr ? 'السجل الأكاديمي' : 'Transcript' },
      ]}
      locale={locale}
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <Printer size={14} />
            <span>{isAr ? 'طباعة' : 'Print'}</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#082B50] hover:bg-[#061E38] text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            <Download size={14} className="text-[#D6A53A]" />
            <span>{isAr ? 'تحميل نسخة رقمية' : 'Export Copy'}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Official Institutional Verification Banner */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <NabaLogo variant="dark" size="md" showText={false} />
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EFF3F8] text-[#082B50] text-[11px] font-bold mb-1 border border-[#DCE3EB]">
                <ShieldCheck size={13} className="text-[#D6A53A]" />
                <span>{isAr ? 'سجل أكاديمي إلكتروني' : 'Digital Academic Record'}</span>
              </div>
              <h2 className="text-base font-bold text-[#102033]">
                {isAr ? 'أكاديمية نبا' : 'NABA Academy'}
              </h2>
              <p className="text-xs text-[#607086] mt-0.5">
                {isAr ? 'نظام السجلات والدرجات الأكاديمية' : 'Academic Registry & Student Records'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-[#607086] border-t md:border-t-0 md:border-s border-[#DCE3EB] pt-4 md:pt-0 md:ps-6">
            <div>
              <span className="block text-[11px] text-[#607086]">{isAr ? 'المعدل التراكمي العام:' : 'Cumulative GPA:'}</span>
              <span className="text-base font-black text-[#082B50] font-mono">—</span>
            </div>
            <div>
              <span className="block text-[11px] text-[#607086]">{isAr ? 'الساعات المعتمدة:' : 'Earned Credits:'}</span>
              <span className="text-base font-black text-[#082B50] font-mono">—</span>
            </div>
          </div>
        </div>

        {/* Factual Academic Empty State */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-10 md:p-16 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
            <FileText size={28} className="text-[#082B50]" />
          </div>

          <h3 className="text-base md:text-lg font-bold text-[#102033] mb-2">
            {isAr ? 'لا توجد فصول دراسية منتهية وموثقة في السجل حالياً' : 'No finalized semester records on transcript currently'}
          </h3>

          <p className="text-xs text-[#607086] max-w-lg mx-auto mb-6 leading-relaxed">
            {isAr
              ? 'يتم إصدار السجل الأكاديمي التراكمي وتحديث الدرجات تلقائيًا بعد اختتام الاختبارات النهائية للفصل الدراسي وتدقيق النتائج رسميًا.'
              : 'Cumulative transcript records and earned credits are updated automatically following final semester grade closure and official verification.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to={`/${locale}/student/courses`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#082B50] hover:bg-[#061E38] text-white text-xs font-bold transition-colors shadow-xs"
            >
              <span>{isAr ? 'الانتقال إلى المقررات الدراسية' : 'View Current Courses'}</span>
              <ArrowIcon size={14} />
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
