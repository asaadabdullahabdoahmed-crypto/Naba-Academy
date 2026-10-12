import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Globe,
  LogIn,
  GraduationCap,
  ChevronDown,
  Menu,
  X,
  Users,
  Shield,
  Layers,
  Briefcase,
} from 'lucide-react';
import { Locale } from '../../i18n/dictionaries';
import { useTranslation } from '../../i18n/useTranslation';
import { NabaLogo } from '../common/NabaLogo';

interface PublicHeaderProps {
  locale: Locale;
  onOpenRouteVerifier?: () => void;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({ locale }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { d, isAr } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPortalsMenuOpen, setIsPortalsMenuOpen] = useState(false);

  const handleLanguageSwitch = () => {
    const nextLocale: Locale = isAr ? 'en' : 'ar';
    const pathParts = location.pathname.split('/');
    if (pathParts[1] === 'ar' || pathParts[1] === 'en') {
      pathParts[1] = nextLocale;
      navigate(pathParts.join('/'));
    } else {
      navigate(`/${nextLocale}`);
    }
  };

  const navLinks = [
    { path: `/${locale}`, label: isAr ? 'الرئيسية' : 'Home' },
    { path: `/${locale}/about`, label: isAr ? 'عن الأكاديمية' : 'About' },
    { path: `/${locale}/programs`, label: isAr ? 'البرامج والدورات' : 'Programs' },
    { path: `/${locale}/elearning`, label: isAr ? 'التعلم الإلكتروني' : 'E-Learning' },
    { path: `/${locale}/library`, label: isAr ? 'المكتبة الرقمية' : 'Digital Library' },
    { path: `/${locale}/admissions`, label: isAr ? 'التسجيل والقبول' : 'Admissions' },
    { path: `/${locale}/contact`, label: isAr ? 'اتصل بنا' : 'Contact' },
  ];

  const portalsList = [
    { key: 'student', title: d.portals.student, path: `/${locale}/student/dashboard`, icon: GraduationCap },
    { key: 'instructor', title: d.portals.instructor, path: `/${locale}/instructor/dashboard`, icon: Users },
    { key: 'department', title: d.portals.department, path: `/${locale}/department/dashboard`, icon: Layers },
    { key: 'admin', title: d.portals.admin, path: `/${locale}/admin/dashboard`, icon: Shield },
    { key: 'alumni', title: d.portals.alumni, path: `/${locale}/alumni/dashboard`, icon: Briefcase },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#DCE3EB] shadow-xs">
      {/* Top Institutional Navy Accent Strip (No unverified phone/email) */}
      <div className="bg-[#061E38] text-white py-1.5 px-4 md:px-6 text-[11px] border-b border-[#082B50]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-white/90 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D6A53A]" />
            <span>
              {isAr
                ? 'أكاديمية نبا للتعليم الإلكتروني والتعليم عن بعد'
                : 'NABA Academy for Digital Higher Education'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Portals Quick Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPortalsMenuOpen(!isPortalsMenuOpen)}
                className="flex items-center gap-1.5 text-white/90 hover:text-[#D6A53A] transition-colors py-0.5 cursor-pointer"
              >
                <GraduationCap size={13} className="text-[#D6A53A]" />
                <span className="font-semibold">{isAr ? 'البوابات الأكاديمية' : 'Academic Portals'}</span>
                <ChevronDown size={12} />
              </button>

              {isPortalsMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsPortalsMenuOpen(false)} aria-hidden="true" />
                  <div className="absolute top-full end-0 mt-1 w-52 bg-white text-[#102033] rounded-xl border border-[#DCE3EB] shadow-xl py-1.5 z-50 animate-in fade-in">
                    {portalsList.map((p) => {
                      const Icon = p.icon;
                      return (
                        <Link
                          key={p.key}
                          to={p.path}
                          onClick={() => setIsPortalsMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold hover:bg-[#EFF3F8] hover:text-[#082B50] transition-colors"
                        >
                          <Icon size={15} className="text-[#082B50]" />
                          <span>{p.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <span className="text-white/20">|</span>

            {/* Language Switch */}
            <button
              type="button"
              onClick={handleLanguageSwitch}
              className="inline-flex items-center gap-1 text-white hover:text-[#D6A53A] font-bold transition-colors cursor-pointer"
            >
              <Globe size={12} />
              <span>{isAr ? 'EN' : 'العربية'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-18 md:h-20 flex items-center justify-between gap-4">
        {/* Right (in RTL): Official Logo */}
        <Link to={`/${locale}`} className="flex items-center gap-3 shrink-0">
          <NabaLogo size="md" variant="dark" showSubtitle={true} />
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'text-[#082B50] bg-[#EFF3F8]'
                    : 'text-[#102033] hover:text-[#082B50] hover:bg-[#EFF3F8]/60'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Left: Action Button - Gold "تسجيل الدخول" as in visual reference */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            to={`/${locale}/auth/login`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#D6A53A] hover:bg-[#B88725] text-[#061E38] font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <LogIn size={15} />
            <span>{isAr ? 'تسجيل الدخول' : 'Sign In'}</span>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex lg:hidden items-center gap-2">
          <Link
            to={`/${locale}/auth/login`}
            className="p-2 rounded-lg bg-[#D6A53A] text-[#061E38] font-bold text-xs"
            aria-label="Sign in"
          >
            <LogIn size={16} />
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-[#102033] hover:bg-[#EFF3F8]"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#DCE3EB] bg-white px-4 py-4 space-y-2 animate-in fade-in">
          {navLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-xs font-bold text-[#102033] hover:bg-[#EFF3F8] hover:text-[#082B50]"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-[#DCE3EB]">
            <Link
              to={`/${locale}/auth/login`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#D6A53A] text-[#061E38] font-bold text-xs"
            >
              <LogIn size={15} />
              <span>{isAr ? 'تسجيل الدخول' : 'Sign In'}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
