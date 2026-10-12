import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, ArrowRight, ArrowLeft } from 'lucide-react';
import { Locale, dictionaries } from '../../i18n/dictionaries';
import { NabaLogo } from '../common/NabaLogo';

interface AuthCardProps {
  id?: string;
  title: string;
  subtitle: string;
  locale: Locale;
  children: React.ReactNode;
  footerSlot?: React.ReactNode;
  showBackToHome?: boolean;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  id,
  title,
  subtitle,
  locale,
  children,
  footerSlot,
  showBackToHome = true,
}) => {
  const location = useLocation();
  const isAr = locale === 'ar';
  const dict = dictionaries[locale];
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const nextLocale = isAr ? 'en' : 'ar';
  const switchedPath = location.pathname.startsWith(`/${locale}`)
    ? location.pathname.replace(`/${locale}`, `/${nextLocale}`)
    : `/${nextLocale}${location.pathname}`;

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col justify-center items-center p-4 py-12">
      {/* Top Controls */}
      <div className="w-full max-w-md flex items-center justify-between mb-6">
        {showBackToHome && (
          <Link
            to={`/${locale}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#082B50] hover:text-[#174F89] transition-colors"
          >
            <ArrowIcon size={15} />
            <span>{dict.common.backToHome}</span>
          </Link>
        )}

        <Link
          to={switchedPath}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#607086] hover:text-[#082B50] transition-colors ms-auto"
        >
          <Globe size={14} />
          <span>{dict.common.switchLanguage}</span>
        </Link>
      </div>

      {/* Main Card */}
      <div
        id={id}
        className="w-full max-w-md bg-white rounded-2xl border border-[#DCE3EB] shadow-xs p-6 md:p-8"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-4">
            <NabaLogo size="lg" variant="dark" showText={true} showSubtitle={true} />
          </div>
          <h2 className="text-lg md:text-xl font-bold text-[#102033] tracking-tight">{title}</h2>
          <p className="text-xs text-[#607086] mt-1.5 leading-relaxed">{subtitle}</p>
        </div>

        {/* Content / Form Elements */}
        <div>{children}</div>

        {/* Footer Links */}
        {footerSlot && (
          <div className="mt-6 pt-4 border-t border-[#DCE3EB] text-center text-xs text-[#607086]">
            {footerSlot}
          </div>
        )}
      </div>

      {/* Bottom Copyright */}
      <p className="text-center text-xs text-[#607086] mt-8">
        © {new Date().getFullYear()} {locale === 'ar' ? 'أكاديمية نبا' : 'NABA Academy'}. {dict.common.allRightsReserved}
      </p>
    </div>
  );
};
