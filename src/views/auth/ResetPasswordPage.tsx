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
      title={isAr ? 'تعيين كلمة مرور جديدة' : 'Create New Password'}
      subtitle={
        isAr
          ? 'أدخل كلمة مرور قوية تحتوي على 8 خانات على الأقل تشمل أحرفًا وأرقامًا'
          : 'Enter a strong password with at least 8 characters including letters and digits'
      }
      locale={locale}
      footerSlot={
        <Link to={`/${locale}/auth/login`} className="font-bold text-[#082B50] hover:underline">
          {isAr ? 'العودة لتسجيل الدخول' : 'Back to Login'}
        </Link>
      }
    >
      {error && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
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
            <Info size={18} className="text-[#082B50] shrink-0 mt-0.5" />
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#102033] mb-1.5">
            {isAr ? 'رمز إعادة التعيين (Token)' : 'Reset Token'}
          </label>
          <input
            type="text"
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="e.g. 64-character verification token"
            className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#102033] mb-1.5">
            {isAr ? 'كلمة المرور الجديدة (12 خانة على الأقل)' : 'New Password (min 12 characters)'}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={12}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl ps-3 pe-9 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 -translate-y-1/2 end-3 text-[#607086] hover:text-[#102033]"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#102033] mb-1.5">
            {isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'}
          </label>
          <input
            type="password"
            required
            minLength={12}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••••••"
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
              ? isAr ? 'جاري الحفظ...' : 'Saving...'
              : isAr ? 'حفظ كلمة المرور الجديدة' : 'Save New Password'}
          </span>
        </button>
      </form>
    </AuthCard>
  );
};
