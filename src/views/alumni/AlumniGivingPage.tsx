import React from 'react';
import { Heart, Info, AlertCircle, Building2 } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface AlumniGivingPageProps {
  locale: Locale;
}

export const AlumniGivingPage: React.FC<AlumniGivingPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();

  return (
    <PortalPage
      title={isAr ? 'المبادرات والوقف التعليمي' : 'Educational Endowment & Initiatives'}
      subtitle={
        isAr
          ? 'المبادرات المؤسسية لدعم البرامج التعليمية والمنح الأكاديمية للأكاديمية'
          : 'Institutional initiatives supporting academic programs and student endowments'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الخريجين' : 'Alumni Portal', path: `/${locale}/alumni/dashboard` },
        { label: isAr ? 'المبادرات والوقف' : 'Endowment' },
      ]}
      locale={locale}
      actions={
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF3F8] text-[#607086] text-xs font-semibold border border-[#DCE3EB]">
          <Info size={14} className="text-[#082B50]" />
          <span>{isAr ? 'معلومات مؤسسية' : 'Institutional Information'}</span>
        </div>
      }
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Informational State (No Payment / Donation Simulation - Rule 15) */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-[#DCE3EB]">
            <div className="w-12 h-12 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center shrink-0">
              <Building2 size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#102033]">
                {isAr ? 'صندوق الوقف والمبادرات التعليمية' : 'Educational Endowment & Community Fund'}
              </h3>
              <p className="text-xs text-[#607086] mt-0.5">
                {isAr
                  ? 'برنامج دعم المنح الأكاديمية ورعاية الطلبة المتميزين'
                  : 'Institutional framework supporting student scholarships and academic excellence'}
              </p>
            </div>
          </div>

          <div className="py-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
              <Heart size={26} />
            </div>
            <h4 className="text-sm font-bold text-[#102033] mb-1">
              {isAr ? 'قنوات المساهمة قيد التهيئة المؤسسية' : 'Endowment Contribution Channels Under Setup'}
            </h4>
            <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed">
              {isAr
                ? 'تخضع برامج الوقف والمساهمات التعليمية للضوابط المالية الرسمية وتعتمد مباشرة عبر إدارة الشؤون المالية عند اكتمال الربط المالي المعتمد.'
                : 'Educational endowment initiatives operate under strict institutional governance and activate once the financial payment gateway is fully configured.'}
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF3F8] text-[#607086] text-[11px] font-semibold border border-[#DCE3EB]">
              <AlertCircle size={14} className="text-[#607086]" />
              <span>{isAr ? 'بوابة الدفع غير مهيأة حالياً' : 'Payment Gateway Currently Inactive'}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#DCE3EB] text-center text-xs text-[#607086]">
            <span>
              {isAr
                ? 'للاستفسار حول المبادرات الوقفية، يرجى التواصل مع إدارة تنمية الموارد المالية والمجتمعية.'
                : 'For endowment inquiries, please contact the Institutional Development and Community Office.'}
            </span>
          </div>
        </div>
      </div>
    </PortalPage>
  );
};
