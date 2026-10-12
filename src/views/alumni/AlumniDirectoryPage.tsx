import React, { useState } from 'react';
import { Users, Search, Filter, AlertCircle, Shield } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import type { AlumniDirectoryRecord } from '../../types';

interface AlumniDirectoryPageProps {
  locale: Locale;
}

export const AlumniDirectoryPage: React.FC<AlumniDirectoryPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  // Privacy-sensitive: no fabricated records (Rule 11)
  const alumniList: AlumniDirectoryRecord[] = [];

  const filtered = alumniList.filter(
    (a) =>
      a.nameAr?.includes(searchTerm) ||
      a.nameEn?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PortalPage
      title={isAr ? 'دليل وشبكة الخريجين' : 'Alumni Directory & Network'}
      subtitle={
        isAr
          ? 'التواصل المهني واستعراض بيانات الخريجين وفق ضوابط الخصوصية المعتمدة'
          : 'Professional networking and directory access subject to institutional privacy policies'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الخريجين' : 'Alumni Portal', path: `/${locale}/alumni/dashboard` },
        { label: isAr ? 'دليل الخريجين' : 'Directory' },
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
              placeholder={isAr ? 'البحث بالاسم أو التخصص أو سنة التخرج...' : 'Search by name, specialization, or graduation year...'}
              className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-xl ps-9 pe-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#174F89]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={14} className="text-[#607086]" />
            <select
              aria-label={isAr ? 'التخصص الأكاديمي' : 'Specialization'}
              className="bg-[#EFF3F8] border border-[#DCE3EB] rounded-xl px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden"
              defaultValue="all"
            >
              <option value="all">{isAr ? 'كافة التخصصات' : 'All Programs'}</option>
            </select>
          </div>
        </div>

        {/* Content / Neutral Privacy-Compliant State */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] shadow-xs overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-20 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
                <Users size={26} />
              </div>
              <h4 className="text-sm font-bold text-[#102033] mb-1">
                {isAr ? 'دليل الخريجين غير متوفر حاليًا' : 'Alumni Directory Currently Unavailable'}
              </h4>
              <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed">
                {isAr
                  ? 'يخضع دليل الخريجين لسياسات الخصوصية وإعدادات الموافقة الفردية لكل خريج، وسيتاح البحث والتواصل فور تفعيل الربط مع قاعدة البيانات.'
                  : 'The alumni directory adheres to member privacy settings and directory visibility opt-ins, available once connected to the backend database.'}
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF3F8] text-[#607086] text-[11px] font-semibold border border-[#DCE3EB]">
                <Shield size={14} className="text-[#082B50]" />
                <span>{isAr ? 'ضوابط الخصوصية وحماية البيانات مفعلة' : 'Data Privacy Enforced'}</span>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#DCE3EB]">
              {filtered.map((item, idx) => (
                <div key={idx} className="p-5 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#102033]">{isAr ? item.nameAr : item.nameEn}</h4>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PortalPage>
  );
};
