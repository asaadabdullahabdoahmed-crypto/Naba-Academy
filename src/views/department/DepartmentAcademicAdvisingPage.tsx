import React, { useState } from 'react';
import { Users, GraduationCap, BookOpen, CheckCircle2, Award, Search, ShieldCheck, AlertCircle } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface DepartmentAcademicAdvisingPageProps {
  locale: Locale;
}

export const DepartmentAcademicAdvisingPage: React.FC<DepartmentAcademicAdvisingPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  // Domain advising rosters from backend (empty state when not connected)
  const advisorRosters: { id: string; advisorNameAr: string; advisorNameEn: string; rankAr: string; rankEn: string; studentCount: number; atRiskCount: number }[] = [];

  return (
    <PortalPage
      title={isAr ? 'الإرشاد الأكاديمي وطلاب القسم' : 'Academic Advising & Department Students'}
      subtitle={
        isAr
          ? 'متابعة توزيع المرشدين الأكاديميين، مراقبة الطلاب المتعثرين، وخطط التدخل الأكاديمي'
          : 'Monitor academic advisor allocations, student intervention workflows, and graduation progress'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة رئيس القسم' : 'Department Portal', path: `/${locale}/department/dashboard` },
        { label: isAr ? 'الإرشاد والطلاب' : 'Advising & Students' },
      ]}
      locale={locale}
    >
      <div className="space-y-6">
        {/* Metric Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs">
            <span className="text-xs text-[#607086] font-medium">
              {isAr ? 'إجمالي طلاب القسم' : 'Total Department Students'}
            </span>
            <div className="text-2xl font-bold text-[#102033] font-mono mt-2">—</div>
            <p className="text-[11px] text-[#607086] mt-1">
              {isAr ? 'المقيدون في برامج القسم' : 'Enrolled across all programs'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs">
            <span className="text-xs text-[#607086] font-medium">
              {isAr ? 'المرشدون الأكاديميون' : 'Appointed Advisors'}
            </span>
            <div className="text-2xl font-bold text-[#102033] font-mono mt-2">—</div>
            <p className="text-[11px] text-[#607086] mt-1">
              {isAr ? 'أعضاء هيئة التدريس المكلفون' : 'Active faculty advisors'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs">
            <span className="text-xs text-[#607086] font-medium">
              {isAr ? 'حالات المتابعة الأكاديمية' : 'Students on Warning / At Risk'}
            </span>
            <div className="text-2xl font-bold text-[#102033] font-mono mt-2">—</div>
            <p className="text-[11px] text-[#607086] mt-1">
              {isAr ? 'خطط التحسين الأكاديمي' : 'Intervention plans'}
            </p>
          </div>
        </div>

        {/* Content / Empty State */}
        {advisorRosters.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-10 md:p-14 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
              <GraduationCap size={24} />
            </div>
            <h3 className="text-sm font-bold text-[#102033] mb-1">
              {isAr ? 'لا تتوفر بيانات قوائم الإرشاد الأكاديمي حالياً' : 'No academic advising rosters currently available'}
            </h3>
            <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed">
              {isAr
                ? 'يتم توزيع الطلاب على المرشدين الأكاديميين وتحديث السجلات الأكاديمية تلقائياً بالتنسيق مع وحدة الإرشاد بعمادة شؤون الطلاب.'
                : 'Student advisor allocations and academic rosters are synchronized through the University Student Affairs Advising Unit.'}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFF3F8] text-[11px] text-[#607086] border border-[#DCE3EB]">
              <ShieldCheck size={13} className="text-[#D6A53A]" />
              <span>{isAr ? 'توجيه أكاديمي معتمد' : 'Accredited Academic Guidance'}</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advisorRosters.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#102033]">
                    {isAr ? item.advisorNameAr : item.advisorNameEn}
                  </span>
                  <span className="text-xs font-bold text-[#082B50] bg-[#EFF3F8] px-2 py-0.5 rounded-full">
                    {item.studentCount} {isAr ? 'طالباً' : 'students'}
                  </span>
                </div>
                <p className="text-xs text-[#607086]">
                  {isAr ? item.rankAr : item.rankEn}
                </p>
                <div className="pt-2 border-t border-[#DCE3EB] text-xs flex justify-between items-center text-[#607086]">
                  <span>{isAr ? 'الإنذارات الأكاديمية:' : 'At Risk:'} {item.atRiskCount}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalPage>
  );
};
