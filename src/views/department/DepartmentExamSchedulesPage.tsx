import React from 'react';
import { Calendar, Clock, Plus, Download, ShieldCheck, Filter } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import type { ExamItem } from '../../types';

interface DepartmentExamSchedulesPageProps {
  locale: Locale;
}

export const DepartmentExamSchedulesPage: React.FC<DepartmentExamSchedulesPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();

  // Domain exams from backend (empty state when not connected)
  const examSchedules: ExamItem[] = [];

  return (
    <PortalPage
      title={isAr ? 'جداول الاختبارات الموحدة للقسم' : 'Department Unified Exam Timetables'}
      subtitle={
        isAr
          ? 'اعتماد مواعيد الاختبارات النصفية والنهائية، توزيع لجان المراقبة، وتفادي التعارضات'
          : 'Approve midterm and final examination schedules, proctor allocations, and prevent course conflicts'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة رئيس القسم' : 'Department Portal', path: `/${locale}/department/dashboard` },
        { label: isAr ? 'جداول الاختبارات' : 'Exam Schedules' },
      ]}
      locale={locale}
      actions={
        <button
          type="button"
          disabled={examSchedules.length === 0}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#DCE3EB] text-[#607086] cursor-not-allowed rounded-lg text-xs font-bold transition-colors shadow-xs"
          title={isAr ? 'لا يوجد جدول متاح للتصدير' : 'No timetable available to export'}
        >
          <Download size={14} />
          <span>{isAr ? 'تصدير جدول الاختبارات' : 'Export Timetable (PDF)'}</span>
        </button>
      }
    >
      <div className="space-y-6">
        {examSchedules.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-10 md:p-14 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
              <Calendar size={24} />
            </div>
            <h3 className="text-sm font-bold text-[#102033] mb-1">
              {isAr ? 'لا يوجد جدول اختبارات معتمد حالياً' : 'No approved examination schedule on record'}
            </h3>
            <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed">
              {isAr
                ? 'يتم إصدار ونشر جداول الاختبارات الموحدة وتوزيع القاعات ولجان المراقبة بالتنسيق مع اللجنة المركزية للاختبارات بالجامعة.'
                : 'Unified examination schedules, hall assignments, and invigilation rosters are issued in coordination with the University Central Exams Committee.'}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFF3F8] text-[11px] text-[#607086] border border-[#DCE3EB]">
              <ShieldCheck size={13} className="text-[#D6A53A]" />
              <span>{isAr ? 'معايير تقويم مركزية' : 'Centralized Assessment Standards'}</span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#DCE3EB] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-start text-xs">
                <thead className="bg-[#EFF3F8] border-b border-[#DCE3EB] text-[#607086] font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4 text-start">{isAr ? 'رمز المقرر' : 'Course Code'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'نوع الاختبار' : 'Exam Type'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'التاريخ' : 'Date'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'الوقت' : 'Time'}</th>
                    <th className="py-3 px-4 text-center">{isAr ? 'المدة' : 'Duration'}</th>
                    <th className="py-3 px-4 text-center">{isAr ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE3EB]">
                  {examSchedules.map((e) => (
                    <tr key={e.id} className="hover:bg-[#EFF3F8]/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#082B50]">{e.courseCode}</td>
                      <td className="py-3.5 px-4 font-semibold text-[#102033]">{isAr ? e.examTypeAr : e.examTypeEn}</td>
                      <td className="py-3.5 px-4 text-[#102033] font-medium">{e.date}</td>
                      <td className="py-3.5 px-4 text-[#607086]">{e.time}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-[#102033]">{e.durationMinutes} {isAr ? 'دقيقة' : 'mins'}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#16835d]/10 text-[#16835d]">
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
