import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell } from './AppShell';
import { Locale } from '../../i18n/dictionaries';

interface PortalLayoutProps {
  locale: Locale;
  portalKey: 'student' | 'instructor' | 'department' | 'admin' | 'alumni';
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({ locale, portalKey }) => {
  return (
    <AppShell locale={locale} portalKey={portalKey}>
      <Outlet />
    </AppShell>
  );
};
