import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck,
  Search,
  Save,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface InstructorGradingPageProps {
  locale: Locale;
}

export const InstructorGradingPage: React.FC<InstructorGradingPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [selectedAssessment, setSelectedAssessment] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Honest data-driven container: empty until real backend submissions exist
  const submissions: any[] = [];

  return (
    <PortalPage
      title={isAr ? 'مركز رصد الدرجات والتقييم' : 'Gradebook & Grading Center'}
      subtitle={
        isAr
          ? 'تصحيح الواجبات، تقييم الاختبارات، واعتماد الدرجات النهائية للشُعب الأكاديمية'
          : 'Evaluate assignments, grade examinations, and finalize scores for assigned sections'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة المحاضر' : 'Faculty Portal', path: `/${locale}/instructor/dashboard` },
        { label: isAr ? 'رصد الدرجات' : 'Grade Center' },
      ]}
      locale={locale}
      actions={
        <button
          type="button"
          disabled={submissions.length === 0}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors shadow-xs ${
            submissions.length === 0
              ? 'bg-[#082B50]/40 text-white/50 border border-[#DCE3EB] cursor-not-allowed'
              : 'bg-[#082B50] hover:bg-[#061E38] text-white'
          }`}
          title={submissions.length === 0 ? (isAr ? 'لا توجد درجات غير مرصودة لحفظها' : 'No unposted grades to save') : undefined}
        >
          <Save size={14} className="text-[#D6A53A]" />
          <span>{isAr ? 'حفظ واعتماد الدرجات' : 'Save & Post Grades'}</span>
        </button>
      }
    >
      <div className="space-y-4">
        {/* Course & Assessment Selectors */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#607086] mb-1">
              {isAr ? 'المقرر الأكاديمي' : 'Course'}
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
            >
              <option value="ALL">{isAr ? 'جميع المقررات المكلفة' : 'All Assigned Courses'}</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#607086] mb-1">
              {isAr ? 'نوع التقييم' : 'Assessment Item'}
            </label>
            <select
              value={selectedAssessment}
              onChange={(e) => setSelectedAssessment(e.target.value)}
              className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
            >
              <option value="ALL">{isAr ? 'جميع التكليفات والاختبارات' : 'All Assessments'}</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#607086] mb-1">
              {isAr ? 'بحث بالاسم أو الرقم الجامعي' : 'Search Student'}
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-[#607086]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isAr ? 'بحث...' : 'Search...'}
                className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg ps-9 pe-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
              />
            </div>
          </div>
        </div>

        {/* Submissions Table Shell or Empty State */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] shadow-xs overflow-hidden">
          {submissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-start text-xs">
                <thead className="bg-[#EFF3F8] border-b border-[#DCE3EB] text-[#607086] font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4 text-start">{isAr ? 'الرقم الجامعي' : 'Student ID'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'اسم الطالب' : 'Student Name'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'تاريخ التسليم' : 'Submitted At'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'الملف المرفق' : 'Attachment'}</th>
                    <th className="py-3 px-4 text-center">{isAr ? 'الدرجة المرصودة' : 'Grade'}</th>
                    <th className="py-3 px-4 text-end">{isAr ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE3EB]" />
              </table>
            </div>
          ) : (
            <div className="py-16 px-4 text-center max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
                <FileCheck size={24} />
              </div>
              <h4 className="text-sm font-bold text-[#102033] mb-1">
                {isAr ? 'لا توجد تسليمات بانتظار الرصد حالياً' : 'No submissions awaiting grading currently.'}
              </h4>
              <p className="text-xs text-[#607086] leading-relaxed mb-4">
                {isAr
                  ? 'ستظهر هنا تسليمات الطلاب للواجبات والاختبارات بمجرد رفعها من الطلاب في النظام.'
                  : 'Student submissions for coursework and exams will appear here once submitted.'}
              </p>
              <Link
                to={`/${locale}/instructor/dashboard`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] rounded-lg text-xs font-bold transition-colors"
              >
                <span>{isAr ? 'العودة للوحة التحكم' : 'Return to Dashboard'}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </PortalPage>
  );
};
