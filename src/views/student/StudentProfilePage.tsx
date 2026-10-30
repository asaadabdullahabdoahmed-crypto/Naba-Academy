import React, { useEffect, useState } from 'react';
import { Building2, LoaderCircle, Mail, MapPin, RotateCw, ShieldCheck, User } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import { useAuth } from '../../context/AuthContext';
import { ApiError, apiClient } from '../../services/apiClient';
import type {
  AcademicCatalogPage,
  RecordedStudentAcademicPlacement,
  StudentAcademicPlacement,
} from '../../contracts/academicCatalog';
import { academicCatalogClient } from '../../services/academicCatalogClient';

interface StudentAcademicProfile {
  departmentId: string | null;
  departmentAr: string | null;
  departmentEn: string | null;
  collegeAr: string | null;
  collegeEn: string | null;
}

type AcademicProfileState = 'loading' | 'ready' | 'error' | 'forbidden' | 'unauthenticated';
type PlacementState = 'disabled' | 'loading' | 'ready' | 'error' | 'forbidden' | 'unauthenticated';
type PlacementHistoryState = 'disabled' | 'loading' | 'ready' | 'error' | 'forbidden' | 'unauthenticated';

const catalogReadsEnabled = import.meta.env.VITE_ACADEMIC_CATALOG_READS_ENABLED === 'true';
const PLACEMENT_HISTORY_PAGE_SIZE = 20;

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
  const [placement, setPlacement] = useState<StudentAcademicPlacement | null>(null);
  const [placementState, setPlacementState] = useState<PlacementState>(
    catalogReadsEnabled ? 'loading' : 'disabled',
  );
  const [placementRetryCount, setPlacementRetryCount] = useState(0);
  const [placementHistory, setPlacementHistory] =
    useState<AcademicCatalogPage<RecordedStudentAcademicPlacement> | null>(null);
  const [placementHistoryState, setPlacementHistoryState] =
    useState<PlacementHistoryState>(catalogReadsEnabled ? 'loading' : 'disabled');
  const [placementHistoryPage, setPlacementHistoryPage] = useState(1);
  const [placementHistoryRetryCount, setPlacementHistoryRetryCount] = useState(0);

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

  useEffect(() => {
    if (!catalogReadsEnabled) {
      setPlacementState('disabled');
      setPlacement(null);
      return;
    }
    if (isAuthLoading) return;
    if (!user) {
      setPlacementState('unauthenticated');
      return;
    }

    let active = true;
    const controller = new AbortController();
    setPlacementState('loading');
    academicCatalogClient
      .getMyPlacement(controller.signal)
      .then(({ current }) => {
        if (!active) return;
        setPlacement(current);
        setPlacementState('ready');
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof ApiError && error.status === 401) {
          setPlacementState('unauthenticated');
          void refreshUser();
          return;
        }
        setPlacementState(
          error instanceof ApiError && error.status === 403 ? 'forbidden' : 'error',
        );
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [isAuthLoading, placementRetryCount, refreshUser, user]);

  useEffect(() => {
    if (!catalogReadsEnabled) {
      setPlacementHistory(null);
      setPlacementHistoryState('disabled');
      return;
    }
    if (isAuthLoading) return;
    if (!user) {
      setPlacementHistoryState('unauthenticated');
      return;
    }

    let active = true;
    const controller = new AbortController();
    setPlacementHistory(null);
    setPlacementHistoryState('loading');
    academicCatalogClient
      .listMyPlacementHistory(
        { page: placementHistoryPage, pageSize: PLACEMENT_HISTORY_PAGE_SIZE },
        controller.signal,
      )
      .then((result) => {
        if (!active) return;
        setPlacementHistory(result);
        setPlacementHistoryState('ready');
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (
          error instanceof ApiError &&
          (error.status === 401 || error.code === 'SESSION_REVOKED')
        ) {
          setPlacementHistoryState('unauthenticated');
          void refreshUser();
          return;
        }
        setPlacementHistoryState(
          error instanceof ApiError && error.status === 403 ? 'forbidden' : 'error',
        );
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [
    isAuthLoading,
    placementHistoryPage,
    placementHistoryRetryCount,
    refreshUser,
    user,
  ]);

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

                  <div className="border-t border-[#DCE3EB] pt-4" aria-live="polite" aria-busy={placementState === 'loading'}>
                    <h4 className="mb-3 text-xs font-bold text-[#102033]">
                      {isAr ? 'التسكين الأكاديمي الموثق' : 'Verified academic placement'}
                    </h4>
                    {placementState === 'loading' && (
                      <p className="flex items-center gap-2 py-3 text-xs text-[#607086]">
                        <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
                        {isAr ? 'جار تحميل التسكين...' : 'Loading placement...'}
                      </p>
                    )}
                    {placementState === 'disabled' && (
                      <p className="py-2 text-xs text-[#607086]" role="status">
                        {isAr ? 'الربط بالدليل الأكاديمي غير مفعّل في هذه البيئة.' : 'Academic catalog integration is disabled in this environment.'}
                      </p>
                    )}
                    {placementState === 'ready' && !placement && (
                      <p className="py-2 text-xs text-[#607086]" role="status">
                        {isAr ? 'لا يوجد تسكين أكاديمي موثق مرتبط بحسابك.' : 'No verified academic placement is linked to your account.'}
                      </p>
                    )}
                    {placementState === 'ready' && placement && (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                          {
                            label: isAr ? 'الجامعة' : 'University',
                            value: placement.program.department.college.university
                              ? isAr
                                ? placement.program.department.college.university.nameAr
                                : placement.program.department.college.university.nameEn
                              : notAvailable,
                          },
                          {
                            label: isAr ? 'الكلية' : 'College',
                            value: isAr
                              ? placement.program.department.college.nameAr
                              : placement.program.department.college.nameEn,
                          },
                          {
                            label: isAr ? 'القسم' : 'Department',
                            value: isAr
                              ? placement.program.department.nameAr
                              : placement.program.department.nameEn,
                          },
                          {
                            label: isAr ? 'البرنامج' : 'Program',
                            value: isAr ? placement.program.nameAr : placement.program.nameEn,
                          },
                        ].map(({ label, value }) => (
                          <div key={label} className="rounded-xl border border-[#DCE3EB] bg-[#F7F9FC] p-3">
                            <span className="block text-[11px] text-[#607086]">{label}</span>
                            <span className="mt-1 block text-sm font-bold text-[#082B50]">{value}</span>
                          </div>
                        ))}
                        <p className="text-xs text-[#607086] sm:col-span-2 lg:col-span-4">
                          {isAr ? 'تاريخ السريان: ' : 'Effective from: '}
                          {placement.effectiveFrom}
                          {` • ${isAr ? 'المؤهل' : 'Credential'}: `}
                          {isAr
                            ? placement.program.credentialLevel.nameAr
                            : placement.program.credentialLevel.nameEn}
                        </p>
                      </div>
                    )}
                    {['error', 'forbidden', 'unauthenticated'].includes(placementState) && (
                      <div className="flex flex-col items-start gap-2 py-2">
                        <p className="text-xs text-[#607086]" role="status">
                          {placementState === 'forbidden'
                            ? isAr ? 'ليست لديك صلاحية عرض التسكين.' : 'You are not authorized to view this placement.'
                            : placementState === 'unauthenticated'
                              ? isAr ? 'الجلسة غير متاحة لعرض التسكين.' : 'A valid session is required to view placement.'
                              : isAr ? 'تعذر تحميل التسكين الأكاديمي.' : 'Could not load academic placement.'}
                        </p>
                        {placementState === 'error' && (
                          <button
                            type="button"
                            onClick={() => setPlacementRetryCount((count) => count + 1)}
                            className="rounded-lg border border-[#DCE3EB] px-3 py-2 text-xs font-bold text-[#082B50]"
                          >
                            {isAr ? 'إعادة المحاولة' : 'Retry'}
                          </button>
                        )}
                      </div>
                    )}
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

        <section
          className="rounded-2xl border border-[#DCE3EB] bg-white p-6 shadow-xs"
          aria-live="polite"
          aria-busy={placementHistoryState === 'loading'}
        >
          <div className="mb-4 border-b border-[#DCE3EB] pb-3">
            <h3 className="text-sm font-bold text-[#102033]">
              {isAr ? 'سجل التسكين الأكاديمي المسجل' : 'Recorded academic placement history'}
            </h3>
            <p className="mt-1 text-xs text-[#607086]">
              {isAr
                ? 'يعرض السجلات المسجلة كما هي، ولا يمثل اعتمادًا لتاريخ التحويلات.'
                : 'Displays recorded rows as stored; this is not an approved transfer history.'}
            </p>
          </div>

          {placementHistoryState === 'loading' && (
            <p className="flex items-center gap-2 py-4 text-xs text-[#607086]" role="status">
              <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
              {isAr ? 'جارٍ تحميل السجل...' : 'Loading recorded history...'}
            </p>
          )}
          {placementHistoryState === 'disabled' && (
            <p className="py-2 text-xs text-[#607086]" role="status">
              {isAr
                ? 'قراءة السجل الأكاديمي غير مفعّلة في هذه البيئة.'
                : 'Academic history reads are disabled in this environment.'}
            </p>
          )}
          {placementHistoryState === 'ready' && placementHistory?.data.length === 0 && (
            <p className="py-2 text-xs text-[#607086]" role="status">
              {isAr ? 'لا توجد سجلات تسكين أكاديمي مسجلة.' : 'No recorded academic placements were found.'}
            </p>
          )}
          {placementHistoryState === 'ready' && placementHistory && placementHistory.data.length > 0 && (
            <>
              <ol className="space-y-3">
                {placementHistory.data.map((record) => (
                  <li
                    key={record.id}
                    className="rounded-xl border border-[#DCE3EB] bg-[#F7F9FC] p-4"
                  >
                    <p className="text-sm font-bold text-[#082B50]">
                      {isAr ? record.program.nameAr : record.program.nameEn}
                    </p>
                    <p className="mt-1 text-xs text-[#607086]">
                      {[
                        record.program.department.college.nameAr
                          ? isAr
                            ? record.program.department.college.nameAr
                            : record.program.department.college.nameEn
                          : null,
                        isAr
                          ? record.program.department.nameAr
                          : record.program.department.nameEn,
                      ]
                        .filter(Boolean)
                        .join(' • ')}
                    </p>
                    <p className="mt-2 text-xs text-[#607086]">
                      {isAr ? 'السريان: ' : 'Effective: '}
                      {record.effectiveFrom}
                      {' – '}
                      {record.effectiveTo ?? (isAr ? 'مستمر' : 'Ongoing')}
                    </p>
                    <p className="mt-1 text-[11px] text-[#607086]">
                      {isAr ? 'تاريخ التسجيل: ' : 'Recorded at: '}
                      {record.recordedAt}
                    </p>
                  </li>
                ))}
              </ol>
              <div className="mt-4 flex items-center justify-between">
                <button
                  type="button"
                  disabled={!placementHistory.meta.hasPrevious}
                  onClick={() => setPlacementHistoryPage((page) => Math.max(1, page - 1))}
                  className="rounded-lg border border-[#DCE3EB] px-3 py-2 text-xs font-bold text-[#082B50] disabled:opacity-50"
                >
                  {isAr ? 'السابق' : 'Previous'}
                </button>
                <span className="text-xs text-[#607086]">
                  {placementHistory.meta.page} / {placementHistory.meta.totalPages}
                </span>
                <button
                  type="button"
                  disabled={!placementHistory.meta.hasNext}
                  onClick={() => setPlacementHistoryPage((page) => page + 1)}
                  className="rounded-lg border border-[#DCE3EB] px-3 py-2 text-xs font-bold text-[#082B50] disabled:opacity-50"
                >
                  {isAr ? 'التالي' : 'Next'}
                </button>
              </div>
            </>
          )}
          {['error', 'forbidden', 'unauthenticated'].includes(placementHistoryState) && (
            <div className="flex flex-col items-start gap-2 py-2">
              <p className="text-xs text-[#607086]" role="status">
                {placementHistoryState === 'forbidden'
                  ? isAr ? 'ليست لديك صلاحية عرض سجل التسكين.' : 'You are not authorized to view placement history.'
                  : placementHistoryState === 'unauthenticated'
                    ? isAr ? 'الجلسة غير متاحة لعرض السجل.' : 'A valid session is required to view placement history.'
                    : isAr ? 'تعذر تحميل سجل التسكين.' : 'Could not load recorded placement history.'}
              </p>
              {placementHistoryState === 'error' && (
                <button
                  type="button"
                  onClick={() => setPlacementHistoryRetryCount((count) => count + 1)}
                  className="rounded-lg border border-[#DCE3EB] px-3 py-2 text-xs font-bold text-[#082B50]"
                >
                  {isAr ? 'إعادة المحاولة' : 'Retry'}
                </button>
              )}
            </div>
          )}
        </section>

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
