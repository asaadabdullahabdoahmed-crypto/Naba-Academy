import React, { useEffect, useState } from 'react';
import { AlertCircle, Building2, ChevronLeft, ChevronRight, LoaderCircle, Search } from 'lucide-react';
import { AcademicCatalogSelectors, type AcademicCatalogSelection } from '../../components/academic/AcademicCatalogSelectors';
import { PortalPage } from '../../components/scaffold/PortalPage';
import type {
  AcademicCatalogPage,
  CollegeCatalogDetail,
  CollegeCatalogItem,
  CredentialLevelCatalogItem,
  DepartmentCatalogDetail,
  DepartmentCatalogItem,
  ProgramCatalogDetail,
  ProgramCatalogItem,
  UniversityCatalogItem,
} from '../../contracts/academicCatalog';
import { useTranslation } from '../../i18n/dictionaries';
import type { Locale } from '../../i18n/dictionaries';
import { ApiError } from '../../services/apiClient';
import { academicCatalogClient } from '../../services/academicCatalogClient';

type CatalogKind = 'universities' | 'colleges' | 'departments' | 'programs' | 'credentials';
type CatalogRow =
  | UniversityCatalogItem
  | CollegeCatalogItem
  | DepartmentCatalogItem
  | ProgramCatalogItem
  | CredentialLevelCatalogItem;

interface AdminAcademicStructurePageProps {
  locale: Locale;
}

const catalogReadsEnabled = import.meta.env.VITE_ACADEMIC_CATALOG_READS_ENABLED === 'true';
const PAGE_SIZE = 20;

