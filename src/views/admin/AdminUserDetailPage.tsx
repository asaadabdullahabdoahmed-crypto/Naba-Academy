import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CircleAlert } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface AdminUserDetailPageProps {
  locale: Locale;
}

export const AdminUserDetailPage: React.FC<AdminUserDetailPageProps> = ({ locale }) => {
  const { isAr, t } = useTranslation();
  const { userId } = useParams<{ userId: string }>();
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  return (
    <PortalPage
      title={t('admin.adminPortalStatus.usersTitle')}
      subtitle={t('admin.adminPortalStatus.userDetailUnavailable')}
      breadcrumbs={[
        { label: isAr ? 'بوابة الإدارة' : 'Administrator Portal', path: `/${locale}/admin/dashboard` },
        { label: t('admin.adminPortalStatus.usersTitle'), path: `/${locale}/admin/users` },
        { label: userId || (isAr ? 'تفاصيل الحساب' : 'Account details') },
      ]}
      locale={locale}
      actions={
        <Link
          to={`/${locale}/admin/users`}
          className="inline-flex items-center gap-2 rounded-lg border border-[#DCE3EB] bg-white px-3.5 py-2 text-xs font-bold text-[#082B50] hover:bg-[#EFF3F8]"
        >
          <BackArrow size={14} />
          {isAr ? 'دليل المستخدمين' : 'User Directory'}
        </Link>
      }
    >
      <section className="mx-auto max-w-3xl rounded-2xl border border-[#DCE3EB] bg-white p-8 text-center shadow-xs">
        <CircleAlert size={28} className="mx-auto text-[#082B50]" />
        <h2 className="mt-4 text-base font-bold text-[#102033]">
          {t('admin.adminPortalStatus.userDetailUnavailable')}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#607086]">
          {t('admin.adminPortalStatus.userDirectoryDetails')}
        </p>
        <p className="mt-4 font-mono text-xs text-[#607086]">
          {isAr ? 'معرف الحساب المطلوب' : 'Requested account ID'}: {userId || '—'}
        </p>
      </section>
    </PortalPage>
  );
};
