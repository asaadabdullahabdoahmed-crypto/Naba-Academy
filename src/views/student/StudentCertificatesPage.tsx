import React, { useState } from 'react';
import { Award, Download, Eye, ShieldCheck, PlusCircle, FileText, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import { useToast } from '../../components/ui/toast';

interface StudentCertificatesPageProps {
  locale: Locale;
}

export const StudentCertificatesPage: React.FC<StudentCertificatesPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const { toast } = useToast();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [docType, setDocType] = useState('enrollment');

  const handleRequestDocument = (e: React.FormEvent) => {
    e.preventDefault();
    setShowRequestModal(false);
    toast.info(
      isAr
        ? 'خدمة استخراج الوثائق الرسمية تتطلب ربط نظام شؤون الطلاب وقاعدة البيانات'
        : 'Official academic document request requires connection to student affairs backend service'
    );
  };

  return (
    <PortalPage
      title={isAr ? 'الوثائق والشهادات الأكاديمية' : 'Certificates & Documents'}
      subtitle={
        isAr
          ? 'استخراج الإفادات الدراسية، شهادات إثبات القيد، والوثائق الأكاديمية'
          : 'Download enrollment letters, academic records, and achievement certificates'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الطالب' : 'Student Portal', path: `/${locale}/student/dashboard` },
        { label: isAr ? 'الوثائق والشهادات' : 'Certificates' },
      ]}
      locale={locale}
      actions={
        <button
          type="button"
          onClick={() => setShowRequestModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#082B50] hover:bg-[#061E38] text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
        >
          <PlusCircle size={14} className="text-[#D6A53A]" />
          <span>{isAr ? 'طلب إفادة أو وثيقة جديدة' : 'Request New Document'}</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Verification System Notice */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center shrink-0 border border-[#DCE3EB]">
            <ShieldCheck size={22} className="text-[#D6A53A]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#102033]">
              {isAr ? 'منظومة التحقق الرقمي للوثائق الأكاديمية' : 'Digital Verification System'}
            </h3>
            <p className="text-xs text-[#607086] mt-1 leading-relaxed">
              {isAr
                ? 'تصدر جميع الوثائق والإفادات الأكاديمية الصادرة من أكاديمية نبا بتوقيع إلكتروني ورمز استجابة سريعة (QR) للتحقق الفوري من صحة البيانات.'
                : 'All documents and enrollment certificates issued by NABA Academy feature secure digital signatures and verifiable QR codes for instant validation.'}
            </p>
          </div>
        </div>

        {/* Factual Academic Empty State */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-10 md:p-16 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
            <Award size={28} className="text-[#082B50]" />
          </div>

          <h3 className="text-base md:text-lg font-bold text-[#102033] mb-2">
            {isAr ? 'لا توجد وثائق أو إفادات صادرة حالياً' : 'No documents or certificates issued yet'}
          </h3>

          <p className="text-xs text-[#607086] max-w-lg mx-auto mb-6 leading-relaxed">
            {isAr
              ? 'يمكنك التقدم بطلب إصدار إفادة قيد دراسي، تعريف طالب، أو كشف درجات إلكتروني من خلال زر طلب وثيقة جديدة.'
              : 'You can submit an official request for proof of enrollment, student identification letter, or transcripts via the action above.'}
          </p>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setShowRequestModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#082B50] hover:bg-[#061E38] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <PlusCircle size={14} className="text-[#D6A53A]" />
              <span>{isAr ? 'طلب إفادة دراسية إلكترونية' : 'Request Electronic Certificate'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Document Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-[#DCE3EB] shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto">
              <FileText size={24} className="text-[#D6A53A]" />
            </div>

            <h3 className="text-base font-bold text-center text-[#102033]">
              {isAr ? 'طلب وثيقة أو إفادة أكاديمية' : 'Request Academic Document'}
            </h3>

            <form onSubmit={handleRequestDocument} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#102033] mb-1.5">
                  {isAr ? 'نوع الوثيقة المطلوبة' : 'Document Type'}
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl px-3.5 py-2.5 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50] cursor-pointer"
                >
                  <option value="enrollment">{isAr ? 'شهادة إثبات قيد وانتظام دراسي' : 'Proof of Enrollment Certificate'}</option>
                  <option value="official_letter">{isAr ? 'خطاب تعريف رسمي موجه لجهة' : 'Official Student Identification Letter'}</option>
                  <option value="transcript_copy">{isAr ? 'نسخة رسمية من السجل الأكاديمي' : 'Official Academic Transcript Copy'}</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#DCE3EB] text-[#102033] text-xs font-bold hover:bg-[#F7F9FC] transition-colors cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#082B50] hover:bg-[#061E38] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  {isAr ? 'تقديم الطلب' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalPage>
  );
};
