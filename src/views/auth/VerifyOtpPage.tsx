import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ShieldCheck, AlertCircle, Info } from 'lucide-react';
import { AuthCard } from '../../components/scaffold/AuthCard';
import { Locale } from '../../i18n/dictionaries';
import { useTranslation } from '../../i18n/useTranslation';

interface VerifyOtpPageProps {
  locale: Locale;
}

export const VerifyOtpPage: React.FC<VerifyOtpPageProps> = ({ locale }) => {
  const [searchParams] = useSearchParams();
  const { isAr } = useTranslation();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState('');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusNotice(
      isAr
        ? 'تم استلام رمز التحقق في الواجهة. التحقق من صلاحية الرموز وتأكيد البريد الإلكتروني يتطلب ربط خادم المصادقة (NestJS Auth API).'
        : 'Verification code captured in interface. OTP verification requires connection to the backend auth service.'
    );
  };

  return (
    <AuthCard
      title={isAr ? 'تأكيد الحساب ورمز التحقق' : 'Account & OTP Verification'}
      subtitle={
        isAr
          ? 'أدخل رمز التحقق المكون من 6 أرقام المرسل إلى بريدك الإلكتروني'
          : 'Enter the 6-digit verification code sent to your registered email'
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
      {statusNotice && (
        <div className="mb-6 p-4 rounded-xl bg-[#082B50]/5 border border-[#082B50]/20 flex items-start gap-3">
          <Info size={18} className="text-[#082B50] shrink-0 mt-0.5" />
          <p className="text-xs text-[#082B50] leading-relaxed font-medium">
            {statusNotice}
          </p>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-[#102033] mb-1">
            {isAr ? 'البريد الإلكتروني' : 'Email Address'}
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#102033] mb-1">
            {isAr ? 'رمز التحقق (6 أرقام)' : 'Verification Code (6 digits)'}
          </label>
          <input
            type="text"
            required
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="000000"
            className="w-full text-center text-lg tracking-widest font-black rounded-xl border border-[#DCE3EB] bg-[#F7F9FC] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#082B50] py-2"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-[#082B50] hover:bg-[#061E38] text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
        >
          <ShieldCheck size={16} />
          <span>{isAr ? 'تأكيد الرمز' : 'Verify Code'}</span>
        </button>
      </form>
    </AuthCard>
  );
};
