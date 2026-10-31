import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CourseReference, ReferenceName, ReferencePage, TermReference } from '../../contracts/teachingCatalog';
import { useAcademicReference } from '../../hooks/useAcademicReference';
import { teachingCatalogClient } from '../../services/teachingCatalogClient';
import { PortalPage } from '../scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

type Portal = 'admin' | 'instructor';
const panel = 'rounded-2xl border border-[#DCE3EB] bg-white p-5 space-y-4';
const button = 'rounded-lg border border-[#DCE3EB] px-3 py-2 text-sm font-semibold text-[#082B50] disabled:opacity-40';

export function ReferenceMessage({ status, retry }: { status: string; retry: () => void }) {
  const { isAr } = useTranslation();
  const messages: Record<string, [string, string]> = {
    disabled: ['الدليل غير متاح حاليًا', 'The catalog is currently unavailable'],
    loading: ['جار تحميل السجلات', 'Loading records…'],
    error: ['تعذر تحميل السجلات', 'Could not load records'],
    forbidden: ['ليست لديك صلاحية لعرض هذا الدليل', 'You are not authorized to view this catalog'],
    unauthenticated: ['يلزم تسجيل الدخول لعرض الدليل', 'Sign in to view the catalog'],
    missing: ['السجل غير موجود أو لم يعد متاحًا', 'The record was not found or is no longer available'],
  };
  if (status === 'ready') return null;
  const text = messages[status] || messages.error;
  return <div className={panel} role={status === 'loading' ? 'status' : 'alert'}>
    <p>{text[isAr ? 0 : 1]}</p>
    {status === 'error' && <button className={button} onClick={retry}>{isAr ? 'إعادة المحاولة' : 'Retry'}</button>}
  </div>;
}

export function ReferencePagination({ meta, setPage }: {
  meta: ReferencePage<unknown>['meta']; setPage: (page: number) => void;
}) {
  const { isAr } = useTranslation();
  return <nav aria-label={isAr ? 'صفحات الدليل' : 'Catalog pagination'} className="flex flex-wrap items-center justify-between gap-3">
    <span className="text-sm text-[#607086]">{isAr
      ? `${meta.totalItems} سجل — الصفحة ${meta.page} من ${Math.max(1, meta.totalPages)}`
      : `${meta.totalItems} records — Page ${meta.page} of ${Math.max(1, meta.totalPages)}`}</span>
    <div className="flex gap-2">
      <button className={button} disabled={!meta.hasPrevious} onClick={() => setPage(meta.page - 1)}>{isAr ? 'السابق' : 'Previous'}</button>
      <button className={button} disabled={!meta.hasNext} onClick={() => setPage(meta.page + 1)}>{isAr ? 'التالي' : 'Next'}</button>
    </div>
  </nav>;
}

export function ReferenceSearch({ onSearch, offerings = false }: { onSearch: (search: string) => void; offerings?: boolean }) {
  const { isAr } = useTranslation();
  const [draft, setDraft] = useState('');
  const label = offerings ? isAr ? 'البحث بالرمز أو الفصل الدراسي' : 'Search by offering code or term'
    : isAr ? 'البحث بالرمز أو الاسم' : 'Search by code or name';
  return <form className="flex flex-wrap gap-3" onSubmit={(event) => { event.preventDefault(); onSearch(draft.trim()); }}>
    <label className="flex-1 space-y-1 text-sm">
      <span>{label}</span>
      <input type="search" value={draft} maxLength={100} onChange={(event) => setDraft(event.target.value)} className="block w-full rounded-lg border border-[#DCE3EB] px-3 py-2" />
    </label>
    <button className={`${button} self-end`} type="submit">{isAr ? 'بحث' : 'Search'}</button>
  </form>;
}

