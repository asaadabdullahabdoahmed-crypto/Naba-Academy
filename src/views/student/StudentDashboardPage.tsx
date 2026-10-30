import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  Award,
  Video,
  ClipboardList,
  Bell,
  ArrowRight,
  ArrowLeft,
  FolderArchive,
  PlusCircle,
  Headphones,
  CheckCircle2,
  Tv,
  CircleAlert,
  LoaderCircle,
  RotateCw,
} from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { useAuth } from '../../context/AuthContext';
import { ApiError, apiClient } from '../../services/apiClient';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface StudentDashboardPageProps {
  locale: Locale;
}

interface StudentAcademicProfile {
  departmentId: string | null;
  departmentAr: string | null;
  departmentEn: string | null;
  collegeAr: string | null;
  collegeEn: string | null;
}

type AcademicProfileState =
  | 'loading'
  | 'ready'
  | 'error'
  | 'forbidden'
  | 'unauthenticated';

export const StudentDashboardPage: React.FC<StudentDashboardPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const { user, isLoading: isAuthLoading, refreshUser } = useAuth();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const [academicProfile, setAcademicProfile] = useState<StudentAcademicProfile | null>(null);
  const [academicProfileState, setAcademicProfileState] =
    useState<AcademicProfileState>('loading');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      setAcademicProfileState('unauthenticated');
      return;
    }

    let active = true;
    const controller = new AbortController();
    setAcademicProfileState('loading');

    apiClient
      .get<StudentAcademicProfile>('/students/me/academic-profile', {
        signal: controller.signal,
      })
      .then((profile) => {
        if (!active) return;
        setAcademicProfile(profile);
        setAcademicProfileState('ready');
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (
          error instanceof ApiError &&
          (error.status === 401 || error.code === 'SESSION_REVOKED')
        ) {
          setAcademicProfileState('unauthenticated');
          void refreshUser();
          return;
        }
        setAcademicProfileState(
          error instanceof ApiError && error.status === 403 ? 'forbidden' : 'error',
        );
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [isAuthLoading, refreshUser, retryCount, user]);

  const notAvailable = isAr ? 'غير متوفر' : 'Not available';
  const department =
    (isAr ? academicProfile?.departmentAr : academicProfile?.departmentEn) ||
    (isAr ? academicProfile?.departmentEn : academicProfile?.departmentAr) ||
    notAvailable;
  const college =
    (isAr ? academicProfile?.collegeAr : academicProfile?.collegeEn) ||
    (isAr ? academicProfile?.collegeEn : academicProfile?.collegeAr) ||
    notAvailable;

  return (
    <PortalPage
      title={isAr ? 'لوحة تحكم الطالب' : 'Student Dashboard'}
      subtitle={
        isAr
          ? 'مرحباً بك في رحلتك التعليمية مع أكاديمية نبا'
          : 'Welcome to your academic journey with NABA Academy'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الطالب' : 'Student Portal', path: `/${locale}/student/dashboard` },
        { label: isAr ? 'الرئيسية' : 'Dashboard' },
      ]}
      locale={locale}
      actions={
        <div className="flex items-center gap-2">
          <Link
            to={`/${locale}/student/registration`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#082B50] hover:bg-[#061E38] text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            <PlusCircle size={14} className="text-[#D6A53A]" />
            <span>{isAr ? 'التسجيل الفصلي للمقررات' : 'Course Registration'}</span>
          </Link>
          <Link
            to={`/${locale}/student/schedule`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] rounded-lg text-xs font-bold transition-colors"
          >
            <Calendar size={14} />
            <span>{isAr ? 'الجدول الدراسي' : 'Class Schedule'}</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        <div
          role="status"
          className="rounded-xl border border-[#DCE3EB] bg-[#F7F9FC] px-4 py-3 text-xs leading-relaxed text-[#607086]"
        >
          {isAr
            ? 'بيانات المقررات والواجبات والجدول الأكاديمي غير متاحة بعد. هذه الحالة لا تعني عدم وجود سجلات للطالب.'
            : 'Course, assignment, and timetable data are not available yet. These placeholders do not mean that no student records exist.'}
        </div>

        <section
          className="rounded-2xl border border-[#DCE3EB] bg-white p-5 shadow-xs sm:p-6"
          aria-live="polite"
          aria-busy={academicProfileState === 'loading'}
        >
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#DCE3EB] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#102033]">
                {isAr ? 'البيانات الأكاديمية الحالية في الحساب' : 'Academic profile on your account'}
              </h3>
              <p className="mt-1 text-xs text-[#607086]">
                {isAr
                  ? 'هذه بيانات الحساب الحالية وليست تسكينًا موحدًا معتمدًا.'
                  : 'These are existing account fields, not a verified normalized placement.'}
              </p>
            </div>
            <Link
              to={`/${locale}/student/profile`}
              className="text-xs font-bold text-[#082B50] underline underline-offset-4"
            >
              {isAr ? 'الملف الأكاديمي' : 'Academic profile'}
            </Link>
          </div>

          {academicProfileState === 'loading' && (
            <p className="flex items-center gap-2 py-4 text-xs text-[#607086]" role="status">
              <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
              {isAr ? 'جارٍ تحميل البيانات الأكاديمية...' : 'Loading academic profile...'}
            </p>
          )}
          {academicProfileState === 'ready' && (
            <dl className="grid gap-4 pt-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-[#607086]">{isAr ? 'الكلية' : 'College'}</dt>
                <dd className="mt-1 text-sm font-semibold text-[#102033]">{college}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#607086]">{isAr ? 'القسم' : 'Department'}</dt>
                <dd className="mt-1 text-sm font-semibold text-[#102033]">{department}</dd>
              </div>
            </dl>
          )}
          {academicProfileState === 'unauthenticated' && (
            <p className="py-4 text-xs text-[#607086]" role="status">
              {isAr
                ? 'الجلسة غير متاحة لعرض البيانات الأكاديمية.'
                : 'A valid session is required to view your academic profile.'}
            </p>
          )}
          {academicProfileState === 'forbidden' && (
            <p className="py-4 text-xs text-[#607086]" role="status">
              {isAr
                ? 'ليست لديك صلاحية عرض هذه البيانات الأكاديمية.'
                : 'You are not authorized to view this academic profile.'}
            </p>
          )}
          {academicProfileState === 'error' && (
            <div className="flex flex-wrap items-center justify-between gap-3 py-4">
              <p className="flex items-center gap-2 text-xs text-[#607086]" role="alert">
                <CircleAlert size={15} aria-hidden="true" />
                {isAr ? 'تعذر تحميل البيانات الأكاديمية.' : 'Could not load academic profile.'}
              </p>
              <button
                type="button"
                onClick={() => setRetryCount((count) => count + 1)}
                className="inline-flex items-center gap-2 rounded-lg border border-[#DCE3EB] px-3 py-2 text-xs font-bold text-[#082B50] hover:bg-[#EFF3F8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#082B50]"
              >
                <RotateCw size={14} aria-hidden="true" />
                {isAr ? 'إعادة المحاولة' : 'Retry'}
              </button>
            </div>
          )}
        </section>

        {/* Top Section: دوراتي الحالية (Current Courses) */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#DCE3EB]">
            <div>
              <h3 className="text-base font-bold text-[#082B50]">
                {isAr ? 'المقررات الدراسية' : 'Enrolled Courses'}
              </h3>
              <p className="text-xs text-[#607086] mt-0.5">
                {isAr ? 'قائمة المقررات المسجلة للطالب' : 'List of enrolled academic courses'}
              </p>
            </div>
            <Link
              to={`/${locale}/student/courses`}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#082B50] hover:text-[#174F89]"
            >
              <span>{isAr ? 'عرض الكل' : 'View All'}</span>
              <ArrowIcon size={13} />
            </Link>
          </div>

          {/* Corrected Neutral Empty State (No assumed operational facts) */}
          <div className="py-12 px-4 text-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
              <BookOpen size={24} />
            </div>
            <h4 className="text-sm font-bold text-[#102033] mb-1">
              {isAr ? 'بيانات المقررات غير متاحة بعد' : 'Course information is not available yet.'}
            </h4>
            <p className="text-xs text-[#607086] leading-relaxed mb-5">
              {isAr
                ? 'يتطلب عرض المقررات ربط النظام بخدمة البيانات الأكاديمية المعتمدة.'
                : 'Displaying courses requires a connection to the approved academic data service.'}
            </p>
            <Link
              to={`/${locale}/student/registration`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#082B50] hover:bg-[#061E38] text-white text-xs font-bold transition-colors shadow-xs"
            >
              <PlusCircle size={14} className="text-[#D6A53A]" />
              <span>{isAr ? 'التسجيل الفصلي للمقررات' : 'Go to Course Registration'}</span>
            </Link>
          </div>
        </div>

        {/* Bottom Three Cards (Neutral Empty States, No assumptions) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: المحاضرات */}
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DCE3EB]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#EFF3F8] text-[#082B50] flex items-center justify-center">
                    <Tv size={15} />
                  </div>
                  <h4 className="text-xs font-bold text-[#082B50]">
                    {isAr ? 'المحاضرات المجدولة' : 'Scheduled Lectures'}
                  </h4>
                </div>
              </div>

              <div className="py-8 text-center">
                <div className="w-10 h-10 rounded-xl bg-[#EFF3F8] text-[#607086] flex items-center justify-center mx-auto mb-2">
                  <Video size={18} />
                </div>
                <h5 className="text-xs font-bold text-[#102033] mb-1">
                  {isAr ? 'بيانات المحاضرات غير متاحة بعد' : 'Lecture information is not available yet.'}
                </h5>
                <p className="text-[11px] text-[#607086]">
                  {isAr ? 'لم يتم ربط جدول المحاضرات بالخدمة الأكاديمية بعد.' : 'The lecture timetable is not connected to the academic service yet.'}
                </p>
              </div>
            </div>

            <Link
              to={`/${locale}/student/schedule`}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#EFF3F8] hover:bg-[#DCE3EB]/60 text-[#082B50] text-xs font-semibold transition-colors mt-2"
            >
              <span>{isAr ? 'الجدول الدراسي' : 'View Schedule'}</span>
              <ArrowIcon size={12} />
            </Link>
          </div>

          {/* Card 2: الواجبات والتكليفات */}
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DCE3EB]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#EFF3F8] text-[#082B50] flex items-center justify-center">
                    <ClipboardList size={15} />
                  </div>
                  <h4 className="text-xs font-bold text-[#082B50]">
                    {isAr ? 'الواجبات والتكليفات' : 'Assignments & Coursework'}
                  </h4>
                </div>
              </div>

              <div className="py-8 text-center">
                <div className="w-10 h-10 rounded-xl bg-[#EFF3F8] text-[#607086] flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 size={18} />
                </div>
                <h5 className="text-xs font-bold text-[#102033] mb-1">
                  {isAr ? 'بيانات الواجبات غير متاحة بعد' : 'Assignment information is not available yet.'}
                </h5>
                <p className="text-[11px] text-[#607086]">
                  {isAr ? 'لم يتم ربط الواجبات بالخدمة الأكاديمية بعد.' : 'Assignments are not connected to the academic service yet.'}
                </p>
              </div>
            </div>

            <Link
              to={`/${locale}/student/assignments`}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#EFF3F8] hover:bg-[#DCE3EB]/60 text-[#082B50] text-xs font-semibold transition-colors mt-2"
            >
              <span>{isAr ? 'قائمة الواجبات' : 'Assignments List'}</span>
              <ArrowIcon size={12} />
            </Link>
          </div>

          {/* Card 3: الإشعارات */}
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DCE3EB]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#EFF3F8] text-[#082B50] flex items-center justify-center">
                    <Bell size={15} />
                  </div>
                  <h4 className="text-xs font-bold text-[#082B50]">
                    {isAr ? 'الإشعارات الأكاديمية' : 'Academic Notices'}
                  </h4>
                </div>
              </div>

              <div className="py-8 text-center">
                <div className="w-10 h-10 rounded-xl bg-[#EFF3F8] text-[#607086] flex items-center justify-center mx-auto mb-2">
                  <Clock size={18} />
                </div>
                <h5 className="text-xs font-bold text-[#102033] mb-1">
                  {isAr ? 'لا توجد إشعارات حالية' : 'No current notifications.'}
                </h5>
                <p className="text-[11px] text-[#607086]">
                  {isAr ? 'ستظهر الإشعارات هنا عند صدورها.' : 'Notifications will appear here as they are issued.'}
                </p>
              </div>
            </div>

            <Link
              to={`/${locale}/student/messages`}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#EFF3F8] hover:bg-[#DCE3EB]/60 text-[#082B50] text-xs font-semibold transition-colors mt-2"
            >
              <span>{isAr ? 'مركز الرسائل' : 'Message Center'}</span>
              <ArrowIcon size={12} />
            </Link>
          </div>
        </div>

        {/* Quick Academic Hub Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            to={`/${locale}/student/library`}
            className="p-4 rounded-xl bg-white border border-[#DCE3EB] hover:border-[#082B50]/30 transition-all shadow-xs flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-[#EFF3F8] text-[#082B50] flex items-center justify-center shrink-0">
              <FolderArchive size={18} />
            </div>
            <div>
              <h5 className="text-xs font-bold text-[#102033]">{isAr ? 'المكتبة الرقمية' : 'Digital Library'}</h5>
              <p className="text-[10px] text-[#607086]">{isAr ? 'المراجع والمقررات' : 'Scholarly texts'}</p>
            </div>
          </Link>

          <Link
            to={`/${locale}/student/exams`}
            className="p-4 rounded-xl bg-white border border-[#DCE3EB] hover:border-[#082B50]/30 transition-all shadow-xs flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-[#EFF3F8] text-[#082B50] flex items-center justify-center shrink-0">
              <Award size={18} />
            </div>
            <div>
              <h5 className="text-xs font-bold text-[#102033]">{isAr ? 'جدول الاختبارات' : 'Exam Schedule'}</h5>
              <p className="text-[10px] text-[#607086]">{isAr ? 'مواعيد التقييم' : 'Assessment calendar'}</p>
            </div>
          </Link>

          <Link
            to={`/${locale}/student/advising`}
            className="p-4 rounded-xl bg-white border border-[#DCE3EB] hover:border-[#082B50]/30 transition-all shadow-xs flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-[#EFF3F8] text-[#082B50] flex items-center justify-center shrink-0">
              <GraduationCap size={18} />
            </div>
            <div>
              <h5 className="text-xs font-bold text-[#102033]">{isAr ? 'الإرشاد الأكاديمي' : 'Academic Advising'}</h5>
              <p className="text-[10px] text-[#607086]">{isAr ? 'التواصل مع المرشد' : 'Advisor contact'}</p>
            </div>
          </Link>

          <Link
            to={`/${locale}/student/support`}
            className="p-4 rounded-xl bg-white border border-[#DCE3EB] hover:border-[#082B50]/30 transition-all shadow-xs flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-[#EFF3F8] text-[#082B50] flex items-center justify-center shrink-0">
              <Headphones size={18} />
            </div>
            <div>
              <h5 className="text-xs font-bold text-[#102033]">{isAr ? 'الدعم الأكاديمي' : 'Academic Support'}</h5>
              <p className="text-[10px] text-[#607086]">{isAr ? 'خدمات المستفيدين' : 'Helpdesk tickets'}</p>
            </div>
          </Link>
        </div>
      </div>
    </PortalPage>
  );
};
