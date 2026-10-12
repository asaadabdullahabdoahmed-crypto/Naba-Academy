import React from 'react';
import { useLocation, Link, useParams } from 'react-router-dom';
import {
  ShieldAlert,
  FileX,
  AlertOctagon,
  Wrench,
  Clock,
  UserX,
  CloudOff,
  RefreshCw,
  Home,
} from 'lucide-react';
import { Locale } from '../../i18n/dictionaries';
import { useTranslation } from '../../i18n/useTranslation';
import { NabaLogo } from '../../components/common/NabaLogo';

interface SystemStatusPageProps {
  forcedCode?: '403' | '404' | '500' | 'maintenance' | 'session-expired' | 'account-disabled' | 'service-unavailable';
  locale?: Locale;
}

export const SystemStatusPage: React.FC<SystemStatusPageProps> = ({ forcedCode, locale: propLocale }) => {
  const location = useLocation();
  const { locale: routeLocale } = useParams<{ locale: Locale }>();
  const { isAr: ctxIsAr } = useTranslation();
  const locale: Locale = propLocale || routeLocale || 'ar';
  const isAr = propLocale !== undefined ? propLocale === 'ar' : (routeLocale !== undefined ? routeLocale === 'ar' : ctxIsAr);

  // Determine code from URL or prop
  let code = forcedCode;
  if (!code) {
    if (location.pathname.includes('403')) code = '403';
    else if (location.pathname.includes('500')) code = '500';
    else if (location.pathname.includes('maintenance')) code = 'maintenance';
    else if (location.pathname.includes('session-expired')) code = 'session-expired';
    else if (location.pathname.includes('account-disabled')) code = 'account-disabled';
    else if (location.pathname.includes('service-unavailable')) code = 'service-unavailable';
    else code = '404';
  }

  const configs: Record<string, {
    titleAr: string;
    titleEn: string;
    descAr: string;
    descEn: string;
    icon: React.ElementType;
    color: string;
    bgSoft: string;
    badge: string;
  }> = {
    '403': {
      titleAr: 'غير مصرح بالوصول',
      titleEn: 'Access Denied',
      descAr: 'ليس لديك الصلاحيات الأكاديمية أو الإدارية الكافية لعرض هذه الصفحة أو المورد.',
      descEn: 'You do not have the required permissions or role clearance to access this resource.',
      icon: ShieldAlert,
      color: '#B91C1C',
      bgSoft: '#FEF2F2',
      badge: '403 FORBIDDEN',
    },
    '404': {
      titleAr: 'الصفحة غير موجودة',
      titleEn: 'Page Not Found',
      descAr: 'المسار المطلوب غير موجود في النظام أو قد تم نقله إلى عنوان آخر.',
      descEn: 'The requested route does not exist in the academic system or may have been moved.',
      icon: FileX,
      color: '#082B50',
      bgSoft: '#EFF3F8',
      badge: '404 NOT FOUND',
    },
    '500': {
      titleAr: 'خطأ في معالجة الطلب',
      titleEn: 'System Processing Error',
      descAr: 'حدث خطأ تقني داخلي أثناء معالجة العملية. يُرجى المحاولة لاحقًا.',
      descEn: 'An unexpected internal error occurred while processing your request. Please try again later.',
      icon: AlertOctagon,
      color: '#B91C1C',
      bgSoft: '#FEF2F2',
      badge: '500 SYSTEM ERROR',
    },
    'maintenance': {
      titleAr: 'النظام تحت الصيانة المجدولة',
      titleEn: 'Scheduled Maintenance',
      descAr: 'تجري فرق البنية التحتية صيانة وقائية مجدولة لتحديث المنظومة وتحسين الأداء.',
      descEn: 'The platform is undergoing scheduled maintenance to upgrade services and optimize performance.',
      icon: Wrench,
      color: '#D6A53A',
      bgSoft: '#FEF9EC',
      badge: 'MAINTENANCE MODE',
    },
    'session-expired': {
      titleAr: 'انتهت صلاحية الجلسة',
      titleEn: 'Session Expired',
      descAr: 'انتهت مهلة جلستك لأسباب أمنية. يُرجى إعادة تسجيل الدخول لمتابعة عملك.',
      descEn: 'Your secure session has timed out due to inactivity. Please sign in again to continue.',
      icon: Clock,
      color: '#174F89',
      bgSoft: '#EFF3F8',
      badge: 'SESSION TIMEOUT',
    },
    'account-disabled': {
      titleAr: 'الحساب غير مفعّل',
      titleEn: 'Account Inactive',
      descAr: 'حسابك الجامعي غير مفعل حاليًا. يُرجى مراجعة عمادة القبول والتسجيل أو الدعم الفني.',
      descEn: 'Your institutional account is currently inactive. Please contact the admissions office or system support.',
      icon: UserX,
      color: '#B91C1C',
      bgSoft: '#FEF2F2',
      badge: 'ACCOUNT INACTIVE',
    },
    'service-unavailable': {
      titleAr: 'الخدمة غير متوفرة مؤقتًا',
      titleEn: 'Service Unavailable',
      descAr: 'الخدمة المطلوبة غير متوفرة حاليًا بسبب الضغط أو أعمال الصيانة السحابية.',
      descEn: 'The requested service is temporarily unavailable. Please try again shortly.',
      icon: CloudOff,
      color: '#D6A53A',
      bgSoft: '#FEF9EC',
      badge: '503 SERVICE UNAVAILABLE',
    },
  };

  const current = configs[code] || configs['404'];
  const IconComponent = current.icon;

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="mb-6">
        <NabaLogo size="md" variant="dark" showSubtitle={true} />
      </div>

      <div className="max-w-md w-full bg-white rounded-3xl border border-[#DCE3EB] p-8 md:p-10 shadow-sm space-y-6">
        <div
          className="w-18 h-18 rounded-2xl flex items-center justify-center mx-auto shadow-xs"
          style={{ backgroundColor: current.bgSoft, color: current.color }}
        >
          <IconComponent size={36} />
        </div>

        <div className="space-y-2">
          <span
            className="text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block"
            style={{ backgroundColor: current.bgSoft, color: current.color }}
          >
            {current.badge}
          </span>
          <h1 className="text-xl font-bold text-[#102033] tracking-tight">
            {isAr ? current.titleAr : current.titleEn}
          </h1>
          <p className="text-xs text-[#607086] leading-relaxed">
            {isAr ? current.descAr : current.descEn}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={`/${locale}`}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#082B50] hover:bg-[#061E38] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Home size={14} />
            <span>{isAr ? 'الرئيسية' : 'Back to Home'}</span>
          </Link>
          <Link
            to={`/${locale}/auth/login`}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#F7F9FC] hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <RefreshCw size={14} />
            <span>{isAr ? 'تسجيل الدخول' : 'Sign In'}</span>
          </Link>
        </div>
      </div>

      <p className="text-xs text-[#607086] mt-6">
        © {new Date().getFullYear()} {isAr ? 'أكاديمية نبا' : 'NABA Academy'}. {isAr ? 'جميع الحقوق محفوظة' : 'All rights reserved'}
      </p>
    </div>
  );
};