export const AdminAcademicStructurePage: React.FC<AdminAcademicStructurePageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const [kind, setKind] = useState<CatalogKind>('universities');
  const [universityId, setUniversityId] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [colleges, setColleges] = useState<CollegeCatalogItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentCatalogItem[]>([]);
  const [rows, setRows] = useState<CatalogRow[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [pagination, setPagination] = useState<AcademicCatalogPage<CatalogRow>['meta'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<'unavailable' | 'forbidden' | 'failed' | null>(null);
  const [filterError, setFilterError] = useState(false);
  const [filterRetryCount, setFilterRetryCount] = useState(0);
  const [catalogRetryCount, setCatalogRetryCount] = useState(0);
  const [selectedId, setSelectedId] = useState('');
  const [detail, setDetail] = useState<{ heading: string; path: string[] } | null>(null);
  const [detailError, setDetailError] = useState(false);
  const [detailRetryCount, setDetailRetryCount] = useState(0);
  const [selectorValue, setSelectorValue] = useState<AcademicCatalogSelection>({
    universityId: null,
    collegeId: null,
    departmentId: null,
    programId: null,
  });

  const labels: Record<CatalogKind, string> = {
    universities: isAr ? 'الجامعات' : 'Universities',
    colleges: isAr ? 'الكليات' : 'Colleges',
    departments: isAr ? 'الأقسام' : 'Departments',
    programs: isAr ? 'البرامج الأكاديمية' : 'Academic programs',
    credentials: isAr ? 'مستويات المؤهل' : 'Credential levels',
  };
  const labelFor = (row: CatalogRow) => isAr ? row.nameAr : row.nameEn;
  const pageTitle = isAr ? 'الهيكل الأكاديمي' : 'Academic Structure';
  const unavailableText = isAr
    ? 'قراءة الدليل الأكاديمي غير مفعّلة في هذه البيئة. لا يتم عرض بيانات تجريبية أو غير موثقة.'
    : 'Academic catalog reads are disabled in this environment. No sample or unverified records are shown.';

  useEffect(() => {
    if (!catalogReadsEnabled) return;
    const controller = new AbortController();
    setFilterError(false);
    academicCatalogClient
      .listColleges(
        { page: 1, pageSize: 100, universityId: universityId || undefined },
        controller.signal,
      )
      .then(({ data }) => setColleges(data))
      .catch(() => {
        if (!controller.signal.aborted) {
          setColleges([]);
          setFilterError(true);
        }
      });
    return () => controller.abort();
  }, [universityId, filterRetryCount]);

  useEffect(() => {
    if (!catalogReadsEnabled || !collegeId) {
      setDepartments([]);
      return;
    }
    const controller = new AbortController();
    setFilterError(false);
    academicCatalogClient
      .listDepartments(collegeId, { page: 1, pageSize: 100 }, controller.signal)
      .then(({ data }) => setDepartments(data))
      .catch(() => {
        if (!controller.signal.aborted) {
          setDepartments([]);
          setFilterError(true);
        }
      });
    return () => controller.abort();
  }, [collegeId, filterRetryCount]);

  useEffect(() => {
    if (!catalogReadsEnabled) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setRows([]);
    setPagination(null);
    const query = { page, pageSize: PAGE_SIZE, search: appliedSearch || undefined };

    const request = async (): Promise<AcademicCatalogPage<CatalogRow>> => {
      switch (kind) {
        case 'universities':
          return academicCatalogClient.listUniversities(query, controller.signal);
        case 'colleges':
          return academicCatalogClient.listColleges(
            { ...query, universityId: universityId || undefined },
            controller.signal,
          );
        case 'departments':
          if (!collegeId) return { data: [], meta: emptyMeta(page) };
          return academicCatalogClient.listDepartments(collegeId, query, controller.signal);
        case 'programs':
          if (!departmentId) return { data: [], meta: emptyMeta(page) };
          return academicCatalogClient.listPrograms(departmentId, query, controller.signal);
        case 'credentials':
          return academicCatalogClient.listCredentialLevels(query, controller.signal);
      }
    };

    void request()
      .then((result) => {
        if (controller.signal.aborted) return;
        setRows(result.data);
        setPagination(result.meta);
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          cause instanceof ApiError && cause.status === 503
            ? 'unavailable'
            : cause instanceof ApiError && cause.status === 403
              ? 'forbidden'
              : 'failed',
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [kind, page, appliedSearch, universityId, collegeId, departmentId, catalogRetryCount]);

  useEffect(() => {
    if (!selectedId || !catalogReadsEnabled) {
      setDetail(null);
      setDetailError(false);
      return;
    }
    const controller = new AbortController();
    setDetailError(false);
    const loadDetail = async () => {
      try {
        let heading = '';
        let path: string[] = [];
        if (kind === 'universities') {
          const university = await academicCatalogClient.getUniversity(selectedId, controller.signal);
          heading = isAr ? university.nameAr : university.nameEn;
          path = [university.code, university.status];
        } else if (kind === 'colleges') {
          const college: CollegeCatalogDetail = await academicCatalogClient.getCollege(selectedId, controller.signal);
          heading = isAr ? college.nameAr : college.nameEn;
          path = [college.university ? (isAr ? college.university.nameAr : college.university.nameEn) : (isAr ? 'جامعة غير مرتبطة' : 'No university linked'), college.code, college.status];
        } else if (kind === 'departments') {
          const department: DepartmentCatalogDetail = await academicCatalogClient.getDepartment(selectedId, controller.signal);
          heading = isAr ? department.nameAr : department.nameEn;
          path = [
            department.college.university
              ? (isAr ? department.college.university.nameAr : department.college.university.nameEn)
              : (isAr ? 'جامعة غير مرتبطة' : 'No university linked'),
            isAr ? department.college.nameAr : department.college.nameEn,
            department.code,
            department.status,
          ];
        } else if (kind === 'programs') {
          const program: ProgramCatalogDetail = await academicCatalogClient.getProgram(selectedId, controller.signal);
          heading = isAr ? program.nameAr : program.nameEn;
          path = [
            program.department.college.university
              ? (isAr ? program.department.college.university.nameAr : program.department.college.university.nameEn)
              : (isAr ? 'جامعة غير مرتبطة' : 'No university linked'),
            isAr ? program.department.college.nameAr : program.department.college.nameEn,
            isAr ? program.department.nameAr : program.department.nameEn,
            isAr ? program.credentialLevel.nameAr : program.credentialLevel.nameEn,
            program.code,
            program.status,
          ];
        } else {
          const credential = rows.find((row) => row.id === selectedId);
          if (credential) {
            heading = labelFor(credential);
            path = [credential.code, credential.status];
          }
        }
        if (!controller.signal.aborted) setDetail({ heading, path });
      } catch {
        if (!controller.signal.aborted) {
          setDetail(null);
          setDetailError(true);
        }
      }
    };
    void loadDetail();
    return () => controller.abort();
  }, [selectedId, kind, isAr, rows, detailRetryCount]);

  const chooseKind = (next: CatalogKind) => {
    setKind(next);
    setSelectedId('');
    setPage(1);
    setAppliedSearch('');
    setSearch('');
  };

  const selectorChanged = (selection: AcademicCatalogSelection) => {
    setSelectorValue(selection);
    if (selection.universityId !== (universityId || null)) {
      setUniversityId(selection.universityId ?? '');
      setCollegeId('');
      setDepartmentId('');
    }
    if (selection.collegeId !== collegeId) {
      setCollegeId(selection.collegeId ?? '');
      setDepartmentId('');
    }
    if (selection.departmentId !== departmentId) {
      setDepartmentId(selection.departmentId ?? '');
    }
  };

  return (
    <PortalPage
      title={pageTitle}
      subtitle={isAr
        ? 'استعراض بيانات الهيكل الأكاديمي الموثقة. عمليات الإنشاء والتعديل متوقفة حتى اعتماد السياسات.'
        : 'Browse verified academic hierarchy records. Create and edit actions remain disabled pending policy approval.'}
      breadcrumbs={[
        { label: isAr ? 'بوابة الإدارة' : 'Admin Portal', path: `/${locale}/admin/dashboard` },
        { label: pageTitle },
      ]}
      locale={locale}
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="status">
          <div className="flex items-start gap-2">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>
              {isAr
                ? 'وضع القراءة فقط. لا توجد واجهات كتابة معتمدة، ولن تُنشأ بيانات تلقائيًا. مستوى التخصص غير متاح في النموذج الحالي.'
                : 'Read-only mode. No approved write APIs are available and no records are created automatically. Specialization is not modeled yet.'}
            </p>
          </div>
        </div>

        <section className="rounded-2xl border border-[#DCE3EB] bg-white p-4 md:p-5 space-y-4">
          <h2 className="font-bold text-[#102033]">{isAr ? 'مستكشف التسلسل الأكاديمي' : 'Academic hierarchy navigator'}</h2>
          <AcademicCatalogSelectors
            value={selectorValue}
            onChange={selectorChanged}
            enabled={catalogReadsEnabled}
          />
        </section>
        {filterError && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
            <p>{isAr ? 'تعذر تحميل خيارات التصفية الأكاديمية.' : 'Academic filter options could not be loaded.'}</p>
            <button type="button" onClick={() => setFilterRetryCount((count) => count + 1)} className="font-bold underline">
              {isAr ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div>
        )}

        {!catalogReadsEnabled ? (
          <div className="rounded-2xl border border-dashed border-[#DCE3EB] bg-white p-10 text-center text-sm text-[#607086]" role="status">
            {unavailableText}
          </div>
        ) : (
          <>
            <section className="rounded-2xl border border-[#DCE3EB] bg-white p-4 md:p-5 space-y-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5" role="tablist" aria-label={isAr ? 'نوع الدليل' : 'Catalog type'}>
                {(['universities', 'colleges', 'departments', 'programs', 'credentials'] as CatalogKind[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    role="tab"
                    aria-selected={kind === item}
                    onClick={() => chooseKind(item)}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-semibold ${kind === item ? 'border-[#082B50] bg-[#EFF3F8] text-[#082B50]' : 'border-[#DCE3EB] text-[#607086] hover:bg-[#F7F9FC]'}`}
                  >
                    {labels[item]}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="space-y-1 text-xs font-semibold text-[#607086]">
                  <span>{isAr ? 'تصفية حسب الكلية' : 'Filter by college'}</span>
                  <select
                    value={collegeId}
                    onChange={(event) => {
                      const nextCollegeId = event.target.value;
                      setCollegeId(nextCollegeId);
                      setDepartmentId('');
                      setSelectorValue((current) => ({
                        ...current,
                        collegeId: nextCollegeId || null,
                        departmentId: null,
                        programId: null,
                      }));
                      setPage(1);
                      setSelectedId('');
                    }}
                    disabled={kind === 'departments' && colleges.length === 0}
                    className="w-full rounded-lg border border-[#DCE3EB] bg-white px-3 py-2.5 text-sm text-[#102033] disabled:bg-[#F7F9FC]"
                  >
                    <option value="">{isAr ? 'اختر كلية' : 'Select a college'}</option>
                    {colleges.map((college) => <option key={college.id} value={college.id}>{labelFor(college)}</option>)}
                  </select>
                </label>
                <label className="space-y-1 text-xs font-semibold text-[#607086]">
                  <span>{isAr ? 'تصفية حسب القسم' : 'Filter by department'}</span>
                  <select
                    value={departmentId}
                    onChange={(event) => {
                      const nextDepartmentId = event.target.value;
                      setDepartmentId(nextDepartmentId);
                      setSelectorValue((current) => ({
                        ...current,
                        departmentId: nextDepartmentId || null,
                        programId: null,
                      }));
                      setPage(1);
                      setSelectedId('');
                    }}
                    disabled={!collegeId}
                    className="w-full rounded-lg border border-[#DCE3EB] bg-white px-3 py-2.5 text-sm text-[#102033] disabled:bg-[#F7F9FC]"
                  >
                    <option value="">{isAr ? 'اختر قسمًا' : 'Select a department'}</option>
                    {departments.map((department) => <option key={department.id} value={department.id}>{labelFor(department)}</option>)}
                  </select>
                </label>
              </div>

              <form
                className="flex flex-col gap-2 sm:flex-row"
                onSubmit={(event) => {
                  event.preventDefault();
                  setPage(1);
                  setAppliedSearch(search.trim());
                  setSelectedId('');
                }}
              >
                <label className="relative min-w-0 flex-1">
                  <span className="sr-only">{isAr ? 'بحث في الدليل' : 'Search catalog'}</span>
                  <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-[#607086]" aria-hidden="true" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    maxLength={100}
                    placeholder={isAr ? 'ابحث بالرمز أو الاسم...' : 'Search by code or name...'}
                    className="w-full rounded-lg border border-[#DCE3EB] py-2.5 ps-9 pe-3 text-sm"
                  />
                </label>
                <button type="submit" className="rounded-lg bg-[#082B50] px-4 py-2.5 text-sm font-bold text-white">
                  {isAr ? 'بحث' : 'Search'}
                </button>
                <button type="button" disabled className="cursor-not-allowed rounded-lg bg-[#DCE3EB] px-4 py-2.5 text-sm font-bold text-[#607086]" title={isAr ? 'الكتابة غير معتمدة' : 'Writes are not approved'}>
                  {isAr ? 'إضافة (متوقفة)' : 'Add (disabled)'}
                </button>
              </form>
            </section>

            {error && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
                <p>
                  {error === 'unavailable'
                    ? unavailableText
                    : error === 'forbidden'
                      ? isAr ? 'ليست لديك صلاحية عرض هذا الدليل.' : 'You are not authorized to view this catalog.'
                      : isAr ? 'تعذر تحميل الدليل.' : 'Could not load the catalog.'}
                </p>
                {error === 'failed' && (
                  <button type="button" onClick={() => setCatalogRetryCount((count) => count + 1)} className="font-bold underline">
                    {isAr ? 'إعادة المحاولة' : 'Retry'}
                  </button>
                )}
              </div>
            )}

            <section className="overflow-hidden rounded-2xl border border-[#DCE3EB] bg-white">
              <div className="flex items-center justify-between border-b border-[#DCE3EB] px-4 py-3">
                <h2 className="font-bold text-[#102033]">{labels[kind]}</h2>
                {loading && <LoaderCircle size={18} className="animate-spin text-[#607086]" aria-label={isAr ? 'جار التحميل' : 'Loading'} />}
              </div>
              {(kind === 'departments' && !collegeId) || (kind === 'programs' && !departmentId) ? (
                <p className="p-8 text-center text-sm text-[#607086]">{isAr ? 'اختر المستوى الأب لعرض السجلات.' : 'Select the parent level to view records.'}</p>
              ) : loading ? (
                <div className="p-12 text-center text-sm text-[#607086]">{isAr ? 'جار تحميل السجلات...' : 'Loading records...'}</div>
              ) : rows.length === 0 ? (
                <div className="p-12 text-center">
                  <Building2 size={26} className="mx-auto mb-2 text-[#607086]" aria-hidden="true" />
                  <p className="text-sm font-semibold text-[#102033]">{isAr ? 'لا توجد سجلات مطابقة' : 'No matching records'}</p>
                  <p className="mt-1 text-xs text-[#607086]">{isAr ? 'لا تُعرض أي سجلات افتراضية أو غير موثقة.' : 'No placeholder or unverified records are displayed.'}</p>
                </div>
              ) : (
                <div className="divide-y divide-[#DCE3EB]">
                  {rows.map((row) => (
                    <button
                      type="button"
                      key={row.id}
                      onClick={() => setSelectedId(row.id)}
                      className={`flex w-full flex-col gap-2 px-4 py-3 text-start hover:bg-[#F7F9FC] sm:flex-row sm:items-center sm:justify-between ${selectedId === row.id ? 'bg-[#EFF3F8]' : ''}`}
                    >
                      <span>
                        <span className="block font-semibold text-[#102033]">{labelFor(row)}</span>
                        <span className="mt-1 block font-mono text-xs text-[#607086]">{row.code}</span>
                      </span>
                      <span className="text-xs text-[#607086]">{row.status}</span>
                    </button>
                  ))}
                </div>
              )}
              {pagination && (
                <div className="flex items-center justify-between border-t border-[#DCE3EB] px-4 py-3 text-xs text-[#607086]">
                  <span>
                    {isAr
                      ? `الصفحة ${pagination.page} من ${pagination.totalPages} • ${pagination.totalItems} سجل`
                      : `Page ${pagination.page} of ${pagination.totalPages} • ${pagination.totalItems} records`}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={!pagination.hasPrevious || loading}
                      onClick={() => setPage((value) => Math.max(1, value - 1))}
                      className="rounded border border-[#DCE3EB] p-2 disabled:opacity-40"
                      aria-label={isAr ? 'الصفحة السابقة' : 'Previous page'}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      disabled={!pagination.hasNext || loading}
                      onClick={() => setPage((value) => value + 1)}
                      className="rounded border border-[#DCE3EB] p-2 disabled:opacity-40"
                      aria-label={isAr ? 'الصفحة التالية' : 'Next page'}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </section>

            {detail && (
              <section className="rounded-2xl border border-[#DCE3EB] bg-white p-4 md:p-5" aria-live="polite">
                <h3 className="font-bold text-[#102033]">{detail.heading}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {detail.path.map((part, index) => (
                    <span key={`${part}-${index}`} className="rounded-full bg-[#EFF3F8] px-3 py-1 text-xs text-[#082B50]">{part}</span>
                  ))}
                </div>
              </section>
            )}
            {detailError && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
                <p>{isAr ? 'تعذر تحميل تفاصيل السجل.' : 'Could not load record details.'}</p>
                <button type="button" onClick={() => setDetailRetryCount((count) => count + 1)} className="font-bold underline">
                  {isAr ? 'إعادة المحاولة' : 'Retry'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </PortalPage>
  );
};

function emptyMeta(page: number): AcademicCatalogPage<CatalogRow>['meta'] {
  return {
    page,
    pageSize: PAGE_SIZE,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  };
}
