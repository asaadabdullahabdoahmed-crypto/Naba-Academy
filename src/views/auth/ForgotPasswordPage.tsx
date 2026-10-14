import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, Info, KeyRound } from 'lucide-react';
import { AuthCard } from '../../components/scaffold/AuthCard';
import { Locale } from '../../i18n/dictionaries';
import { useTranslation } from '../../i18n/useTranslation';

import { Loader2 } from 'lucide-react';
import { authService } from '../../services/authService';
import { ApiError } from '../../services/apiClient';

interface ForgotPasswordPageProps {
  locale: Locale;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const [email, setEmail] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusNotice(null);
    setIsSubmitting(true);

    try {
      const res = await authService.forgotPassword({
        email: email.trim(),
        locale: locale === 'en' ? 'en' : 'ar',
      });

      setIsSuccess(true);
      setStatusNotice(
        res.message ||
          (isAr
            ? 'إذا كان هذا البريد مسجلاً في النظام، فقد تم إرسال رابط إعادة تعيين كلمة المرور إليه.'
            : 'If this email address is registered, a password reset link has been dispatched.')
      );
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(
        apiErr.message ||
          (isAr ? 'تعذر إرسال رابط الاستعادة حالياً. يرجى المحاولة لاحقاً.' : 'Unable to dispatch reset link. Please try again.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title={isAr ? 'استعادة كلمة المرور' : 'Password Recovery'}
      subtitle={
        isAr
          ? 'أدخل بريدك الإلكتروني المسجل في النظام لإرسال رابط إعادة التعيين'
          : 'Enter your registered email address to receive password reset instructions'
      }
      locale={locale}
      footerSlot={
        <div>
          <Link to={`/${locale}/auth/login`} className="font-bold text-[#082B50] hover:underline">
            {isAr ? 'العودة لتسجيل الدخول' : 'Back to Login'}
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
          <p className="text-xs leading-relaxed font-medium">
            {statusNotice}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#102033] mb-1.5">
            {isAr ? 'البريد الإلكتروني المسجل' : 'Registered Email Address'}
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-[#607086]" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl ps-9 pe-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#102033] mb-1.5">
            {isAr ? 'الهوية الوطنية / الإقامة (اختياري)' : 'National ID / Iqama (Optional)'}
          </label>
          <input
            type="text"
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value)}
            placeholder="10XXXXXXXX"
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
            <KeyRound size={15} />
          )}
          <span>
            {isSubmitting
              ? isAr ? 'جاري الإرسال...' : 'Sending...'
              : isAr ? 'إرسال رابط الاستعادة' : 'Send Reset Link'}
          </span>
        </button>
      </form>
    </AuthCard>
  );
};
