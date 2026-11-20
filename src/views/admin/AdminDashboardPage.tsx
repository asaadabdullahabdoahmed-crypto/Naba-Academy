import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  BookOpen,
  CheckCircle2,
  CircleAlert,
  KeyRound,
  Server,
  ShieldAlert,
  UserRound,
  Users,
} from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { useAuth } from '../../context/AuthContext';
import { useSystemHealth } from '../../hooks/useSystemHealth';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface AdminDashboardPageProps {
  locale: Locale;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ locale }) => {
  const { isAr, t, formatDate } = useTranslation();
  const { user } = useAuth();
  const healthState = useSystemHealth();
  const displayName = (isAr ? user?.nameAr || user?.nameEn : user?.nameEn || user?.nameAr)
    || t('admin.adminPortalStatus.profileFallback');

  const managementLinks = [
    {
      href: `/${locale}/admin/users`,
      title: t('admin.adminPortalStatus.userDirectory'),
      description: t('admin.adminPortalStatus.userDirectoryUnavailable'),
      icon: Users,
    },
    {
      href: `/${locale}/admin/roles`,
      title: t('admin.adminPortalStatus.roleManagement'),
      description: t('admin.adminPortalStatus.roleManagementUnavailable'),
      icon: KeyRound,
    },
    {
      href: `/${locale}/admin/courses`,
      title: isAr ? 'دليل المقررات والفصول' : 'Course and term catalogs',
      description: isAr ? 'استعراض البيانات المرجعية عند توفر الدليل' : 'Browse reference data when catalog access is available',
      icon: BookOpen,
    },
  ];

  const renderDependencyStatus = (status: 'up' | 'down' | 'unconfigured' | 'degraded') => {
    const healthy = status === 'up';
    const label = healthy
      ? t('admin.adminPortalStatus.statusOk')
      : status === 'down'
        ? t('admin.adminPortalStatus.statusDown')
        : status === 'degraded'
          ? t('admin.adminPortalStatus.statusDegraded')
          : t('admin.adminPortalStatus.statusUnconfigured');

    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${healthy ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>
        {healthy ? <CheckCircle2 size={13} /> : <CircleAlert size={13} />}
        {label}
      </span>
    );
  };

  return (
    <PortalPage
      title={isAr ? 'لوحة الإدارة' : 'Administrator Dashboard'}
      subtitle={isAr ? 'ملخص الحساب والخدمات المتاحة' : 'Account overview and currently available services'}
      breadcrumbs={[
        { label: isAr ? 'بوابة الإدارة' : 'Administrator Portal', path: `/${locale}/admin/dashboard` },
        { label: isAr ? 'لوحة التحكم' : 'Dashboard' },
      ]}
      locale={locale}
      actions={
        <Link
          to={`/${locale}/admin/profile`}
          className="inline-flex items-center gap-2 rounded-lg bg-[#082B50] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#061E38]"
        >
          <UserRound size={15} />
          {t('admin.adminPortalStatus.profile')}
        </Link>
      }
    >
      <div className="space-y-6">
        <section className="rounded-2xl bg-[#082B50] p-6 text-white shadow-xs sm:p-8">
          <p className="text-sm text-white/75">{t('admin.adminPortalStatus.identityDescription')}</p>
          <h2 className="mt-2 text-2xl font-bold">{t('admin.adminPortalStatus.welcome', { name: displayName })}</h2>
          <p className="mt-2 break-all text-sm text-white/80">{user?.email || '—'}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {user?.roles.map((role) => (
              <span key={role.code} className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs">
                {(isAr ? role.nameAr || role.nameEn : role.nameEn || role.nameAr) || role.code}
              </span>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-base font-bold text-[#082B50]">
            {isAr ? 'الوحدات الإدارية' : 'Administration Areas'}
          </h3>
          <div className="grid gap-4 lg:grid-cols-3">
            {managementLinks.map(({ href, title, description, icon: Icon }) => (
              <Link
                key={href}
                to={href}
                className="rounded-2xl border border-[#DCE3EB] bg-white p-5 shadow-xs transition-colors hover:border-[#082B50]/40"
              >
                <div className="flex items-center justify-between gap-3">
                  <Icon size={20} className="text-[#082B50]" />
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
                    {t('common.unavailable')}
                  </span>
                </div>
                <h4 className="mt-4 text-sm font-bold text-[#102033]">{title}</h4>
                <p className="mt-2 text-xs leading-5 text-[#607086]">{description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#DCE3EB] bg-white p-5 shadow-xs sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#DCE3EB] pb-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF3F8] text-[#082B50]">
                <Server size={20} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-[#102033]">{t('admin.adminPortalStatus.liveHealth')}</h3>
                <p className="mt-1 text-xs text-[#607086]">
                  {healthState.status === 'loaded'
                    ? t('admin.adminPortalStatus.healthLoadedAt', { date: formatDate(healthState.health.timestamp) })
                    : healthState.status === 'loading'
                      ? t('common.loading')
                      : t('admin.adminPortalStatus.loadHealthError', { message: healthState.message })}
                </p>
              </div>
            </div>
            <Link
              to={`/${locale}/admin/system-status`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#082B50] underline underline-offset-4"
            >
              <Activity size={14} />
              {t('admin.adminPortalStatus.systemHealth')}
            </Link>
          </div>

          {healthState.status === 'loaded' ? (
            <div className="grid gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-[#607086]">{t('admin.adminPortalStatus.apiService')}</span>
                {renderDependencyStatus(healthState.health.status === 'ok' ? 'up' : 'degraded')}
              </div>
              {(['database', 'redis', 'storage'] as const).map((dependency) => (
                <div key={dependency} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-[#607086]">{t(`admin.adminPortalStatus.${dependency}`)}</span>
                  {renderDependencyStatus(healthState.health.dependencies[dependency])}
                </div>
              ))}
            </div>
          ) : healthState.status === 'error' ? (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
              <p role="alert" className="text-xs text-rose-700">{healthState.message}</p>
              <button
                type="button"
                onClick={healthState.refresh}
                className="rounded-lg border border-[#DCE3EB] px-3 py-2 text-xs font-semibold text-[#082B50] hover:bg-[#EFF3F8]"
              >
                {t('admin.adminPortalStatus.retryHealth')}
              </button>
            </div>
          ) : null}
        </section>

        <section className="flex items-start gap-3 rounded-2xl border border-[#DCE3EB] bg-[#EFF3F8] p-5">
          <ShieldAlert size={19} className="mt-0.5 shrink-0 text-[#082B50]" />
          <p className="text-sm leading-6 text-[#607086]">
            {t('admin.adminPortalStatus.academicOperationsUnavailable')}
          </p>
        </section>
      </div>
    </PortalPage>
  );
};
