import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { BookOpen, CalendarRange, Library, Search, Plus, ShieldCheck, Filter, AlertCircle } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import type { Course } from '../../types';

interface AdminCoursesPageProps {
  locale: Locale;
}

export const AdminCoursesPage: React.FC<AdminCoursesPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const location = useLocation();

  const isTermsView = location.pathname.includes('/admin/terms');
  const isLibraryView = location.pathname.includes('/admin/library');

  const [searchTerm, setSearchTerm] = useState('');

  // Domain course records from backend (empty state when not connected)
  const courses: Course[] = [];

  const filtered = courses.filter(
    (c) =>
      c.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.titleAr?.includes(searchTerm) ||
      c.titleEn?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  let pageTitle = isAr ? 'دليل المقررات الشامل' : 'Course Directory & Catalog';
  let pageSubtitle = isAr
    ? 'قاعدة بيانات المقررات المركزية، الساعات المعتمدة، وتوصيف المقررات الأكاديمية'
    : 'Central course master catalog, credit hour governance, and prerequisite structures';
  let MainIcon = BookOpen;

  if (isTermsView) {
    pageTitle = isAr ? 'الفصول والتقويم الأكاديمي' : 'Academic Terms & Calendar';
    pageSubtitle = isAr
      ? 'ضبط فترات التسجيل، الفصول الدراسية، والتقويم الجامعي المعتمد'
      : 'Academic terms configuration, add/drop windows, and official institutional calendar';
    MainIcon = CalendarRange;
  } else if (isLibraryView) {
    pageTitle = isAr ? 'إدارة المكتبة الرقمية' : 'Digital Library Administration';
    pageSubtitle = isAr
      ? 'المراجع الأكاديمية المركزية، المستودع الرقمي، ومصادر التعلم الإلكترونية'
      : 'Institutional academic repositories, digital reference materials, and learning resources';
    MainIcon = Library;
  }

  return (
    <PortalPage
      title={pageTitle}
      subtitle={pageSubtitle}
      breadcrumbs={[
        { label: isAr ? 'بوابة الإدارة' : 'Admin Portal', path: `/${locale}/admin/dashboard` },
        { label: pageTitle },
      ]}
      locale={locale}
      actions={
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF3F8] text-[#607086] text-xs font-semibold border border-[#DCE3EB]">
            <AlertCircle size={14} className="text-[#607086]" />
            <span>{isAr ? 'في انتظار ربط الواجهة الخلفية' : 'Pending Backend Integration'}</span>
          </div>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#DCE3EB] text-[#607086] cursor-not-allowed rounded-lg text-xs font-bold transition-colors"
            title={isAr ? 'يتطلب ربط الواجهة الخلفية لتفعيل الإضافة' : 'Requires backend connection to create'}
          >
            <Plus size={14} />
            <span>
              {isTermsView
                ? (isAr ? 'إضافة فصل دراسي' : 'Add Term')
                : isLibraryView
                ? (isAr ? 'إضافة مرجع رقمي' : 'Add Resource')
                : (isAr ? 'إضافة مقرر جديد' : 'New Course')}
            </span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Search & Filter Header */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-[#607086]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                isTermsView
                  ? (isAr ? 'البحث في الفصول الدراسية والسنوات الأكاديمية...' : 'Search academic terms and years...')
                  : isLibraryView
                  ? (isAr ? 'البحث في المراجع الرقمية والكتب والمقالات...' : 'Search digital repositories and references...')
                  : (isAr ? 'البحث برمز المقرر أو اسم المادة...' : 'Search by course code or title...')
              }
              className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-xl ps-9 pe-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#174F89]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={14} className="text-[#607086]" />
            <select
              aria-label={isAr ? 'تصفية الحالة' : 'Filter status'}
              className="bg-[#EFF3F8] border border-[#DCE3EB] rounded-xl px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden"
              defaultValue="all"
            >
              <option value="all">{isAr ? 'الكل' : 'All'}</option>
              <option value="active">{isAr ? 'النشطة حالياً' : 'Active'}</option>
              <option value="archived">{isAr ? 'المؤرشفة' : 'Archived'}</option>
            </select>
          </div>
        </div>

        {/* Content / Empty State */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] shadow-xs overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-20 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
                <MainIcon size={26} />
              </div>
              <h4 className="text-sm font-bold text-[#102033] mb-1">
                {isTermsView
                  ? (isAr ? 'لا توجد فصول دراسية معلنة حالياً' : 'No Academic Terms Scheduled')
                  : isLibraryView
                  ? (isAr ? 'لا توجد مصادر رقمية مسجلة في المستودع' : 'No Digital Library Records Found')
                  : (isAr ? 'لا توجد مقررات دراسية مسجلة' : 'No Courses Registered in Catalog')}
              </h4>
              <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed">
                {isTermsView
                  ? (isAr
                      ? 'تُدرج مواعيد الفصول الدراسية وفترات التسجيل رسمياً وفق قرارات مجلس الجامعة وعمادة القبول.'
                      : 'Academic term calendars and registration windows synchronize according to University Council governance.')
                  : isLibraryView
                  ? (isAr
                      ? 'ترتبط المصادر الأكاديمية والمراجع العلمية مباشرة بقواعد البيانات ومستودعات المعرفة الرقمية.'
                      : 'Digital learning assets and library citations synchronize directly with institutional repositories.')
                  : (isAr
                      ? 'يتم استيراد دليل المقررات وتوصيفاتها المعتمدة فور اعتمادها من اللجان الأكاديمية المختصة.'
                      : 'Course catalog records and credit frameworks synchronize directly with academic committee approvals.')}
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF3F8] text-[#607086] text-[11px] font-semibold border border-[#DCE3EB]">
                <AlertCircle size={14} className="text-[#607086]" />
                <span>{isAr ? 'في انتظار ربط الواجهة الخلفية' : 'Pending Backend Integration'}</span>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-start text-xs">
                <thead className="bg-[#EFF3F8] border-b border-[#DCE3EB] text-[#607086] font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4 text-start">{isAr ? 'الرمز' : 'Code'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'اسم المقرر' : 'Title'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'القسم' : 'Department'}</th>
                    <th className="py-3 px-4 text-center">{isAr ? 'الساعات' : 'Credits'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE3EB]">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-[#EFF3F8]/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#082B50]">{c.code}</td>
                      <td className="py-3.5 px-4 font-semibold text-[#102033]">{isAr ? c.titleAr : c.titleEn}</td>
                      <td className="py-3.5 px-4 text-[#607086]">{isAr ? c.departmentAr : c.departmentEn}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-[#102033]">{c.credits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PortalPage>
  );
};
