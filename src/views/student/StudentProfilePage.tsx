import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Shield, CheckCircle2, Camera, ShieldCheck, ArrowRight, ArrowLeft, Save } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import { useToast } from '../../components/ui/toast';
interface StudentProfilePageProps {
  locale: Locale;
}

export const StudentProfilePage: React.FC<StudentProfilePageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const { toast } = useToast();

  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const notAvailable = isAr ? 'غير متوفر' : 'Not available';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info(
      isAr
        ? 'تحديث بيانات الاتصال يتطلب ربط نظام شؤون الطلاب وقاعدة البيانات'
        : 'Contact information update requires connection to student records backend service'
    );
  };

  return (
    <PortalPage
      title={isAr ? 'الملف الأكاديمي للطالب' : 'Student Academic Profile'}
      subtitle={
        isAr
          ? 'البيانات الشخصية، بيانات القيد الأكاديمي، ومعلومات التواصل'
          : 'Personal identity, enrollment status, and contact details'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الطالب' : 'Student Portal', path: `/${locale}/student/dashboard` },
        { label: isAr ? 'الملف الأكاديمي' : 'Profile' },
      ]}
      locale={locale}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Identity Card */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center border-2 border-[#DCE3EB] font-bold text-2xl shrink-0">
            <User size={36} className="text-[#082B50]" />
          </div>

          <div className="text-center sm:text-start space-y-1 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-base md:text-lg font-bold text-[#102033]">
                {notAvailable}
              </h2>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EFF3F8] text-[#082B50] border border-[#DCE3EB]">
                {notAvailable}
              </span>
            </div>
            <p className="text-xs text-[#607086]">
              {notAvailable}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-[#607086]">
              <span className="flex items-center gap-1">
                <ShieldCheck size={14} className="text-[#082B50]" />
                <span>{isAr ? 'حساب أكاديمي' : 'Academic Account'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Academic Enrollment Information (Read-only institutional records) */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#DCE3EB]">
            <ShieldCheck size={18} className="text-[#082B50]" />
            <h3 className="text-sm font-bold text-[#102033]">
              {isAr ? 'بيانات القيد والتسجيل الأكاديمي' : 'Academic Registration Details'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#DCE3EB]">
              <span className="text-[#607086] block text-[11px]">{isAr ? 'الرقم الجامعي:' : 'Academic ID:'}</span>
              <span className="font-bold text-[#082B50] font-mono text-sm mt-0.5 block">{notAvailable}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#DCE3EB]">
              <span className="text-[#607086] block text-[11px]">{isAr ? 'حالة القيد:' : 'Registration Status:'}</span>
              <span className="font-bold text-[#082B50] text-sm mt-0.5 block">{notAvailable}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#DCE3EB]">
              <span className="text-[#607086] block text-[11px]">{isAr ? 'نوع الدراسة:' : 'Study Mode:'}</span>
              <span className="font-bold text-[#082B50] text-sm mt-0.5 block">{notAvailable}</span>
            </div>
          </div>
        </div>

        {/* Update Contact Form */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 md:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[#DCE3EB]">
            <User size={18} className="text-[#082B50]" />
            <h3 className="text-sm font-bold text-[#102033]">
              {isAr ? 'تحديث بيانات الاتصال والعنوان' : 'Update Contact Information'}
            </h3>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#102033] mb-1.5">
                  {isAr ? 'رقم الهاتف المتنقل' : 'Mobile Phone Number'}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={isAr ? 'أدخل رقم الهاتف...' : 'Enter phone number...'}
                  className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl px-3.5 py-2.5 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102033] mb-1.5">
                  {isAr ? 'العنوان الوطني أو مدينة الإقامة' : 'City or Residential Address'}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={isAr ? 'المدينة، الحي...' : 'City, district...'}
                  className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl px-3.5 py-2.5 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#082B50] hover:bg-[#061E38] text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                <Save size={14} className="text-[#D6A53A]" />
                <span>{isAr ? 'حفظ التعديلات' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </PortalPage>
  );
};
