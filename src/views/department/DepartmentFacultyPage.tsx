import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, Plus, Mail, BookOpen, Award, Filter, ShieldCheck } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import type { FacultyMember } from '../../types';

interface DepartmentFacultyPageProps {
  locale: Locale;
}

export const DepartmentFacultyPage: React.FC<DepartmentFacultyPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  // Domain records from backend (empty state when not connected)
  const facultyMembers: FacultyMember[] = [];

  const filtered = facultyMembers.filter(
    (f) =>
      f.nameAr?.includes(searchTerm) ||
      f.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PortalPage
      title={isAr ? 'أعضاء هيئة التدريس بالقسم' : 'Department Faculty Directory'}
      subtitle={
        isAr
          ? 'إدارة الكادر الأكاديمي، الرتب العلمية، ومتابعة الأنصبة التدريسية المعتمدة'
          : 'Manage academic staff, professorial ranks, and official teaching workload allocations'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة رئيس القسم' : 'Department Portal', path: `/${locale}/department/dashboard` },
        { label: isAr ? 'أعضاء هيئة التدريس' : 'Faculty Members' },
      ]}
      locale={locale}
      actions={
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#DCE3EB] text-[#607086] cursor-not-allowed rounded-lg text-xs font-bold transition-colors"
          title={isAr ? 'إضافة عضو هيئة تدريس تتم عبر إدارة الموارد البشرية والعمادة' : 'Faculty appointments are managed through HR and University Deanship'}
        >
          <Plus size={14} />
          <span>{isAr ? 'إضافة عضو هيئة تدريس' : 'Add Faculty Member'}</span>
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
              placeholder={isAr ? 'البحث باسم عضو هيئة التدريس، التخصص، أو البريد الإلكتروني...' : 'Search by faculty name, specialization, or email...'}
              className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-xl ps-9 pe-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#174F89]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              aria-label={isAr ? 'تصفية حسب الرتبة العلمية' : 'Filter by academic rank'}
              className="bg-[#EFF3F8] border border-[#DCE3EB] rounded-xl px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden"
              defaultValue="all"
            >
              <option value="all">{isAr ? 'جميع الرتب العلمية' : 'All Academic Ranks'}</option>
              <option value="professor">{isAr ? 'أستاذ' : 'Professor'}</option>
              <option value="associate">{isAr ? 'أستاذ مشارك' : 'Associate Professor'}</option>
              <option value="assistant">{isAr ? 'أستاذ مساعد' : 'Assistant Professor'}</option>
              <option value="lecturer">{isAr ? 'محاضر' : 'Lecturer'}</option>
            </select>
          </div>
        </div>

        {/* Directory List / Empty State */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-10 md:p-14 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
              <Users size={24} />
            </div>
            <h3 className="text-sm font-bold text-[#102033] mb-1">
              {isAr ? 'لا تتوفر سجلات أعضاء هيئة تدريس حالياً' : 'No faculty records currently available'}
            </h3>
            <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed">
              {isAr
                ? 'يتم مزامنة بيانات أعضاء هيئة التدريس، الرتب الأكاديمية، والأنصبة التدريسية مباشرة مع عمادة شؤون أعضاء هيئة التدريس ونظام الموارد البشرية بالجامعة.'
                : 'Faculty records, academic ranks, and teaching workloads are synchronized directly with the University Faculty Affairs Deanship and HR systems.'}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFF3F8] text-[11px] text-[#607086] border border-[#DCE3EB]">
              <ShieldCheck size={13} className="text-[#D6A53A]" />
              <span>{isAr ? 'سجلات معتمدة رسمياً' : 'Officially authenticated records'}</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((f) => (
              <div
                key={f.id}
                className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs flex flex-col justify-between hover:border-[#174F89]/40 transition-all space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#082B50] text-[#D6A53A] flex items-center justify-center font-bold text-sm shrink-0">
                      {f.nameAr?.charAt(0) || 'د'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-[#102033] truncate">
                        {isAr ? f.nameAr : f.nameEn}
                      </h4>
                      <p className="text-xs text-[#607086] truncate">
                        {isAr ? f.rankAr : f.rankEn}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#DCE3EB] space-y-1.5 text-xs text-[#607086]">
                    <div className="flex justify-between items-center">
                      <span>{isAr ? 'العبء التدريسي:' : 'Teaching Load:'}</span>
                      <span className="font-bold text-[#102033]">{f.loadHours} {isAr ? 'ساعات' : 'hrs'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>{isAr ? 'المقررات المكلفة:' : 'Assigned Courses:'}</span>
                      <span className="font-bold text-[#102033]">{f.assignedCoursesCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>{isAr ? 'الطلاب المكلف بهم:' : 'Advisees:'}</span>
                      <span className="font-bold text-[#102033]">{f.adviseesCount}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#DCE3EB] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#607086] truncate">{f.email}</span>
                  <Link
                    to={`/${locale}/department/faculty/${f.id}`}
                    className="text-xs font-bold text-[#174F89] hover:text-[#082B50] transition-colors"
                  >
                    {isAr ? 'عرض الملف' : 'View Profile'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalPage>
  );
};
