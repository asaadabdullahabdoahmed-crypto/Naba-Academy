import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, AlertCircle, Loader2, Info } from 'lucide-react';
import { AuthCard } from '../../components/scaffold/AuthCard';
import { Locale } from '../../i18n/dictionaries';
import { useTranslation } from '../../i18n/useTranslation';

import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../services/apiClient';

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
  const { register } = useAuth();

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
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusNotice(null);

    // Client-side password policy check (12-128 chars per security architecture)
    if (formData.password.length < 12) {
      setError(
        isAr
          ? 'يجب أن تتكون كلمة المرور من 12 خانة على الأقل وتحتوي على أحرف وأرقام ورموز.'
          : 'Password must be at least 12 characters and contain letters, numbers, and symbols.'
      );
      return;
    }

    if (formData.nationalId.trim().length < 10) {
      setError(
        isAr
          ? 'رقم الهوية الوطنية / الإقامة يجب أن يتكون من 10 أرقام على الأقل.'
          : 'National ID / Iqama must be at least 10 characters.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await register({
        email: formData.email,
        password: formData.password,
        nationalId: formData.nationalId,
        fullNameAr: formData.fullNameAr,
        fullNameEn: formData.fullNameEn,
        phone: formData.phone || undefined,
      });

      setIsSuccess(true);
      setStatusNotice(
        isAr
          ? 'تم استلام طلب إنشاء الحساب. إذا كان البريد الإلكتروني مؤهلاً فستصلك رسالة لتأكيد البريد. تحقق من صندوق الوارد والرسائل غير المرغوب فيها، ويمكنك استخدام صفحة تأكيد البريد لإعادة الإرسال.'
          : 'Your registration request has been received. If the email address is eligible, a verification email will be sent. Check your inbox and spam folder, or use the verification page to request another email.'
      );
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const code = apiErr.code;
      const msg = apiErr.message || '';

      if (code === 'EMAIL_ALREADY_REGISTERED' || msg.toLowerCase().includes('already exists')) {
        setError(
          isAr
            ? 'يوجد حساب مسجل مسبقاً بهذا البريد الإلكتروني.'
            : 'An account with this email address already exists.'
        );
      } else if (code === 'PASSWORD_POLICY_VIOLATION') {
        setError(
          isAr
            ? 'كلمة المرور لا تستوفي معايير الأمان (12 خانة على الأقل مع أحرف وأرقام ورموز).'
            : 'Password does not meet security requirements (min 12 characters with mixed complexity).'
        );
      } else if (code === 'TOO_MANY_REQUESTS') {
        setError(
          isAr
            ? 'تم تجاوز الحد المسموح من المحاولات. يرجى الانتظار والمحاولة لاحقاً.'
            : 'Too many registration requests. Please wait and try again later.'
        );
      } else {
        setError(
          msg || (isAr ? 'فشل إنشاء الحساب. يرجى مراجعة البيانات.' : 'Failed to create account. Please check inputs.')
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title={isAr ? 'إنشاء حساب جديد' : 'Create a New Account'}
      subtitle={
        isAr
          ? 'إنشاء حساب مستخدم جديد للوصول إلى منصة أكاديمية نبا'
          : 'Create a new user account to access the NABA Academy platform'
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
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
          <AlertCircle size={18} className="text-[#C93C3C] shrink-0 mt-0.5" />
          <p className="text-xs text-[#C93C3C] leading-relaxed font-medium">
            {error}
          </p>
        </div>
      )}

      {statusNotice && (
        <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${
          isSuccess
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-[#082B50]/5 border-[#082B50]/20 text-[#082B50]'
        }`}>
          <Info size={18} className="shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed font-medium space-y-2">
            <p>{statusNotice}</p>
            {isSuccess && (
              <div className="pt-2 flex gap-3">
                <Link
                  to={`/${locale}/auth/verify-email?email=${encodeURIComponent(formData.email)}`}
                  className="inline-flex items-center gap-1 font-bold text-emerald-900 underline"
                >
                  {isAr ? 'صفحة تأكيد البريد الإلكتروني' : 'Verify Email Page'}
                </Link>
                <span>•</span>
                <Link
                  to={`/${locale}/auth/login`}
                  className="inline-flex items-center gap-1 font-bold text-emerald-900 underline"
                >
                  {isAr ? 'تسجيل الدخول' : 'Sign In'}
                </Link>
              </div>
            )}
          </div>
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
          disabled={isSubmitting}
          className="w-full mt-2 py-2.5 bg-[#082B50] hover:bg-[#061E38] text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isSubmitting ? (
            <Loader2 size={15} className="animate-spin text-[#D6A53A]" />
          ) : (
            <UserPlus size={15} />
          )}
          <span>
            {isSubmitting
              ? isAr ? 'جاري إنشاء الحساب...' : 'Creating Account...'
              : isAr ? 'إنشاء الحساب' : 'Create Account'}
          </span>
        </button>

        <div className="pt-2 text-center">
          <Link
            to={`/${locale}/auth/verify-email`}
            className="text-xs text-[#174F89] hover:underline font-semibold"
          >
            {isAr ? 'تأكيد حساب مسجل مسبقاً' : 'Verify an existing account'}
          </Link>
        </div>
      </form>
    </AuthCard>
  );
};
