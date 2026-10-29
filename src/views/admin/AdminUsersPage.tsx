import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CircleAlert, UserRound, Users } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface AdminUsersPageProps {
  locale: Locale;
}

export const AdminUsersPage: React.FC<AdminUsersPageProps> = ({ locale }) => {
  const { isAr, t } = useTranslation();
  const location = useLocation();
  const isStudentsView = location.pathname.includes('/admin/students');
  const pageTitle = isStudentsView
    ? t('admin.adminPortalStatus.studentsTitle')
    : t('admin.adminPortalStatus.usersTitle');

  return (
    <PortalPage
      title={pageTitle}
      subtitle={isAr
        ? 'استعراض الحسابات أو سجلات الطلاب غير متاح قبل اعتماد واجهات الإدارة.'
        : 'Browsing accounts or student records is unavailable until administrative APIs are approved.'}
      breadcrumbs={[
        { label: isAr ? 'بوابة الإدارة' : 'Administrator Portal', path: `/${locale}/admin/dashboard` },
        { label: pageTitle },
      ]}
      locale={locale}
    >
      <section className="mx-auto max-w-3xl rounded-2xl border border-[#DCE3EB] bg-white p-8 text-center shadow-xs sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFF3F8] text-[#082B50]">
          {isStudentsView ? <UserRound size={25} /> : <Users size={25} />}
        </div>
        <h2 className="mt-4 text-base font-bold text-[#102033]">
          {t('admin.adminPortalStatus.userDirectoryUnavailable')}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#607086]">
          {t('admin.adminPortalStatus.userDirectoryDetails')}
        </p>
        {isStudentsView && (
          <div className="mx-auto mt-5 flex max-w-xl items-start gap-3 rounded-xl bg-[#EFF3F8] p-4 text-start text-xs leading-5 text-[#607086]">
            <CircleAlert size={17} className="mt-0.5 shrink-0 text-[#082B50]" />
            <span>{t('admin.adminPortalStatus.academicApprovalBlocker')}</span>
          </div>
        )}
        <Link
          to={`/${locale}/admin/profile`}
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[#DCE3EB] px-4 py-2.5 text-xs font-bold text-[#082B50] transition-colors hover:bg-[#EFF3F8]"
        >
          <UserRound size={15} />
          {t('admin.adminPortalStatus.profile')}
        </Link>
      </section>
    </PortalPage>
  );
};
