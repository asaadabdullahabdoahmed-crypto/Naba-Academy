import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Award, BookOpen, Clock, Users, Search, Plus, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import type { AcademicProgram } from '../../types';

interface DepartmentProgramsPageProps {
  locale: Locale;
}

export const DepartmentProgramsPage: React.FC<DepartmentProgramsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const [searchTerm, setSearchTerm] = useState('');

  // Domain records from backend (empty state when not connected)
  const programs: AcademicProgram[] = [];

  const filtered = programs.filter(
    (prog) =>
      prog.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prog.titleAr?.includes(searchTerm) ||
      prog.titleEn?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PortalPage
      title={isAr ? 'البرامج والخطط الدراسية للقسم' : 'Department Degree Programs & Curricula'}
      subtitle={
        isAr
          ? 'إدارة الخطط الدراسية المعتمدة، متطلبات التخرج، والمسارات الأكاديمية التخصصية'
          : 'Oversee accredited degree curricula, graduation requirements, and academic specializations'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة رئيس القسم' : 'Department Portal', path: `/${locale}/department/dashboard` },
        { label: isAr ? 'البرامج والمناهج' : 'Programs & Curricula' },
      ]}
      locale={locale}
      actions={
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#DCE3EB] text-[#607086] cursor-not-allowed rounded-lg text-xs font-bold transition-colors"
          title={isAr ? 'اعتماد البرامج يتم بقرار من المجلس الأكاديمي للجامعة' : 'Program accreditation is managed through the University Academic Council'}
        >
          <Plus size={14} />
          <span>{isAr ? 'استحداث برنامج دراسي' : 'Propose Degree Program'}</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Search bar */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-4 shadow-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-[#607086]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAr ? 'البحث باسم البرنامج الأكاديمي أو رمزه...' : 'Search by program code or degree title...'}
              className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-xl ps-9 pe-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#174F89]"
            />
          </div>
        </div>

        {/* Programs Grid / Empty State */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-10 md:p-14 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
              <GraduationCap size={24} />
            </div>
            <h3 className="text-sm font-bold text-[#102033] mb-1">
              {isAr ? 'لا تتوفر برامج أكاديمية مسجلة حالياً' : 'No academic degree programs registered'}
            </h3>
            <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed">
              {isAr
                ? 'يتم اعتماد البرامج الأكاديمية والخطط الدراسية بالتنسيق بين مجلس القسم ومجلس الجامعة والمركز الوطني للتقويم والاعتماد الأكاديمي.'
                : 'Degree programs and study plans are approved in coordination between the Department Council, University Senate, and NCAAA.'}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFF3F8] text-[11px] text-[#607086] border border-[#DCE3EB]">
              <ShieldCheck size={13} className="text-[#D6A53A]" />
              <span>{isAr ? 'اعتماد مؤسسي وبرامجي' : 'Institutional & Programmatic Accreditation'}</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((prog) => (
              <div
                key={prog.id}
                className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs flex flex-col justify-between hover:border-[#174F89]/30 transition-all space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#EFF3F8] text-[#082B50] border border-[#DCE3EB]">
                      {prog.code}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D6A53A]/15 text-[#082B50]">
                      {isAr ? 'معتمد' : 'Accredited'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#102033]">
                    {isAr ? prog.titleAr : prog.titleEn}
                  </h4>
                  <p className="text-xs text-[#607086] leading-relaxed line-clamp-2">
                    {isAr ? prog.descriptionAr : prog.descriptionEn}
                  </p>

                  <div className="pt-2 border-t border-[#DCE3EB] space-y-1 text-xs text-[#607086]">
                    <div className="flex justify-between">
                      <span>{isAr ? 'الساعات المعتمدة:' : 'Total Credits:'}</span>
                      <span className="font-bold text-[#102033]">{prog.totalCredits} {isAr ? 'ساعة' : 'credits'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isAr ? 'المدة النظامية:' : 'Duration:'}</span>
                      <span className="font-bold text-[#102033]">{prog.durationYears} {isAr ? 'سنوات' : 'years'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#DCE3EB] flex items-center justify-between">
                  <Link
                    to={`/${locale}/department/programs/${prog.id}`}
                    className="text-xs font-bold text-[#174F89] hover:text-[#082B50] transition-colors flex items-center gap-1"
                  >
                    <span>{isAr ? 'تفاصيل الخطة الدراسية' : 'View Curriculum'}</span>
                    <ArrowIcon size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalPage>
  );
};
