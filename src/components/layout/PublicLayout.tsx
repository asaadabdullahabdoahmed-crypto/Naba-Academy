import React, { useState } from 'react';
import { Outlet, useParams, useLocation } from 'react-router-dom';
import { PublicHeader } from '../public/PublicHeader';
import { PublicFooter } from '../public/PublicFooter';
import { RouteVerificationDrawer } from '../ui/RouteVerificationDrawer';
import { Locale } from '../../i18n/dictionaries';

interface PublicLayoutProps {
  locale: Locale;
  onToggleLocale?: () => void;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ locale }) => {
  const [isVerifierOpen, setIsVerifierOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f8fb] text-[#17202a] font-sans antialiased">
      <PublicHeader
        locale={locale}
        onOpenRouteVerifier={() => setIsVerifierOpen(true)}
      />

      <main className="flex-1">
        <Outlet />
      </main>

      <PublicFooter
        locale={locale}
        onOpenRouteVerifier={() => setIsVerifierOpen(true)}
      />

      <RouteVerificationDrawer
        isOpen={isVerifierOpen}
        onClose={() => setIsVerifierOpen(false)}
        locale={locale}
      />
    </div>
  );
};
