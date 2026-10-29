import React from 'react';
import { CalendarDays, Mail, ShieldCheck, User } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { AccountSessionsPanel } from '../../components/account/AccountSessionsPanel';
import { useAuth } from '../../context/AuthContext';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface AdminProfilePageProps {
  locale: Locale;
}

export const AdminProfilePage: React.FC<AdminProfilePageProps> = ({ locale }) => {
  const { isAr, t, formatDate } = useTranslation();
  const { user } = useAuth();
  const displayName = (isAr ? user?.nameAr || user?.nameEn : user?.nameEn || user?.nameAr)
    || t('admin.adminPortalStatus.profileFallback');
  const roles = user?.roles.map((role) =>
    (isAr ? role.nameAr || role.nameEn : role.nameEn || role.nameAr) || role.code,
  ) ?? [];

  return (
    <PortalPage
      title={t('admin.adminPortalStatus.profile')}
      subtitle={t('admin.adminPortalStatus.identityDescription')}
      breadcrumbs={[
        { label: isAr ? 'بوابة الإدارة' : 'Administrator Portal', path: `/${locale}/admin/dashboard` },
        { label: t('admin.adminPortalStatus.profile') },
      ]}
      locale={locale}
    >
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="flex flex-col gap-5 rounded-2xl border border-[#DCE3EB] bg-white p-6 shadow-xs sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#EFF3F8] text-[#082B50]">
            <User size={30} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-[#102033]">{displayName}</h2>
            <p className="mt-1 flex items-center gap-2 text-sm text-[#607086]">
              <Mail size={15} />
              <span className="break-all">{user?.email || '—'}</span>
            </p>
          </div>
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-[#DCE3EB] bg-[#EFF3F8] px-3 py-1.5 text-xs font-semibold text-[#082B50] sm:self-center">
            <ShieldCheck size={15} />
            {user?.primaryRole || '—'}
          </span>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#DCE3EB] bg-white p-5 shadow-xs">
            <h3 className="mb-4 text-sm font-bold text-[#082B50]">
              {isAr ? 'بيانات الحساب والصلاحيات' : 'Account & Access'}
            </h3>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-xs text-[#607086]">{isAr ? 'حالة الحساب' : 'Account status'}</dt>
                <dd className="mt-1 font-semibold text-[#102033]">{user?.accountStatus || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#607086]">{isAr ? 'الأدوار المسندة' : 'Assigned roles'}</dt>
                <dd className="mt-1 flex flex-wrap gap-2">
                  {roles.length ? roles.map((role) => (
                    <span key={role} className="rounded-full bg-[#EFF3F8] px-2.5 py-1 text-xs text-[#082B50]">
                      {role}
                    </span>
                  )) : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#607086]">
                  {isAr ? 'حالة توثيق البريد الإلكتروني' : 'Email verification'}
                </dt>
                <dd className="mt-1 font-semibold text-[#102033]">
                  {user?.emailVerifiedAt
                    ? (isAr ? 'موثق' : 'Verified')
                    : (isAr ? 'غير موثق' : 'Not verified')}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-[#DCE3EB] bg-white p-5 shadow-xs">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#082B50]">
              <CalendarDays size={17} />
              {isAr ? 'بيانات الجلسة الحالية' : 'Current Session Details'}
            </h3>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-xs text-[#607086]">{isAr ? 'تاريخ إنشاء الحساب' : 'Account created'}</dt>
                <dd className="mt-1 font-semibold text-[#102033]">
                  {user?.createdAt ? formatDate(user.createdAt) : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#607086]">{isAr ? 'آخر تسجيل دخول' : 'Last sign in'}</dt>
                <dd className="mt-1 font-semibold text-[#102033]">
                  {user?.lastLoginAt ? formatDate(user.lastLoginAt) : '—'}
                </dd>
              </div>
            </dl>
            <p className="mt-5 border-t border-[#DCE3EB] pt-4 text-xs leading-6 text-[#607086]">
              {isAr
                ? 'تظهر هنا بيانات الهوية التي أعادها الخادم للجلسة الحالية فقط.'
                : 'This page displays only identity data returned by the server for the current session.'}
            </p>
          </div>
        </section>
        <AccountSessionsPanel />
      </div>
    </PortalPage>
  );
};
