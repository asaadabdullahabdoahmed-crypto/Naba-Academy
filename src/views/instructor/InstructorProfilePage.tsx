import React, { useState } from 'react';
import { User, Mail, Award, CheckCircle2, Building, ShieldCheck, Phone, BookOpen, Lock } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface InstructorProfilePageProps {
  locale: Locale;
}

export const InstructorProfilePage: React.FC<InstructorProfilePageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const na = isAr ? 'غير متوفر' : 'Not available';

  const [officeLocation, setOfficeLocation] = useState('');

  return (
    <PortalPage
      title={isAr ? 'الملف الأكاديمي لعضو هيئة التدريس' : 'Faculty Academic Profile'}
      subtitle={
        isAr
          ? 'البيانات الأكاديمية الرسمية، الرتبة العلمية، والاهتمامات البحثية المعتمدة في نبا'
          : 'Institutional credentials, faculty appointment status, and research focus at NABA'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة المحاضر' : 'Faculty Portal', path: `/${locale}/instructor/dashboard` },
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
                {isAr ? 'الرتبة الأكاديمية: ' : 'Academic Rank: '}{na}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-[#607086]">
              <span className="flex items-center gap-1.5">
                <Building size={14} className="text-[#082B50]" />
                <span>{isAr ? 'القسم: ' : 'Department: '}{na}</span>
              </span>
              <span className="flex items-center gap-1.5 font-mono">
                <Mail size={14} className="text-[#082B50]" />
                <span>{na}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Academic Details Shell */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs space-y-6">
          <div className="pb-4 border-b border-[#DCE3EB]">
            <h3 className="text-base font-bold text-[#082B50]">
              {isAr ? 'البيانات والاهتمامات البحثية' : 'Academic & Research Profile'}
            </h3>
            <p className="text-xs text-[#607086] mt-0.5">
              {isAr ? 'معلومات المكتب الأكاديمي والتخصص الدقيق المعتمدة لدى عمادة الكلية' : 'Office location and research specialization recorded with the deanery'}
            </p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#102033] mb-1">
                  {isAr ? 'مقر المكتب وساعات التواجد' : 'Office Location'}
                </label>
                <input
                  type="text"
                  value={officeLocation}
                  onChange={(e) => setOfficeLocation(e.target.value)}
                  placeholder={isAr ? 'مثال: المبنى الأكاديمي — القاعة 204' : 'e.g., Academic Building — Room 204'}
                  className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#102033] mb-1">
                  {isAr ? 'حالة التكليف الأكاديمي' : 'Faculty Appointment Status'}
                </label>
                <input
                  type="text"
                  disabled
                  value={na}
                  className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg px-3 py-2 text-xs text-[#607086] cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#082B50]/40 text-white/50 rounded-lg text-xs font-semibold cursor-not-allowed border border-[#DCE3EB]"
                title={isAr ? 'تعديل البيانات الأكاديمية يتطلب التنسيق مع شؤون هيئة التدريس' : 'Profile updates are synchronized with faculty affairs'}
              >
                <Lock size={14} className="text-[#D6A53A]/60" />
                <span>{isAr ? 'حفظ التحديثات' : 'Save Updates'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </PortalPage>
  );
};
