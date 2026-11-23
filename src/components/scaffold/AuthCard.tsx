import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock3, Globe2, Laptop2, MapPin } from 'lucide-react';
import { Locale, dictionaries } from '../../i18n/dictionaries';
import { NabaLogo } from '../common/NabaLogo';
import { ASSET_IMAGES } from '../../assets/branding/images';

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
    <div className="auth-page">
      <header className="auth-topbar">
        {showBackToHome ? (
          <Link to={`/${locale}`} className="auth-nav-link">
            <ArrowIcon size={16} aria-hidden="true" />
            <span>{dict.common.backToHome}</span>
          </Link>
        ) : <span />}
        <Link
          to={`${switchedPath}${location.search}${location.hash}`}
          className="auth-nav-link auth-language-link"
          lang={nextLocale}
        >
          <Globe2 size={16} aria-hidden="true" />
          <span>{dict.common.switchLanguage}</span>
        </Link>
      </header>

      <main className="auth-main">
        <div className="auth-card" id={id}>
          <section className="auth-content" aria-labelledby={`${id || 'auth'}-title`}>
            <div className="auth-heading">
              <NabaLogo size="lg" variant="dark" showText showSubtitle />
              <h1 id={`${id || 'auth'}-title`}>{title}</h1>
              <p>{subtitle}</p>
            </div>
            <div className="auth-form-content">{children}</div>
            {footerSlot && <footer className="auth-card-footer">{footerSlot}</footer>}
          </section>

          <aside className="auth-visual" aria-label={isAr ? 'أكاديمية نبا' : 'NABA Academy'}>
            <div className="auth-visual-glow" aria-hidden="true" />
            <div className="auth-visual-heading">
              <NabaLogo size="lg" variant="light" showText showSubtitle />
              <h2>{isAr ? 'خطوتك القادمة تبدأ هنا' : 'Your next step starts here'}</h2>
              <p>
                {isAr
                  ? 'مرحباً بك في مساحة تعليمية تدعم طموحك وترافق رحلتك الأكاديمية.'
                  : 'Welcome to a learning space designed to support your ambition and academic journey.'}
              </p>
            </div>
            <div className="auth-visual-image">
              <img
                src={ASSET_IMAGES.loginVisual}
                alt={isAr ? 'التعلم الرقمي في أكاديمية نبا' : 'Digital learning at NABA Academy'}
              />
            </div>
            <div className="auth-value-list">
              <span><Clock3 size={16} aria-hidden="true" />{isAr ? 'تعلم مرن' : 'Flexible learning'}</span>
              <span><Laptop2 size={16} aria-hidden="true" />{isAr ? 'محتوى رقمي' : 'Digital content'}</span>
              <span><MapPin size={16} aria-hidden="true" />{isAr ? 'تعلم من أي مكان' : 'Learn anywhere'}</span>
            </div>
          </aside>
        </div>
      </main>

      <p className="auth-copyright">
        © {new Date().getFullYear()} {isAr ? 'أكاديمية نبا' : 'NABA Academy'}. {dict.common.allRightsReserved}
      </p>
    </div>
  );
};
