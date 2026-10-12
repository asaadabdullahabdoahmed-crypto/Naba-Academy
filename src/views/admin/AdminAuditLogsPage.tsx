import React, { useState } from 'react';
import { Shield, Search, Filter, History, ShieldCheck, Download, AlertCircle } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import type { AuditLogItem } from '../../types';

interface AdminAuditLogsPageProps {
  locale: Locale;
}

export const AdminAuditLogsPage: React.FC<AdminAuditLogsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  // Domain audit log records from backend (empty state when not connected)
  const logs: AuditLogItem[] = [];

  const filtered = logs.filter((l) => {
    const matchSearch =
      l.detailsAr?.includes(searchTerm) ||
      l.detailsEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.actorAr?.includes(searchTerm) ||
      l.ip?.includes(searchTerm);
    const matchAction = actionFilter === 'ALL' || l.action === actionFilter;
    return matchSearch && matchAction;
  });

  return (
    <PortalPage
      title={isAr ? 'سجلات المراجعة والتدقيق الأمني' : 'Security Audit Trail'}
      subtitle={
        isAr
          ? 'سجل الرقابة غير القابل للتعديل، توثيق عمليات الدخول، والتغييرات الحساسة في المنظومة'
          : 'Immutable audit trail of authentication events, administrative actions, and configuration changes'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الإدارة' : 'Admin Portal', path: `/${locale}/admin/dashboard` },
        { label: isAr ? 'سجلات التدقيق' : 'Audit Logs' },
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
        {/* Search & Filter Header */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-[#607086]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAr ? 'البحث في سجلات التدقيق أو عنوان IP أو المنفذ...' : 'Search audit records by actor, IP, or action details...'}
              className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-xl ps-9 pe-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#174F89]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={14} className="text-[#607086]" />
            <select
              aria-label={isAr ? 'نوع الحدث الأمني' : 'Event Type'}
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-[#EFF3F8] border border-[#DCE3EB] rounded-xl px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden"
            >
              <option value="ALL">{isAr ? 'كافة الأحداث الأمنية' : 'All Security Events'}</option>
              <option value="LOGIN">{isAr ? 'تسجيلات الدخول' : 'Logins'}</option>
              <option value="UPDATE">{isAr ? 'التعديلات' : 'Updates'}</option>
              <option value="SECURITY">{isAr ? 'تنبيهات الحماية' : 'Security Alerts'}</option>
            </select>
          </div>
        </div>

        {/* Content / Empty State */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] shadow-xs overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-20 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
                <History size={26} />
              </div>
              <h4 className="text-sm font-bold text-[#102033] mb-1">
                {isAr ? 'لا توجد سجلات تدقيق أمني مطابقة' : 'No Matching Audit Logs Recorded'}
              </h4>
              <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed">
                {isAr
                  ? 'يتم توثيق كافة العمليات الإدارية وتغييرات الصلاحيات ومحاولات المصادقة آنياً في سجل مشفر غير قابل للتعديل.'
                  : 'All administrative interventions, permission updates, and authentication attempts stream into an immutable security journal.'}
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
                    <th className="py-3 px-4 text-start">{isAr ? 'التاريخ والوقت' : 'Timestamp'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'المستخدم' : 'Actor'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'الإجراء' : 'Action'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'التفاصيل' : 'Details'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'عنوان IP' : 'IP Address'}</th>
                    <th className="py-3 px-4 text-end">{isAr ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE3EB]">
                  {filtered.map((l) => (
                    <tr key={l.id} className="hover:bg-[#EFF3F8]/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[#607086]">{l.timestamp}</td>
                      <td className="py-3.5 px-4 font-bold text-[#102033]">{isAr ? l.actorAr : l.actorEn}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#082B50]">{l.action}</td>
                      <td className="py-3.5 px-4 text-[#607086]">{isAr ? l.detailsAr : l.detailsEn}</td>
                      <td className="py-3.5 px-4 font-mono text-[#607086]">{l.ip}</td>
                      <td className="py-3.5 px-4 text-end">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#e7f4f1] text-[#16835d]">
                          {l.status}
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
