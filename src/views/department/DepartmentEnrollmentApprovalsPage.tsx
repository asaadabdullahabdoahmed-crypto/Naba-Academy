import React, { useState } from 'react';
import { ClipboardCheck, Check, X, Search, Clock, ShieldCheck, Filter } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import type { DepartmentEnrollmentPetition } from '../../types';

interface DepartmentEnrollmentApprovalsPageProps {
  locale: Locale;
}

export const DepartmentEnrollmentApprovalsPage: React.FC<DepartmentEnrollmentApprovalsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  // Domain petitions from backend (empty state when not connected)
  const petitions: DepartmentEnrollmentPetition[] = [];

  const filtered = petitions.filter((p) => {
    if (activeTab === 'pending') return true;
    return true;
  });

  return (
    <PortalPage
      title={isAr ? 'اعتماد طلبات واستثناءات التسجيل' : 'Enrollment Approvals & Academic Petitions'}
      subtitle={
        isAr
          ? 'البت في طلبات استثناء المتطلبات، رفع الساعات الأكاديمية، وتسجيل المقررات البديلة'
          : 'Review and decide upon prerequisite waivers, credit overload petitions, and course substitutions'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة رئيس القسم' : 'Department Portal', path: `/${locale}/department/dashboard` },
        { label: isAr ? 'اعتماد الطلبات' : 'Enrollment Petitions' },
      ]}
      locale={locale}
    >
      <div className="space-y-6">
        {/* Status Tabs */}
        <div className="flex border-b border-[#DCE3EB] gap-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === 'pending'
                ? 'border-[#082B50] text-[#082B50]'
                : 'border-transparent text-[#607086] hover:text-[#102033]'
            }`}
          >
            {isAr ? 'طلبات قيد المراجعة (0)' : 'Pending Review (0)'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('approved')}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === 'approved'
                ? 'border-[#082B50] text-[#082B50]'
                : 'border-transparent text-[#607086] hover:text-[#102033]'
            }`}
          >
            {isAr ? 'الطلبات المعتمدة' : 'Approved'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rejected')}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === 'rejected'
                ? 'border-[#082B50] text-[#082B50]'
                : 'border-transparent text-[#607086] hover:text-[#102033]'
            }`}
          >
            {isAr ? 'الطلبات المرفوضة' : 'Rejected'}
          </button>
        </div>

        {/* Content Table / Empty State */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-10 md:p-14 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
              <ClipboardCheck size={24} />
            </div>
            <h3 className="text-sm font-bold text-[#102033] mb-1">
              {isAr ? 'لا توجد طلبات تسجيل معلقة حالياً' : 'No enrollment petitions currently pending'}
            </h3>
            <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed">
              {isAr
                ? 'ستظهر هنا طلبات استثناء المتطلبات وتجاوز الساعات المحولة من المرشدين الأكاديميين خلال فترات الحذف والإضافة المعتمدة.'
                : 'Petitions for credit overloads and prerequisite waivers forwarded by academic advisors will appear here during add/drop periods.'}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFF3F8] text-[11px] text-[#607086] border border-[#DCE3EB]">
              <ShieldCheck size={13} className="text-[#D6A53A]" />
              <span>{isAr ? 'قرارات أكاديمية موثقة' : 'Regulatory Academic Decisions'}</span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#DCE3EB] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-start text-xs">
                <thead className="bg-[#EFF3F8] border-b border-[#DCE3EB] text-[#607086] font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4 text-start">{isAr ? 'رقم الطلب' : 'Request ID'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'الطالب' : 'Student'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'نوع الاستثناء' : 'Petition Type'}</th>
                    <th className="py-3 px-4 text-center">{isAr ? 'المعدل' : 'GPA'}</th>
                    <th className="py-3 px-4 text-center">{isAr ? 'التاريخ' : 'Date'}</th>
                    <th className="py-3 px-4 text-end">{isAr ? 'القرار' : 'Decision'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE3EB]">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-[#EFF3F8]/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#082B50]">{item.id}</td>
                      <td className="py-3.5 px-4 font-semibold text-[#102033]">{item.student}</td>
                      <td className="py-3.5 px-4 text-[#607086]">{item.type}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-[#102033]">{item.gpa}</td>
                      <td className="py-3.5 px-4 text-center text-[#607086]">{item.date}</td>
                      <td className="py-3.5 px-4 text-end">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#16835d]/10 text-[#16835d]">
                          {isAr ? 'معتمد' : 'Approved'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PortalPage>
  );
};
