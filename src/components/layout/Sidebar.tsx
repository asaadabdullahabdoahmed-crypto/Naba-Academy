import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { PORTAL_CONFIGS, NavItem } from '../../config/portalNavigation';
import { useTranslation } from '../../i18n/useTranslation';
import { NabaLogo } from '../common/NabaLogo';

interface SidebarProps {
  portalKey: string;
  locale: 'ar' | 'en';
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  portalKey,
  locale,
  isOpenMobile,
  onCloseMobile,
}) => {
  const location = useLocation();
  const { t, d, isAr } = useTranslation();
  const config = PORTAL_CONFIGS[portalKey] || PORTAL_CONFIGS.student;

  const currentPath = location.pathname;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-[#061E38]/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Aside Container - Deep Navy Institutional Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 start-0 z-40 w-64 md:w-68 bg-[#082B50] text-white border-e border-[#061E38] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 shadow-lg ${
          isOpenMobile
            ? 'translate-x-0'
            : isAr
            ? 'translate-x-full lg:translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-white/10 bg-[#061E38] flex items-center justify-between">
          <Link to={`/${locale}`} className="flex items-center gap-2 group">
            <NabaLogo size="sm" variant="light" showSubtitle={true} />
          </Link>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors lg:hidden shrink-0"
            aria-label={d.common.closeMenu}
          >
            <Icons.X size={18} />
          </button>
        </div>

        {/* Portal Role Badge Banner */}
        <div className="px-4 py-2.5 bg-white/5 border-b border-white/10 flex items-center justify-between text-xs">
          <span className="font-semibold text-white/90 truncate">{t(config.nameKey)}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D6A53A]/20 text-[#D6A53A] border border-[#D6A53A]/30">
            {t(config.badgeKey)}
          </span>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-thin">
          {config.items.map((item: NavItem) => {
            const targetUrl = `/${locale}${item.path}`;
            const isActive =
              currentPath === targetUrl ||
              (item.path !== config.basePath && currentPath.startsWith(targetUrl + '/'));

            const IconComponent =
              (Icons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[
                item.icon
              ] || Icons.Circle;

            return (
              <Link
                key={item.id}
                to={targetUrl}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-[#174F89] text-white shadow-xs font-bold border-s-4 border-[#D6A53A]'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <IconComponent
                    size={17}
                    className={`shrink-0 transition-colors ${
                      isActive ? 'text-[#D6A53A]' : 'text-white/70 group-hover:text-white'
                    }`}
                  />
                  <span className="truncate">{t(item.titleKey)}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-white/20 text-[#D6A53A]'
                        : 'bg-white/10 text-white/90'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom Helper / Settings Area */}
        <div className="p-3 border-t border-white/10 bg-[#061E38]/70">
          <Link
            to={`/${locale}/${portalKey}/settings`}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Icons.Settings size={16} className="text-[#D6A53A]" />
            <span>{isAr ? 'الإعدادات' : 'Settings'}</span>
          </Link>
        </div>
      </aside>
    </>
  );
};
