import React, { useState } from 'react';
import { Building2, Search, Plus, Filter, AlertCircle } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import type { AdminDepartmentSummary } from '../../types';

interface AdminDepartmentsPageProps {
  locale: Locale;
}

export const AdminDepartmentsPage: React.FC<AdminDepartmentsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  // Domain departments from backend (empty state when not connected)
  const departments: AdminDepartmentSummary[] = [];

  const filtered = departments.filter(
    (d) =>
      d.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.nameAr?.includes(searchTerm)
  );

  return (
    <PortalPage
      title={isAr ? 'الأقسام الأكاديمية' : 'Departments'}
      subtitle={
        isAr
          ? 'إدارة الأقسام الأكاديمية، رئاسة الأقسام، والارتباط الإداري'
          : 'Academic department management, department heads, and faculty assignments'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الإدارة' : 'Admin Portal', path: `/${locale}/admin/dashboard` },
        { label: isAr ? 'الأقسام الأكاديمية' : 'Departments' },
      ]}
      locale={locale}
      actions={
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#DCE3EB] text-[#607086] cursor-not-allowed rounded-lg text-xs font-bold transition-colors"
          title={isAr ? 'يتطلب ربط الواجهة الخلفية لتفعيل الإضافة' : 'Requires backend connection to add department'}
        >
          <Plus size={14} />
          <span>{isAr ? 'إضافة قسم أكاديمي' : 'New Department'}</span>
        </button>
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
              placeholder={isAr ? 'البحث برمز القسم أو الاسم...' : 'Search by department code or name...'}
              className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-xl ps-9 pe-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#174F89]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={14} className="text-[#607086]" />
            <select
              aria-label={isAr ? 'تصفية الأقسام' : 'Filter departments'}
              className="bg-[#EFF3F8] border border-[#DCE3EB] rounded-xl px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden"
              defaultValue="all"
            >
              <option value="all">{isAr ? 'كافة الأقسام' : 'All Departments'}</option>
            </select>
          </div>
        </div>

        {/* Content / Empty State */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] shadow-xs overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-20 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
                <Building2 size={26} />
              </div>
              <h4 className="text-sm font-bold text-[#102033] mb-1">
                {isAr ? 'لا توجد أقسام أكاديمية مسجلة حالياً' : 'No Academic Departments Registered'}
              </h4>
              <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed">
                {isAr
                  ? 'ستظهر الأقسام الأكاديمية وبيانات رؤساء الأقسام هنا عند الربط بقاعدة البيانات.'
                  : 'Academic departments and department head assignments will appear here once connected to the backend database.'}
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF3F8] text-[#607086] text-[11px] font-semibold border border-[#DCE3EB]">
                <AlertCircle size={14} className="text-[#607086]" />
                <span>{isAr ? 'في انتظار ربط الواجهة الخلفية' : 'Pending Backend Integration'}</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-5">
              {filtered.map((dept, i) => (
                <div key={i} className="p-4 rounded-xl border border-[#DCE3EB] bg-[#EFF3F8]/30 space-y-3">
                  <span className="font-mono text-xs font-bold text-[#082B50] bg-[#EFF3F8] px-2 py-0.5 rounded border border-[#DCE3EB]">
                    {dept.code}
                  </span>
                  <h4 className="text-sm font-bold text-[#102033]">{dept.nameAr}</h4>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PortalPage>
  );
};
