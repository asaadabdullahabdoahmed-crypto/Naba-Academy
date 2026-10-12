import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Award, Compass, Search, Plus, BookOpen, Clock, ShieldCheck, Filter, AlertCircle } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import type { AcademicProgram } from '../../types';

interface AdminProgramsPageProps {
  locale: Locale;
}

export const AdminProgramsPage: React.FC<AdminProgramsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const location = useLocation();
  const isCurriculaView = location.pathname.includes('/admin/curricula');

  const [searchTerm, setSearchTerm] = useState('');

  // Domain program records from backend (empty state when not connected)
  const programs: AcademicProgram[] = [];

  const filtered = programs.filter(
    (p) =>
      p.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.titleAr?.includes(searchTerm) ||
      p.titleEn?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pageTitle = isCurriculaView
    ? (isAr ? 'الخطط والمناهج الدراسية' : 'Curricula & Study Plans')
    : (isAr ? 'البرامج والدرجات الأكاديمية' : 'Degree Programs Administration');

  const pageSubtitle = isCurriculaView
    ? (isAr
        ? 'حوكمة المتطلبات السابقة، التوزيع الفصلي للمقررات، والمسارات التخصصية'
        : 'Prerequisite frameworks, semester course sequencing, and degree track requirements')
    : (isAr
        ? 'إدارة التخصصات الأكاديمية، متطلبات التخرج، والاعتمادات المؤسسية'
        : 'Manage degree curricula, graduation criteria, and institutional accreditations');

  return (
    <PortalPage
      title={pageTitle}
      subtitle={pageSubtitle}
      breadcrumbs={[
        { label: isAr ? 'بوابة الإدارة' : 'Admin Portal', path: `/${locale}/admin/dashboard` },
        { label: pageTitle },
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
            title={isAr ? 'يتطلب ربط الواجهة الخلفية لتفعيل الإضافة' : 'Requires backend connection to create program'}
          >
            <Plus size={14} />
            <span>{isAr ? 'إضافة برنامج جديد' : 'New Program'}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Search & Filter Header */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-[#607086]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAr ? 'البحث برمز البرنامج أو الاسم...' : 'Search by program code or title...'}
              className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-xl ps-9 pe-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#174F89]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={14} className="text-[#607086]" />
            <select
              aria-label={isAr ? 'الدرجة العلمية' : 'Degree Level'}
              className="bg-[#EFF3F8] border border-[#DCE3EB] rounded-xl px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden"
              defaultValue="all"
            >
              <option value="all">{isAr ? 'جميع الدرجات الأكاديمية' : 'All Degree Levels'}</option>
              <option value="bachelor">{isAr ? 'بكالوريوس' : 'Bachelor'}</option>
              <option value="master">{isAr ? 'ماجستير' : 'Master'}</option>
              <option value="diploma">{isAr ? 'دبلوم مشارك' : 'Diploma'}</option>
            </select>
          </div>
        </div>

        {/* Content / Empty State */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] shadow-xs overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-20 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
                {isCurriculaView ? <Compass size={26} /> : <Award size={26} />}
              </div>
              <h4 className="text-sm font-bold text-[#102033] mb-1">
                {isAr
                  ? (isCurriculaView ? 'لا توجد خطط دراسية مسجلة حالياً' : 'لا توجد برامج أكاديمية مسجلة')
                  : (isCurriculaView ? 'No Curricula Registered' : 'No Academic Programs Registered')}
              </h4>
              <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed">
                {isAr
                  ? 'ستظهر البرامج والخطط الدراسية المعتمدة هنا عند الربط بقاعدة البيانات المركزية.'
                  : 'Approved academic programs and curricula will populate here once connected to the backend database.'}
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF3F8] text-[#607086] text-[11px] font-semibold border border-[#DCE3EB]">
                <AlertCircle size={14} className="text-[#607086]" />
                <span>{isAr ? 'في انتظار ربط الواجهة الخلفية' : 'Pending Backend Integration'}</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-5">
              {filtered.map((p) => (
                <div key={p.id} className="p-4 rounded-xl border border-[#DCE3EB] bg-[#EFF3F8]/30 space-y-3">
                  <span className="font-mono text-xs font-bold text-[#082B50] bg-[#EFF3F8] px-2 py-0.5 rounded border border-[#DCE3EB]">
                    {p.code}
                  </span>
                  <h3 className="text-sm font-bold text-[#102033]">{isAr ? p.titleAr : p.titleEn}</h3>
                  <p className="text-xs text-[#607086]">
                    {p.totalCredits} {isAr ? 'ساعة معتمدة' : 'Credits'} • {p.durationYears} {isAr ? 'سنوات' : 'Years'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PortalPage>
  );
};
