import React, { useEffect, useState } from 'react';
import { AlertCircle, LoaderCircle, RefreshCw } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import type { AcademicSection, AcademicSectionStudent } from '../../contracts/academicOperations';
import { useTranslation } from '../../i18n/dictionaries';
import type { Locale } from '../../i18n/dictionaries';
import { ApiError } from '../../services/apiClient';
import { academicOperationsClient } from '../../services/academicOperationsClient';

interface InstructorSectionsPageProps {
  locale: Locale;
}

export const InstructorSectionsPage: React.FC<InstructorSectionsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const [sections, setSections] = useState<AcademicSection[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [students, setStudents] = useState<AcademicSectionStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [error, setError] = useState('');
  const [rosterError, setRosterError] = useState('');
  const [retry, setRetry] = useState(0);
  const text = (en: string, ar: string) => isAr ? ar : en;

  const message = (cause: unknown) =>
    cause instanceof ApiError && cause.status === 403
      ? text('Access denied. Only currently assigned sections are visible.', 'تم رفض الوصول. تظهر الشعب المسندة إليك فقط.')
      : cause instanceof ApiError && cause.status === 503
        ? text('Academic operations are disabled in this environment.', 'العمليات الأكاديمية غير مفعّلة في هذه البيئة.')
        : text('Could not load academic data. Retry the request.', 'تعذر تحميل البيانات الأكاديمية. أعد المحاولة.');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    academicOperationsClient.listMySections({ page: 1, pageSize: 100 }, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setSections(result.data);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setSections([]);
          setError(message(cause));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [retry]);

  useEffect(() => {
    if (!selectedId) {
      setStudents([]);
      setRosterError('');
      return;
    }
    const controller = new AbortController();
    setRosterLoading(true);
    setRosterError('');
    academicOperationsClient.listStudents(selectedId, { page: 1, pageSize: 100 }, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setStudents(result.data);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setStudents([]);
          setRosterError(message(cause));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setRosterLoading(false);
      });
    return () => controller.abort();
  }, [selectedId, retry]);

  return (
    <PortalPage
      title={text('My assigned sections', 'الشعب المسندة إليّ')}
      subtitle={text('Only active assignments and the enrolled students for those sections are shown.', 'تظهر التعيينات النشطة والطلاب المسجلون في تلك الشعب فقط.')}
      breadcrumbs={[
        { label: text('Instructor Portal', 'بوابة المحاضر'), path: `/${locale}/instructor/dashboard` },
        { label: text('My sections', 'شعبي') },
      ]}
      locale={locale}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="rounded-2xl border border-[#DCE3EB] bg-white p-4 shadow-xs">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#102033]">{text('Assigned sections', 'الشعب المكلف بها')}</h2>
            <button type="button" onClick={() => setRetry((value) => value + 1)} aria-label={text('Retry', 'إعادة المحاولة')} className="text-[#607086]"><RefreshCw size={17} /></button>
          </div>
          {loading ? (
            <div role="status" className="flex items-center gap-2 py-8 text-sm text-[#607086]"><LoaderCircle className="animate-spin" size={18} />{text('Loading…', 'جارٍ التحميل…')}</div>
          ) : error ? (
            <p role="alert" className="flex items-center gap-2 py-6 text-sm text-red-700"><AlertCircle size={17} />{error}</p>
          ) : sections.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#607086]">{text('No active section assignments.', 'لا توجد تعيينات شعب نشطة.')}</p>
          ) : (
            <div className="space-y-2">
              {sections.map((section) => (
                <button key={section.id} type="button" onClick={() => setSelectedId(section.id)} className={`w-full rounded-xl border p-3 text-start ${section.id === selectedId ? 'border-[#082B50] bg-[#EFF3F8]' : 'border-[#DCE3EB]'}`}>
                  <span className="block text-sm font-bold text-[#102033]">{section.code} · {isAr ? section.course.nameAr : section.course.nameEn}</span>
                  <span className="text-xs text-[#607086]">{section.term.code} · {section.activeEnrollmentCount ?? 0}/{section.capacity} · {section.status}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[#DCE3EB] bg-white p-4 shadow-xs">
          <h2 className="mb-3 text-sm font-bold text-[#102033]">{text('Enrolled students', 'الطلاب المسجلون')}</h2>
          {!selectedId ? (
            <p className="py-8 text-center text-sm text-[#607086]">{text('Select one of your assigned sections.', 'اختر شعبة مسندة إليك.')}</p>
          ) : rosterLoading ? (
            <div role="status" className="flex items-center gap-2 py-8 text-sm text-[#607086]"><LoaderCircle className="animate-spin" size={18} />{text('Loading roster…', 'جارٍ تحميل القائمة…')}</div>
          ) : rosterError ? (
            <p role="alert" className="flex items-center gap-2 py-6 text-sm text-red-700"><AlertCircle size={17} />{rosterError}</p>
          ) : students.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#607086]">{text('No active enrollments in this section.', 'لا توجد تسجيلات نشطة في هذه الشعبة.')}</p>
          ) : (
            <ul className="divide-y divide-[#DCE3EB]">
              {students.map((student) => (
                <li key={student.enrollmentId} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span className="font-semibold text-[#102033]">{isAr ? student.nameAr : student.nameEn}</span>
                  <span className="text-xs text-[#607086]">{new Date(student.enrolledAt).toLocaleDateString(isAr ? 'ar' : 'en')}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </PortalPage>
  );
};
