import React from 'react';
import { Image, Plus, AlertCircle } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import type { CmsBannerItem } from '../../types';

interface AdminCmsBannersPageProps {
  locale: Locale;
}

export const AdminCmsBannersPage: React.FC<AdminCmsBannersPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();

  // Domain banners from backend (empty state when not connected - Rule 5)
  const banners: CmsBannerItem[] = [];

  return (
    <PortalPage
      title={isAr ? 'إدارة اللوحات الإعلانية والشاشات الرئيسية' : 'Hero Banners & Announcements (CMS)'}
      subtitle={
        isAr
          ? 'إدارة البنرات الترويجية، الإعلانات الإرشادية، ورسائل التنبيه على البوابات'
          : 'Manage homepage banners, advisory announcements, and portal alerts'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الإدارة' : 'Admin Portal', path: `/${locale}/admin/dashboard` },
        { label: isAr ? 'إدارة المحتوى' : 'CMS' },
        { label: isAr ? 'اللوحات الإعلانية' : 'Banners' },
      ]}
      locale={locale}
      actions={
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF3F8] text-[#607086] text-xs font-semibold border border-[#DCE3EB]">
            <AlertCircle size={14} className="text-[#607086]" />
            <span>{isAr ? 'في انتظار ربط الواجهة الخلفية' : 'Pending Backend Integration'}</span>
          </div>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#DCE3EB] text-[#607086] cursor-not-allowed rounded-lg text-xs font-bold transition-colors"
            title={isAr ? 'يتطلب ربط الواجهة الخلفية لإضافة البنرات' : 'Requires backend connection to add banner'}
          >
            <Plus size={14} />
            <span>{isAr ? 'إضافة بنر إعلاني' : 'Add Banner'}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-[#DCE3EB] shadow-xs overflow-hidden">
          {banners.length === 0 ? (
            <div className="py-20 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
                <Image size={26} />
              </div>
              <h4 className="text-sm font-bold text-[#102033] mb-1">
                {isAr ? 'لا توجد بنرات إعلانية نشطة حالياً' : 'No Active Promotional Banners'}
              </h4>
              <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed">
                {isAr
                  ? 'ستظهر اللوحات الإعلانية والبنرات هنا عند إضافتها عبر خادم إدارة المحتوى.'
                  : 'Banners and promotional alerts will display here once scheduled via the backend CMS.'}
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF3F8] text-[#607086] text-[11px] font-semibold border border-[#DCE3EB]">
                <AlertCircle size={14} className="text-[#607086]" />
                <span>{isAr ? 'في انتظار ربط الواجهة الخلفية' : 'Pending Backend Integration'}</span>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#DCE3EB]">
              {banners.map((b, i) => (
                <div key={i} className="p-5 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#102033]">{b.title}</h4>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PortalPage>
  );
};
