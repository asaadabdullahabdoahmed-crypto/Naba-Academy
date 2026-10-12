import React from 'react';
import { User, Mail, Award, Briefcase, AlertCircle, Building, Calendar } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface AlumniProfilePageProps {
  locale: Locale;
}

export const AlumniProfilePage: React.FC<AlumniProfilePageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const na = isAr ? 'غير متوفر حالياً' : 'Currently unavailable';

  return (
    <PortalPage
      title={isAr ? 'الملف الشخصي للخريج' : 'Graduate Profile'}
      subtitle={
        isAr
          ? 'البيانات الشخصية، السجل المهني، والبيانات التعريفية المعتمدة'
          : 'Personal identity credentials, professional records, and institutional profile'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الخريجين' : 'Alumni Portal', path: `/${locale}/alumni/dashboard` },
        { label: isAr ? 'الملف الشخصي' : 'Profile' },
      ]}
      locale={locale}
      actions={
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF3F8] text-[#607086] text-xs font-semibold border border-[#DCE3EB]">
          <AlertCircle size={14} className="text-[#607086]" />
          <span>{isAr ? 'في انتظار ربط الواجهة الخلفية' : 'Pending Backend Integration'}</span>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-[#EFF3F8] border border-[#DCE3EB] flex items-center justify-center text-[#082B50] shrink-0">
            <User size={36} />
          </div>

          <div className="flex-1 text-center sm:text-start space-y-2">
            <div>
              <h2 className="text-lg font-bold text-[#102033]">
                {na}
              </h2>
              <p className="text-xs text-[#607086] mt-0.5">
                {isAr ? 'الحالة الأكاديمية: خريج معتمد' : 'Academic Status: Verified Alumni'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-[#607086]">
              <span className="flex items-center gap-1.5">
                <Award size={14} className="text-[#082B50]" />
                <span>{isAr ? 'الدرجة العلمية: —' : 'Degree: —'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Mail size={14} className="text-[#082B50]" />
                <span className="font-mono">—</span>
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Academic Information */}
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#102033] flex items-center gap-2">
              <Award size={16} className="text-[#082B50]" />
              <span>{isAr ? 'البيانات الأكاديمية والتخرج' : 'Academic & Graduation Records'}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#EFF3F8]/50 border border-[#DCE3EB] flex items-center justify-between">
                <span className="text-[#607086]">{isAr ? 'الرقم الجامعي / المعرف' : 'Student / Alumni ID'}</span>
                <span className="font-bold text-[#082B50] font-mono">—</span>
              </div>
              <div className="p-3 rounded-xl bg-[#EFF3F8]/50 border border-[#DCE3EB] flex items-center justify-between">
                <span className="text-[#607086]">{isAr ? 'البرنامج والتخصص' : 'Program / Major'}</span>
                <span className="font-bold text-[#082B50]">{na}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#EFF3F8]/50 border border-[#DCE3EB] flex items-center justify-between">
                <span className="text-[#607086]">{isAr ? 'سنة التخرج' : 'Graduation Year'}</span>
                <span className="font-bold text-[#082B50]">—</span>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#102033] flex items-center gap-2">
              <Briefcase size={16} className="text-[#082B50]" />
              <span>{isAr ? 'البيانات المهنية الحالية' : 'Professional Record'}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#EFF3F8]/50 border border-[#DCE3EB] flex items-center justify-between">
                <span className="text-[#607086]">{isAr ? 'المسمى الوظيفي' : 'Job Title'}</span>
                <span className="font-bold text-[#082B50]">{na}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#EFF3F8]/50 border border-[#DCE3EB] flex items-center justify-between">
                <span className="text-[#607086]">{isAr ? 'جهة العمل' : 'Employer / Organization'}</span>
                <span className="font-bold text-[#082B50]">{na}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#EFF3F8]/50 border border-[#DCE3EB] flex items-center justify-between">
                <span className="text-[#607086]">{isAr ? 'حالة التوظيف' : 'Employment Status'}</span>
                <span className="font-bold text-[#082B50]">{na}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PortalPage>
  );
};
