import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { PortalPage } from '../scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import { teachingCatalogClient } from '../../services/teachingCatalogClient';
import { useAcademicReference } from '../../hooks/useAcademicReference';
import type { ReferenceName } from '../../contracts/teachingCatalog';
import { ReferenceMessage, ReferencePagination, ReferenceSearch, referenceStatus } from './AcademicReferenceBrowser';

export function AcademicCourseReference({ locale, portal, courseId }: {
  locale: Locale; portal: 'admin' | 'instructor'; courseId: string;
}) {
  const { isAr } = useTranslation();
  const label = (row: ReferenceName) => (isAr ? row.nameAr || row.nameEn : row.nameEn || row.nameAr) || row.code;
  const load = useCallback((signal: AbortSignal) => teachingCatalogClient.getCourse(courseId, signal), [courseId]);
  const { state, retry } = useAcademicReference(load);
  return <PortalPage title={isAr ? 'تفاصيل المقرر' : 'Course reference'} locale={locale}>
    <div className="space-y-5">
      <Link className="font-semibold underline" to={`/${locale}/${portal}/courses`}>{isAr ? 'العودة إلى دليل المقررات' : 'Back to course catalog'}</Link>
      <ReferenceMessage status={state.status} retry={retry} />
      {state.status === 'ready' && <>
        <section className="space-y-3 rounded-2xl border border-[#DCE3EB] bg-white p-5">
          <h2 className="text-lg font-bold">{label(state.data)}</h2>
          <p><bdi>{state.data.code}</bdi> · {referenceStatus(state.data.status, isAr)}</p>
          <p className="text-sm text-[#607086]">{[state.data.university, state.data.college, state.data.department].filter(Boolean).map((part) => label(part!)).join(' / ')}</p>
          <p className="text-sm text-[#607086]">{isAr
            ? 'هذه بيانات مرجعية ولا تمثل إسنادًا للتدريس أو شعبة مسجلة'
            : 'These reference records do not represent a teaching assignment or an enrolled section'}</p>
        </section>
        <CourseOfferings key={courseId} courseId={courseId} />
      </>}
    </div>
  </PortalPage>;
}

function CourseOfferings({ courseId }: { courseId: string }) {
  const { isAr } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const load = useCallback((signal: AbortSignal) => teachingCatalogClient.listCourseOfferings(courseId, { page, pageSize: 20, search }, signal), [courseId, page, search]);
  const { state, retry } = useAcademicReference(load);
  return <section className="space-y-4 rounded-2xl border border-[#DCE3EB] bg-white p-5">
    <h3 className="font-bold">{isAr ? 'الطروحات حسب الفصل الدراسي' : 'Course offerings by term'}</h3>
    <ReferenceSearch offerings onSearch={(value) => { setSearch(value); setPage(1); }} />
    <ReferenceMessage status={state.status} retry={retry} />
    {state.status === 'ready' && <div className="space-y-4" aria-live="polite">
      {!state.data.data.length && <p>{isAr ? 'لا توجد طروحات مطابقة' : 'No matching offerings'}</p>}
      {state.data.data.map((offering) => <article key={offering.id} className="space-y-1 border-b border-[#DCE3EB] pb-3 text-sm">
        <h4 className="font-semibold"><bdi>{offering.code}</bdi> · {referenceStatus(offering.status, isAr)}</h4>
        <p>{isAr ? offering.term.nameAr || offering.term.nameEn : offering.term.nameEn || offering.term.nameAr} · {offering.term.code}</p>
        <p>{referenceStatus(offering.term.status, isAr)} · <time dateTime={offering.term.startsOn}>{offering.term.startsOn}</time> — <time dateTime={offering.term.endsOn}>{offering.term.endsOn}</time></p>
      </article>)}
      <ReferencePagination meta={state.data.meta} setPage={setPage} />
    </div>}
  </section>;
}
