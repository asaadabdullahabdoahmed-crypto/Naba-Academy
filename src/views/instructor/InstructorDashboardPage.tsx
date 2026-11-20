import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  ShieldAlert,
  UserRound,
} from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { useAuth } from '../../context/AuthContext';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface InstructorDashboardPageProps {
  locale: Locale;
}

export const InstructorDashboardPage: React.FC<InstructorDashboardPageProps> = ({ locale }) => {
  const { isAr, t } = useTranslation();
  const { user } = useAuth();
  const displayName = (isAr ? user?.nameAr || user?.nameEn : user?.nameEn || user?.nameAr)
    || t('instructor.instructorPortalStatus.profileFallback');

  const pendingWorkflows = [
    { label: t('instructor.instructorPortalStatus.assignedCourses'), icon: BookOpen },
    { label: isAr ? 'قوائم الطلاب والشُعب' : 'Student & Section Rosters', icon: GraduationCap },
    { label: isAr ? 'التكليفات ورصد الدرجات' : 'Assignments & Grading', icon: ClipboardCheck },
  ];

  return (
    <PortalPage
      title={isAr ? 'لوحة عضو هيئة التدريس' : 'Teacher Dashboard'}
      subtitle={isAr ? 'مساحة التدريس والحساب الأكاديمي' : 'Teaching workspace and account overview'}
      breadcrumbs={[
        { label: isAr ? 'بوابة عضو هيئة التدريس' : 'Teacher Portal', path: `/${locale}/instructor/dashboard` },
        { label: isAr ? 'لوحة التحكم' : 'Dashboard' },
      ]}
      locale={locale}
      actions={
        <Link
          to={`/${locale}/instructor/profile`}
          className="inline-flex items-center gap-2 rounded-lg bg-[#082B50] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#061E38]"
        >
          <UserRound size={15} />
          {t('instructor.instructorPortalStatus.profile')}
        </Link>
      }
    >
      <div className="space-y-6">
        <section className="rounded-2xl bg-[#082B50] p-6 text-white shadow-xs sm:p-8">
          <p className="text-sm text-white/75">{t('instructor.instructorPortalStatus.identityDescription')}</p>
          <h2 className="mt-2 text-2xl font-bold">{t('instructor.instructorPortalStatus.welcome', { name: displayName })}</h2>
          <p className="mt-2 break-all text-sm text-white/80">{user?.email || '—'}</p>
          <Link
            to={`/${locale}/instructor/profile`}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/30 px-3 py-2 text-xs font-semibold transition-colors hover:bg-white/10"
          >
            <UserRound size={14} />
            {isAr ? 'عرض بيانات الحساب' : 'View account details'}
          </Link>
        </section>

        <section className="rounded-2xl border border-[#DCE3EB] bg-white p-5 shadow-xs sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF3F8] text-[#082B50]">
              <ShieldAlert size={20} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-[#102033]">
                {t('instructor.instructorPortalStatus.unavailableLabel')}
              </h3>
              <p className="mt-1 text-sm leading-6 text-[#607086]">
                {t('instructor.instructorPortalStatus.academicApprovalBlocker')}
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-base font-bold text-[#082B50]">
              {isAr ? 'مسارات العمل الأكاديمية' : 'Academic Workflows'}
            </h3>
            <Link
              to={`/${locale}/instructor/courses`}
              className="text-xs font-semibold text-[#082B50] underline underline-offset-4"
            >
              {isAr ? 'استعراض دليل المقررات' : 'Browse course catalog'}
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {pendingWorkflows.map(({ label, icon: Icon }) => (
              <article key={label} className="rounded-2xl border border-[#DCE3EB] bg-white p-5 shadow-xs">
                <Icon size={20} className="text-[#082B50]" />
                <h4 className="mt-3 text-sm font-bold text-[#102033]">{label}</h4>
                <p className="mt-2 text-xs leading-5 text-[#607086]">
                  {t('instructor.instructorPortalStatus.unavailableLabel')}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </PortalPage>
  );
};
