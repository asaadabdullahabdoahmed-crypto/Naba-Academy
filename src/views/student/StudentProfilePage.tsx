import React, { useEffect, useState } from 'react';
import { Building2, LoaderCircle, Mail, MapPin, RotateCw, ShieldCheck, User } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import { useAuth } from '../../context/AuthContext';
import { ApiError, apiClient } from '../../services/apiClient';

interface StudentAcademicProfile {
  departmentId: string | null;
  departmentAr: string | null;
  departmentEn: string | null;
  collegeAr: string | null;
  collegeEn: string | null;
}

type AcademicProfileState = 'loading' | 'ready' | 'error' | 'forbidden' | 'unauthenticated';

interface StudentProfilePageProps {
  locale: Locale;
}

export const StudentProfilePage: React.FC<StudentProfilePageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const { user, isLoading: isAuthLoading, refreshUser } = useAuth();
  const [academicProfile, setAcademicProfile] = useState<StudentAcademicProfile | null>(null);
  const [academicProfileState, setAcademicProfileState] =
    useState<AcademicProfileState>('loading');
  const [retryCount, setRetryCount] = useState(0);

  const notAvailable = isAr ? 'غير متوفر' : 'Not available';

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      setAcademicProfileState('unauthenticated');
      return;
    }

    let isCurrent = true;
    setAcademicProfileState('loading');

    apiClient
      .get<StudentAcademicProfile>('/students/me/academic-profile')
      .then((profile) => {
        if (!isCurrent) return;
        setAcademicProfile(profile);
        setAcademicProfileState('ready');
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;
        if (error instanceof ApiError && (error.status === 401 || error.code === 'SESSION_REVOKED')) {
          setAcademicProfileState('unauthenticated');
          void refreshUser();
          return;
        }
        setAcademicProfileState(
          error instanceof ApiError && error.status === 403 ? 'forbidden' : 'error',
        );
      });

    return () => {
      isCurrent = false;
    };
  }, [isAuthLoading, refreshUser, retryCount, user]);

  const profileName =
    (isAr ? user?.nameAr : user?.nameEn) || user?.nameAr || user?.nameEn || notAvailable;
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
      title={isAr ? 'الملف الأكاديمي للطالب' : 'Student Academic Profile'}
      subtitle={
        isAr
          ? 'البيانات الشخصية، بيانات القيد الأكاديمي، ومعلومات التواصل'
          : 'Personal identity, enrollment status, and contact details'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الطالب' : 'Student Portal', path: `/${locale}/student/dashboard` },
        { label: isAr ? 'الملف الأكاديمي' : 'Profile' },
      ]}
      locale={locale}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Identity Card */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center border-2 border-[#DCE3EB] font-bold text-2xl shrink-0">
            <User size={36} className="text-[#082B50]" />
          </div>

          <div className="text-center sm:text-start space-y-1 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-base md:text-lg font-bold text-[#102033]">
                {profileName}
              </h2>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EFF3F8] text-[#082B50] border border-[#DCE3EB]">
                {isAr ? 'حساب طالب' : 'Student account'}
              </span>
            </div>
            <p className="text-xs text-[#607086]">
              {user?.email || notAvailable}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-[#607086]">
              <span className="flex items-center gap-1">
                <ShieldCheck size={14} className="text-[#082B50]" />
                <span>
                  {user?.nationalId
                    ? `${isAr ? 'رقم الهوية' : 'National ID'}: ${user.nationalId}`
                    : isAr ? 'حساب أكاديمي' : 'Academic account'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Academic Enrollment Information (Read-only institutional records) */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#DCE3EB]">
            <ShieldCheck size={18} className="text-[#082B50]" />
            <h3 className="text-sm font-bold text-[#102033]">
              {isAr ? 'بيانات القيد والتسجيل الأكاديمي' : 'Academic Registration Details'}
            </h3>
          </div>

          <div
            className="min-h-28"
            aria-live="polite"
            aria-busy={academicProfileState === 'loading'}
          >
            {academicProfileState === 'loading' && (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-[#607086]">
                <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
                <span>{isAr ? 'جارٍ تحميل البيانات الأكاديمية...' : 'Loading academic information...'}</span>
              </div>
            )}

            {academicProfileState === 'ready' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F7F9FC] border border-[#DCE3EB]">
                  <MapPin size={17} className="mt-0.5 text-[#082B50]" aria-hidden="true" />
                  <div>
                    <span className="text-[#607086] block text-[11px]">{isAr ? 'القسم الأكاديمي' : 'Department'}</span>
                    <span className="font-bold text-[#082B50] text-sm mt-0.5 block">{department}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F7F9FC] border border-[#DCE3EB]">
                  <Building2 size={17} className="mt-0.5 text-[#082B50]" aria-hidden="true" />
                  <div>
                    <span className="text-[#607086] block text-[11px]">{isAr ? 'الكلية' : 'College'}</span>
                    <span className="font-bold text-[#082B50] text-sm mt-0.5 block">{college}</span>
                  </div>
                </div>
              </div>
            )}

            {(academicProfileState === 'error' ||
              academicProfileState === 'forbidden' ||
              academicProfileState === 'unauthenticated') && (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <p className="text-sm text-[#607086]" role="status">
                  {academicProfileState === 'forbidden'
                    ? isAr
                      ? 'ليس لديك صلاحية عرض هذه البيانات الأكاديمية.'
                      : 'You are not authorized to view this academic information.'
                    : academicProfileState === 'unauthenticated'
                      ? isAr
                        ? 'انتهت صلاحية الجلسة. سجّل الدخول مجددًا لعرض بياناتك.'
                        : 'Your session is no longer available. Sign in again to view your information.'
                      : isAr
                        ? 'تعذر تحميل البيانات الأكاديمية. تحقق من اتصالك ثم أعد المحاولة.'
                        : 'Academic information could not be loaded. Check your connection and try again.'}
                </p>
                {academicProfileState === 'error' && (
                  <button
                    type="button"
                    onClick={() => setRetryCount((count) => count + 1)}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#DCE3EB] px-3 py-2 text-xs font-bold text-[#082B50] hover:bg-[#EFF3F8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#082B50]"
                  >
                    <RotateCw size={14} aria-hidden="true" />
                    {isAr ? 'إعادة المحاولة' : 'Try again'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#F7F9FC] rounded-2xl border border-[#DCE3EB] p-5 md:p-6">
          <div className="flex items-center gap-2 pb-3 border-b border-[#DCE3EB]">
            <Mail size={18} className="text-[#082B50]" />
            <h3 className="text-sm font-bold text-[#102033]">
              {isAr ? 'بيانات التواصل' : 'Contact information'}
            </h3>
          </div>
          <p className="pt-3 text-xs leading-relaxed text-[#607086]">
            {isAr
              ? 'تعديل الهاتف والعنوان غير متاح حاليًا؛ لم يتم حفظ أي تغييرات محلية.'
              : 'Phone and address editing is not available yet. No local changes are saved.'}
          </p>
        </div>
      </div>
    </PortalPage>
  );
};
