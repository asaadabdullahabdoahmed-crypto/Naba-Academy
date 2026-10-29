import React from 'react';
import { useLocation } from 'react-router-dom';
import { Activity, CheckCircle2, CircleAlert, Database, HardDrive, RefreshCw, Server } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { useSystemHealth } from '../../hooks/useSystemHealth';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface AdminSystemHealthPageProps {
  locale: Locale;
}

export const AdminSystemHealthPage: React.FC<AdminSystemHealthPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const location = useLocation();
  const isAssessmentsView = location.pathname.includes('/admin/assessments');

  return (
    <PortalPage
      title={isAssessmentsView
        ? (isAr ? 'التقييم والاختبارات' : 'Assessments & Examination')
        : (isAr ? 'حالة النظام والخدمات' : 'System & Service Health')}
      subtitle={isAssessmentsView
        ? (isAr ? 'حالة التقييم بانتظار اعتماد واجهة API والمخطط الأكاديمي.' : 'Assessment workflows are pending academic schema and API approval.')
        : (isAr ? 'حالة فعلية من نقطة فحص الصحة في الواجهة الخلفية.' : 'Live status reported by the backend health endpoint.')}
      breadcrumbs={[
        { label: isAr ? 'بوابة الإدارة' : 'Admin Portal', path: `/${locale}/admin/dashboard` },
        { label: isAssessmentsView
          ? (isAr ? 'التقييم والاختبارات' : 'Assessments')
          : (isAr ? 'صحة النظام' : 'System Health') },
      ]}
      locale={locale}
    >
      {isAssessmentsView
        ? <AssessmentUnavailable />
        : <LiveSystemHealth />}
    </PortalPage>
  );
};

const AssessmentUnavailable: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-[#DCE3EB] bg-white p-8 text-center shadow-xs">
      <CircleAlert size={28} className="mx-auto text-[#082B50]" />
      <h2 className="mt-4 text-base font-bold text-[#102033]">
        {t('admin.adminPortalStatus.assessmentUnavailable')}
      </h2>
      <p className="mt-3 text-sm leading-6 text-[#607086]">
        {t('admin.adminPortalStatus.academicApprovalBlocker')}
      </p>
    </section>
  );
};

const LiveSystemHealth: React.FC = () => {
  const { isAr, t, formatDate } = useTranslation();
  const healthState = useSystemHealth();

  const dependencies = healthState.status === 'loaded'
    ? [
        { key: 'api', label: t('admin.adminPortalStatus.apiService'), status: healthState.health.status === 'ok' ? 'up' : 'degraded', icon: Server },
        { key: 'database', label: t('admin.adminPortalStatus.database'), status: healthState.health.dependencies.database, icon: Database },
        { key: 'redis', label: t('admin.adminPortalStatus.redis'), status: healthState.health.dependencies.redis, icon: Activity },
        { key: 'storage', label: t('admin.adminPortalStatus.storage'), status: healthState.health.dependencies.storage, icon: HardDrive },
      ]
    : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#DCE3EB] bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-[#102033]">{t('admin.adminPortalStatus.systemHealth')}</h2>
          <p className="mt-1 text-xs text-[#607086]">
            {healthState.status === 'loaded'
              ? t('admin.adminPortalStatus.healthLoadedAt', { date: formatDate(healthState.health.timestamp) })
              : healthState.status === 'loading'
                ? t('common.loading')
                : t('admin.adminPortalStatus.loadHealthError', { message: healthState.message })}
          </p>
        </div>
        <button
          type="button"
          onClick={healthState.refresh}
          disabled={healthState.status === 'loading'}
          className="inline-flex items-center gap-2 rounded-lg border border-[#DCE3EB] px-3 py-2 text-xs font-semibold text-[#082B50] hover:bg-[#EFF3F8] disabled:cursor-wait disabled:opacity-50"
        >
          <RefreshCw size={14} />
          {t('admin.adminPortalStatus.retryHealth')}
        </button>
      </div>

      {healthState.status === 'error' ? (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {healthState.message}
        </p>
      ) : healthState.status === 'loaded' ? (
        <>
          <div className={`rounded-2xl border p-5 ${healthState.health.status === 'ok' ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
            <p className="flex items-center gap-2 text-sm font-bold text-[#102033]">
              {healthState.health.status === 'ok' ? <CheckCircle2 size={17} /> : <CircleAlert size={17} />}
              {healthState.health.status === 'ok'
                ? t('admin.adminPortalStatus.systemHealthy')
                : t('admin.adminPortalStatus.systemDegraded')}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {dependencies.map(({ key, label, status, icon: Icon }) => {
              const statusLabel = status === 'up'
                ? t('admin.adminPortalStatus.statusOk')
                : status === 'down'
                  ? t('admin.adminPortalStatus.statusDown')
                  : status === 'degraded'
                    ? t('admin.adminPortalStatus.statusDegraded')
                    : t('admin.adminPortalStatus.statusUnconfigured');

              return (
                <article key={key} className="flex items-center justify-between gap-4 rounded-2xl border border-[#DCE3EB] bg-white p-5 shadow-xs">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF3F8] text-[#082B50]">
                      <Icon size={19} />
                    </span>
                    <h3 className="text-sm font-bold text-[#102033]">{label}</h3>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status === 'up' ? 'bg-emerald-50 text-emerald-700' : status === 'down' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-800'}`}>
                    {statusLabel}
                  </span>
                </article>
              );
            })}
          </div>
        </>
      ) : null}
      <p className="px-1 text-xs leading-5 text-[#607086]">
        {isAr
          ? 'تقتصر هذه المؤشرات على حالات الخدمات التي يعيدها فحص الصحة، ولا تعرض سجلات أو تفاصيل اتصال حساسة.'
          : 'These indicators show only statuses returned by the health check and do not expose records or connection details.'}
      </p>
    </div>
  );
};
