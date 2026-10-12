import React, { useState } from 'react';
import { Headphones, LifeBuoy, Search, Filter, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import type { AdminSupportTicketItem } from '../../types';

interface AdminSupportPageProps {
  locale: Locale;
}

export const AdminSupportPage: React.FC<AdminSupportPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Domain tickets from backend (empty state when not connected)
  const tickets: AdminSupportTicketItem[] = [];

  const filtered = tickets.filter((t) => {
    const matchSearch =
      t.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject?.includes(searchTerm) ||
      t.user?.includes(searchTerm);
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <PortalPage
      title={isAr ? 'تذاكر الدعم الفني وخدمة المستفيدين' : 'IT Service Desk & Helpdesk Tickets'}
      subtitle={
        isAr
          ? 'معالجة البلاغات التقنية، استفسارات الطلبة وأعضاء هيئة التدريس، وتتبع مستويات الخدمة (SLA)'
          : 'Resolve technical incidents, handle faculty/student inquiries, and ensure SLA compliance'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الإدارة' : 'Admin Portal', path: `/${locale}/admin/dashboard` },
        { label: isAr ? 'الدعم الفني' : 'Support Desk' },
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
              placeholder={isAr ? 'البحث برقم التذكرة أو صاحب البلاغ أو الموضوع...' : 'Search by ticket ID, user, or issue summary...'}
              className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-xl ps-9 pe-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#174F89]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={14} className="text-[#607086]" />
            <select
              aria-label={isAr ? 'حالة التذكرة' : 'Ticket Status'}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#EFF3F8] border border-[#DCE3EB] rounded-xl px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden"
            >
              <option value="ALL">{isAr ? 'كافة الحالات' : 'All Statuses'}</option>
              <option value="OPEN">{isAr ? 'مفتوحة' : 'Open'}</option>
              <option value="IN_PROGRESS">{isAr ? 'قيد المعالجة' : 'In Progress'}</option>
              <option value="RESOLVED">{isAr ? 'تم الحل' : 'Resolved'}</option>
            </select>
          </div>
        </div>

        {/* Content / Empty State */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] shadow-xs overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-20 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
                <Headphones size={26} />
              </div>
              <h4 className="text-sm font-bold text-[#102033] mb-1">
                {isAr ? 'لا توجد تذاكر دعم فني معلقة حالياً' : 'No Open Helpdesk Tickets'}
              </h4>
              <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed">
                {isAr
                  ? 'ترد البلاغات والاستفسارات التقنية مباشرة من بوابات الطلاب وأعضاء هيئة التدريس وتُصنّف آلياً حسب الأولوية.'
                  : 'Incident reports and student inquiries route in real-time from user portal widgets and triage automatically.'}
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF3F8] text-[#607086] text-[11px] font-semibold border border-[#DCE3EB]">
                <AlertCircle size={14} className="text-[#607086]" />
                <span>{isAr ? 'في انتظار ربط الواجهة الخلفية' : 'Pending Backend Integration'}</span>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#DCE3EB]">
              {filtered.map((t) => (
                <div key={t.id} className="p-5 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#102033]">{t.subject}</h4>
                    <p className="text-xs text-[#607086]">{t.user} • {t.time}</p>
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
