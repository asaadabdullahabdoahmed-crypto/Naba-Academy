import React from 'react';
import { Gift, AlertCircle } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import type { AlumniBenefitItem } from '../../types';

interface AlumniBenefitsPageProps {
  locale: Locale;
}

export const AlumniBenefitsPage: React.FC<AlumniBenefitsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();

  // Domain benefits from backend (empty state when not connected - Rule 14)
  const benefits: AlumniBenefitItem[] = [];

  return (
    <PortalPage
      title={isAr ? 'مزايا وخدمات الخريجين' : 'Alumni Privileges & Services'}
      subtitle={
        isAr
          ? 'المزايا الأكاديمية والخدمات الحصرية المقدمة لأعضاء رابطة خريجي الأكاديمية'
          : 'Institutional services and privileges provided to accredited NABA alumni members'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الخريجين' : 'Alumni Portal', path: `/${locale}/alumni/dashboard` },
        { label: isAr ? 'المزايا والخدمات' : 'Benefits' },
      ]}
      locale={locale}
      actions={
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF3F8] text-[#607086] text-xs font-semibold border border-[#DCE3EB]">
          <AlertCircle size={14} className="text-[#607086]" />
          <span>{isAr ? 'في انتظار ربط الواجهة الخلفية' : 'Pending Backend Integration'}</span>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-[#DCE3EB] shadow-xs overflow-hidden">
          {benefits.length === 0 ? (
            <div className="py-20 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
                <Gift size={26} />
              </div>
              <h4 className="text-sm font-bold text-[#102033] mb-1">
                {isAr ? 'لا توجد مزايا معلنة حالياً' : 'No Active Alumni Privileges on Record'}
              </h4>
              <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed">
                {isAr
                  ? 'ستُدرج المزايا الأكاديمية والشراكات والخدمات الحصرية لخريجي الأكاديمية فور اعتمادها من مجلس الإدارة.'
                  : 'Approved institutional benefits and partnerships for NABA alumni will appear here once authorized.'}
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF3F8] text-[#607086] text-[11px] font-semibold border border-[#DCE3EB]">
                <AlertCircle size={14} className="text-[#607086]" />
                <span>{isAr ? 'في انتظار ربط الواجهة الخلفية' : 'Pending Backend Integration'}</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
              {benefits.map((b, i) => (
                <div key={i} className="p-4 rounded-xl border border-[#DCE3EB] bg-[#EFF3F8]/30 space-y-2">
                  <h3 className="text-sm font-bold text-[#102033]">{b.title}</h3>
                  <p className="text-xs text-[#607086] leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PortalPage>
  );
};
