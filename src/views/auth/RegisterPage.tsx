import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, AlertCircle, Loader2, Info, Eye, EyeOff } from 'lucide-react';
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
  });

  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
          ? 'تم استلام طلب التسجيل. لا يؤكد هذا الرد أهلية البريد أو وصول الرسالة. تحقق من البريد الوارد والرسائل غير المرغوب فيها، وإذا لم تصلك رسالة فاستخدم صفحة تأكيد البريد لإعادة المحاولة.'
          : 'Your registration request has been received. This response does not confirm eligibility or email delivery. Check your inbox and spam folder; if no message arrives, use the verification page to try again.'
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
      } else if (code === 'TOO_MANY_REQUESTS' || code === 'RATE_LIMIT_EXCEEDED') {
        setError(
          isAr
            ? 'تم تجاوز الحد المسموح من المحاولات. يرجى الانتظار والمحاولة لاحقاً.'
            : 'Too many registration requests. Please wait and try again later.'
        );
      } else if (
        code === 'VALIDATION_ERROR' ||
        code === 'BAD_REQUEST' ||
        apiErr.status === 400 ||
        apiErr.status === 422
      ) {
        setError(
          isAr
            ? 'تعذر إنشاء الحساب لأن بعض البيانات غير صحيحة. يرجى التحقق من جميع الحقول والمحاولة مجددًا.'
            : 'Some registration details are invalid. Please check all fields and try again.'
        );
      } else {
        setError(
          isAr
            ? 'تعذر إنشاء الحساب الآن. يرجى المحاولة لاحقًا.'
            : msg || 'Failed to create account. Please try again later.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title={isAr ? 'إنشاء حساب جديد' : 'Create an account'}
      subtitle={
        isAr
          ? 'إنشاء حساب مستخدم جديد للوصول إلى منصة أكاديمية نبا'
          : 'Create a new user account to access the NABA Academy platform'
      }
      locale={locale}
      footerSlot={
        <div className="flex items-center justify-center gap-2">
          <span className="text-slate-600">
            {isAr ? 'لديك حساب بالفعل؟' : 'Already have an account?'}
          </span>
          <Link to={`/${locale}/auth/login`} className="auth-text-link">
            {isAr ? 'تسجيل الدخول' : 'Sign In'}
          </Link>
        </div>
      }
    >
      {error && (
        <div id="register-error" className="auth-alert mb-5" role="alert" aria-live="assertive">
          <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p className="m-0">
            {error}
          </p>
        </div>
      )}

      {statusNotice && (
        <div className={`auth-notice mb-5 ${isSuccess ? 'auth-notice--success' : ''}`} role="status" aria-live="polite">
          <Info size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <div className="space-y-2">
            <p>{statusNotice}</p>
            {isSuccess && (
              <div className="pt-2 flex gap-3">
                <Link
                  to={`/${locale}/auth/verify-email?email=${encodeURIComponent(formData.email)}`}
                  className="auth-text-link"
                >
                  {isAr ? 'صفحة تأكيد البريد الإلكتروني' : 'Verify Email Page'}
                </Link>
                <span>•</span>
                <Link
                  to={`/${locale}/auth/login`}
                  className="auth-text-link"
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
          <label htmlFor="register-name-ar" className="auth-label">
            {isAr ? 'الاسم باللغة العربية' : 'Full Name (Arabic)'}
          </label>
          <input
            id="register-name-ar"
            type="text"
            autoComplete="name"
            required
            value={formData.fullNameAr}
            onChange={(e) => setFormData({ ...formData, fullNameAr: e.target.value })}
            placeholder={isAr ? 'الاسم الثلاثي أو الرباعي' : 'Full Arabic name'}
            aria-describedby={error ? 'register-error' : undefined}
            className="auth-input"
          />
        </div>

        <div>
          <label htmlFor="register-name-en" className="auth-label">
            {isAr ? 'الاسم باللغة الإنجليزية' : 'Full Name (English)'}
          </label>
          <input
            id="register-name-en"
            type="text"
            autoComplete="name"
            required
            value={formData.fullNameEn}
            onChange={(e) => setFormData({ ...formData, fullNameEn: e.target.value })}
            placeholder={isAr ? 'كما هو مدون في جواز السفر أو الهوية الرسمية' : 'As written in passport / official ID'}
            className="auth-input"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="register-national-id" className="auth-label">
              {isAr ? 'الهوية الوطنية / الإقامة' : 'National ID / Iqama'}
            </label>
            <input
              id="register-national-id"
              type="text"
              autoComplete="off"
              required
              value={formData.nationalId}
              onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
              placeholder="10XXXXXXXX"
              className="auth-input"
            />
          </div>

          <div>
            <label htmlFor="register-phone" className="auth-label">
              {isAr ? 'رقم الجوال' : 'Phone Number'}
            </label>
            <input
              id="register-phone"
              type="tel"
              autoComplete="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="05XXXXXXXX"
              className="auth-input"
            />
          </div>
        </div>

        <div>
          <label htmlFor="register-email" className="auth-label">
            {isAr ? 'البريد الإلكتروني' : 'Email Address'}
          </label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="applicant@example.com"
            className="auth-input"
          />
        </div>

        <div>
          <label htmlFor="register-password" className="auth-label">
            {isAr ? 'كلمة المرور' : 'Password'}
          </label>
          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={12}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••••••"
              aria-describedby={error ? 'register-error' : undefined}
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="auth-submit mt-2"
        >
          {isSubmitting ? (
            <Loader2 size={17} className="animate-spin" aria-hidden="true" />
          ) : (
            <UserPlus size={17} aria-hidden="true" />
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
            className="auth-text-link text-sm"
          >
            {isAr ? 'تأكيد حساب مسجل مسبقاً' : 'Verify an existing account'}
          </Link>
        </div>
      </form>
    </AuthCard>
  );
};
