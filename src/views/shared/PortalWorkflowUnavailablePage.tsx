import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CircleAlert } from 'lucide-react';
import { PORTAL_CONFIGS } from '../../config/portalNavigation';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface PortalWorkflowUnavailablePageProps {
  locale: Locale;
  portalKey: 'instructor' | 'admin';
}

export const PortalWorkflowUnavailablePage: React.FC<PortalWorkflowUnavailablePageProps> = ({
  locale,
  portalKey,
}) => {
  const { isAr, t } = useTranslation();
  const location = useLocation();
  const path = location.pathname.replace(`/${locale}`, '');
  const navItem = PORTAL_CONFIGS[portalKey].items
    .filter((item) => path === item.path || path.startsWith(`${item.path}/`))
    .sort((left, right) => right.path.length - left.path.length)[0];
  const title = navItem
    ? t(navItem.titleKey)
    : isAr
      ? 'مسار عمل غير متاح'
      : 'Unavailable workflow';
  const detail = portalKey === 'instructor'
    ? t('instructor.instructorPortalStatus.workflowUnavailable')
    : t('admin.adminPortalStatus.workflowUnavailable');
  const approvalNote = portalKey === 'instructor'
    ? t('instructor.instructorPortalStatus.academicApprovalBlocker')
    : null;
  const dashboardPath = `/${locale}/${portalKey}/dashboard`;

  return (
    <PortalPage
      title={title}
      subtitle={detail}
      breadcrumbs={[
        {
          label: portalKey === 'instructor'
            ? (isAr ? 'بوابة عضو هيئة التدريس' : 'Teacher Portal')
            : (isAr ? 'بوابة الإدارة' : 'Administrator Portal'),
          path: dashboardPath,
        },
        { label: title },
      ]}
      locale={locale}
    >
      <section className="mx-auto max-w-3xl rounded-2xl border border-[#DCE3EB] bg-white p-8 text-center shadow-xs sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFF3F8] text-[#082B50]">
          <CircleAlert size={25} />
        </div>
        <h2 className="mt-4 text-base font-bold text-[#102033]">{title}</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#607086]">{detail}</p>
        {approvalNote && (
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#607086]">{approvalNote}</p>
        )}
        <Link
          to={dashboardPath}
          className="mt-6 inline-flex items-center rounded-lg border border-[#DCE3EB] px-4 py-2.5 text-xs font-bold text-[#082B50] transition-colors hover:bg-[#EFF3F8]"
        >
          {isAr ? 'العودة إلى لوحة التحكم' : 'Back to dashboard'}
        </Link>
      </section>
    </PortalPage>
  );
};
