import React, { useState } from 'react';
import { User, Mail, Award, CheckCircle2, Building, ShieldCheck, Phone, BookOpen, Lock } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface DepartmentProfilePageProps {
  locale: Locale;
}

export const DepartmentProfilePage: React.FC<DepartmentProfilePageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const na = isAr ? 'غير متوفر' : 'Not available';

  const [officeLocation, setOfficeLocation] = useState('');

  return (
    <PortalPage
      title={isAr ? 'الملف الأكاديمي لرئيس القسم' : 'Department Chair Profile'}
      subtitle={
        isAr
          ? 'البيانات الإدارية الرسمية، الرتبة العلمية، والاعتمادات الأكاديمية المعتمدة في نبا'
          : 'Administrative credentials, academic appointment status, and institutional authorizations at NABA'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة رئيس القسم' : 'Department Portal', path: `/${locale}/department/dashboard` },
        { label: isAr ? 'الملف الأكاديمي' : 'Profile' },
      ]}
      locale={locale}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Identity Header Card with Neutral Values */}
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
                {isAr ? 'المنصب الإداري: رئيس القسم' : 'Administrative Role: Department Chair'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-[#607086]">
              <span className="flex items-center gap-1.5">
                <Building size={14} className="text-[#082B50]" />
                <span>{isAr ? 'القسم: ' : 'Department: '}{na}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Mail size={14} className="text-[#082B50]" />
                <span className="font-mono">{na}</span>
              </span>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EFF3F8] text-[11px] font-bold text-[#082B50] border border-[#DCE3EB]">
            <ShieldCheck size={14} className="text-[#D6A53A]" />
            <span>{isAr ? 'صلاحيات رئيس قسم' : 'Chair Privileges'}</span>
          </div>
        </div>

        {/* Official Credentials Grid */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#102033] flex items-center gap-2">
            <Award size={16} className="text-[#082B50]" />
            <span>{isAr ? 'السجل الأكاديمي والإداري' : 'Institutional Credentials'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#EFF3F8]/50 border border-[#DCE3EB] space-y-1">
              <span className="text-[#607086]">{isAr ? 'الرتبة العلمية' : 'Academic Rank'}</span>
              <p className="font-bold text-[#102033]">{na}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#EFF3F8]/50 border border-[#DCE3EB] space-y-1">
              <span className="text-[#607086]">{isAr ? 'الكلية' : 'College'}</span>
              <p className="font-bold text-[#102033]">{na}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#EFF3F8]/50 border border-[#DCE3EB] space-y-1">
              <span className="text-[#607086]">{isAr ? 'تاريخ التكليف برئاسة القسم' : 'Appointment Date'}</span>
              <p className="font-bold text-[#102033]">{na}</p>
            </div>
          </div>
        </div>

        {/* Department Chair Office Info */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#102033] flex items-center gap-2">
            <Building size={16} className="text-[#082B50]" />
            <span>{isAr ? 'مكتب رئيس القسم والتواصل' : 'Department Office Location'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-medium text-[#102033]">
                {isAr ? 'مكتب رئاسة القسم' : 'Office Location'}
              </label>
              <input
                type="text"
                value={officeLocation}
                onChange={(e) => setOfficeLocation(e.target.value)}
                placeholder={isAr ? 'مثال: مبنى الإدارة، الدور الثالث، مكتب 301' : 'e.g. Admin Building, 3rd Floor, Suite 301'}
                className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-xl px-3.5 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#174F89]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-[#102033]">
                {isAr ? 'البريد الإلكتروني المعتمد للقسم' : 'Department Official Email'}
              </label>
              <input
                type="email"
                disabled
                value={na}
                className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-xl px-3.5 py-2 text-xs text-[#607086] cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#DCE3EB] text-[#607086] cursor-not-allowed rounded-xl text-xs font-bold transition-colors"
              title={isAr ? 'التحديث معطل لعدم وجود اتصال مباشر بقاعدة البيانات' : 'Updates disabled without backend persistence'}
            >
              <span>{isAr ? 'حفظ التعديلات' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </PortalPage>
  );
};
