import React, { useState } from 'react';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import { RouteVerificationDrawer } from '../ui/RouteVerificationDrawer';
import { Locale } from '../../i18n/dictionaries';

interface AppShellProps {
  locale: Locale;
  portalKey: 'student' | 'instructor' | 'department' | 'admin' | 'alumni';
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  locale,
  portalKey,
  children,
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRouteVerifierOpen, setIsRouteVerifierOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#102033] flex font-sans">
      {/* Role-Specific Full-Height Deep Navy Sidebar */}
      <Sidebar
        portalKey={portalKey}
        locale={locale}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 lg:ps-64 md:lg:ps-68 transition-all duration-200">
        {/* Global Portal Topbar */}
        <Topbar
          locale={locale}
          currentPortalKey={portalKey}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onOpenRouteVerifier={() => setIsRouteVerifierOpen(true)}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Hidden Dev Route Verification Drawer (Alt+R) */}
      <RouteVerificationDrawer
        isOpen={isRouteVerifierOpen}
        onClose={() => setIsRouteVerifierOpen(false)}
        locale={locale}
      />
    </div>
  );
};
