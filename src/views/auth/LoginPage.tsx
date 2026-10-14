import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Mail,
  Lock,
  Globe,
  GraduationCap,
  Users,
  Shield,
  Briefcase,
  Layers,
  ArrowRight,
  ArrowLeft,
  Clock,
  Laptop,
  MapPin,
  UserPlus,
} from 'lucide-react';
import type { PortalArea } from '../../types';
import { Locale } from '../../i18n/dictionaries';
import { useTranslation } from '../../i18n/useTranslation';
import { NabaLogo } from '../../components/common/NabaLogo';
import { ASSET_IMAGES } from '../../assets/branding/images';

import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../services/apiClient';

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

  const handleLanguageSwitch = () => {
    const nextLocale: Locale = isAr ? 'en' : 'ar';
    navigate(`/${nextLocale}/auth/login`);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const user = await login({ email: identifier, password });
      
      // Route user to appropriate portal based on authenticated primaryRole or selected role
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

      navigate(targetPath);
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
      } else if (code === 'TOO_MANY_REQUESTS') {
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

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col justify-between font-sans">
      {/* Top Bar with Language Switcher & Home Link */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <Link
          to={`/${locale}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#082B50] hover:text-[#174F89] transition-colors"
        >
          <ArrowIcon size={14} />
          <span>{isAr ? 'العودة للموقع الرئيسي' : 'Back to Home'}</span>
        </Link>

        <button
          type="button"
          onClick={handleLanguageSwitch}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DCE3EB] bg-white text-xs font-bold text-[#082B50] hover:bg-[#EFF3F8] transition-colors cursor-pointer"
        >
          <Globe size={13} className="text-[#D6A53A]" />
          <span>{isAr ? 'English' : 'العربية'}</span>
        </button>
      </div>

      {/* Main Split-Screen Layout */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-6 lg:p-8">
        <div className="w-full max-w-5xl bg-white rounded-3xl border border-[#DCE3EB] shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          {/* Form Column */}
          <div className="lg:col-span-6 p-6 sm:p-10 md:p-12 flex flex-col justify-center">
            {/* Header with Logo */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <NabaLogo size="md" variant="dark" showSubtitle={true} />
              </div>
              <h1 className="text-2xl font-black text-[#082B50] tracking-tight">
                {isAr ? 'تسجيل الدخول' : 'Sign In'}
              </h1>
              <p className="text-xs text-[#607086] mt-1.5">
                {isAr ? 'مرحباً بك في منصة أكاديمية نبا' : 'Welcome to NABA Academy Platform'}
              </p>
            </div>

            {/* Role Switcher Tabs */}
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#EFF3F8] border border-[#DCE3EB] rounded-xl text-center">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    role === 'student'
                      ? 'bg-[#082B50] text-white shadow-xs'
                      : 'text-[#607086] hover:text-[#082B50]'
                  }`}
                >
                  <GraduationCap size={15} className={role === 'student' ? 'text-[#D6A53A]' : ''} />
                  <span>{isAr ? 'الطالب' : 'Student'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('instructor')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    role === 'instructor'
                      ? 'bg-[#082B50] text-white shadow-xs'
                      : 'text-[#607086] hover:text-[#082B50]'
                  }`}
                >
                  <Users size={15} className={role === 'instructor' ? 'text-[#D6A53A]' : ''} />
                  <span>{isAr ? 'أعضاء هيئة التدريس' : 'Faculty'}</span>
                </button>
              </div>

              {/* Other Roles Dropdown / Quick Links */}
              <div className="mt-2 flex items-center justify-center gap-3 text-[11px] text-[#607086]">
                <span>{isAr ? 'أدوار أخرى:' : 'Other portals:'}</span>
                <button
                  type="button"
                  onClick={() => setRole('department')}
                  className={`hover:underline cursor-pointer ${role === 'department' ? 'font-bold text-[#082B50]' : ''}`}
                >
                  {isAr ? 'رئيس قسم' : 'Dept. Head'}
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`hover:underline cursor-pointer ${role === 'admin' ? 'font-bold text-[#082B50]' : ''}`}
                >
                  {isAr ? 'مشرف نظام' : 'Admin'}
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setRole('alumni')}
                  className={`hover:underline cursor-pointer ${role === 'alumni' ? 'font-bold text-[#082B50]' : ''}`}
                >
                  {isAr ? 'خريج' : 'Alumni'}
                </button>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-[#C93C3C] text-xs rounded-xl">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email / Academic ID */}
              <div>
                <label htmlFor="login-identifier" className="block text-xs font-semibold text-[#102033] mb-1.5">
                  {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="relative">
                  <input
                    id="login-identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={isAr ? 'أدخل بريدك الإلكتروني' : 'Enter your email address'}
                    className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl ps-10 pe-4 py-2.5 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50] transition-colors"
                  />
                  <Mail size={16} className="absolute top-1/2 -translate-y-1/2 start-3.5 text-[#607086]" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="block text-xs font-semibold text-[#102033] mb-1.5">
                  {isAr ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isAr ? 'أدخل كلمة المرور' : 'Enter your password'}
                    className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl ps-10 pe-10 py-2.5 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50] transition-colors"
                  />
                  <Lock size={16} className="absolute top-1/2 -translate-y-1/2 start-3.5 text-[#607086]" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 -translate-y-1/2 end-3.5 text-[#607086] hover:text-[#082B50] cursor-pointer"
                    aria-label={showPassword ? (isAr ? 'إخفاء كلمة المرور' : 'Hide password') : (isAr ? 'إظهار كلمة المرور' : 'Show password')}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label htmlFor="login-remember-me" className="flex items-center gap-2 cursor-pointer text-[#607086]">
                  <input
                    id="login-remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#DCE3EB] text-[#082B50] focus:ring-[#082B50]"
                  />
                  <span>{isAr ? 'تذكرني' : 'Remember me'}</span>
                </label>

                <Link
                  to={`/${locale}/auth/forgot-password`}
                  className="font-semibold text-[#174F89] hover:underline"
                >
                  {isAr ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#082B50] hover:bg-[#061E38] text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <LogIn size={16} className="text-[#D6A53A]" />
                )}
                <span>
                  {isSubmitting
                    ? isAr ? 'جاري التحقق...' : 'Signing in...'
                    : isAr ? 'تسجيل الدخول' : 'Sign In'}
                </span>
                {!isSubmitting && <ArrowIcon size={14} className="text-[#D6A53A]" />}
              </button>

              {/* Divider: أو */}
              <div className="relative py-2 flex items-center justify-center">
                <div className="w-full border-t border-[#DCE3EB]" />
                <span className="absolute bg-white px-3 text-xs text-[#607086] font-medium">
                  {isAr ? 'أو' : 'OR'}
                </span>
              </div>

              {/* Register / Create Account Button */}
              <Link
                to={`/${locale}/auth/register`}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#DCE3EB] bg-white hover:bg-[#EFF3F8] text-[#082B50] text-xs font-bold transition-colors shadow-2xs"
              >
                <UserPlus size={15} />
                <span>{isAr ? 'إنشاء حساب جديد' : 'Create New Account'}</span>
              </Link>
            </form>
          </div>

          {/* Visual Digital Learning Column */}
          <div className="hidden lg:flex lg:col-span-6 bg-linear-to-br from-[#082B50] via-[#061E38] to-[#041528] p-8 md:p-12 text-white flex-col justify-between relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#D6A53A]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top Brand Header */}
            <div className="text-center relative z-10">
              <div className="flex justify-center mb-3">
                <NabaLogo size="lg" variant="light" showSubtitle={true} />
              </div>
              <h3 className="text-base font-bold text-white/95">
                {isAr ? 'منصة تعليمية متكاملة للتعليم عن بعد' : 'Integrated Distance Learning Platform'}
              </h3>
            </div>

            {/* Central 3D Graphic */}
            <div className="my-auto py-4 relative z-10 flex justify-center">
              <div className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-[#D6A53A]/30 shadow-2xl">
                <img
                  src={ASSET_IMAGES.loginVisual}
                  alt={isAr ? 'التعليم الرقمي نبا' : 'NABA Digital Learning'}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Bottom Value Badges (Neutral, no unverified accreditation claims) */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10 text-center relative z-10 text-xs">
              <div className="flex flex-col items-center">
                <Clock size={16} className="text-[#D6A53A] mb-1" />
                <span className="font-semibold text-white/90 text-[11px]">{isAr ? 'تعليم مرن' : 'Flexible'}</span>
              </div>
              <div className="flex flex-col items-center">
                <Laptop size={16} className="text-[#D6A53A] mb-1" />
                <span className="font-semibold text-white/90 text-[11px]">{isAr ? 'محتوى رقمي' : 'Digital Content'}</span>
              </div>
              <div className="flex flex-col items-center">
                <MapPin size={16} className="text-[#D6A53A] mb-1" />
                <span className="font-semibold text-white/90 text-[11px]">{isAr ? 'تعلم في أي مكان' : 'Anywhere'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Copyright */}
      <footer className="w-full text-center py-4 text-xs text-[#607086]">
        © {new Date().getFullYear()} {isAr ? 'أكاديمية نبا' : 'NABA Academy'}. {isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
      </footer>
    </div>
  );
};
