import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  LogIn,
  Mail,
  Users,
} from 'lucide-react';
import type { PortalArea } from '../../types';
import { Locale } from '../../i18n/dictionaries';
import { useTranslation } from '../../i18n/useTranslation';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../services/apiClient';
import { AuthCard } from '../../components/scaffold/AuthCard';

interface LoginPageProps {
  locale: Locale;
}

export const LoginPage: React.FC<LoginPageProps> = ({ locale }) => {
  const navigate = useNavigate();
  const { isAr } = useTranslation();
  const { login } = useAuth();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [role, setRole] = useState<PortalArea>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const user = await login({ email: identifier, password });

      const primaryRole = user.primaryRole || role;
      let targetPath = `/${locale}/student/dashboard`;
      if (primaryRole === 'instructor') {
        targetPath = `/${locale}/instructor/dashboard`;
      } else if (primaryRole === 'department_head' || primaryRole === 'department') {
        targetPath = `/${locale}/department/dashboard`;
      } else if (primaryRole === 'system_admin' || primaryRole === 'admin') {
        targetPath = `/${locale}/admin/dashboard`;
      } else if (primaryRole === 'alumni') {
        targetPath = `/${locale}/alumni/dashboard`;
      }

      navigate(targetPath, { replace: true });
    } catch (err: unknown) {
      setIsSubmitting(false);
      const apiErr = err as ApiError;
      const code = apiErr.code;
      const msg = apiErr.message || '';

      if (code === 'INVALID_CREDENTIALS') {
        if (msg.toLowerCase().includes('verif')) {
          setError(
            isAr
              ? 'لم يتم تأكيد عنوان البريد الإلكتروني بعد. يرجى تفعيل حسابك من خلال رابط التحقق.'
              : 'Email address has not been verified yet. Please check your inbox to verify your account.'
          );
        } else {
          setError(
            isAr
              ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
              : 'Invalid email address or password.'
          );
        }
      } else if (code === 'ACCOUNT_LOCKED') {
        setError(
          isAr
            ? 'تم قفل الحساب مؤقتاً لمدة 15 دقيقة بسبب تكرار المحاولات الخاطئة.'
            : 'Account is temporarily locked for 15 minutes due to multiple failed attempts.'
        );
      } else if (code === 'ACCOUNT_DISABLED') {
        setError(
          isAr
            ? 'تم تعطيل هذا الحساب. يرجى التواصل مع إدارة القبول والتسجيل.'
            : 'This account is disabled. Please contact academic support.'
        );
      } else if (code === 'TOO_MANY_REQUESTS' || code === 'RATE_LIMIT_EXCEEDED') {
        setError(
          isAr
            ? 'تم تجاوز الحد المسموح من المحاولات. يرجى الانتظار والمحاولة لاحقاً.'
            : 'Too many requests. Please wait a moment and try again.'
        );
      } else {
        setError(
          msg || (isAr ? 'فشل تسجيل الدخول. يرجى التحقق من اتصالك بالشبكة.' : 'Login failed. Please check network connection.')
        );
      }
    }
  };

  const roleOptions: { value: PortalArea; ar: string; en: string }[] = [
    { value: 'department', ar: 'رئيس قسم', en: 'Department head' },
    { value: 'admin', ar: 'مشرف النظام', en: 'Administrator' },
    { value: 'alumni', ar: 'خريج', en: 'Alumni' },
  ];

  return (
    <AuthCard
      title={isAr ? 'تسجيل الدخول' : 'Sign in'}
      subtitle={isAr ? 'مرحباً بك في منصة أكاديمية نبا' : 'Welcome to the NABA Academy platform'}
      locale={locale}
      footerSlot={
        <p className="m-0">
          {isAr ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
          <Link to={`/${locale}/auth/register`} className="auth-text-link">
            {isAr ? 'إنشاء حساب جديد' : 'Create an account'}
          </Link>
        </p>
      }
    >
      <div className="mb-6">
        <div className="auth-role-tabs" role="group" aria-label={isAr ? 'نوع الحساب' : 'Account type'}>
          <button
            type="button"
            aria-pressed={role === 'student'}
            onClick={() => setRole('student')}
            className="auth-role-tab"
          >
            <GraduationCap size={17} aria-hidden="true" />
            {isAr ? 'الطالب' : 'Student'}
          </button>
          <button
            type="button"
            aria-pressed={role === 'instructor'}
            onClick={() => setRole('instructor')}
            className="auth-role-tab"
          >
            <Users size={17} aria-hidden="true" />
            {isAr ? 'عضو هيئة التدريس' : 'Faculty'}
          </button>
        </div>
        <div className="auth-role-links">
          <span>{isAr ? 'بوابات أخرى:' : 'Other portals:'}</span>
          {roleOptions.map((option, index) => (
            <React.Fragment key={option.value}>
              {index > 0 && <span aria-hidden="true">·</span>}
              <button
                type="button"
                aria-pressed={role === option.value}
                onClick={() => setRole(option.value)}
                className="auth-role-link"
              >
                {isAr ? option.ar : option.en}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      {error && (
        <div id="login-error" className="auth-alert mb-5" role="alert" aria-live="assertive">
          <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label htmlFor="login-identifier" className="auth-label">
            {isAr ? 'البريد الإلكتروني' : 'Email address'}
          </label>
          <div className="relative">
            <input
              id="login-identifier"
              type="email"
              autoComplete="username"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={isAr ? 'أدخل بريدك الإلكتروني' : 'Enter your email address'}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'login-error' : undefined}
              className="auth-input auth-input--icon-start"
            />
            <Mail size={17} className="auth-field-icon" aria-hidden="true" />
          </div>
        </div>

        <div>
          <label htmlFor="login-password" className="auth-label">
            {isAr ? 'كلمة المرور' : 'Password'}
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isAr ? 'أدخل كلمة المرور' : 'Enter your password'}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'login-error' : undefined}
              className="auth-input auth-input--icon-start auth-input--icon-end"
            />
            <Lock size={17} className="auth-field-icon" aria-hidden="true" />
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

        <div className="flex items-center justify-between gap-3 text-sm">
          <label htmlFor="login-remember-me" className="inline-flex cursor-pointer items-center gap-2 text-slate-600">
            <input
              id="login-remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="auth-checkbox rounded border-slate-300"
            />
            <span>{isAr ? 'تذكرني' : 'Remember me'}</span>
          </label>
          <Link to={`/${locale}/auth/forgot-password`} className="auth-text-link">
            {isAr ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
          </Link>
        </div>

        <button type="submit" disabled={isSubmitting} className="auth-submit">
          {isSubmitting ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <LogIn size={18} aria-hidden="true" />}
          <span>{isSubmitting ? (isAr ? 'جارٍ التحقق...' : 'Signing in...') : (isAr ? 'تسجيل الدخول' : 'Sign in')}</span>
          {!isSubmitting && <ArrowIcon size={16} aria-hidden="true" />}
        </button>
      </form>
    </AuthCard>
  );
};
