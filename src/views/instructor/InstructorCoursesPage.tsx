import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShieldAlert, UserRound } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface InstructorCoursesPageProps {
  locale: Locale;
}

export const InstructorCoursesPage: React.FC<InstructorCoursesPageProps> = ({ locale }) => {
  const { isAr, t } = useTranslation();

  return (
    <PortalPage
      title={t('instructor.instructorPortalStatus.assignedCourses')}
      subtitle={t('instructor.instructorPortalStatus.courseAssignmentsUnavailable')}
      breadcrumbs={[
        { label: isAr ? 'بوابة عضو هيئة التدريس' : 'Teacher Portal', path: `/${locale}/instructor/dashboard` },
        { label: t('instructor.instructorPortalStatus.assignedCourses') },
      ]}
      locale={locale}
    >
      <section className="mx-auto max-w-3xl rounded-2xl border border-[#DCE3EB] bg-white p-8 text-center shadow-xs sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFF3F8] text-[#082B50]">
          <BookOpen size={25} />
        </div>
        <h2 className="mt-4 text-base font-bold text-[#102033]">
          {t('instructor.instructorPortalStatus.courseAssignmentsUnavailable')}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#607086]">
          {t('instructor.instructorPortalStatus.academicApprovalBlocker')}
        </p>
        <div className="mx-auto mt-5 flex max-w-xl items-start gap-3 rounded-xl bg-[#EFF3F8] p-4 text-start text-xs leading-5 text-[#607086]">
          <ShieldAlert size={17} className="mt-0.5 shrink-0 text-[#082B50]" />
          <span>{t('instructor.instructorPortalStatus.academicDataUnavailable')}</span>
        </div>
        <Link
          to={`/${locale}/instructor/profile`}
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[#DCE3EB] px-4 py-2.5 text-xs font-bold text-[#082B50] transition-colors hover:bg-[#EFF3F8]"
        >
          <UserRound size={15} />
          {t('instructor.instructorPortalStatus.profile')}
        </Link>
      </section>
    </PortalPage>
  );
};
