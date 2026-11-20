import React, { useEffect, useState } from 'react';
import type { UniversityCatalogItem } from '../../contracts/academicCatalog';
import { useTranslation } from '../../i18n/dictionaries';
import { academicCatalogClient } from '../../services/academicCatalogClient';

interface UniversitySelectorProps {
  value: string;
  onChange: (universityId: string) => void;
  enabled: boolean;
}

export const UniversitySelector: React.FC<UniversitySelectorProps> = ({
  value,
  onChange,
  enabled,
}) => {
  const { isAr } = useTranslation();
  const [universities, setUniversities] = useState<UniversityCatalogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    academicCatalogClient
      .listUniversities({ page, pageSize: 100 }, controller.signal)
      .then(({ data, meta }) => {
        if (controller.signal.aborted) return;
        setUniversities((current) => page === 1 ? data : [...current, ...data]);
        setTotal(meta.totalItems);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setError(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [enabled, page, retryCount]);

  if (!enabled) {
    return (
      <label className="space-y-1 text-xs font-semibold text-[#607086]">
        <span>{isAr ? 'الجامعة' : 'University'}</span>
        <select disabled className="w-full rounded-lg border border-[#DCE3EB] bg-[#F7F9FC] px-3 py-2.5 text-sm">
          <option>{isAr ? 'الدليل غير مفعّل' : 'Catalog disabled'}</option>
        </select>
      </label>
    );
  }

  return (
    <div className="space-y-1">
      <label className="space-y-1 text-xs font-semibold text-[#607086]">
        <span>{isAr ? 'الجامعة' : 'University'}</span>
        <select
          value={value}
          disabled={loading && universities.length === 0}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-lg border border-[#DCE3EB] bg-white px-3 py-2.5 text-sm text-[#102033] disabled:bg-[#F7F9FC]"
        >
          <option value="">{isAr ? 'كل الجامعات' : 'All universities'}</option>
          {universities.map((university) => (
            <option key={university.id} value={university.id}>
              {isAr ? university.nameAr : university.nameEn}
            </option>
          ))}
        </select>
      </label>
      {error && (
        <div className="flex items-center gap-2">
          <p role="status" className="text-xs text-red-700">
            {isAr ? 'تعذر تحميل الجامعات.' : 'Universities could not be loaded.'}
          </p>
          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
            className="text-xs font-semibold text-[#082B50] underline"
          >
            {isAr ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      )}
      {!error && universities.length === 0 && !loading && (
        <p role="status" className="text-xs text-[#607086]">
          {isAr ? 'لا توجد جامعات مسجلة.' : 'No universities are registered.'}
        </p>
      )}
      {universities.length < total && (
        <button
          type="button"
          disabled={loading}
          onClick={() => setPage((current) => current + 1)}
          className="rounded border border-[#DCE3EB] px-2.5 py-1.5 text-xs font-semibold text-[#082B50] disabled:opacity-50"
        >
          {loading
            ? isAr ? 'جار التحميل...' : 'Loading...'
            : isAr ? 'تحميل المزيد' : 'Load more'}
        </button>
      )}
    </div>
  );
};
