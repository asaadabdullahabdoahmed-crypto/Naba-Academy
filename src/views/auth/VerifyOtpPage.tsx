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
      title={isAr ? 'تأكيد الحساب والبريد الإلكتروني' : 'Verify your email'}
      subtitle={
        isAr
          ? 'أدخل رمز أو رابط التحقق المرسل إلى بريدك الإلكتروني لتفعيل حسابك'
          : 'Enter your verification token or confirm the link sent to your registered email'
      }
      locale={locale}
      footerSlot={
        <div className="space-y-2">
          <div>
            <Link to={`/${locale}/auth/login`} className="auth-text-link">
              {isAr ? 'العودة لتسجيل الدخول' : 'Back to Login'}
            </Link>
          </div>
        </div>
      }
    >
      {error && (
        <div id="verify-error" className="auth-alert mb-5" role="alert" aria-live="assertive">
          <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p className="m-0">
            {error}
          </p>
        </div>
      )}

      {statusNotice && (
        <div className={`auth-notice mb-5 ${isSuccess ? 'auth-notice--success' : ''}`} role="status" aria-live="polite">
          {isSuccess ? (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          ) : (
            <Info size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          )}
          <div className="space-y-2">
            <p>{statusNotice}</p>
            {isSuccess && (
              <div className="pt-2">
                <Link
                  to={`/${locale}/auth/login`}
                  className="auth-text-link"
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
          <label htmlFor="verify-email" className="auth-label">
            {isAr ? 'البريد الإلكتروني' : 'Email Address'}
          </label>
          <input
            type="email"
            id="verify-email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            aria-describedby={error ? 'verify-error' : undefined}
            className="auth-input"
          />
        </div>

        <div>
          <label htmlFor="verify-token" className="auth-label">
            {isAr ? 'رمز التحقق' : 'Verification token'}
          </label>
          <input
            type="text"
            id="verify-token"
            required
            autoComplete="one-time-code"
            dir="ltr"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={isAr ? 'أدخل الرمز المرسل إلى بريدك الإلكتروني' : 'Paste the verification token from your email'}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'verify-error' : undefined}
            className="auth-input auth-input--code"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="auth-submit"
        >
          {isSubmitting ? (
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
          ) : (
            <ShieldCheck size={18} aria-hidden="true" />
          )}
          <span>
            {isSubmitting
              ? isAr ? 'جاري التحقق...' : 'Verifying...'
              : isAr ? 'تأكيد الحساب' : 'Verify Account'}
          </span>
        </button>

        <div className="pt-4 text-center border-t border-slate-200">
          <button
            type="button"
            disabled={isResending}
            onClick={handleResend}
            className="auth-resend"
          >
            {isResending ? (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            ) : (
              <RotateCw size={16} aria-hidden="true" />
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
