import React, { useState } from 'react';
import { Users, BookOpen, CheckCircle2, Save, AlertCircle, ShieldCheck } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import type { Course } from '../../types';

interface DepartmentCourseAssignmentsPageProps {
  locale: Locale;
}

export const DepartmentCourseAssignmentsPage: React.FC<DepartmentCourseAssignmentsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();

  // Domain assignments from backend (empty state when not connected)
  const assignments: { id: string; courseCode: string; courseTitleAr: string; courseTitleEn: string; credits: number; facultyNameAr?: string; facultyNameEn?: string; status: string }[] = [];

  return (
    <PortalPage
      title={isAr ? 'تكليفات التدريس والأنصبة الأكاديمية' : 'Faculty Teaching Allocations & Loads'}
      subtitle={
        isAr
          ? 'توزيع الشُعب والمقررات الدراسية على أعضاء هيئة التدريس وموازنة الساعات المعتمدة'
          : 'Allocate course sections and lecture hours to department faculty members and balance workloads'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة رئيس القسم' : 'Department Portal', path: `/${locale}/department/dashboard` },
        { label: isAr ? 'تكليفات التدريس' : 'Teaching Allocations' },
      ]}
      locale={locale}
      actions={
        <button
          type="button"
          disabled={assignments.length === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#DCE3EB] text-[#607086] cursor-not-allowed rounded-lg text-xs font-bold transition-all shadow-xs"
          title={isAr ? 'لا توجد تعديلات غير محفوظة' : 'No unsaved allocation changes'}
        >
          <Save size={14} />
          <span>{isAr ? 'حفظ التكليفات' : 'Save Allocations'}</span>
        </button>
      }
    >
      <div className="space-y-6">
        {assignments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-10 md:p-14 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
              <Users size={24} />
            </div>
            <h3 className="text-sm font-bold text-[#102033] mb-1">
              {isAr ? 'لا تتوفر بيانات تكليفات تدريسية حالياً' : 'No teaching allocations on record'}
            </h3>
            <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed">
              {isAr
                ? 'يتم إسناد المقررات والشُعب الدراسية لأعضاء هيئة التدريس بعد اعتماد الجدول الدراسي النهائي وقوائم الشعب من مجلس الكلية.'
                : 'Faculty teaching assignments are established once the final course schedule and section lists are ratified by the College Council.'}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFF3F8] text-[11px] text-[#607086] border border-[#DCE3EB]">
              <ShieldCheck size={13} className="text-[#D6A53A]" />
              <span>{isAr ? 'أنصبة تدريسية نظامية' : 'Regulatory Teaching Load Caps'}</span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#DCE3EB] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-start text-xs">
                <thead className="bg-[#EFF3F8] border-b border-[#DCE3EB] text-[#607086] font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4 text-start">{isAr ? 'المقرر' : 'Course'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'الساعات' : 'Credits'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'عضو هيئة التدريس المكلف' : 'Assigned Faculty'}</th>
                    <th className="py-3 px-4 text-center">{isAr ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE3EB]">
                  {assignments.map((item) => (
                    <tr key={item.id} className="hover:bg-[#EFF3F8]/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#082B50]">{item.courseCode}</td>
                      <td className="py-3.5 px-4 text-[#102033]">{item.credits}</td>
                      <td className="py-3.5 px-4 font-semibold text-[#102033]">{isAr ? item.facultyNameAr : item.facultyNameEn}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#16835d]/10 text-[#16835d]">
                          {item.status}
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
