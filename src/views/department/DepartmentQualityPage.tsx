import React from 'react';
import { ShieldCheck, Award, CheckCircle2, TrendingUp, BookOpen, FileCheck, Layers } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import type { DepartmentQualityKpi } from '../../types';

interface DepartmentQualityPageProps {
  locale: Locale;
}

export const DepartmentQualityPage: React.FC<DepartmentQualityPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();

  // Domain KPIs from backend (empty state when not connected)
  const kpis: DepartmentQualityKpi[] = [];

  return (
    <PortalPage
      title={isAr ? 'الجودة والاعتماد الأكاديمي للقسم' : 'Academic Quality & Accreditation'}
      subtitle={
        isAr
          ? 'متابعة ملفات المقررات الدراسية، مصفوفة مخرجات التعلم، والامتثال لمعايير الاعتماد الوطني (NCAAA)'
          : 'Course dossiers, program learning outcomes (PLOs) matrix, and national accreditation compliance'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة رئيس القسم' : 'Department Portal', path: `/${locale}/department/dashboard` },
        { label: isAr ? 'الجودة والاعتماد' : 'Quality & Accreditation' },
      ]}
      locale={locale}
    >
      <div className="space-y-6">
        {/* Institutional Quality Framework Notice */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center">
                <ShieldCheck size={18} className="text-[#D6A53A]" />
              </div>
              <span className="text-xs font-bold text-[#102033]">
                {isAr ? 'الاعتماد المؤسسي والبرامجي' : 'Program Accreditation'}
              </span>
            </div>
            <div className="text-xl font-bold text-[#102033] font-mono">—</div>
            <p className="text-[11px] text-[#607086] mt-1">
              {isAr ? 'المركز الوطني للتقويم والاعتماد (NCAAA)' : 'National Center for Academic Accreditation'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center">
                <FileCheck size={18} />
              </div>
              <span className="text-xs font-bold text-[#102033]">
                {isAr ? 'ملفات وتقارير المقررات' : 'Course Dossiers & Reports'}
              </span>
            </div>
            <div className="text-xl font-bold text-[#102033] font-mono">—</div>
            <p className="text-[11px] text-[#607086] mt-1">
              {isAr ? 'الفصل الدراسي المنتهي' : 'Completed academic term'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center">
                <Award size={18} />
              </div>
              <span className="text-xs font-bold text-[#102033]">
                {isAr ? 'مؤشرات مخرجات التعلم (PLOs)' : 'Learning Outcomes (PLOs)'}
              </span>
            </div>
            <div className="text-xl font-bold text-[#102033] font-mono">—</div>
            <p className="text-[11px] text-[#607086] mt-1">
              {isAr ? 'دورة التقييم الدوري' : 'Periodic evaluation cycle'}
            </p>
          </div>
        </div>

        {/* Content / Empty State */}
        {kpis.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-10 md:p-14 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
              <Award size={24} />
            </div>
            <h3 className="text-sm font-bold text-[#102033] mb-1">
              {isAr ? 'مؤشرات الجودة والاعتماد قيد المراجعة للدورة الأكاديمية الحالية' : 'Quality indicators pending for current evaluation cycle'}
            </h3>
            <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed">
              {isAr
                ? 'يتم احتساب ورفع مؤشرات الأداء الرئيسية (KPIs) وتقارير ملفات المقررات بعد إغلاق رصد الدرجات واعتمادها من عمادة التطوير والجودة.'
                : 'Performance indicators (KPIs) and course dossier evaluations are computed following final grade reconciliations by the Quality Assurance Deanship.'}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFF3F8] text-[11px] text-[#607086] border border-[#DCE3EB]">
              <ShieldCheck size={13} className="text-[#D6A53A]" />
              <span>{isAr ? 'معايير الجودة الأكاديمية الرسمية' : 'Official Academic Quality Standards'}</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {kpis.map((k, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs space-y-2">
                <span className="text-xs text-[#607086]">{k.title}</span>
                <div className="text-2xl font-black text-[#082B50]">{k.val}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalPage>
  );
};
