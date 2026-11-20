import React, { useEffect, useState } from 'react';
import { AlertCircle, LoaderCircle, RefreshCw, Search } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import type {
  AcademicSection,
  AcademicSectionPage,
  AcademicSectionStudent,
  AcademicTeacherAssignment,
} from '../../contracts/academicOperations';
import { useTranslation } from '../../i18n/dictionaries';
import type { Locale } from '../../i18n/dictionaries';
import { ApiError } from '../../services/apiClient';
import { academicOperationsClient, type AcademicSectionInput } from '../../services/academicOperationsClient';

interface AdminAcademicOperationsPageProps {
  locale: Locale;
}

interface SectionFormState {
  courseOfferingId: string;
  code: string;
  capacity: string;
  schedule: string;
  enrollmentOpensAt: string;
  enrollmentClosesAt: string;
}

const EMPTY_FORM: SectionFormState = {
  courseOfferingId: '',
  code: '',
  capacity: '',
  schedule: '[]',
  enrollmentOpensAt: '',
  enrollmentClosesAt: '',
};

function localDateTime(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function apiDateTime(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}

export const AdminAcademicOperationsPage: React.FC<AdminAcademicOperationsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const [departmentId, setDepartmentId] = useState('');
  const [appliedDepartmentId, setAppliedDepartmentId] = useState('');
  const [search, setSearch] = useState('');
  const [sections, setSections] = useState<AcademicSection[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState<SectionFormState>(EMPTY_FORM);
  const [teacherId, setTeacherId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [teachers, setTeachers] = useState<AcademicTeacherAssignment[]>([]);
  const [students, setStudents] = useState<AcademicSectionStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [retry, setRetry] = useState(0);

  const text = (en: string, ar: string) => isAr ? ar : en;
  const errorMessage = (cause: unknown) => {
    if (cause instanceof ApiError && cause.status === 403) {
      return text('Access denied for this department or operation.', 'لا تملك صلاحية الوصول لهذا القسم أو الإجراء.');
    }
    if (cause instanceof ApiError && cause.status === 503) {
      return text('Academic operations are disabled in this environment.', 'العمليات الأكاديمية غير مفعّلة في هذه البيئة.');
    }
    if (cause instanceof ApiError && cause.status === 409) {
      return cause.message;
    }
    return text('The request failed. Check the service and retry.', 'تعذر تنفيذ الطلب. تحقق من الخدمة ثم أعد المحاولة.');
  };

  useEffect(() => {
    if (!appliedDepartmentId) {
      setSections([]);
      setError('');
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError('');
    academicOperationsClient
      .listSections(
        { departmentId: appliedDepartmentId, page: 1, pageSize: 100, search: search || undefined },
        controller.signal,
      )
      .then((result: AcademicSectionPage) => {
        if (!controller.signal.aborted) setSections(result.data);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setSections([]);
          setError(errorMessage(cause));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [appliedDepartmentId, search, retry]);

  useEffect(() => {
    if (!selectedId) {
      setTeachers([]);
      setStudents([]);
      return;
    }
    const controller = new AbortController();
    setActionError('');
    Promise.all([
      academicOperationsClient.listTeachers(selectedId, { page: 1, pageSize: 100 }, controller.signal),
      academicOperationsClient.listStudents(selectedId, { page: 1, pageSize: 100 }, controller.signal),
    ])
      .then(([assigned, enrolled]) => {
        if (controller.signal.aborted) return;
        setTeachers(assigned.data);
        setStudents(enrolled.data);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setActionError(errorMessage(cause));
      });
    return () => controller.abort();
  }, [selectedId, retry]);

  const selectSection = async (section: AcademicSection) => {
    setSelectedId(section.id);
    setActionError('');
    try {
      const current = await academicOperationsClient.getSection(section.id);
      setForm({
        courseOfferingId: current.courseOfferingId,
        code: current.code,
        capacity: String(current.capacity),
        schedule: JSON.stringify(current.schedule ?? [], null, 2),
        enrollmentOpensAt: localDateTime(current.enrollmentOpensAt),
        enrollmentClosesAt: localDateTime(current.enrollmentClosesAt),
      });
    } catch (cause) {
      setActionError(errorMessage(cause));
    }
  };

  const submitSection = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setActionError('');
    try {
      const schedule: AcademicSectionInput['schedule'] = JSON.parse(form.schedule);
      if (!Array.isArray(schedule)) throw new Error('schedule');
      const values = {
        code: form.code.trim(),
        capacity: Number(form.capacity),
        schedule,
        enrollmentOpensAt: apiDateTime(form.enrollmentOpensAt),
        enrollmentClosesAt: apiDateTime(form.enrollmentClosesAt),
      };
      if (selectedId) {
        await academicOperationsClient.updateSection(selectedId, values);
      } else {
        if (!form.courseOfferingId.trim()) throw new Error('offering');
        await academicOperationsClient.createSection({
          ...values,
          courseOfferingId: form.courseOfferingId.trim(),
        });
      }
      setSelectedId('');
      setForm(EMPTY_FORM);
      setRetry((value) => value + 1);
    } catch (cause) {
      setActionError(
        cause instanceof SyntaxError || (cause instanceof Error && cause.message === 'schedule')
          ? text('Schedule must be a JSON array of meeting times.', 'يجب أن يكون الجدول مصفوفة JSON لأوقات اللقاءات.')
          : errorMessage(cause),
      );
    } finally {
      setSaving(false);
    }
  };

  const runSectionAction = async (action: () => Promise<unknown>) => {
    setActionError('');
    try {
      await action();
      setRetry((value) => value + 1);
    } catch (cause) {
      setActionError(errorMessage(cause));
    }
  };

  const assignTeacher = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedId) return;
    await runSectionAction(async () => {
      await academicOperationsClient.assignTeacher(selectedId, teacherId.trim());
      setTeacherId('');
    });
  };

  const enrollStudent = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedId) return;
    await runSectionAction(async () => {
      await academicOperationsClient.adminEnrollStudent(selectedId, studentId.trim());
      setStudentId('');
    });
  };

  return (
    <PortalPage
      title={text('Academic Sections', 'الشُعب الأكاديمية')}
      subtitle={text('Manage sections, assigned teachers, enrollment and registration windows within your authorized department.', 'إدارة الشعب والمدرسين والتسجيل وفترات القبول ضمن نطاق القسم المصرح به.')}
      breadcrumbs={[
        { label: text('Admin Portal', 'بوابة الإدارة'), path: `/${locale}/admin/dashboard` },
        { label: text('Academic Operations', 'العمليات الأكاديمية') },
      ]}
      locale={locale}
    >
      <div className="space-y-5">
        <form
          className="flex flex-col gap-3 rounded-2xl border border-[#DCE3EB] bg-white p-4 shadow-xs md:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            setAppliedDepartmentId(departmentId.trim());
          }}
        >
          <label className="flex-1 text-xs font-semibold text-[#102033]">
            {text('Authorized department ID', 'معرّف القسم المصرح به')}
            <input
              value={departmentId}
              onChange={(event) => setDepartmentId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-[#DCE3EB] bg-[#F7F9FC] px-3 py-2 font-normal"
              placeholder="xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx"
              required
            />
          </label>
          <label className="flex-1 text-xs font-semibold text-[#102033]">
            {text('Filter sections', 'تصفية الشعب')}
            <span className="relative mt-1 block">
              <Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-[#607086]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-lg border border-[#DCE3EB] bg-[#F7F9FC] py-2 ps-9 pe-3 font-normal"
              />
            </span>
          </label>
          <button className="self-end rounded-lg bg-[#082B50] px-4 py-2 text-xs font-bold text-white" type="submit">
            {text('Load sections', 'عرض الشعب')}
          </button>
        </form>

        {error && (
          <div role="alert" className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <span className="flex items-center gap-2"><AlertCircle size={17} />{error}</span>
            <button type="button" onClick={() => setRetry((value) => value + 1)} aria-label={text('Retry', 'إعادة المحاولة')}>
              <RefreshCw size={17} />
            </button>
          </div>
        )}
        {actionError && <p role="alert" className="text-sm text-red-700">{actionError}</p>}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
          <section className="rounded-2xl border border-[#DCE3EB] bg-white p-4 shadow-xs">
            <h2 className="mb-3 text-sm font-bold text-[#102033]">{text('Sections', 'الشعب')}</h2>
            {loading ? (
              <div role="status" className="flex items-center gap-2 py-8 text-sm text-[#607086]"><LoaderCircle className="animate-spin" size={18} />{text('Loading…', 'جارٍ التحميل…')}</div>
            ) : error ? null : sections.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#607086]">{appliedDepartmentId ? text('No sections found.', 'لا توجد شعب.') : text('Enter your department ID to load its sections.', 'أدخل معرّف القسم لعرض شعبه.')}</p>
            ) : (
              <div className="space-y-2">
                {sections.map((section) => (
                  <div key={section.id} className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 ${section.id === selectedId ? 'border-[#082B50] bg-[#EFF3F8]' : 'border-[#DCE3EB]'}`}>
                    <button type="button" className="min-w-0 text-start" onClick={() => void selectSection(section)}>
                      <span className="block text-sm font-bold text-[#102033]">{section.code} · {isAr ? section.course.nameAr : section.course.nameEn}</span>
                      <span className="text-xs text-[#607086]">{section.term.code} · {section.activeEnrollmentCount ?? 0}/{section.capacity}</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{section.status}</span>
                      {section.status === 'open' ? (
                        <button type="button" className="text-xs font-semibold text-red-700" onClick={() => void runSectionAction(() => academicOperationsClient.closeSection(section.id))}>{text('Close', 'إغلاق')}</button>
                      ) : (
                        <button type="button" className="text-xs font-semibold text-green-700" onClick={() => void runSectionAction(() => academicOperationsClient.openSection(section.id))}>{text('Open', 'فتح')}</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <form onSubmit={submitSection} className="space-y-3 rounded-2xl border border-[#DCE3EB] bg-white p-4 shadow-xs">
              <h2 className="text-sm font-bold text-[#102033]">{selectedId ? text('Edit section', 'تعديل الشعبة') : text('Create section', 'إنشاء شعبة')}</h2>
              {!selectedId && (
                <Field label={text('Course offering ID', 'معرّف طرح المقرر')} value={form.courseOfferingId} onChange={(value) => setForm({ ...form, courseOfferingId: value })} required />
              )}
              <div className="grid grid-cols-2 gap-3">
                <Field label={text('Section code', 'رمز الشعبة')} value={form.code} onChange={(value) => setForm({ ...form, code: value })} required />
                <Field label={text('Capacity', 'السعة')} type="number" value={form.capacity} onChange={(value) => setForm({ ...form, capacity: value })} required />
              </div>
              <Field label={text('Enrollment opens', 'بداية التسجيل')} type="datetime-local" value={form.enrollmentOpensAt} onChange={(value) => setForm({ ...form, enrollmentOpensAt: value })} />
              <Field label={text('Enrollment closes', 'نهاية التسجيل')} type="datetime-local" value={form.enrollmentClosesAt} onChange={(value) => setForm({ ...form, enrollmentClosesAt: value })} />
              <label className="block text-xs font-semibold text-[#102033]">
                {text('Meeting schedule (JSON)', 'جدول اللقاءات (JSON)')}
                <textarea value={form.schedule} onChange={(event) => setForm({ ...form, schedule: event.target.value })} rows={3} className="mt-1 w-full rounded-lg border border-[#DCE3EB] bg-[#F7F9FC] px-3 py-2 font-mono text-xs font-normal" />
              </label>
              {selectedId && <button type="button" className="text-xs text-[#607086]" onClick={() => { setSelectedId(''); setForm(EMPTY_FORM); }}>{text('Create a different section', 'إنشاء شعبة أخرى')}</button>}
              <button disabled={saving} className="w-full rounded-lg bg-[#082B50] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-60" type="submit">
                {saving ? text('Saving…', 'جارٍ الحفظ…') : selectedId ? text('Save changes', 'حفظ التعديلات') : text('Create planned section', 'إنشاء شعبة مجدولة')}
              </button>
            </form>

            {selectedId && (
              <div className="space-y-4 rounded-2xl border border-[#DCE3EB] bg-white p-4 shadow-xs">
                <form onSubmit={assignTeacher} className="flex gap-2">
                  <input aria-label={text('Teacher user ID', 'معرّف المدرس')} value={teacherId} onChange={(event) => setTeacherId(event.target.value)} placeholder={text('Teacher user ID', 'معرّف المدرس')} className="min-w-0 flex-1 rounded-lg border border-[#DCE3EB] px-3 py-2 text-xs" required />
                  <button className="rounded-lg border border-[#DCE3EB] px-3 text-xs font-bold" type="submit">{text('Assign', 'تعيين')}</button>
                </form>
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-[#102033]">{text('Teacher assignment history', 'سجل تعيين المدرسين')}</h3>
                  {teachers.map((teacher) => (
                    <div key={teacher.id} className="flex items-center justify-between gap-2 text-xs">
                      <span>{isAr ? teacher.teacherNameAr : teacher.teacherNameEn} · {teacher.status}</span>
                      {teacher.status === 'active' && <button type="button" className="text-red-700" onClick={() => void runSectionAction(() => academicOperationsClient.unassignTeacher(selectedId, teacher.teacherUserId))}>{text('Remove', 'إزالة')}</button>}
                    </div>
                  ))}
                </div>
                <form onSubmit={enrollStudent} className="flex gap-2 border-t border-[#DCE3EB] pt-3">
                  <input aria-label={text('Student user ID', 'معرّف الطالب')} value={studentId} onChange={(event) => setStudentId(event.target.value)} placeholder={text('Student user ID', 'معرّف الطالب')} className="min-w-0 flex-1 rounded-lg border border-[#DCE3EB] px-3 py-2 text-xs" required />
                  <button className="rounded-lg border border-[#DCE3EB] px-3 text-xs font-bold" type="submit">{text('Enroll', 'تسجيل')}</button>
                </form>
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-[#102033]">{text('Currently enrolled students', 'الطلاب المسجلون')}</h3>
                  {students.length === 0 ? <p className="text-xs text-[#607086]">{text('No active enrollments.', 'لا يوجد تسجيل نشط.')}</p> : students.map((student) => (
                    <div key={student.enrollmentId} className="flex items-center justify-between gap-2 text-xs">
                      <span>{isAr ? student.nameAr : student.nameEn}</span>
                      <button type="button" className="text-red-700" onClick={() => void runSectionAction(() => academicOperationsClient.adminCancelEnrollment(student.enrollmentId))}>{text('Cancel', 'إلغاء')}</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </PortalPage>
  );
};

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}> = ({ label, value, onChange, type = 'text', required }) => (
  <label className="block text-xs font-semibold text-[#102033]">
    {label}
    <input required={required} min={type === 'number' ? 1 : undefined} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-[#DCE3EB] bg-[#F7F9FC] px-3 py-2 font-normal" />
  </label>
);
