import React, { useState } from 'react';
import { FileText, Plus, Search, Filter, AlertCircle } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface AdminCmsPageItem {
  id: string;
  titleAr: string;
  titleEn: string;
  path: string;
  updatedAt: string;
}

interface AdminCmsPagesPageProps {
  locale: Locale;
}

export const AdminCmsPagesPage: React.FC<AdminCmsPagesPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  // Domain static pages from backend (empty state when not connected - Rule 5)
  const pages: AdminCmsPageItem[] = [];

  const filtered = pages.filter(
    (p) =>
      p.titleAr?.includes(searchTerm) ||
      p.titleEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.path?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PortalPage
      title={isAr ? 'إدارة الصفحات التعريفية والسياسات' : 'Static Pages & Policies (CMS)'}
      subtitle={
        isAr
          ? 'إدارة محتوى الصفحات التعريفية، السياسات، وشروط الاستخدام'
          : 'Manage institutional informational pages, legal charters, and static content'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الإدارة' : 'Admin Portal', path: `/${locale}/admin/dashboard` },
        { label: isAr ? 'إدارة المحتوى' : 'CMS' },
        { label: isAr ? 'الصفحات الثابتة' : 'Static Pages' },
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
            title={isAr ? 'يتطلب ربط الواجهة الخلفية لإنشاء الصفحات' : 'Requires backend connection to create pages'}
          >
            <Plus size={14} />
            <span>{isAr ? 'إضافة صفحة جديدة' : 'New Page'}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Search Header */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-[#607086]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAr ? 'البحث في عناوين الصفحات أو المسار...' : 'Search page titles or paths...'}
              className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-xl ps-9 pe-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#174F89]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={14} className="text-[#607086]" />
            <select
              aria-label={isAr ? 'الحالة' : 'Status'}
              className="bg-[#EFF3F8] border border-[#DCE3EB] rounded-xl px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden"
              defaultValue="all"
            >
              <option value="all">{isAr ? 'كافة الحالات' : 'All Statuses'}</option>
            </select>
          </div>
        </div>

        {/* Content / Empty State */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] shadow-xs overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-20 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
                <FileText size={26} />
              </div>
              <h4 className="text-sm font-bold text-[#102033] mb-1">
                {isAr ? 'لا توجد صفحات ثابتة مسجلة حالياً' : 'No Static Pages Registered'}
              </h4>
              <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed">
                {isAr
                  ? 'ستظهر الصفحات التعريفية واللوائح التنظيمية هنا عند إضافتها وربطها بالواجهة الخلفية.'
                  : 'Institutional static pages and policies will appear here once connected to the backend repository.'}
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF3F8] text-[#607086] text-[11px] font-semibold border border-[#DCE3EB]">
                <AlertCircle size={14} className="text-[#607086]" />
                <span>{isAr ? 'في انتظار ربط الواجهة الخلفية' : 'Pending Backend Integration'}</span>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#DCE3EB]">
              {filtered.map((p) => (
                <div key={p.id} className="p-5 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#102033]">{isAr ? p.titleAr : p.titleEn}</h4>
                    <span className="text-xs text-[#607086] font-mono">{p.path}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PortalPage>
  );
};
