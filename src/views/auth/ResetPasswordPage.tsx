import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, Info, KeyRound, Loader2, CheckCircle2 } from 'lucide-react';
import { AuthCard } from '../../components/scaffold/AuthCard';
import { Locale } from '../../i18n/dictionaries';
import { useTranslation } from '../../i18n/useTranslation';
import { authService } from '../../services/authService';
import { ApiError } from '../../services/apiClient';

interface ResetPasswordPageProps {
  locale: Locale;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ locale }) => {
  const [searchParams] = useSearchParams();
  const { isAr } = useTranslation();

  // Support both query param (?token=...) and URL fragment (#token=...) per security spec
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

  const [token, setToken] = useState(getTokenFromUrl());
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusNotice(null);

    if (password !== confirmPassword) {
      setError(isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    if (!token.trim()) {
      setError(isAr ? 'رمز إعادة التعيين مطلوب' : 'Reset token is required');
      return;
    }

    if (password.length < 12) {
      setError(
        isAr
          ? 'يجب أن تتكون كلمة المرور من 12 خانة على الأقل وتحتوي على أحرف وأرقام ورموز.'
          : 'Password must be at least 12 characters and contain letters, numbers, and symbols.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await authService.resetPassword({
        token: token.trim(),
        password,
      });

      setIsSuccess(true);
      setStatusNotice(
        res.message ||
          (isAr
            ? 'تمت إعادة تعيين كلمة المرور بنجاح. تم إلغاء جميع الجلسات النشطة السابقة. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.'
            : 'Password has been reset successfully. All existing sessions have been terminated. You can now log in.')
      );
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const code = apiErr.code;
      const msg = apiErr.message || '';

      if (code === 'PASSWORD_RESET_INVALID_OR_EXPIRED') {
        setError(
          isAr
            ? 'رمز إعادة التعيين غير صالح أو منتهي الصلاحية أو تم استخدامه مسبقاً.'
            : 'The password reset token is invalid, expired, or has already been used.'
        );
      } else if (code === 'PASSWORD_POLICY_VIOLATION') {
        setError(
          isAr
            ? 'كلمة المرور لا تستوفي معايير الأمان (12 خانة على الأقل مع أحرف وأرقام ورموز).'
            : 'Password does not meet security requirements (min 12 characters with mixed complexity).'
        );
      } else {
        setError(
          msg || (isAr ? 'فشل إعادة تعيين كلمة المرور.' : 'Failed to reset password.')
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title={isAr ? 'تعيين كلمة مرور جديدة' : 'Create a new password'}
      subtitle={
        isAr
          ? 'أنشئ كلمة مرور قوية لا تقل عن 12 خانة.'
          : 'Create a strong password with at least 12 characters.'
      }
      locale={locale}
      footerSlot={
        <Link to={`/${locale}/auth/login`} className="auth-text-link">
          {isAr ? 'العودة لتسجيل الدخول' : 'Back to Login'}
        </Link>
      }
    >
      {error && (
        <div id="reset-error" className="auth-alert mb-5" role="alert" aria-live="assertive">
          <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reset-token" className="auth-label">
            {isAr ? 'رمز إعادة التعيين' : 'Reset token'}
          </label>
          <input
            id="reset-token"
            type="text"
            required
            autoComplete="one-time-code"
            dir="ltr"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={isAr ? 'أدخل الرمز المرسل إلى بريدك الإلكتروني' : 'Paste the reset token from your email'}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'reset-error' : undefined}
            className="auth-input"
          />
        </div>

        <div>
          <label htmlFor="reset-password" className="auth-label">
            {isAr ? 'كلمة المرور الجديدة (12 خانة على الأقل)' : 'New Password (min 12 characters)'}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="reset-password"
              autoComplete="new-password"
              required
              minLength={12}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'reset-error' : undefined}
              className="auth-input auth-input--icon-end"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="auth-password-toggle"
              aria-label={showPassword ? (isAr ? 'إخفاء كلمة المرور' : 'Hide password') : (isAr ? 'إظهار كلمة المرور' : 'Show password')}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="reset-confirm-password" className="auth-label">
            {isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'}
          </label>
          <div className="relative">
            <input
              id="reset-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={12}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'reset-error' : undefined}
              className="auth-input auth-input--icon-end"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="auth-password-toggle"
              aria-label={showConfirmPassword ? (isAr ? 'إخفاء تأكيد كلمة المرور' : 'Hide password confirmation') : (isAr ? 'إظهار تأكيد كلمة المرور' : 'Show password confirmation')}
              aria-pressed={showConfirmPassword}
            >
              {showConfirmPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
            </button>
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
              ? isAr ? 'جاري الحفظ...' : 'Saving...'
              : isAr ? 'حفظ كلمة المرور الجديدة' : 'Save New Password'}
          </span>
        </button>
      </form>
    </AuthCard>
  );
};
