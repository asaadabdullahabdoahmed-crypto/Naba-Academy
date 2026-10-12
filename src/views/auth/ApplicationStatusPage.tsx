import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, AlertCircle, Info, FileText } from 'lucide-react';
import { AuthCard } from '../../components/scaffold/AuthCard';
import { Locale } from '../../i18n/dictionaries';
import { useTranslation } from '../../i18n/useTranslation';

interface ApplicationStatusPageProps {
  locale: Locale;
}

export const ApplicationStatusPage: React.FC<ApplicationStatusPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const [appId, setAppId] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusNotice(
      isAr
        ? `طلب الاستعلام برقم المرجع (${appId}): خدمة الاستعلام المباشر عن حالة طلبات القبول تتطلب ربط قاعدة بيانات القبول والتسجيل المركزية (PostgreSQL / NestJS).`
        : `Inquiry for application (${appId}): Real-time application lookup requires connection to the admissions database service.`
    );
  };

  return (
    <AuthCard
      title={isAr ? 'الاستعلام عن حالة طلب القبول' : 'Application Status Inquiry'}
      subtitle={
        isAr
          ? 'متابعة مسار مراجعة طلب القبول الأكاديمي باستخدام الرقم المرجعي ورقم الهوية'
          : 'Track your admission application review status using your application reference ID'
      }
      locale={locale}
      footerSlot={
        <div>
          <Link to={`/${locale}/auth/login`} className="font-bold text-[#082B50] hover:underline">
            {isAr ? 'العودة لتسجيل الدخول' : 'Back to Login'}
          </Link>
        </div>
      }
    >
      <form onSubmit={handleSearch} className="space-y-4 mb-6">
        <div>
          <label className="block text-xs font-semibold text-[#102033] mb-1">
            {isAr ? 'الرقم المرجعي للطلب' : 'Application Reference ID'}
          </label>
          <input
            type="text"
            required
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
            placeholder="NAB-APP-XXXX-XXXX"
            className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#102033] mb-1">
            {isAr ? 'الهوية الوطنية / الإقامة' : 'National ID / Iqama'}
          </label>
          <input
            type="text"
            required
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value)}
            placeholder="10XXXXXXXX"
            className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
          />
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#082B50] hover:bg-[#061E38] text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
        >
          <Search size={15} />
          <span>{isAr ? 'استعلام عن الطلب' : 'Track Application'}</span>
        </button>
      </form>

      {statusNotice && (
        <div className="p-4 rounded-xl bg-[#082B50]/5 border border-[#082B50]/20 flex items-start gap-3">
          <Info size={18} className="text-[#082B50] shrink-0 mt-0.5" />
          <p className="text-xs text-[#082B50] leading-relaxed font-medium">
            {statusNotice}
          </p>
        </div>
      )}
    </AuthCard>
  );
};
