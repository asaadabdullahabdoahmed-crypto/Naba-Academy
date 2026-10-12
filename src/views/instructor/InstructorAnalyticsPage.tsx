import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Award, Filter, Calendar } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface InstructorAnalyticsPageProps {
  locale: Locale;
}

export const InstructorAnalyticsPage: React.FC<InstructorAnalyticsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const [selectedCourse, setSelectedCourse] = useState('ALL');

  return (
    <PortalPage
      title={isAr ? 'التحليلات ومؤشرات الأداء الأكاديمي' : 'Course Learning Analytics'}
      subtitle={
        isAr
          ? 'متابعة منحنيات التفاعل، توزيع الدرجات، ومؤشرات حضور وإتمام المحاضرات'
          : 'Track student engagement curves, grade distribution models, and lecture retention metrics'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة المحاضر' : 'Faculty Portal', path: `/${locale}/instructor/dashboard` },
        { label: isAr ? 'التحليلات الأكاديمية' : 'Analytics' },
      ]}
      locale={locale}
    >
      <div className="space-y-6">
        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#102033]">
              {isAr ? 'تصفية حسب المقرر:' : 'Filter by Course:'}
            </span>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg px-3 py-1.5 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
            >
              <option value="ALL">{isAr ? 'جميع المقررات المكلفة' : 'All Assigned Courses'}</option>
            </select>
          </div>
          <span className="text-xs text-[#607086]">
            {isAr ? 'تحديث دوري مع نهاية كل جلسة تقييم' : 'Synchronized periodically after evaluations'}
          </span>
        </div>

        {/* Structural Metrics Cards (honest neutral state without fake percentage claims) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#607086] font-medium">
                {isAr ? 'متوسط نسبة النجاح' : 'Average Pass Rate'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#EFF3F8] text-[#082B50] flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#102033] font-mono">—</div>
            <p className="text-[11px] text-[#607086] mt-1">
              {isAr ? 'بانتظار رصد نتائج التقييمات' : 'Awaiting graded assessments'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#607086] font-medium">
                {isAr ? 'متوسط الحضور التفاعلي' : 'Live Session Attendance'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#EFF3F8] text-[#082B50] flex items-center justify-center">
                <Users size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#102033] font-mono">—</div>
            <p className="text-[11px] text-[#607086] mt-1">
              {isAr ? 'يتم احتسابه من جلسات البث المعتمدة' : 'Calculated from live attendance records'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#607086] font-medium">
                {isAr ? 'معدل تسليم التكليفات في الموعد' : 'On-Time Submission Rate'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#EFF3F8] text-[#082B50] flex items-center justify-center">
                <Award size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#102033] font-mono">—</div>
            <p className="text-[11px] text-[#607086] mt-1">
              {isAr ? 'نسبة تسليم الواجبات قبل الموعد النهائي' : 'Submissions prior to deadlines'}
            </p>
          </div>
        </div>

        {/* Analytics Visual Shell / Empty State */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Grade Distribution Shell */}
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs flex flex-col justify-between">
            <div className="pb-4 border-b border-[#DCE3EB]">
              <h3 className="text-base font-bold text-[#082B50]">
                {isAr ? 'توزيع التقديرات الأكاديمية' : 'Grade Distribution'}
              </h3>
              <p className="text-xs text-[#607086] mt-0.5">
                {isAr ? 'منحنى التقديرات المعيارية للطلاب (A, B, C, D, F)' : 'Standard academic grade curve across sections'}
              </p>
            </div>

            <div className="py-12 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
                <BarChart3 size={24} />
              </div>
              <h4 className="text-sm font-bold text-[#102033] mb-1">
                {isAr ? 'لا تتوفر تحليلات درجات مرصودة حالياً' : 'No grade analytics available currently.'}
              </h4>
              <p className="text-xs text-[#607086] leading-relaxed max-w-sm mx-auto">
                {isAr
                  ? 'سيتم توليد الرسوم البيانية لتوزيع الدرجات فور اعتماد ورصد نتائج الاختبارات والتكليفات.'
                  : 'Grade distribution curves will be generated once final assessment scores are posted.'}
              </p>
            </div>
          </div>

          {/* Lecture Engagement Shell */}
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs flex flex-col justify-between">
            <div className="pb-4 border-b border-[#DCE3EB]">
              <h3 className="text-base font-bold text-[#082B50]">
                {isAr ? 'نسب إتمام ومشاهدة المحاضرات' : 'Lecture Completion & Retention'}
              </h3>
              <p className="text-xs text-[#607086] mt-0.5">
                {isAr ? 'معدلات متابعة الطلاب للمحاضرات المسجلة والبث التفاعلي' : 'Student watch duration and recorded lecture engagement'}
              </p>
            </div>

            <div className="py-12 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
                <TrendingUp size={24} />
              </div>
              <h4 className="text-sm font-bold text-[#102033] mb-1">
                {isAr ? 'لا تتوفر بيانات تفاعل كافية حالياً' : 'Insufficient engagement data currently.'}
              </h4>
              <p className="text-xs text-[#607086] leading-relaxed max-w-sm mx-auto">
                {isAr
                  ? 'ستظهر مؤشرات إتمام المحاضرات ومعدلات المشاهدة فور تفاعل الطلاب مع المحتوى المسجل.'
                  : 'Lecture retention rates will populate as enrolled students interact with published content.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PortalPage>
  );
};
