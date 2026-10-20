import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Globe,
  Bell,
  ChevronDown,
  GraduationCap,
  Users,
  Shield,
  Briefcase,
  Layers,
  BookOpen,
  User,
  LogOut,
} from 'lucide-react';
import { Locale } from '../../i18n/dictionaries';
import { useTranslation } from '../../i18n/useTranslation';
import { NabaLogo } from '../common/NabaLogo';

import { useAuth } from '../../context/AuthContext';

interface TopbarProps {
  locale: Locale;
  onToggleMobileSidebar?: () => void;
  onOpenRouteVerifier: () => void;
  currentPortalKey?: string;
}

export const Topbar: React.FC<TopbarProps> = ({
  locale,
  onToggleMobileSidebar,
  currentPortalKey = 'student',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, d, isAr } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isPortalDropdownOpen, setIsPortalDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const handleLogout = async () => {
    setIsUserDropdownOpen(false);
    try {
      await logout();
    } catch {
      // Continue navigation even if network error
    }
    navigate(`/${locale}/auth/login`, { replace: true });
  };

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

  const portalsList = [
    { key: 'public', titleKey: 'portals.public', path: `/${locale}`, icon: BookOpen },
    { key: 'student', titleKey: 'portals.student', path: `/${locale}/student/dashboard`, icon: GraduationCap },
    { key: 'instructor', titleKey: 'portals.instructor', path: `/${locale}/instructor/dashboard`, icon: Users },
    { key: 'department', titleKey: 'portals.department', path: `/${locale}/department/dashboard`, icon: Layers },
    { key: 'admin', titleKey: 'portals.admin', path: `/${locale}/admin/dashboard`, icon: Shield },
    { key: 'alumni', titleKey: 'portals.alumni', path: `/${locale}/alumni/dashboard`, icon: Briefcase },
  ];

  const currentPortalObj = portalsList.find((p) => p.key === currentPortalKey) || portalsList[1];

  return (
    <header className="sticky top-0 z-50 h-16 bg-white border-b border-[#DCE3EB] shadow-xs">
      <div className="h-full px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Left Side: Brand Logo & Mobile Toggle */}
        <div className="flex items-center gap-3 md:gap-4">
          {onToggleMobileSidebar && (
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="p-2 -ms-2 rounded-lg text-[#102033] hover:bg-[#EFF3F8] lg:hidden"
              aria-label="Toggle navigation"
            >
              <Menu size={20} />
            </button>
          )}

          {/* Logo Brand Link */}
          <Link
            to={`/${locale}`}
            className="flex items-center gap-2 group focus:outline-hidden"
          >
            <NabaLogo size="sm" variant="dark" showSubtitle={false} />
          </Link>
        </div>

        {/* Center / Portal Switcher */}
        <div className="hidden lg:flex items-center gap-2.5">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsPortalDropdownOpen(!isPortalDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#EFF3F8] hover:bg-[#DCE3EB]/60 border border-[#DCE3EB] text-[#082B50] rounded-lg text-xs font-semibold transition-colors"
            >
              <currentPortalObj.icon size={15} className="text-[#082B50]" />
              <span>{t(currentPortalObj.titleKey)}</span>
              <ChevronDown size={14} className="text-[#607086]" />
            </button>

            {isPortalDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsPortalDropdownOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute top-full mt-1.5 start-0 z-30 w-56 bg-white rounded-xl border border-[#DCE3EB] shadow-lg py-1.5 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-[#607086] border-b border-[#DCE3EB] uppercase">
                    {d.common.selectPortal}
                  </div>
                  {portalsList.map((portal) => (
                    <Link
                      key={portal.key}
                      to={portal.path}
                      onClick={() => setIsPortalDropdownOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${
                        currentPortalKey === portal.key
                          ? 'bg-[#EFF3F8] text-[#082B50] font-bold'
                          : 'text-[#102033] hover:bg-[#EFF3F8]'
                      }`}
                    >
                      <portal.icon size={15} className="text-[#082B50]" />
                      <span>{t(portal.titleKey)}</span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Language Switch */}
          <button
            type="button"
            onClick={handleLanguageSwitch}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#102033] hover:bg-[#EFF3F8] border border-[#DCE3EB] transition-colors"
          >
            <Globe size={14} className="text-[#082B50]" />
            <span>{isAr ? 'English' : 'العربية'}</span>
          </button>

          {/* Notifications Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-lg text-[#607086] hover:text-[#102033] hover:bg-[#EFF3F8] border border-[#DCE3EB] transition-colors"
              aria-label={d.common.notifications}
            >
              <Bell size={16} />
            </button>

            {isNotifOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setIsNotifOpen(false)} aria-hidden="true" />
                <div className="absolute top-full mt-1.5 end-0 z-30 w-72 md:w-80 bg-white rounded-xl border border-[#DCE3EB] shadow-xl p-3">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#DCE3EB]">
                    <span className="text-xs font-bold text-[#102033]">{d.common.notifications}</span>
                  </div>
                  <div className="p-4 text-center text-xs text-[#607086]">
                    {isAr ? 'لا توجد إشعارات جديدة حالياً' : 'No new notifications at this time'}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile Avatar & Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="w-9 h-9 rounded-full bg-[#082B50] text-[#D6A53A] flex items-center justify-center border border-[#061E38] hover:ring-2 hover:ring-[#D6A53A]/30 transition-all cursor-pointer"
              aria-label="User profile"
            >
              <User size={16} />
            </button>

            {isUserDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsUserDropdownOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute top-full mt-1.5 end-0 z-30 w-56 bg-white rounded-xl border border-[#DCE3EB] shadow-xl py-2">
                  <div className="px-4 py-2 border-b border-[#DCE3EB]">
                    <p className="text-xs font-bold text-[#102033] truncate">
                      {user ? (user.nameAr || user.nameEn || user.email) : t(currentPortalObj.titleKey)}
                    </p>
                    <p className="text-[11px] text-[#607086] mt-0.5 truncate">
                      {user ? user.email : (isAr ? 'جلسة مستخدم نشطة' : 'Active user session')}
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#C93C3C] hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={14} />
                      <span>{d.common.logout}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
