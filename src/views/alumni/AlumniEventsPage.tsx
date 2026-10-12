import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, Bell, Search, Filter, AlertCircle } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import type { AlumniEventItem } from '../../types';

interface AlumniEventsPageProps {
  locale: Locale;
}

export const AlumniEventsPage: React.FC<AlumniEventsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const location = useLocation();

  const isAnnouncementsView = location.pathname.includes('/alumni/announcements');
  const [searchTerm, setSearchTerm] = useState('');

  // Domain events from backend (empty state when not connected - Rule 9 & 10)
  const events: AlumniEventItem[] = [];

  const filtered = events.filter((e) =>
    e.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pageTitle = isAnnouncementsView
    ? (isAr ? 'أخبار وإعلانات الخريجين' : 'Alumni Announcements & Notices')
    : (isAr ? 'ملتقيات وفعاليات الخريجين' : 'Alumni Events & Gatherings');

  const pageSubtitle = isAnnouncementsView
    ? (isAr
        ? 'النشرات الرسمية، القرارات المؤسسية، ومستجدات رابطة خريجي الأكاديمية'
        : 'Official institutional bulletins, alumni network news, and updates')
    : (isAr
        ? 'الملتقيات السنوية، الندوات التخصصية، وجلسات التواصل المهني'
        : 'Annual conferences, professional development webinars, and alumni networking events');

  const MainIcon = isAnnouncementsView ? Bell : Calendar;

  return (
    <PortalPage
      title={pageTitle}
      subtitle={pageSubtitle}
      breadcrumbs={[
        { label: isAr ? 'بوابة الخريجين' : 'Alumni Portal', path: `/${locale}/alumni/dashboard` },
        { label: pageTitle },
      ]}
      locale={locale}
      actions={
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF3F8] text-[#607086] text-xs font-semibold border border-[#DCE3EB]">
          <AlertCircle size={14} className="text-[#607086]" />
          <span>{isAr ? 'في انتظار ربط الواجهة الخلفية' : 'Pending Backend Integration'}</span>
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
              placeholder={
                isAnnouncementsView
                  ? (isAr ? 'البحث في الإعلانات والنشرات...' : 'Search announcements and notices...')
                  : (isAr ? 'البحث في الفعاليات والملتقيات...' : 'Search events and conferences...')
              }
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
              <option value="all">{isAr ? 'كافة الفئات' : 'All Categories'}</option>
            </select>
          </div>
        </div>

        {/* Content / Empty State */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] shadow-xs overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-20 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
                <MainIcon size={26} />
              </div>
              <h4 className="text-sm font-bold text-[#102033] mb-1">
                {isAnnouncementsView
                  ? (isAr ? 'لا توجد إعلانات منشورة حالياً' : 'No Active Announcements')
                  : (isAr ? 'لا توجد فعاليات مسجلة حالياً' : 'No Scheduled Events Available')}
              </h4>
              <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed">
                {isAnnouncementsView
                  ? (isAr
                      ? 'ستظهر الإعلانات والأخبار الرسمية هنا فور اعتمادها ونشرها من إدارة شؤون الخريجين.'
                      : 'Official bulletins and alumni updates will display here once published by Alumni Affairs.')
                  : (isAr
                      ? 'ستظهر ملتقيات الخريجين وورش العمل هنا فور إدراجها في التقويم الأكاديمي والمهني.'
                      : 'Upcoming alumni gatherings and professional development events will appear here once scheduled.')}
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF3F8] text-[#607086] text-[11px] font-semibold border border-[#DCE3EB]">
                <AlertCircle size={14} className="text-[#607086]" />
                <span>{isAr ? 'في انتظار ربط الواجهة الخلفية' : 'Pending Backend Integration'}</span>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#DCE3EB]">
              {filtered.map((item, idx) => (
                <div key={idx} className="p-5 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#102033]">{item.title}</h4>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PortalPage>
  );
};
