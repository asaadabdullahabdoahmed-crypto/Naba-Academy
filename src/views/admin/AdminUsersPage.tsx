import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Users, Search, Plus, UserCheck, ShieldCheck, Mail, Filter, AlertCircle } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import type { SystemUser } from '../../types';

interface AdminUsersPageProps {
  locale: Locale;
}

export const AdminUsersPage: React.FC<AdminUsersPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const location = useLocation();
  const isStudentsView = location.pathname.includes('/admin/students');

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState(isStudentsView ? 'STUDENT' : 'ALL');

  // Domain user records from backend (empty state when not connected)
  const users: SystemUser[] = [];

  const filtered = users.filter((u) => {
    const matchSearch =
      u.nameAr?.includes(searchTerm) ||
      u.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const pageTitle = isStudentsView
    ? (isAr ? 'سجلات الطلاب العامة' : 'Master Student Directory')
    : (isAr ? 'المستخدمون والحسابات' : 'Central Users Directory');

  const pageSubtitle = isStudentsView
    ? (isAr
        ? 'قاعدة بيانات الطلبة المركزية، الحالة الأكاديمية، والبيانات التعريفية'
        : 'Central student registry, academic enrollment statuses, and identity records')
    : (isAr
        ? 'إدارة الحسابات المركزية، صلاحيات النظام، وحالات التفعيل المؤسسي'
        : 'Central identity governance, institutional roles, and account provisioning');

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
            title={isAr ? 'يتطلب ربط الواجهة الخلفية لإضافة مستخدم' : 'Requires backend connection to add user'}
          >
            <Plus size={14} />
            <span>{isAr ? 'إضافة مستخدم جديد' : 'New User Account'}</span>
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
              placeholder={isAr ? 'البحث بالاسم أو البريد الإلكتروني أو الرقم التعريفي...' : 'Search by name, email, or institutional ID...'}
              className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-xl ps-9 pe-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#174F89]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={14} className="text-[#607086]" />
            <select
              aria-label={isAr ? 'تصفية حسب الدور' : 'Filter by role'}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-[#EFF3F8] border border-[#DCE3EB] rounded-xl px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden"
            >
              <option value="ALL">{isAr ? 'كافة الأدوار والصلاحيات' : 'All Roles & Permissions'}</option>
              <option value="STUDENT">{isAr ? 'الطلاب الأكاديميون' : 'Academic Students'}</option>
              <option value="INSTRUCTOR">{isAr ? 'أعضاء هيئة التدريس' : 'Faculty Instructors'}</option>
              <option value="DEPARTMENT_HEAD">{isAr ? 'رؤساء الأقسام' : 'Department Heads'}</option>
              <option value="ADMIN">{isAr ? 'مشرفو النظام' : 'System Administrators'}</option>
              <option value="ALUMNI">{isAr ? 'الخريجون' : 'Alumni Members'}</option>
            </select>
          </div>
        </div>

        {/* Content Area / Empty State */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] shadow-xs overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-20 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
                {isStudentsView ? <UserCheck size={26} /> : <Users size={26} />}
              </div>
              <h4 className="text-sm font-bold text-[#102033] mb-1">
                {isAr
                  ? (isStudentsView ? 'لا توجد سجلات طلاب مطابقة' : 'لا توجد حسابات مستخدمين مسجلة')
                  : (isStudentsView ? 'No Matching Student Records' : 'No User Accounts Found')}
              </h4>
              <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed">
                {isAr
                  ? 'ستظهر حسابات المستخدمين وسجلات الطلبة هنا عند الربط بقاعدة البيانات المركزية.'
                  : 'User directories and student profiles will populate here once connected to the backend database.'}
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF3F8] text-[#607086] text-[11px] font-semibold border border-[#DCE3EB]">
                <AlertCircle size={14} className="text-[#607086]" />
                <span>{isAr ? 'في انتظار ربط الواجهة الخلفية' : 'Pending Backend Integration'}</span>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-start text-xs">
                <thead className="bg-[#EFF3F8] border-b border-[#DCE3EB] text-[#607086] font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4 text-start">{isAr ? 'المستخدم' : 'User'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'الدور الوظيفي' : 'Role'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'القسم الأكاديمي' : 'Department'}</th>
                    <th className="py-3 px-4 text-center">{isAr ? 'الحالة' : 'Status'}</th>
                    <th className="py-3 px-4 text-end">{isAr ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE3EB]">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-[#EFF3F8]/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[#102033]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#082B50] text-white flex items-center justify-center text-xs font-bold">
                            {(u.nameAr || u.nameEn || 'U').charAt(0)}
                          </div>
                          <div>
                            <span className="block font-bold">{isAr ? u.nameAr : u.nameEn}</span>
                            <span className="text-[10px] text-[#607086] font-mono">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EFF3F8] text-[#082B50] border border-[#DCE3EB]">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#607086]">{(isAr ? u.departmentAr : u.departmentEn) || '—'}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e7f4f1] text-[#16835d]">
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-end">
                        <Link
                          to={`/${locale}/admin/users/${u.id}`}
                          className="text-xs font-bold text-[#082B50] hover:text-[#174F89]"
                        >
                          {isAr ? 'تفاصيل' : 'Details'}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PortalPage>
  );
};
