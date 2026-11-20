import React, { useEffect, useState } from 'react';
import { AlertCircle, LoaderCircle, RefreshCw, Search } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import type {
  AcademicEnrollment,
  EligibleAcademicSection,
} from '../../contracts/academicOperations';
import { useTranslation } from '../../i18n/dictionaries';
import type { Locale } from '../../i18n/dictionaries';
import { ApiError } from '../../services/apiClient';
import { academicOperationsClient } from '../../services/academicOperationsClient';

interface StudentRegistrationPageProps {
  locale: Locale;
}

export const StudentRegistrationPage: React.FC<StudentRegistrationPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const [search, setSearch] = useState('');
  const [sections, setSections] = useState<EligibleAcademicSection[]>([]);
  const [enrollments, setEnrollments] = useState<AcademicEnrollment[]>([]);
  const [availableLoading, setAvailableLoading] = useState(true);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);
  const [availableError, setAvailableError] = useState('');
  const [enrollmentsError, setEnrollmentsError] = useState('');
  const [actionError, setActionError] = useState('');
  const [pendingId, setPendingId] = useState('');
  const [retry, setRetry] = useState(0);
  const text = (en: string, ar: string) => isAr ? ar : en;

  const errorMessage = (cause: unknown) => {
    if (cause instanceof ApiError && cause.status === 403) {
      return text('Access denied. Verify your active student role and academic placement.', 'تم رفض الوصول. تحقق من حالة دور الطالب والتسكين الأكاديمي.');
    }
    if (cause instanceof ApiError && cause.status === 503) {
      return text('Academic operations are disabled in this environment.', 'العمليات الأكاديمية غير مفعّلة في هذه البيئة.');
    }
    if (cause instanceof ApiError && cause.status === 409) return cause.message;
    return text('Could not load or update registration. Retry the request.', 'تعذر تحميل التسجيل أو تحديثه. أعد المحاولة.');
  };

  useEffect(() => {
    const availableController = new AbortController();
    const enrollmentController = new AbortController();
    setAvailableLoading(true);
    setEnrollmentsLoading(true);
    setAvailableError('');
    setEnrollmentsError('');

    academicOperationsClient
      .listAvailableSections({ page: 1, pageSize: 100, search: search || undefined }, availableController.signal)
      .then(({ data }) => {
        if (!availableController.signal.aborted) setSections(data);
      })
      .catch((cause: unknown) => {
        if (!availableController.signal.aborted) {
          setSections([]);
          setAvailableError(errorMessage(cause));
        }
      })
      .finally(() => {
        if (!availableController.signal.aborted) setAvailableLoading(false);
      });

    academicOperationsClient
      .listMyEnrollments({ page: 1, pageSize: 100 }, enrollmentController.signal)
      .then((result) => {
        if (!enrollmentController.signal.aborted) setEnrollments(result.data);
      })
      .catch((cause: unknown) => {
        if (!enrollmentController.signal.aborted) {
          setEnrollments([]);
          setEnrollmentsError(errorMessage(cause));
        }
      })
      .finally(() => {
        if (!enrollmentController.signal.aborted) setEnrollmentsLoading(false);
      });

    return () => {
      availableController.abort();
      enrollmentController.abort();
    };
  }, [search, retry]);

  const runAction = async (id: string, action: () => Promise<unknown>) => {
    setPendingId(id);
    setActionError('');
    try {
      await action();
      setRetry((value) => value + 1);
    } catch (cause) {
      setActionError(errorMessage(cause));
    } finally {
      setPendingId('');
    }
  };

  const availabilityText = (section: EligibleAcademicSection) => {
    if (section.eligibilityMessage === 'section_full') return text('Full', 'مكتملة');
    if (section.eligibilityMessage === 'already_enrolled_in_offering') return text('Already enrolled in this offering', 'مسجل في هذا الطرح');
    if (section.eligibilityMessage === 'enrollment_window_closed') return text('Registration window closed', 'فترة التسجيل مغلقة');
    return text(`${section.seatsAvailable ?? 0} seats available`, `المقاعد المتاحة: ${section.seatsAvailable ?? 0}`);
  };

  return (
    <PortalPage
      title={text('Course Registration & Add/Drop', 'التسجيل الفصلي للمقررات')}
      subtitle={text('Discover sections in your active academic placement, enroll, and review your enrollment history.', 'استعرض الشعب ضمن تسكينك الأكاديمي النشط، وسجل أو راجع سجل تسجيلك.')}
      breadcrumbs={[
        { label: text('Student Portal', 'بوابة الطالب'), path: `/${locale}/student/dashboard` },
        { label: text('Registration', 'التسجيل') },
      ]}
      locale={locale}
    >
      <div className="space-y-5">
        {actionError && <p role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><AlertCircle size={17} />{actionError}</p>}
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="space-y-3 rounded-2xl border border-[#DCE3EB] bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-[#102033]">{text('Available sections', 'الشعب المتاحة')}</h2>
              <button type="button" onClick={() => setRetry((value) => value + 1)} aria-label={text('Retry', 'إعادة المحاولة')} className="text-[#607086]"><RefreshCw size={17} /></button>
            </div>
            <label className="relative block">
              <Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-[#607086]" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={text('Search by section or course', 'ابحث برمز الشعبة أو المقرر')} className="w-full rounded-lg border border-[#DCE3EB] bg-[#F7F9FC] py-2 ps-9 pe-3 text-xs" />
            </label>
            {availableLoading ? (
              <div role="status" className="flex items-center gap-2 py-6 text-sm text-[#607086]"><LoaderCircle className="animate-spin" size={18} />{text('Loading sections…', 'جارٍ تحميل الشعب…')}</div>
            ) : availableError ? (
              <p role="alert" className="flex items-center gap-2 py-5 text-sm text-red-700"><AlertCircle size={17} />{availableError}</p>
            ) : sections.length === 0 ? (
              <p className="py-6 text-center text-sm text-[#607086]">{text('No open sections match your active placement.', 'لا توجد شعب مفتوحة تطابق تسكينك الأكاديمي النشط.')}</p>
            ) : (
              <div className="space-y-2">
                {sections.map((section) => (
                  <article key={section.id} className="rounded-xl border border-[#DCE3EB] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-[#102033]">{section.code} · {isAr ? section.course.nameAr : section.course.nameEn}</h3>
                        <p className="mt-1 text-xs text-[#607086]">{isAr ? section.term.nameAr : section.term.nameEn} · {section.activeEnrollmentCount ?? 0}/{section.capacity}</p>
                        <p className={`mt-1 text-xs ${section.canEnroll ? 'text-green-700' : 'text-amber-700'}`}>{availabilityText(section)}</p>
                      </div>
                      <button
                        type="button"
                        disabled={!section.canEnroll || pendingId === section.id}
                        onClick={() => void runAction(section.id, () => academicOperationsClient.enrollMyself(section.id))}
                        className="shrink-0 rounded-lg bg-[#082B50] px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        {pendingId === section.id ? text('Submitting…', 'جارٍ التسجيل…') : text('Enroll', 'تسجيل')}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3 rounded-2xl border border-[#DCE3EB] bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-[#102033]">{text('My enrollments', 'تسجيلاتي')}</h2>
              <button type="button" onClick={() => setRetry((value) => value + 1)} aria-label={text('Retry', 'إعادة المحاولة')} className="text-[#607086]"><RefreshCw size={17} /></button>
            </div>
            {enrollmentsLoading ? (
              <div role="status" className="flex items-center gap-2 py-6 text-sm text-[#607086]"><LoaderCircle className="animate-spin" size={18} />{text('Loading enrollments…', 'جارٍ تحميل التسجيلات…')}</div>
            ) : enrollmentsError ? (
              <p role="alert" className="flex items-center gap-2 py-5 text-sm text-red-700"><AlertCircle size={17} />{enrollmentsError}</p>
            ) : enrollments.length === 0 ? (
              <p className="py-6 text-center text-sm text-[#607086]">{text('You have no recorded enrollments.', 'لا توجد تسجيلات مسجلة.')}</p>
            ) : (
              <div className="space-y-2">
                {enrollments.map((enrollment) => (
                  <article key={enrollment.enrollmentId} className="flex items-center justify-between gap-3 rounded-xl border border-[#DCE3EB] p-3">
                    <div>
                      <h3 className="text-sm font-bold text-[#102033]">{enrollment.section.code} · {isAr ? enrollment.section.course.nameAr : enrollment.section.course.nameEn}</h3>
                      <p className="mt-1 text-xs text-[#607086]">{isAr ? enrollment.section.term.nameAr : enrollment.section.term.nameEn} · {enrollment.status === 'active' ? text('Active', 'نشط') : text('Cancelled', 'ملغي')}</p>
                      {enrollment.cancelledAt && <p className="text-xs text-[#607086]">{text('Cancelled', 'تاريخ الإلغاء')}: {new Date(enrollment.cancelledAt).toLocaleString(isAr ? 'ar' : 'en')}</p>}
                    </div>
                    {enrollment.status === 'active' && (
                      <button
                        type="button"
                        disabled={pendingId === enrollment.enrollmentId}
                        onClick={() => void runAction(enrollment.enrollmentId, () => academicOperationsClient.cancelMyEnrollment(enrollment.enrollmentId))}
                        className="shrink-0 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 disabled:opacity-50"
                      >
                        {pendingId === enrollment.enrollmentId ? text('Submitting…', 'جارٍ الإلغاء…') : text('Cancel', 'إلغاء')}
                      </button>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </PortalPage>
  );
};
