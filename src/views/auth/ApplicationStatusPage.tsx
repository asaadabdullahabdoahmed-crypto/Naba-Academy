import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Info } from 'lucide-react';
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
      title={isAr ? 'متابعة حالة الطلب' : 'Application status'}
      subtitle={
        isAr
          ? 'متابعة مسار مراجعة طلب القبول الأكاديمي باستخدام الرقم المرجعي ورقم الهوية'
          : 'Track your admission application review status using your application reference ID'
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
      <form onSubmit={handleSearch} className="space-y-4 mb-6">
        <div>
          <label htmlFor="application-reference" className="auth-label">
            {isAr ? 'الرقم المرجعي للطلب' : 'Application Reference ID'}
          </label>
          <input
            type="text"
            id="application-reference"
            required
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
            placeholder="NAB-APP-XXXX-XXXX"
            className="auth-input"
          />
        </div>

        <div>
          <label htmlFor="application-national-id" className="auth-label">
            {isAr ? 'الهوية الوطنية / الإقامة' : 'National ID / Iqama'}
          </label>
          <input
            type="text"
            id="application-national-id"
            required
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value)}
            placeholder="10XXXXXXXX"
            className="auth-input"
          />
        </div>

        <button
          type="submit"
          className="auth-submit"
        >
          <Search size={18} aria-hidden="true" />
          <span>{isAr ? 'استعلام عن الطلب' : 'Track Application'}</span>
        </button>
      </form>

      {statusNotice && (
        <div className="auth-notice" role="status" aria-live="polite">
          <Info size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p className="m-0">
            {statusNotice}
          </p>
        </div>
      )}
    </AuthCard>
  );
};
