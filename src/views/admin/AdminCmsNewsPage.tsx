import React, { useState } from 'react';
import { Newspaper, Plus, Search, Filter, AlertCircle } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface AdminCmsNewsItem {
  id: string;
  titleAr: string;
  titleEn: string;
  date: string;
  categoryAr?: string;
  categoryEn?: string;
}

interface AdminCmsNewsPageProps {
  locale: Locale;
}

export const AdminCmsNewsPage: React.FC<AdminCmsNewsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  // Domain articles from backend (empty state when not connected - Rule 5)
  const articles: AdminCmsNewsItem[] = [];

  const filtered = articles.filter(
    (n) =>
      n.titleAr?.includes(searchTerm) ||
      n.titleEn?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PortalPage
      title={isAr ? 'إدارة الأخبار والبيانات الصحفية' : 'Institutional News & Press (CMS)'}
      subtitle={
        isAr
          ? 'نشر وتحرير الأخبار الرسمية للأكاديمية، الإعلانات، وتغطية الفعاليات'
          : 'Publish and curate official institutional announcements and event coverage'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الإدارة' : 'Admin Portal', path: `/${locale}/admin/dashboard` },
        { label: isAr ? 'إدارة المحتوى' : 'CMS' },
        { label: isAr ? 'الأخبار' : 'News' },
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
            title={isAr ? 'يتطلب ربط الواجهة الخلفية لنشر الأخبار' : 'Requires backend connection to publish news'}
          >
            <Plus size={14} />
            <span>{isAr ? 'إضافة خبر جديد' : 'New Article'}</span>
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
              placeholder={isAr ? 'البحث في عناوين الأخبار والمقالات...' : 'Search news titles and content...'}
              className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-xl ps-9 pe-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#174F89]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={14} className="text-[#607086]" />
            <select
              aria-label={isAr ? 'التصنيف' : 'Category'}
              className="bg-[#EFF3F8] border border-[#DCE3EB] rounded-xl px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden"
              defaultValue="all"
            >
              <option value="all">{isAr ? 'كافة التصنيفات' : 'All Categories'}</option>
              <option value="academic">{isAr ? 'أكاديمي' : 'Academic'}</option>
              <option value="events">{isAr ? 'فعاليات' : 'Events'}</option>
            </select>
          </div>
        </div>

        {/* Content / Empty State */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] shadow-xs overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-20 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
                <Newspaper size={26} />
              </div>
              <h4 className="text-sm font-bold text-[#102033] mb-1">
                {isAr ? 'لا توجد أخبار أو بيانات صحفية منشورة حالياً' : 'No Published News Articles'}
              </h4>
              <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed">
                {isAr
                  ? 'ستظهر الأخبار والبيانات الصحفية هنا عند إضافتها واعتمادها عبر خادم إدارة المحتوى.'
                  : 'Official announcements and news articles will appear here once published via the backend CMS.'}
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF3F8] text-[#607086] text-[11px] font-semibold border border-[#DCE3EB]">
                <AlertCircle size={14} className="text-[#607086]" />
                <span>{isAr ? 'في انتظار ربط الواجهة الخلفية' : 'Pending Backend Integration'}</span>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#DCE3EB]">
              {filtered.map((n) => (
                <div key={n.id} className="p-5 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#102033]">{isAr ? n.titleAr : n.titleEn}</h4>
                    <p className="text-xs text-[#607086] mt-0.5">{n.date}</p>
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
