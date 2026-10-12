import React, { useState } from 'react';
import { BookOpen, Plus, Search, Users, CheckCircle2, ShieldCheck, Filter } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import type { Course } from '../../types';

interface DepartmentCourseOfferingsPageProps {
  locale: Locale;
}

export const DepartmentCourseOfferingsPage: React.FC<DepartmentCourseOfferingsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  // Domain records from backend (empty state when not connected)
  const courses: Course[] = [];

  const filtered = courses.filter(
    (c) =>
      c.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.titleAr?.includes(searchTerm) ||
      c.titleEn?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PortalPage
      title={isAr ? 'مقررات وشُعب القسم المطروحة' : 'Course Offerings & Section Scheduling'}
      subtitle={
        isAr
          ? 'إدارة الشُعب الدراسية، متابعة الطاقات الاستيعابية، وتوزيع القاعات الدراسية'
          : 'Schedule course sections, track enrollment capacities, and manage classroom allocations'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة رئيس القسم' : 'Department Portal', path: `/${locale}/department/dashboard` },
        { label: isAr ? 'المقررات والشعب' : 'Offerings & Sections' },
      ]}
      locale={locale}
      actions={
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#DCE3EB] text-[#607086] cursor-not-allowed rounded-lg text-xs font-bold transition-colors"
          title={isAr ? 'فتح الشُعب الإضافية يتم عبر عمادة القبول والتسجيل' : 'Opening sections is coordinated through the Deanship of Admissions & Registration'}
        >
          <Plus size={14} />
          <span>{isAr ? 'فتح شعبة دراسية' : 'Open New Section'}</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Search & Filters */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-[#607086]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAr ? 'البحث برمز المقرر أو اسم المادة...' : 'Search by course code or title...'}
              className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-xl ps-9 pe-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#174F89]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              aria-label={isAr ? 'تصفية حسب المستوى الدراسي' : 'Filter by academic level'}
              className="bg-[#EFF3F8] border border-[#DCE3EB] rounded-xl px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden"
              defaultValue="all"
            >
              <option value="all">{isAr ? 'جميع المستويات' : 'All Levels'}</option>
              <option value="1">{isAr ? 'المستوى الأول / الثاني' : 'Level 1 / 2'}</option>
              <option value="2">{isAr ? 'المستوى الثالث / الرابع' : 'Level 3 / 4'}</option>
              <option value="3">{isAr ? 'المستوى الخامس / السادس' : 'Level 5 / 6'}</option>
              <option value="4">{isAr ? 'المستوى السابع / الثامن' : 'Level 7 / 8'}</option>
            </select>
          </div>
        </div>

        {/* Content Table / Empty State */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-10 md:p-14 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
              <BookOpen size={24} />
            </div>
            <h3 className="text-sm font-bold text-[#102033] mb-1">
              {isAr ? 'لا توجد شُعب دراسية مطروحة حالياً لهذا الفصل' : 'No course sections currently offered'}
            </h3>
            <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed">
              {isAr
                ? 'يتم اعتماد خطة طرح المقررات والشُعب الدراسية بالتنسيق مع عمادة القبول والتسجيل ولجنة الجداول الأكاديمية.'
                : 'Section offerings and classroom schedules are synchronized following timetable committee approvals.'}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFF3F8] text-[11px] text-[#607086] border border-[#DCE3EB]">
              <ShieldCheck size={13} className="text-[#D6A53A]" />
              <span>{isAr ? 'الجدول الدراسي المعتمد' : 'Official Academic Timetable'}</span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#DCE3EB] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-start text-xs">
                <thead className="bg-[#EFF3F8] border-b border-[#DCE3EB] text-[#607086] font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4 text-start">{isAr ? 'رمز المقرر' : 'Course Code'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'اسم المقرر' : 'Course Title'}</th>
                    <th className="py-3 px-4 text-center">{isAr ? 'الشعبة' : 'Section'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'أستاذ المقرر' : 'Instructor'}</th>
                    <th className="py-3 px-4 text-center">{isAr ? 'السعة المقررة' : 'Capacity'}</th>
                    <th className="py-3 px-4 text-center">{isAr ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE3EB]">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-[#EFF3F8]/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#082B50]">{c.code}</td>
                      <td className="py-3.5 px-4 font-semibold text-[#102033]">{isAr ? c.titleAr : c.titleEn}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-[#102033]">101</td>
                      <td className="py-3.5 px-4 text-[#607086]">{isAr ? c.instructorAr : c.instructorEn}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-[#082B50]">{c.enrolledCount}</span> / 50
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#16835d]/10 text-[#16835d]">
                          {isAr ? 'نشط' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PortalPage>
  );
};
