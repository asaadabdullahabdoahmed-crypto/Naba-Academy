import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, Info, KeyRound, Loader2 } from 'lucide-react';
import { AuthCard } from '../../components/scaffold/AuthCard';
import { Locale } from '../../i18n/dictionaries';
import { useTranslation } from '../../i18n/useTranslation';

import { authService } from '../../services/authService';
import { ApiError } from '../../services/apiClient';

interface ForgotPasswordPageProps {
  locale: Locale;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const [email, setEmail] = useState('');
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
      title={isAr ? 'استعادة كلمة المرور' : 'Reset your password'}
      subtitle={
        isAr
          ? 'أدخل بريدك الإلكتروني المسجل في النظام لإرسال رابط إعادة التعيين'
          : 'Enter your registered email address to receive password reset instructions'
      }
      locale={locale}
      footerSlot={
        <div>
          <Link to={`/${locale}/auth/login`} className="auth-text-link">
            {isAr ? 'العودة لتسجيل الدخول' : 'Back to Login'}
          </Link>
        </div>
      }
    >
      {error && (
        <div id="forgot-error" className="auth-alert mb-5" role="alert" aria-live="assertive">
          <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p className="m-0">
            {error}
          </p>
        </div>
      )}

      {statusNotice && (
        <div className={`auth-notice mb-5 ${isSuccess ? 'auth-notice--success' : ''}`} role="status" aria-live="polite">
          <Info size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p className="m-0">
            {statusNotice}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="forgot-email" className="auth-label">
            {isAr ? 'البريد الإلكتروني المسجل' : 'Registered Email Address'}
          </label>
          <div className="relative">
            <Mail className="auth-field-icon" aria-hidden="true" />
            <input
              type="email"
              id="forgot-email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'forgot-error' : undefined}
              className="auth-input auth-input--icon-start"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="auth-submit mt-2"
        >
          {isSubmitting ? (
            <Loader2 size={17} className="animate-spin" aria-hidden="true" />
          ) : (
            <KeyRound size={17} aria-hidden="true" />
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
