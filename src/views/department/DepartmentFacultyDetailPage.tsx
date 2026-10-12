import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Mail, Award, BookOpen, Clock, Users, ArrowRight, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface DepartmentFacultyDetailPageProps {
  locale: Locale;
}

export const DepartmentFacultyDetailPage: React.FC<DepartmentFacultyDetailPageProps> = ({ locale }) => {
  const { facultyId } = useParams<{ facultyId: string }>();
  const { isAr } = useTranslation();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  // In live architecture, faculty record is fetched via API; if not loaded:
  const faculty = null;

  return (
    <PortalPage
      title={isAr ? 'الملف الأكاديمي لعضو هيئة التدريس' : 'Faculty Member Academic Record'}
      subtitle={
        isAr
          ? 'تفاصيل العبء التدريسي، الشُعب المسندة، والملف المهني'
          : 'Teaching workload breakdown, assigned course sections, and professional credentials'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة رئيس القسم' : 'Department Portal', path: `/${locale}/department/dashboard` },
        { label: isAr ? 'أعضاء هيئة التدريس' : 'Faculty Members', path: `/${locale}/department/faculty` },
        { label: facultyId || (isAr ? 'السجل الأكاديمي' : 'Faculty Record') },
      ]}
      locale={locale}
      actions={
        <Link
          to={`/${locale}/department/faculty`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] rounded-lg text-xs font-bold transition-colors"
        >
          <ArrowIcon size={14} />
          <span>{isAr ? 'العودة إلى الدليل' : 'Back to Directory'}</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Not Found / Institutional State */}
        {!faculty ? (
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-10 md:p-14 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
              <User size={24} />
            </div>
            <h3 className="text-sm font-bold text-[#102033] mb-1">
              {isAr ? 'بيانات عضو هيئة التدريس غير متوفرة' : 'Faculty record currently unavailable'}
            </h3>
            <p className="text-xs text-[#667085] max-w-md mx-auto leading-relaxed">
              {isAr
                ? 'لم يتم العثور على سجل متصل بهذا المعرّف في قاعدة بيانات الكادر الأكاديمي للقسم.'
                : 'No active record associated with this identifier was found in the department academic personnel database.'}
            </p>
            <div className="mt-5">
              <Link
                to={`/${locale}/department/faculty`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#082B50] hover:bg-[#061E38] text-white rounded-xl text-xs font-bold transition-colors"
              >
                <span>{isAr ? 'العودة إلى دليل أعضاء هيئة التدريس' : 'Return to Faculty Directory'}</span>
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </PortalPage>
  );
};
