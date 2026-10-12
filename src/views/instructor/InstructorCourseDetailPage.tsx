import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  FileText,
  Video,
  Plus,
  Layers,
  ArrowRight,
  ArrowLeft,
  CalendarCheck,
} from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface InstructorCourseDetailPageProps {
  locale: Locale;
}

export const InstructorCourseDetailPage: React.FC<InstructorCourseDetailPageProps> = ({ locale }) => {
  const { courseId } = useParams<{ courseId: string }>();
  const { isAr } = useTranslation();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <PortalPage
      title={isAr ? `إدارة المقرر: ${courseId || 'المقرر الأكاديمي'}` : `Course Workspace: ${courseId || 'Academic Course'}`}
      subtitle={
        isAr
          ? 'إدارة محتوى المحاضرات، بنك التكليفات، ومتابعة حضور وتسليمات الطلاب'
          : 'Manage course lectures, assignment repository, and track student attendance and submissions'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة المحاضر' : 'Faculty Portal', path: `/${locale}/instructor/dashboard` },
        { label: isAr ? 'المقررات المكلفة' : 'Courses', path: `/${locale}/instructor/courses` },
        { label: courseId || (isAr ? 'تفاصيل المقرر' : 'Course Details') },
      ]}
      locale={locale}
      actions={
        <div className="flex items-center gap-2">
          <Link
            to={`/${locale}/instructor/courses/${courseId || 'default'}/students`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] rounded-lg text-xs font-bold transition-colors"
          >
            <Users size={14} />
            <span>{isAr ? 'قائمة الطلاب' : 'Student Roster'}</span>
          </Link>
          <Link
            to={`/${locale}/instructor/live-session`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#082B50] hover:bg-[#061E38] text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            <Video size={14} className="text-[#D6A53A]" />
            <span>{isAr ? 'بدء البث المباشر' : 'Start Live Session'}</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Navigation Tabs (clean unboxed segmented control matching NABA design) */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#DCE3EB] pb-3">
          <Link
            to={`/${locale}/instructor/courses/${courseId || 'default'}/lectures`}
            className="px-4 py-2 rounded-lg bg-[#082B50] text-white text-xs font-bold shadow-xs"
          >
            {isAr ? 'المحاضرات والدروس' : 'Lectures & Lessons'}
          </Link>
          <Link
            to={`/${locale}/instructor/courses/${courseId || 'default'}/assignments`}
            className="px-4 py-2 rounded-lg bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#607086] hover:text-[#082B50] text-xs font-bold transition-colors"
          >
            {isAr ? 'الواجبات والتكليفات' : 'Assignments'}
          </Link>
          <Link
            to={`/${locale}/instructor/courses/${courseId || 'default'}/students`}
            className="px-4 py-2 rounded-lg bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#607086] hover:text-[#082B50] text-xs font-bold transition-colors"
          >
            {isAr ? 'قائمة الطلاب والحضور' : 'Students & Attendance'}
          </Link>
        </div>

        {/* Course Overview Shell */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCE3EB]">
            <div>
              <h3 className="text-base font-bold text-[#082B50]">
                {isAr ? 'المحتوى التعليمي للمقرر' : 'Course Instructional Content'}
              </h3>
              <p className="text-xs text-[#607086] mt-0.5">
                {isAr ? 'الوحدات الدراسية، المحاضرات المسجلة، والمصادر التعليمية' : 'Course units, video recordings, and learning resources'}
              </p>
            </div>
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#082B50]/40 text-white/50 rounded-lg text-xs font-semibold cursor-not-allowed border border-[#DCE3EB]"
              title={isAr ? 'إضافة المحاضرات تتطلب اتصال خدمة الملفات' : 'Adding lectures requires storage connection'}
            >
              <Plus size={14} className="text-[#D6A53A]/60" />
              <span>{isAr ? 'إضافة محاضرة أو مورد' : 'Add Lecture / Resource'}</span>
            </button>
          </div>

          {/* Honest Empty State */}
          <div className="py-12 px-4 text-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
              <FileText size={24} />
            </div>
            <h4 className="text-sm font-bold text-[#102033] mb-1">
              {isAr ? 'لا توجد محاضرات منشورة لهذا المقرر حالياً' : 'No lectures published for this course yet.'}
            </h4>
            <p className="text-xs text-[#607086] leading-relaxed mb-5">
              {isAr
                ? 'ستظهر هنا المحاضرات المسجلة والتسجيلات السحابية عند إضافتها من قبل المحاضر.'
                : 'Recorded lectures and cloud sessions will appear here once added by faculty.'}
            </p>
          </div>
        </div>
      </div>
    </PortalPage>
  );
};
