import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { AppShell } from './AppShell';
import { Locale } from '../../i18n/dictionaries';
import { useAuth } from '../../context/AuthContext';

interface PortalLayoutProps {
  locale: Locale;
  portalKey: 'student' | 'instructor' | 'department' | 'admin' | 'alumni';
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({ locale, portalKey }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#082B50] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium">
            {locale === 'ar' ? 'جاري التحقق من الجلسة...' : 'Verifying session...'}
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={`/${locale}/auth/login`} replace state={{ from: location }} />;
  }

  return (
    <AppShell locale={locale} portalKey={portalKey}>
      <Outlet />
    </AppShell>
  );
};
