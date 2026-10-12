import React from 'react';
import { Award, AlertCircle, Search, QrCode } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface AlumniVerificationPageProps {
  locale: Locale;
}

export const AlumniVerificationPage: React.FC<AlumniVerificationPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();

  return (
    <PortalPage
      title={isAr ? 'الشهادة الجدارية والتحقق الرقمي' : 'Degree Certificate & Verification'}
      subtitle={
        isAr
          ? 'التحقق الرسمي من صحة الشهادات الجدارية والوثائق الأكاديمية المعتمدة'
          : 'Official verification of degree credentials and verified graduation documents'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الخريجين' : 'Alumni Portal', path: `/${locale}/alumni/dashboard` },
        { label: isAr ? 'الشهادة الجدارية' : 'Degree Certificate' },
      ]}
      locale={locale}
      actions={
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF3F8] text-[#607086] text-xs font-semibold border border-[#DCE3EB]">
          <AlertCircle size={14} className="text-[#607086]" />
          <span>{isAr ? 'في انتظار ربط الواجهة الخلفية' : 'Pending Backend Integration'}</span>
        </div>
      }
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Certificate Query Box */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-[#607086]" />
            <input
              type="text"
              disabled
              placeholder={isAr ? 'إدخال رقم الوثيقة أو رمز التحقق...' : 'Enter certificate number or verification hash...'}
              className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-xl ps-9 pe-3 py-2 text-xs text-[#607086] cursor-not-allowed"
            />
          </div>
          <button
            type="button"
            disabled
            className="px-4 py-2 bg-[#DCE3EB] text-[#607086] cursor-not-allowed rounded-xl text-xs font-bold transition-colors w-full sm:w-auto shrink-0"
            title={isAr ? 'يتطلب ربط الواجهة الخلفية للتحقق من الوثائق' : 'Requires backend connection to verify credentials'}
          >
            {isAr ? 'التحقق من الوثيقة' : 'Verify Credential'}
          </button>
        </div>

        {/* Honest Institutional Empty State */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-10 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
            <Award size={32} />
          </div>
          <h4 className="text-base font-bold text-[#102033] mb-1.5">
            {isAr ? 'لا توجد وثيقة جدارية مسجلة حالياً' : 'No Degree Certificate on Record'}
          </h4>
          <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed">
            {isAr
              ? 'يتم إصدار الشهادة الجدارية الرسمية وتفعيل رمز التحقق فور اعتماد قرار منح الدرجة العلمية واسترجاع بيانات السجل من الخادم المركزي.'
              : 'Official degree certificates and digital verification codes activate upon graduation approval and record retrieval from the central backend.'}
          </p>
          <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF3F8] text-[#607086] text-[11px] font-semibold border border-[#DCE3EB]">
            <AlertCircle size={14} className="text-[#607086]" />
            <span>{isAr ? 'في انتظار ربط الواجهة الخلفية' : 'Pending Backend Integration'}</span>
          </div>
        </div>
      </div>
    </PortalPage>
  );
};
