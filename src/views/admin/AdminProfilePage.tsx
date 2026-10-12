import React from 'react';
import { User, Mail, Shield, ShieldCheck, Lock, Building, AlertCircle } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface AdminProfilePageProps {
  locale: Locale;
}

export const AdminProfilePage: React.FC<AdminProfilePageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const na = isAr ? 'غير متوفر حاليًا' : 'Currently unavailable';

  return (
    <PortalPage
      title={isAr ? 'الملف الشخصي للمسؤول' : 'Administrator Profile'}
      subtitle={
        isAr
          ? 'البيانات الرسمية، الصلاحيات الإدارية، وسجلات الحساب'
          : 'Account credentials, administrative authorizations, and access records'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الإدارة' : 'Admin Portal', path: `/${locale}/admin/dashboard` },
        { label: isAr ? 'الملف الشخصي' : 'Profile' },
      ]}
      locale={locale}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Identity Header Card with Truthful Neutral Fallbacks */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-[#EFF3F8] border border-[#DCE3EB] flex items-center justify-center text-[#082B50] shrink-0">
            <User size={36} />
          </div>

          <div className="flex-1 text-center sm:text-start space-y-2">
            <div>
              <h2 className="text-lg font-bold text-[#102033]">
                {na}
              </h2>
              <p className="text-xs text-[#607086] mt-0.5">
                {isAr ? 'الرتبة الإدارية: مسؤول النظام' : 'Administrative Title: Administrator'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-[#607086]">
              <span className="flex items-center gap-1.5">
                <Building size={14} className="text-[#082B50]" />
                <span>{isAr ? 'الإدارة: إدارة النظام' : 'Division: System Administration'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Mail size={14} className="text-[#082B50]" />
                <span className="font-mono">{na}</span>
              </span>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EFF3F8] text-[11px] font-bold text-[#082B50] border border-[#DCE3EB]">
            <ShieldCheck size={14} className="text-[#D6A53A]" />
            <span>{isAr ? 'صلاحيات المسؤول' : 'Administrator Access'}</span>
          </div>
        </div>

        {/* Credentials & System Authorization Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#102033] flex items-center gap-2">
              <Shield size={16} className="text-[#082B50]" />
              <span>{isAr ? 'بيانات الاعتماد والمصادقة' : 'Authentication & Security Tiers'}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#EFF3F8]/50 border border-[#DCE3EB] flex items-center justify-between">
                <span className="text-[#607086]">{isAr ? 'المصادقة الثنائية (2FA)' : 'Two-Factor Authentication'}</span>
                <span className="font-bold text-[#082B50]">{isAr ? 'مفعلة' : 'Active'}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#EFF3F8]/50 border border-[#DCE3EB] flex items-center justify-between">
                <span className="text-[#607086]">{isAr ? 'مستوى الصلاحية' : 'Access Level'}</span>
                <span className="font-bold text-[#082B50]">{isAr ? 'إدارة عامة' : 'Full Admin'}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#EFF3F8]/50 border border-[#DCE3EB] flex items-center justify-between">
                <span className="text-[#607086]">{isAr ? 'صلاحية الجلسة' : 'Session Duration'}</span>
                <span className="font-bold text-[#082B50]">{isAr ? '30 دقيقة خمول' : '30 min idle'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#102033] flex items-center gap-2">
              <Lock size={16} className="text-[#082B50]" />
              <span>{isAr ? 'سياسات الحماية والوصول' : 'Access & Privacy Policies'}</span>
            </h3>

            <div className="space-y-3 text-xs text-[#607086] leading-relaxed">
              <p>
                {isAr
                  ? 'يخضع حساب المسؤول لسجلات التدقيق وتوثيق العمليات الإدارية لضمان سلامة وأمان المنظومة الأكاديمية.'
                  : 'Administrator actions and system events are logged in the security audit trail to maintain system integrity.'}
              </p>
              <div className="pt-2 border-t border-[#DCE3EB] flex items-center gap-1.5 text-[11px] text-[#607086] font-semibold">
                <AlertCircle size={14} className="text-[#607086]" />
                <span>{isAr ? 'في انتظار ربط الواجهة الخلفية' : 'Pending Backend Integration'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PortalPage>
  );
};
