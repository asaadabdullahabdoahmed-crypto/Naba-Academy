import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, Check, X, ShieldCheck, Scale, Filter } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import type { DepartmentStudentAppeal } from '../../types';

interface DepartmentAppealsPageProps {
  locale: Locale;
}

export const DepartmentAppealsPage: React.FC<DepartmentAppealsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const [activeTab, setActiveTab] = useState<'appeals' | 'violations'>('appeals');

  // Domain records from backend (empty state when not connected)
  const appeals: DepartmentStudentAppeal[] = [];

  return (
    <PortalPage
      title={isAr ? 'التظلمات واللجان الأكاديمية للقسم' : 'Academic Appeals & Department Inquiries'}
      subtitle={
        isAr
          ? 'النظر في تظلمات تقييم المقررات، أعذار الغياب، والتقارير الأكاديمية المحالة للجنة القسم'
          : 'Review course grade disputes, excused absences, and academic matters referred to the committee'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة رئيس القسم' : 'Department Portal', path: `/${locale}/department/dashboard` },
        { label: isAr ? 'التظلمات والمخالفات' : 'Appeals & Inquiries' },
      ]}
      locale={locale}
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-[#DCE3EB] gap-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('appeals')}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === 'appeals'
                ? 'border-[#082B50] text-[#082B50]'
                : 'border-transparent text-[#607086] hover:text-[#102033]'
            }`}
          >
            {isAr ? 'تظلمات درجات المقررات (0)' : 'Grade Disputes (0)'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('violations')}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === 'violations'
                ? 'border-[#082B50] text-[#082B50]'
                : 'border-transparent text-[#607086] hover:text-[#102033]'
            }`}
          >
            {isAr ? 'تقارير المخالفات واللجان (0)' : 'Violations & Inquiries (0)'}
          </button>
        </div>

        {/* Content / Empty State */}
        {appeals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-10 md:p-14 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
              <Scale size={24} />
            </div>
            <h3 className="text-sm font-bold text-[#102033] mb-1">
              {isAr ? 'لا توجد تظلمات أو مخالفات مقيدة حالياً' : 'No appeals or disciplinary cases recorded'}
            </h3>
            <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed">
              {isAr
                ? 'يتم تقييد تظلمات الطلاب على درجات الاختبارات تلقائياً عبر بوابة الطالب وفق المهلة النظامية المحددة في اللائحة الأكاديمية.'
                : 'Grade disputes submitted through the Student Portal within the official regulatory window will appear here for committee review.'}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFF3F8] text-[11px] text-[#607086] border border-[#DCE3EB]">
              <ShieldCheck size={13} className="text-[#D6A53A]" />
              <span>{isAr ? 'حوكمة أكاديمية عادلة' : 'Equitable Academic Governance'}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {appeals.map((apl) => (
              <div
                key={apl.id}
                className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#082B50]">{apl.id}</span>
                    <span className="font-bold text-xs text-[#102033]">{apl.student}</span>
                    <span className="text-[11px] text-[#607086] font-semibold">({apl.course} • {apl.instructor})</span>
                  </div>
                  <p className="text-xs text-[#607086] leading-relaxed">{apl.reason}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalPage>
  );
};
