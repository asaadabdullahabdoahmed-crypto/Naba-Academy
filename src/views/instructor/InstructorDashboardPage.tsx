import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Video,
  FileCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Layers,
  Award,
  Bell,
  PlusCircle,
  HelpCircle,
  MessageSquare,
  BarChart2,
} from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface InstructorDashboardPageProps {
  locale: Locale;
}

export const InstructorDashboardPage: React.FC<InstructorDashboardPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <PortalPage
      title={isAr ? 'لوحة تحكم أستاذ المقرر' : 'Faculty Dashboard'}
      subtitle={
        isAr
          ? 'إدارة المقررات المكلفة، متابعة الطلاب، ورصد التقييمات الأكاديمية'
          : 'Manage assigned courses, track student engagement, and evaluate assessments'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة المحاضر' : 'Faculty Portal', path: `/${locale}/instructor/dashboard` },
        { label: isAr ? 'لوحة التحكم' : 'Dashboard' },
      ]}
      locale={locale}
      actions={
        <div className="flex items-center gap-2">
          <Link
            to={`/${locale}/instructor/live-session`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#082B50] hover:bg-[#061E38] text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            <Video size={14} className="text-[#D6A53A]" />
            <span>{isAr ? 'بدء جلسة مباشرة' : 'Start Live Session'}</span>
          </Link>
          <Link
            to={`/${locale}/instructor/grading`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] rounded-lg text-xs font-bold transition-colors"
          >
            <FileCheck size={14} />
            <span>{isAr ? 'رصد الدرجات' : 'Grade Center'}</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Structural Metrics Overview (honest empty/neutral indicators without fake claims) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#607086] font-medium">
                {isAr ? 'المقررات المكلفة' : 'Assigned Courses'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#EFF3F8] text-[#082B50] flex items-center justify-center">
                <BookOpen size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#102033] font-mono">—</div>
            <p className="text-[11px] text-[#607086] mt-1">
              {isAr ? 'الفصل الدراسي الحالي' : 'Current Academic Term'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#607086] font-medium">
                {isAr ? 'الطلاب المسجلون' : 'Enrolled Students'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#EFF3F8] text-[#082B50] flex items-center justify-center">
                <Users size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#102033] font-mono">—</div>
            <p className="text-[11px] text-[#607086] mt-1">
              {isAr ? 'في جميع الشُعب' : 'Across all sections'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#607086] font-medium">
                {isAr ? 'واجبات بانتظار التصحيح' : 'Pending Grading'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#EFF3F8] text-[#082B50] flex items-center justify-center">
                <FileCheck size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#102033] font-mono">—</div>
            <p className="text-[11px] text-[#607086] mt-1">
              {isAr ? 'تسليمات الواجبات والمشاريع' : 'Assignment submissions'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#607086] font-medium">
                {isAr ? 'الجلسات المباشرة القادمة' : 'Upcoming Live Sessions'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#EFF3F8] text-[#082B50] flex items-center justify-center">
                <Video size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#102033] font-mono">—</div>
            <p className="text-[11px] text-[#607086] mt-1">
              {isAr ? 'المحاضرات التفاعلية' : 'Scheduled interactive lectures'}
            </p>
          </div>
        </div>

        {/* Section 1: Assigned Courses Workspace */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#DCE3EB]">
            <div>
              <h3 className="text-base font-bold text-[#082B50]">
                {isAr ? 'المقررات الدراسية المكلفة' : 'Assigned Teaching Courses'}
              </h3>
              <p className="text-xs text-[#607086] mt-0.5">
                {isAr ? 'قائمة المقررات والشُعب الموكلة لعضو هيئة التدريس' : 'Active courses and assigned sections'}
              </p>
            </div>
            <Link
              to={`/${locale}/instructor/courses`}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#082B50] hover:text-[#174F89]"
            >
              <span>{isAr ? 'عرض الكل' : 'View All'}</span>
              <ArrowIcon size={13} />
            </Link>
          </div>

          {/* Honest Empty State */}
          <div className="py-12 px-4 text-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
              <BookOpen size={24} />
            </div>
            <h4 className="text-sm font-bold text-[#102033] mb-1">
              {isAr ? 'لا توجد مقررات دراسية مكلفة حالياً' : 'No assigned courses currently.'}
            </h4>
            <p className="text-xs text-[#607086] leading-relaxed mb-5">
              {isAr
                ? 'ستظهر المقررات الدراسية المكلفة والشعب هنا عند تكليف القسم الأكاديمي.'
                : 'Assigned courses and sections will appear here once allocated by academic administration.'}
            </p>
            <Link
              to={`/${locale}/instructor/courses`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#082B50] hover:bg-[#061E38] text-white text-xs font-bold transition-colors shadow-xs"
            >
              <Layers size={14} className="text-[#D6A53A]" />
              <span>{isAr ? 'إدارة المقررات والشعب' : 'Manage Courses & Sections'}</span>
            </Link>
          </div>
        </div>

        {/* Two-Column Grid: Pending Grading & Upcoming Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Grading Shell */}
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#DCE3EB]">
                <div>
                  <h3 className="text-base font-bold text-[#082B50]">
                    {isAr ? 'مهام التصحيح والتقييم' : 'Grading & Evaluation Tasks'}
                  </h3>
                  <p className="text-xs text-[#607086] mt-0.5">
                    {isAr ? 'التكليفات والواجبات التي تتطلب الرصد' : 'Submissions awaiting evaluation'}
                  </p>
                </div>
                <Link
                  to={`/${locale}/instructor/grading`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#082B50] hover:text-[#174F89]"
                >
                  <span>{isAr ? 'مركز الرصد' : 'Grade Center'}</span>
                  <ArrowIcon size={13} />
                </Link>
              </div>

              <div className="py-8 px-4 text-center max-w-sm mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
                  <FileCheck size={20} />
                </div>
                <h4 className="text-sm font-bold text-[#102033] mb-1">
                  {isAr ? 'لا توجد تسليمات بانتظار التصحيح' : 'No submissions pending grading.'}
                </h4>
                <p className="text-xs text-[#607086] leading-relaxed">
                  {isAr
                    ? 'ستظهر تسليمات الطلاب للواجبات والمشاريع هنا فور رفعها من الطلاب.'
                    : 'Student submissions will appear here once submitted for grading.'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#DCE3EB]">
              <Link
                to={`/${locale}/instructor/assignments`}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#EFF3F8] hover:bg-[#DCE3EB]/70 text-[#082B50] text-xs font-bold transition-colors"
              >
                <span>{isAr ? 'استعراض جميع الواجبات' : 'View All Assignments'}</span>
              </Link>
            </div>
          </div>

          {/* Upcoming Teaching Activity Shell */}
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#DCE3EB]">
                <div>
                  <h3 className="text-base font-bold text-[#082B50]">
                    {isAr ? 'الجدول التدريسي والبث المباشر' : 'Teaching Schedule & Live Sessions'}
                  </h3>
                  <p className="text-xs text-[#607086] mt-0.5">
                    {isAr ? 'المحاضرات المجدولة والساعات المكتبية' : 'Scheduled lectures and office hours'}
                  </p>
                </div>
                <Link
                  to={`/${locale}/instructor/live-session`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#082B50] hover:text-[#174F89]"
                >
                  <span>{isAr ? 'استوديو البث' : 'Broadcast Studio'}</span>
                  <ArrowIcon size={13} />
                </Link>
              </div>

              <div className="py-8 px-4 text-center max-w-sm mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
                  <Calendar size={20} />
                </div>
                <h4 className="text-sm font-bold text-[#102033] mb-1">
                  {isAr ? 'لا توجد جلسات مجدولة حالياً' : 'No sessions scheduled currently.'}
                </h4>
                <p className="text-xs text-[#607086] leading-relaxed">
                  {isAr
                    ? 'ستظهر جلسات البث التفاعلي والمواعيد المجدولة هنا عند إضافتها.'
                    : 'Interactive live sessions and scheduled classes will appear here.'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#DCE3EB]">
              <Link
                to={`/${locale}/instructor/office-hours`}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#EFF3F8] hover:bg-[#DCE3EB]/70 text-[#082B50] text-xs font-bold transition-colors"
              >
                <span>{isAr ? 'تنظيم الساعات المكتبية' : 'Manage Office Hours'}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Academic Announcements Shell */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#DCE3EB]">
            <div>
              <h3 className="text-base font-bold text-[#082B50]">
                {isAr ? 'الإعلانات والتعاميم الأكاديمية' : 'Academic Announcements'}
              </h3>
              <p className="text-xs text-[#607086] mt-0.5">
                {isAr ? 'الإعلانات المنشورة للطلاب والشعب الدراسية' : 'Announcements published to sections'}
              </p>
            </div>
            <Link
              to={`/${locale}/instructor/announcements`}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#082B50] hover:text-[#174F89]"
            >
              <span>{isAr ? 'إنشاء إعلان جديد' : 'New Announcement'}</span>
              <ArrowIcon size={13} />
            </Link>
          </div>

          <div className="py-8 px-4 text-center max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
              <Bell size={20} />
            </div>
            <h4 className="text-sm font-bold text-[#102033] mb-1">
              {isAr ? 'لا توجد إعلانات منشورة حالياً' : 'No announcements published currently.'}
            </h4>
            <p className="text-xs text-[#607086] leading-relaxed">
              {isAr
                ? 'يمكنك نشر إعلانات فورية لكافة الشُعب أو لمقرر محدد من خلال صفحة الإعلانات.'
                : 'You can publish announcements to all sections or specific courses from the announcements tab.'}
            </p>
          </div>
        </div>
      </div>
    </PortalPage>
  );
};
