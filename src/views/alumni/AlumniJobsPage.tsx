import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Briefcase, Search, Filter, AlertCircle, Award } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import type { JobItem } from '../../types';

interface AlumniJobsPageProps {
  locale: Locale;
}

export const AlumniJobsPage: React.FC<AlumniJobsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const location = useLocation();

  const isInternshipsView = location.pathname.includes('/alumni/internships');
  const [searchTerm, setSearchTerm] = useState('');

  // Domain jobs from backend (empty when not connected - Data Integrity Rule)
  const jobs: JobItem[] = [];

  const filtered = jobs.filter(
    (j) =>
      j.titleAr?.includes(searchTerm) ||
      j.titleEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.companyAr?.includes(searchTerm) ||
      j.companyEn?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pageTitle = isInternshipsView
    ? (isAr ? 'برامج التدريب والتأهيل المهني' : 'Internships & Professional Training')
    : (isAr ? 'بوابة الفرص الوظيفية' : 'Career & Job Opportunities');

  const pageSubtitle = isInternshipsView
    ? (isAr
        ? 'فرص التدريب التعاوني، التأهيل المهني، والشراكات المعتمدة للخريجين'
        : 'Co-op internships, vocational training, and partner advancement programs')
    : (isAr
        ? 'استعراض الشواغر الوظيفية والفرص المهنية المعتمدة لخريجي الأكاديمية'
        : 'Explore verified career vacancies and employment listings for NABA graduates');

  const MainIcon = isInternshipsView ? Award : Briefcase;

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
                isInternshipsView
                  ? (isAr ? 'البحث في برامج التدريب أو جهة العمل...' : 'Search internship programs or companies...')
                  : (isAr ? 'البحث عن مسمى وظيفي أو جهة العمل...' : 'Search by job title or organization...')
              }
              className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-xl ps-9 pe-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#174F89]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={14} className="text-[#607086]" />
            <select
              aria-label={isAr ? 'نوع الفرصة' : 'Opportunity Type'}
              className="bg-[#EFF3F8] border border-[#DCE3EB] rounded-xl px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden"
              defaultValue="all"
            >
              <option value="all">{isAr ? 'كافة المجالات' : 'All Fields'}</option>
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
                {isInternshipsView
                  ? (isAr ? 'لا توجد برامج تدريب متاحة حالياً' : 'No Internship Programs Currently Available')
                  : (isAr ? 'لا توجد فرص وظيفية متاحة حاليًا' : 'No Career Opportunities Currently Available')}
              </h4>
              <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed">
                {isInternshipsView
                  ? (isAr
                      ? 'ستظهر برامج التدريب المهني والتأهيل المعتمدة هنا فور نشرها من وحدة التوظيف والشراكات.'
                      : 'Accredited training programs and internships will appear here once published by the Career & Partnerships unit.')
                  : (isAr
                      ? 'ستظهر الشواغر والفرص الوظيفية هنا فور إدراجها وربطها بالواجهة الخلفية للمنظومة.'
                      : 'Verified job openings will populate here once posted and connected to the backend database.')}
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF3F8] text-[#607086] text-[11px] font-semibold border border-[#DCE3EB]">
                <AlertCircle size={14} className="text-[#607086]" />
                <span>{isAr ? 'في انتظار ربط الواجهة الخلفية' : 'Pending Backend Integration'}</span>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#DCE3EB]">
              {filtered.map((job) => (
                <div key={job.id} className="p-5 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#102033]">{isAr ? job.titleAr : job.titleEn}</h4>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PortalPage>
  );
};
