import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, AlertCircle, Loader2, Info } from 'lucide-react';
import { AuthCard } from '../../components/scaffold/AuthCard';
import { Locale } from '../../i18n/dictionaries';
import { useTranslation } from '../../i18n/useTranslation';

interface RegisterPageProps {
  locale: Locale;
}

export interface RegistrationFormData {
  fullNameAr: string;
  fullNameEn: string;
  email: string;
  phone: string;
  password: string;
  nationalId: string;
  program: string;
  highSchoolGpa: string;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();

  const [formData, setFormData] = useState<RegistrationFormData>({
    fullNameAr: '',
    fullNameEn: '',
    email: '',
    phone: '',
    password: '',
    nationalId: '',
    program: 'BS-CS',
    highSchoolGpa: '',
  });

  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Honest notification without simulating fake applicant record creation
    setStatusNotice(
      isAr
        ? 'تم حفظ مدخلات طلب القبول في نموذج التسجيل محليًا. خدمة إنشاء وحفظ طلبات القبول الرسمية بانتظار اكتمال ربط خادم القبول وقاعدة البيانات (NestJS / PostgreSQL).'
        : 'Admission application inputs captured locally. Formal application submission is pending connection with the backend admissions service and database.'
    );
  };

  return (
    <AuthCard
      title={isAr ? 'تقديم طلب قبول جديد' : 'New Admission Application'}
      subtitle={
        isAr
          ? 'تعبئة استمارة التقديم الإلكترونية للالتحاق بالبرامج الأكاديمية'
          : 'Submit your digital application to enroll in NABA Academy academic programs'
      }
      locale={locale}
      footerSlot={
        <div className="flex items-center justify-center gap-2">
          <span className="text-[#607086]">
            {isAr ? 'لديك حساب بالفعل؟' : 'Already have an account?'}
          </span>
          <Link to={`/${locale}/auth/login`} className="font-bold text-[#082B50] hover:underline">
            {isAr ? 'تسجيل الدخول' : 'Sign In'}
          </Link>
        </div>
      }
    >
      {statusNotice && (
        <div className="mb-6 p-4 rounded-xl bg-[#082B50]/5 border border-[#082B50]/20 flex items-start gap-3">
          <Info size={18} className="text-[#082B50] shrink-0 mt-0.5" />
          <p className="text-xs text-[#082B50] leading-relaxed font-medium">
            {statusNotice}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#102033] mb-1.5">
            {isAr ? 'الاسم باللغة العربية' : 'Full Name (Arabic)'}
          </label>
          <input
            type="text"
            required
            value={formData.fullNameAr}
            onChange={(e) => setFormData({ ...formData, fullNameAr: e.target.value })}
            placeholder={isAr ? 'الاسم الثلاثي أو الرباعي' : 'Full Arabic name'}
            className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#102033] mb-1.5">
            {isAr ? 'الاسم باللغة الإنجليزية' : 'Full Name (English)'}
          </label>
          <input
            type="text"
            required
            value={formData.fullNameEn}
            onChange={(e) => setFormData({ ...formData, fullNameEn: e.target.value })}
            placeholder="As written in passport / official ID"
            className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#102033] mb-1.5">
              {isAr ? 'الهوية الوطنية / الإقامة' : 'National ID / Iqama'}
            </label>
            <input
              type="text"
              required
              value={formData.nationalId}
              onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
              placeholder="10XXXXXXXX"
              className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#102033] mb-1.5">
              {isAr ? 'رقم الجوال' : 'Phone Number'}
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="05XXXXXXXX"
              className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#102033] mb-1.5">
            {isAr ? 'البريد الإلكتروني' : 'Email Address'}
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="applicant@example.com"
            className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#102033] mb-1.5">
            {isAr ? 'كلمة المرور' : 'Password'}
          </label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
            className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
          />
        </div>

        <button
          type="submit"
          className="w-full mt-2 py-2.5 bg-[#082B50] hover:bg-[#061E38] text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
        >
          <UserPlus size={15} />
          <span>{isAr ? 'تقديم طلب القبول' : 'Submit Admission Application'}</span>
        </button>

        <div className="pt-2 text-center">
          <Link
            to={`/${locale}/auth/application-status`}
            className="text-xs text-[#174F89] hover:underline font-semibold"
          >
            {isAr ? 'متابعة حالة طلب سابق' : 'Track an existing application'}
          </Link>
        </div>
      </form>
    </AuthCard>
  );
};
