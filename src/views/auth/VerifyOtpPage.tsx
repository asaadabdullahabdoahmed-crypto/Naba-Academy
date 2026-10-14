import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShieldCheck, AlertCircle, Info, Loader2, CheckCircle2, RotateCw } from 'lucide-react';
import { AuthCard } from '../../components/scaffold/AuthCard';
import { Locale } from '../../i18n/dictionaries';
import { useTranslation } from '../../i18n/useTranslation';
import { authService } from '../../services/authService';
import { ApiError } from '../../services/apiClient';

interface VerifyOtpPageProps {
  locale: Locale;
}

export const VerifyOtpPage: React.FC<VerifyOtpPageProps> = ({ locale }) => {
  const [searchParams] = useSearchParams();
  const { isAr } = useTranslation();

  const getTokenFromUrl = () => {
    const fromQuery = searchParams.get('token');
    if (fromQuery) return fromQuery;
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, '?'));
      const fromHash = hashParams.get('token');
      if (fromHash) return fromHash;
    }
    return '';
  };

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [token, setToken] = useState(getTokenFromUrl());
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-verify if token is present in URL
  useEffect(() => {
    const urlToken = getTokenFromUrl();
    if (urlToken && !isSuccess && !error && !isSubmitting) {
      handleTokenVerification(urlToken);
    }
  }, []);

  const handleTokenVerification = async (targetToken: string) => {
    if (!targetToken.trim()) {
      setError(isAr ? 'رمز التحقق مطلوب' : 'Verification token is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setStatusNotice(null);

    try {
      const res = await authService.verifyEmail(targetToken.trim());
      setIsSuccess(true);
      setStatusNotice(
        res.message ||
          (isAr
            ? 'تم تأكيد البريد الإلكتروني بنجاح وتفعيل حسابك الأكاديمي. يمكنك الآن تسجيل الدخول.'
            : 'Email address verified successfully. Your academic account is now active.')
      );
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const code = apiErr.code;
      const msg = apiErr.message || '';

      if (code === 'INVALID_VERIFICATION_TOKEN') {
        setError(
          isAr
            ? 'رمز التحقق غير صالح أو غير موجود.'
            : 'The verification token is invalid or does not exist.'
        );
      } else if (code === 'VERIFICATION_TOKEN_EXPIRED') {
        setError(
          isAr
            ? 'انتهت صلاحية رمز التحقق (الصلاحية 24 ساعة). يرجى طلب رمز جديد.'
            : 'The verification token has expired (24h validity). Please request a new link.'
        );
      } else if (code === 'VERIFICATION_TOKEN_ALREADY_USED') {
        setError(
          isAr
            ? 'تم استخدام هذا الرمز مسبقاً وتأكيد الحساب.'
            : 'This verification token has already been used.'
        );
      } else {
        setError(
          msg || (isAr ? 'فشل تأكيد البريد الإلكتروني.' : 'Failed to verify email address.')
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    handleTokenVerification(token);
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setError(isAr ? 'يرجى إدخال البريد الإلكتروني لإعادة إرسال الرابط' : 'Please provide your email to resend link');
      return;
    }

    setIsResending(true);
    setError(null);

    try {
      const res = await authService.resendVerification(email.trim());
      setStatusNotice(
        res.message ||
          (isAr
            ? 'تمت إعادة إرسال رابط تأكيد الحساب بنجاح إذا كان الحساب مسجلاً.'
            : 'Verification link resent successfully if account exists.')
      );
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(
        apiErr.message || (isAr ? 'تعذر إعادة إرسال الرابط حالياً.' : 'Failed to resend verification link.')
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthCard
      title={isAr ? 'تأكيد الحساب والبريد الإلكتروني' : 'Account & Email Verification'}
      subtitle={
        isAr
          ? 'أدخل رمز أو رابط التحقق المرسل إلى بريدك الإلكتروني لتفعيل حسابك'
          : 'Enter your verification token or confirm the link sent to your registered email'
      }
      locale={locale}
      footerSlot={
        <div className="space-y-2">
          <div>
            <Link to={`/${locale}/auth/login`} className="font-semibold text-[#607086] hover:text-[#082B50]">
              {isAr ? 'العودة لتسجيل الدخول' : 'Back to Login'}
            </Link>
          </div>
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
          {isSuccess ? (
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <Info size={18} className="shrink-0 mt-0.5" />
          )}
          <div className="text-xs leading-relaxed font-medium space-y-2">
            <p>{statusNotice}</p>
            {isSuccess && (
              <div className="pt-2">
                <Link
                  to={`/${locale}/auth/login`}
                  className="inline-flex items-center gap-1.5 font-bold text-emerald-900 underline"
                >
                  <span>{isAr ? 'الانتقال إلى صفحة تسجيل الدخول' : 'Proceed to Sign In'}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-[#102033] mb-1">
            {isAr ? 'البريد الإلكتروني' : 'Email Address'}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#102033] mb-1">
            {isAr ? 'رمز التحقق (Verification Token)' : 'Verification Token'}
          </label>
          <input
            type="text"
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="e.g. 64-character verification token"
            className="w-full text-center text-xs tracking-wider font-mono rounded-xl border border-[#DCE3EB] bg-[#F7F9FC] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50] py-2.5 px-3"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-[#082B50] hover:bg-[#061E38] text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isSubmitting ? (
            <Loader2 size={16} className="animate-spin text-[#D6A53A]" />
          ) : (
            <ShieldCheck size={16} />
          )}
          <span>
            {isSubmitting
              ? isAr ? 'جاري التحقق...' : 'Verifying...'
              : isAr ? 'تأكيد الحساب' : 'Verify Account'}
          </span>
        </button>

        <div className="pt-2 text-center border-t border-[#DCE3EB]">
          <button
            type="button"
            disabled={isResending}
            onClick={handleResend}
            className="inline-flex items-center gap-1.5 text-xs text-[#174F89] hover:underline font-semibold cursor-pointer disabled:opacity-50"
          >
            {isResending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <RotateCw size={13} />
            )}
            <span>
              {isResending
                ? isAr ? 'جاري إعادة الإرسال...' : 'Resending...'
                : isAr ? 'إعادة إرسال رابط التحقق' : 'Resend verification link'}
            </span>
          </button>
        </div>
      </form>
    </AuthCard>
  );
};
