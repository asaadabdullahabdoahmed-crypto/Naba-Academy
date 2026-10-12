import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Clock, Award, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface DepartmentProgramDetailPageProps {
  locale: Locale;
}

export const DepartmentProgramDetailPage: React.FC<DepartmentProgramDetailPageProps> = ({ locale }) => {
  const { programId } = useParams<{ programId: string }>();
  const { isAr } = useTranslation();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  // In live architecture, program is fetched via backend API
  const program = null;

  return (
    <PortalPage
      title={isAr ? 'تفاصيل الخطة الدراسية للبرنامج' : 'Degree Program Curriculum Details'}
      subtitle={
        isAr
          ? 'المستويات الدراسية، متطلبات التخرج، ومصفوفة مخرجات التعلم المعتمدة'
          : 'Curriculum structure, graduation requirements, and accredited learning outcomes'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة رئيس القسم' : 'Department Portal', path: `/${locale}/department/dashboard` },
        { label: isAr ? 'البرامج الأكاديمية' : 'Programs', path: `/${locale}/department/programs` },
        { label: programId || (isAr ? 'الخطة الدراسية' : 'Study Plan') },
      ]}
      locale={locale}
      actions={
        <Link
          to={`/${locale}/department/programs`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] rounded-lg text-xs font-bold transition-colors"
        >
          <ArrowIcon size={14} />
          <span>{isAr ? 'العودة إلى البرامج' : 'Back to Programs'}</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {!program ? (
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-10 md:p-14 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
              <GraduationCap size={24} />
            </div>
            <h3 className="text-sm font-bold text-[#102033] mb-1">
              {isAr ? 'بيانات البرنامج الأكاديمي غير متوفرة حالياً' : 'Program curriculum data currently unavailable'}
            </h3>
            <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed">
              {isAr
                ? 'يتم استيراد الخطط والمستويات الأكاديمية ومصفوفة المقررات مباشرة من عمادة القبول والتسجيل بعد اعتماد مجلس الكلية.'
                : 'Study plans, course levels, and learning outcome matrices are synchronized from the University Registrar upon College Council approval.'}
            </p>
            <div className="mt-5">
              <Link
                to={`/${locale}/department/programs`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#082B50] hover:bg-[#061E38] text-white rounded-xl text-xs font-bold transition-colors"
              >
                <span>{isAr ? 'العودة إلى قائمة البرامج' : 'Return to Programs List'}</span>
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </PortalPage>
  );
};
