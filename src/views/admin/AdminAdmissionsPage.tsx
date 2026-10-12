import React, { useState } from 'react';
import { UserCheck, Search, Filter, FileCheck, AlertCircle } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import type { AdminAdmissionApplication } from '../../types';

interface AdminAdmissionsPageProps {
  locale: Locale;
}

export const AdminAdmissionsPage: React.FC<AdminAdmissionsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Domain applications from backend (empty state when not connected)
  const applications: AdminAdmissionApplication[] = [];

  const filtered = applications.filter((a) => {
    const matchSearch =
      a.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.name?.includes(searchTerm) ||
      a.program?.includes(searchTerm);
    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <PortalPage
      title={isAr ? 'القبول والتسجيل' : 'Admissions'}
      subtitle={
        isAr
          ? 'متابعة وفرز طلبات الالتحاق الأكاديمي والتحقق من ملفات المتقدمين'
          : 'Review applicant admission files and manage academic intake'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الإدارة' : 'Admin Portal', path: `/${locale}/admin/dashboard` },
        { label: isAr ? 'القبول والتسجيل' : 'Admissions' },
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
        {/* Search & Filters */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-[#607086]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAr ? 'البحث برقم الطلب أو اسم المتقدم أو البرنامج...' : 'Search by application ID, applicant name, or program...'}
              className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-xl ps-9 pe-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#174F89]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={14} className="text-[#607086]" />
            <select
              aria-label={isAr ? 'حالة الطلب' : 'Application Status'}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#EFF3F8] border border-[#DCE3EB] rounded-xl px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden"
            >
              <option value="ALL">{isAr ? 'كافة الحالات' : 'All Statuses'}</option>
              <option value="PENDING">{isAr ? 'قيد المراجعة' : 'Pending Review'}</option>
              <option value="ACCEPTED">{isAr ? 'مقبول مبدئياً' : 'Provisionally Accepted'}</option>
              <option value="REJECTED">{isAr ? 'مرفوض' : 'Rejected'}</option>
            </select>
          </div>
        </div>

        {/* Content / Empty State */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] shadow-xs overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-20 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
                <FileCheck size={26} />
              </div>
              <h4 className="text-sm font-bold text-[#102033] mb-1">
                {isAr ? 'لا توجد طلبات قبول معلقة حالياً' : 'No Pending Admission Applications'}
              </h4>
              <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed">
                {isAr
                  ? 'تستقبل بوابة القبول طلبات الالتحاق الإلكترونية خلال الفترات المحددة في التقويم الأكاديمي المعتمد.'
                  : 'Candidate applications populate here once submitted during scheduled admissions windows.'}
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF3F8] text-[#607086] text-[11px] font-semibold border border-[#DCE3EB]">
                <AlertCircle size={14} className="text-[#607086]" />
                <span>{isAr ? 'بانتظار توفر البيانات' : 'Awaiting Operational Data'}</span>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-start text-xs">
                <thead className="bg-[#EFF3F8] border-b border-[#DCE3EB] text-[#607086] font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4 text-start">{isAr ? 'رقم الطلب' : 'App ID'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'المتقدم' : 'Applicant'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'البرنامج المستهدف' : 'Target Program'}</th>
                    <th className="py-3 px-4 text-center">{isAr ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE3EB]">
                  {filtered.map((app) => (
                    <tr key={app.id} className="hover:bg-[#EFF3F8]/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#082B50]">{app.id}</td>
                      <td className="py-3.5 px-4 font-semibold text-[#102033]">{app.name}</td>
                      <td className="py-3.5 px-4 text-[#607086]">{app.program}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EFF3F8] text-[#607086]">
                          {app.status}
                        </span>
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
