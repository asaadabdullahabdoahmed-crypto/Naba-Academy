import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../../i18n/dictionaries';
import type {
  CollegeCatalogItem,
  DepartmentCatalogItem,
  ProgramCatalogItem,
} from '../../contracts/academicCatalog';
import { ApiError } from '../../services/apiClient';
import { academicCatalogClient } from '../../services/academicCatalogClient';
import { UniversitySelector } from './UniversitySelector';

export interface AcademicCatalogSelection {
  universityId: string | null;
  collegeId: string | null;
  departmentId: string | null;
  programId: string | null;
}

interface AcademicCatalogSelectorsProps {
  value: AcademicCatalogSelection;
  onChange: (selection: AcademicCatalogSelection) => void;
  enabled?: boolean;
}

type LoadState = 'idle' | 'loading' | 'ready' | 'error' | 'forbidden' | 'unavailable';

const catalogReadsEnabled = import.meta.env.VITE_ACADEMIC_CATALOG_READS_ENABLED === 'true';

export const AcademicCatalogSelectors: React.FC<AcademicCatalogSelectorsProps> = ({
  value,
  onChange,
  enabled = catalogReadsEnabled,
}) => {
  const { isAr } = useTranslation();
  const [colleges, setColleges] = useState<CollegeCatalogItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentCatalogItem[]>([]);
  const [programs, setPrograms] = useState<ProgramCatalogItem[]>([]);
  const [collegeState, setCollegeState] = useState<LoadState>('idle');
  const [departmentState, setDepartmentState] = useState<LoadState>('idle');
  const [programState, setProgramState] = useState<LoadState>('idle');
  const [collegeTotal, setCollegeTotal] = useState(0);
  const [departmentTotal, setDepartmentTotal] = useState(0);
  const [programTotal, setProgramTotal] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState<'college' | 'department' | 'program' | null>(null);
  const [moreError, setMoreError] = useState(false);
  const moreController = useRef<AbortController | null>(null);

  const failureState = (error: unknown): LoadState =>
    error instanceof ApiError && error.status === 403
      ? 'forbidden'
      : error instanceof ApiError && error.status === 503
        ? 'unavailable'
        : 'error';

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    let active = true;
    setColleges([]);
    setCollegeTotal(0);
    setCollegeState('loading');
    academicCatalogClient
      .listColleges(
        {
          page: 1,
          pageSize: 100,
          universityId: value.universityId ?? undefined,
        },
        controller.signal,
      )
      .then(({ data, meta }) => {
        if (!active) return;
        setColleges(data);
        setCollegeTotal(meta.totalItems);
        setCollegeState('ready');
      })
      .catch((error: unknown) => {
        if (active && !controller.signal.aborted) setCollegeState(failureState(error));
      });
    return () => {
      active = false;
      controller.abort();
      moreController.current?.abort();
    };
  }, [enabled, retryCount, value.universityId]);

  useEffect(() => {
    setDepartments([]);
    setPrograms([]);
    setDepartmentTotal(0);
    setProgramTotal(0);
    setDepartmentState(value.collegeId ? 'loading' : 'idle');
    setProgramState('idle');
    if (!enabled || !value.collegeId) return;

    let active = true;
    const controller = new AbortController();
    academicCatalogClient
      .listDepartments(value.collegeId, { page: 1, pageSize: 100 }, controller.signal)
      .then(({ data, meta }) => {
        if (!active) return;
        setDepartments(data);
        setDepartmentTotal(meta.totalItems);
        setDepartmentState('ready');
      })
      .catch((error: unknown) => {
        if (active && !controller.signal.aborted) setDepartmentState(failureState(error));
      });
    return () => {
      active = false;
      controller.abort();
      moreController.current?.abort();
    };
  }, [enabled, retryCount, value.collegeId]);

  useEffect(() => {
    setPrograms([]);
    setProgramState(value.departmentId ? 'loading' : 'idle');
    if (!enabled || !value.departmentId) return;

    let active = true;
    const controller = new AbortController();
    academicCatalogClient
      .listPrograms(value.departmentId, { page: 1, pageSize: 100 }, controller.signal)
      .then(({ data, meta }) => {
        if (!active) return;
        setPrograms(data);
        setProgramTotal(meta.totalItems);
        setProgramState('ready');
      })
      .catch((error: unknown) => {
        if (active && !controller.signal.aborted) setProgramState(failureState(error));
      });
    return () => {
      active = false;
      controller.abort();
      moreController.current?.abort();
    };
  }, [enabled, retryCount, value.departmentId]);

  const loadMore = async (catalog: 'college' | 'department' | 'program') => {
    setLoadingMore(catalog);
    setMoreError(false);
    const controller = new AbortController();
    moreController.current?.abort();
    moreController.current = controller;
    try {
      if (catalog === 'college') {
        const { data } = await academicCatalogClient.listColleges({
          page: Math.floor(colleges.length / 100) + 1,
          pageSize: 100,
          universityId: value.universityId ?? undefined,
        }, controller.signal);
        if (controller.signal.aborted) return;
        setColleges((current) => [...current, ...data]);
      } else if (catalog === 'department' && value.collegeId) {
        const { data } = await academicCatalogClient.listDepartments(value.collegeId, {
          page: Math.floor(departments.length / 100) + 1,
          pageSize: 100,
        }, controller.signal);
        if (controller.signal.aborted) return;
        setDepartments((current) => [...current, ...data]);
      } else if (catalog === 'program' && value.departmentId) {
        const { data } = await academicCatalogClient.listPrograms(value.departmentId, {
          page: Math.floor(programs.length / 100) + 1,
          pageSize: 100,
        }, controller.signal);
        if (controller.signal.aborted) return;
        setPrograms((current) => [...current, ...data]);
      }
    } catch {
      if (!controller.signal.aborted) setMoreError(true);
    } finally {
      if (moreController.current === controller) {
        moreController.current = null;
        setLoadingMore(null);
      }
    }
  };

  const unavailable = isAr
    ? 'اختيار الهيكل الأكاديمي غير متاح حتى اعتماد المخطط وتفعيله.'
    : 'Academic catalog selection is unavailable until the schema is approved and enabled.';
  const failed = isAr ? 'تعذر تحميل الخيارات.' : 'Options could not be loaded.';
  const forbidden = isAr
    ? 'لا تملك صلاحية عرض هذه الخيارات.'
    : 'You are not authorized to view these options.';
  const catalogUnavailable = isAr
    ? 'خدمة الهيكل الأكاديمي غير مفعلة حتى اعتماد المخطط.'
    : 'Academic catalog API is disabled until the schema is approved.';
  const empty = isAr ? 'لا توجد خيارات متاحة.' : 'No options are available.';
  const loading = isAr ? 'جارٍ التحميل...' : 'Loading...';
  const optionLabel = (
    nameAr: string,
    nameEn: string,
    code: string,
  ) => `${isAr ? nameAr : nameEn} (${code})`;
  const stateLabel = (state: LoadState, hasOptions: boolean, prompt: string) => {
    if (state === 'loading') return loading;
    if (state === 'error') return failed;
    if (state === 'forbidden') return forbidden;
    if (state === 'unavailable') return catalogUnavailable;
    if (state === 'ready' && !hasOptions) return empty;
    return prompt;
  };

  if (!enabled) {
    return (
      <p className="rounded-lg border border-dashed border-[#DCE3EB] p-3 text-sm text-[#607086]" role="status">
        {unavailable}
      </p>
    );
  }

  return (
    <fieldset
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      aria-busy={[collegeState, departmentState, programState].includes('loading')}
    >
      <legend className="sr-only">
        {isAr
          ? 'اختيار الجامعة والكلية والقسم والبرنامج'
          : 'Select university, college, department, and program'}
      </legend>
      <UniversitySelector
        value={value.universityId ?? ''}
        onChange={(universityId) =>
          onChange({
            ...value,
            universityId: universityId || null,
            collegeId: null,
            departmentId: null,
            programId: null,
          })
        }
        enabled={enabled}
      />
      <div className="space-y-2">
        <label className="space-y-1.5 text-sm font-medium text-[#102033]">
        <span>{isAr ? 'الكلية' : 'College'}</span>
        <select
          value={value.collegeId ?? ''}
          disabled={collegeState !== 'ready'}
          onChange={(event) =>
            onChange({
              ...value,
              collegeId: event.target.value || null,
              departmentId: null,
              programId: null,
            })
          }
          className="w-full rounded-lg border border-[#DCE3EB] bg-white px-3 py-2.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#082B50] disabled:bg-[#F7F9FC]"
        >
          <option value="">
            {stateLabel(collegeState, colleges.length > 0, isAr ? 'اختر كلية' : 'Select a college')}
          </option>
          {colleges.map((college) => (
            <option key={college.id} value={college.id}>
              {optionLabel(college.nameAr, college.nameEn, college.code)}
            </option>
          ))}
        </select>
        {['error', 'forbidden', 'unavailable'].includes(collegeState) && (
          <span role="status">{stateLabel(collegeState, false, '')}</span>
        )}
        {collegeState === 'ready' && colleges.length === 0 && <span role="status">{empty}</span>}
        </label>
        {colleges.length < collegeTotal && (
          <button
            type="button"
            disabled={loadingMore !== null}
            onClick={() => void loadMore('college')}
            className="rounded-lg border border-[#DCE3EB] px-3 py-2 text-xs font-bold text-[#082B50] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#082B50] disabled:opacity-60"
          >
            {loadingMore === 'college' ? loading : isAr ? 'تحميل المزيد' : 'Load more'}
          </button>
        )}
      </div>

      <div className="space-y-2">
        <label className="space-y-1.5 text-sm font-medium text-[#102033]">
        <span>{isAr ? 'القسم' : 'Department'}</span>
        <select
          value={value.departmentId ?? ''}
          disabled={departmentState !== 'ready'}
          onChange={(event) =>
            onChange({
              ...value,
              departmentId: event.target.value || null,
              programId: null,
            })
          }
          className="w-full rounded-lg border border-[#DCE3EB] bg-white px-3 py-2.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#082B50] disabled:bg-[#F7F9FC]"
        >
          <option value="">
            {value.collegeId
              ? stateLabel(departmentState, departments.length > 0, isAr ? 'اختر قسمًا' : 'Select a department')
              : isAr
                ? 'اختر كلية أولًا'
                : 'Select a college first'}
          </option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {optionLabel(department.nameAr, department.nameEn, department.code)}
            </option>
          ))}
        </select>
        {['error', 'forbidden', 'unavailable'].includes(departmentState) && (
          <span role="status">{stateLabel(departmentState, false, '')}</span>
        )}
        {departmentState === 'ready' && departments.length === 0 && <span role="status">{empty}</span>}
        </label>
        {departments.length < departmentTotal && (
          <button
            type="button"
            disabled={loadingMore !== null}
            onClick={() => void loadMore('department')}
            className="rounded-lg border border-[#DCE3EB] px-3 py-2 text-xs font-bold text-[#082B50] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#082B50] disabled:opacity-60"
          >
            {loadingMore === 'department' ? loading : isAr ? 'تحميل المزيد' : 'Load more'}
          </button>
        )}
      </div>

      <div className="space-y-2">
        <label className="space-y-1.5 text-sm font-medium text-[#102033]">
        <span>{isAr ? 'البرنامج الأكاديمي' : 'Academic program'}</span>
        <select
          value={value.programId ?? ''}
          disabled={programState !== 'ready'}
          onChange={(event) =>
            onChange({
              ...value,
              programId: event.target.value || null,
            })
          }
          className="w-full rounded-lg border border-[#DCE3EB] bg-white px-3 py-2.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#082B50] disabled:bg-[#F7F9FC]"
        >
          <option value="">
            {value.departmentId
              ? stateLabel(programState, programs.length > 0, isAr ? 'اختر برنامجًا' : 'Select a program')
              : isAr
                ? 'اختر قسمًا أولًا'
                : 'Select a department first'}
          </option>
          {programs.map((program) => (
            <option key={program.id} value={program.id}>
              {optionLabel(program.nameAr, program.nameEn, program.code)}
            </option>
          ))}
        </select>
        {['error', 'forbidden', 'unavailable'].includes(programState) && (
          <span role="status">{stateLabel(programState, false, '')}</span>
        )}
        {programState === 'ready' && programs.length === 0 && <span role="status">{empty}</span>}
        </label>
        {programs.length < programTotal && (
          <button
            type="button"
            disabled={loadingMore !== null}
            onClick={() => void loadMore('program')}
            className="rounded-lg border border-[#DCE3EB] px-3 py-2 text-xs font-bold text-[#082B50] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#082B50] disabled:opacity-60"
          >
            {loadingMore === 'program' ? loading : isAr ? 'تحميل المزيد' : 'Load more'}
          </button>
        )}
      </div>
      <p className="text-xs text-[#607086] sm:col-span-2 lg:col-span-4">
        {isAr
          ? 'اختيارات العرض فقط؛ لا يتم حفظ أي تغيير.'
          : 'Selection only; no changes are saved.'}
      </p>
      {[collegeState, departmentState, programState].includes('error') && (
        <button
          type="button"
          onClick={() => setRetryCount((count) => count + 1)}
          className="justify-self-start rounded-lg border border-[#DCE3EB] px-3 py-2 text-xs font-bold text-[#082B50] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#082B50] sm:col-span-2 lg:col-span-4"
        >
          {isAr ? 'إعادة المحاولة' : 'Retry loading'}
        </button>
      )}
      {moreError && (
        <p role="status" className="text-sm text-[#607086] sm:col-span-2 lg:col-span-4">
          {failed}
        </p>
      )}
    </fieldset>
  );
};
