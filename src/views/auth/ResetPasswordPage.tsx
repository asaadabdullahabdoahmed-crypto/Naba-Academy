import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, Info, KeyRound } from 'lucide-react';
import { AuthCard } from '../../components/scaffold/AuthCard';
import { Locale } from '../../i18n/dictionaries';
import { useTranslation } from '../../i18n/useTranslation';

interface ResetPasswordPageProps {
  locale: Locale;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ locale }) => {
  const [searchParams] = useSearchParams();
  const { isAr } = useTranslation();

  const [token, setToken] = useState(searchParams.get('token') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    if (!token.trim()) {
      setError(isAr ? 'رمز إعادة التعيين مطلوب' : 'Reset token is required');
      return;
    }

    setStatusNotice(
      isAr
        ? 'تم التحقق من تطابق كلمة المرور محليًا. تتطلب معالجة تغيير كلمة المرور والتحقق من صلاحية الرمز ربط خادم المصادقة (NestJS Auth API).'
        : 'Password match verified locally. Token validation and password update require connection to the backend auth service.'
    );
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
        <div className="mb-6 p-4 rounded-xl bg-[#082B50]/5 border border-[#082B50]/20 flex items-start gap-3">
          <Info size={18} className="text-[#082B50] shrink-0 mt-0.5" />
          <p className="text-xs text-[#082B50] leading-relaxed font-medium">
            {statusNotice}
          </p>
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
            {isAr ? 'كلمة المرور الجديدة' : 'New Password'}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
          />
        </div>

        <button
          type="submit"
          className="w-full mt-2 py-2.5 bg-[#082B50] hover:bg-[#061E38] text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
        >
          <KeyRound size={15} />
          <span>{isAr ? 'حفظ كلمة المرور الجديدة' : 'Save New Password'}</span>
        </button>
      </form>
    </AuthCard>
  );
};
