import React, { useState } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from './toast';
import { useTranslation } from '../../i18n/useTranslation';

interface Column<T> {
  key: string;
  headerAr: string;
  headerEn: string;
  render?: (item: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableShellProps<T> {
  id?: string;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  columns: Column<T>[];
  data: T[];
  locale?: 'ar' | 'en';
  searchPlaceholderAr?: string;
  searchPlaceholderEn?: string;
  searchKey?: keyof T;
  actionsSlot?: React.ReactNode;
  filterSlot?: React.ReactNode;
  rowsPerPage?: number;
}

export function DataTableShell<T extends Record<string, unknown>>({
  id,
  titleAr,
  titleEn,
  descriptionAr,
  descriptionEn,
  columns,
  data,
  locale = 'ar',
  searchPlaceholderAr = 'ابحث في السجلات...',
  searchPlaceholderEn = 'Search records...',
  searchKey,
  actionsSlot,
  filterSlot,
  rowsPerPage = 8,
}: DataTableShellProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const { d, isAr: ctxIsAr } = useTranslation();

  const isAr = locale !== undefined ? locale === 'ar' : ctxIsAr;
  const v = d.views.shared.dataTableShell;
  const title = isAr ? titleAr : titleEn;
  const description = isAr ? descriptionAr : descriptionEn;
  const searchPlaceholder = (isAr ? searchPlaceholderAr : searchPlaceholderEn) || v.searchPlaceholder;

  // Filter records
  const filteredData = data.filter((item) => {
    if (!searchTerm.trim()) return true;
    if (searchKey) {
      const val = item[searchKey];
      return String(val ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    }
    return Object.values(item).some((v) =>
      String(v ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div id={id} className="bg-white rounded-xl border border-[#e4e7ec] shadow-xs overflow-hidden">
      {/* Header & Controls */}
      <div className="p-4 md:p-5 border-b border-[#e4e7ec] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm md:text-base font-bold text-[#17202a]">{title}</h3>
          {description && <p className="text-xs text-[#667085] mt-0.5">{description}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Bar */}
          <div className="relative min-w-[200px] md:min-w-[260px] flex-1 md:flex-none">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-[#667085]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full bg-[#f8fafc] border border-[#e4e7ec] rounded-lg ps-9 pe-3 py-1.5 text-xs text-[#17202a] placeholder-[#667085] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#17324d] transition-all"
            />
          </div>

          {filterSlot}

          {actionsSlot || (
            <button
              type="button"
              onClick={() => toast.info(v.exportingPreviewReportInExcelpdf)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f8fafc] hover:bg-[#eaf0f5] border border-[#e4e7ec] text-[#17324d] rounded-lg text-xs font-semibold transition-colors"
            >
              <Download size={14} />
              <span>{v.export}</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-start text-xs text-[#17202a]">
          <thead className="bg-[#f8fafc] border-b border-[#e4e7ec] text-[#667085] font-semibold text-[11px] uppercase tracking-wider">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-start ${col.width || ''}`}
                >
                  {isAr ? col.headerAr : col.headerEn}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e4e7ec]">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#f8fafc]/80 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      {col.render ? col.render(row, idx) : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-[#667085]">
                  {v.noMatchingRecordsFound}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="p-3.5 bg-[#f8fafc] border-t border-[#e4e7ec] flex items-center justify-between text-xs text-[#667085]">
        <div>
          {v.showingOfRecords
            .replace('${paginatedData.length}', String(paginatedData.length))
            .replace('${filteredData.length}', String(filteredData.length))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              aria-label={isAr ? 'الصفحة السابقة' : 'Previous page'}
              className="p-1 rounded-md border border-[#e4e7ec] bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#eaf0f5] text-[#17324d]"
            >
              {isAr ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>

            <span className="px-2 font-medium text-[#17202a]">
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              aria-label={isAr ? 'الصفحة التالية' : 'Next page'}
              className="p-1 rounded-md border border-[#e4e7ec] bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#eaf0f5] text-[#17324d]"
            >
              {isAr ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