export function AcademicReferenceBrowser({ locale, portal, kind = 'courses' }: {
  locale: Locale; portal: Portal; kind?: 'courses' | 'terms';
}) {
  const { isAr } = useTranslation();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [department, setDepartment] = useState<ReferenceName | null>(null);
  const label = (row: ReferenceName) => (isAr ? row.nameAr || row.nameEn : row.nameEn || row.nameAr) || row.code;
  const load = useCallback((signal: AbortSignal): Promise<ReferencePage<CourseReference | TermReference>> => kind === 'courses'
    ? teachingCatalogClient.listCourses({ page, pageSize: 20, search, departmentId: department?.id }, signal)
    : teachingCatalogClient.listTerms({ page, pageSize: 20, search }, signal), [kind, page, search, department?.id]);
  const { state, retry } = useAcademicReference(load);
  const title = kind === 'courses' ? isAr ? 'دليل المقررات' : 'Course catalog' : isAr ? 'الفصول الدراسية' : 'Academic terms';

  return <PortalPage title={title} locale={locale} subtitle={isAr ? 'بيانات مرجعية للقراءة فقط' : 'Read-only academic reference data'} breadcrumbs={[
    { label: isAr ? 'لوحة التحكم' : 'Dashboard', path: `/${locale}/${portal}/dashboard` }, { label: title },
  ]}>
    <div className="space-y-5">
      <nav className="flex gap-4" aria-label={isAr ? 'الدليل الأكاديمي' : 'Academic reference'}>
        <Link className="font-semibold underline" to={`/${locale}/${portal}/courses`}>{isAr ? 'المقررات' : 'Courses'}</Link>
        <Link className="font-semibold underline" to={`/${locale}/${portal}/terms`}>{isAr ? 'الفصول الدراسية' : 'Terms'}</Link>
      </nav>
      <p className="rounded-xl bg-[#EFF3F8] p-4 text-sm leading-6 text-[#607086]">{isAr
        ? 'عرض المقرر أو طرحه لا يعني إسناده للتدريس ولا يمنح صلاحية الوصول إلى الطلاب أو الدرجات'
        : 'Catalog courses and offerings do not establish teaching assignments or grant access to students or grades'}</p>
      {state.status !== 'disabled' && <section className={panel}>
        <ReferenceSearch onSearch={(value) => { setPage(1); setSearch(value); }} />
        {kind === 'courses' && department && <div className="flex flex-wrap items-center gap-3 text-sm">
          <span>{isAr ? 'القسم' : 'Department'}: {label(department)}</span>
          <button className={button} onClick={() => { setDepartment(null); setPage(1); }}>{isAr ? 'إزالة التصفية' : 'Clear department filter'}</button>
        </div>}
      </section>}
      <ReferenceMessage status={state.status} retry={retry} />
      {state.status === 'ready' && <section className={panel} aria-live="polite">
        {!state.data.data.length && <p>{isAr ? 'لا توجد سجلات مطابقة' : 'No matching records'}</p>}
        {state.data.data.map((row) => <article key={row.id} className="border-b border-[#DCE3EB] pb-4 last:border-0">
          <h2 className="font-semibold text-[#082B50]">{'department' in row
            ? <Link className="underline" to={`/${locale}/${portal}/courses/${row.id}`}>{label(row)}</Link> : label(row)}</h2>
          <p className="mt-1 text-sm text-[#607086]"><bdi>{row.code}</bdi> · {referenceStatus(row.status, isAr)}</p>
          {'department' in row ? <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <span>{[row.university, row.college, row.department].filter(Boolean).map((part) => label(part!)).join(' / ')}</span>
            <button className={button} onClick={() => { setDepartment(row.department); setPage(1); }}>{isAr ? 'مقررات هذا القسم' : 'Browse this department'}</button>
          </div> : <p className="mt-2 text-sm"><time dateTime={row.startsOn}>{row.startsOn}</time> — <time dateTime={row.endsOn}>{row.endsOn}</time></p>}
        </article>)}
        <ReferencePagination meta={state.data.meta} setPage={setPage} />
      </section>}
    </div>
  </PortalPage>;
}

export function referenceStatus(status: string, isAr: boolean): string {
  const labels: Record<string, [string, string]> = {
    active: ['نشط', 'Active'], inactive: ['غير نشط', 'Inactive'], planned: ['مخطط', 'Planned'],
    open: ['مفتوح', 'Open'], closed: ['مغلق', 'Closed'], completed: ['مكتمل', 'Completed'], cancelled: ['ملغى', 'Cancelled'],
  };
  return labels[status]?.[isAr ? 0 : 1] || status;
}
