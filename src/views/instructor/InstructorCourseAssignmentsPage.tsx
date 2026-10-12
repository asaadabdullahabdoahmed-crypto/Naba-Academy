import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, Plus, ArrowRight, ArrowLeft } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface InstructorCourseAssignmentsPageProps {
  locale: Locale;
}

export const InstructorCourseAssignmentsPage: React.FC<InstructorCourseAssignmentsPageProps> = ({ locale }) => {
  const { courseId } = useParams<{ courseId: string }>();
  const { isAr } = useTranslation();

  // Honest data-driven container: empty until real backend data is connected
  const assignments: any[] = [];

  return (
    <PortalPage
      title={isAr ? `تكليفات المقرر: ${courseId || 'المقرر'}` : `Course Assignments: ${courseId || 'Course'}`}
      subtitle={
        isAr
          ? 'إدارة الواجبات والأنشطة الأكاديمية ورصد تسليمات الطلاب'
          : 'Manage course assignments, due dates, and student submissions'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة المحاضر' : 'Faculty Portal', path: `/${locale}/instructor/dashboard` },
        { label: isAr ? 'المقررات المكلفة' : 'Courses', path: `/${locale}/instructor/courses` },
        { label: courseId || (isAr ? 'المقرر' : 'Course'), path: `/${locale}/instructor/courses/${courseId || 'default'}` },
        { label: isAr ? 'التكليفات' : 'Assignments' },
      ]}
      locale={locale}
      actions={
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#082B50]/40 text-white/50 rounded-lg text-xs font-semibold cursor-not-allowed border border-[#DCE3EB]"
          title={isAr ? 'إنشاء التكليفات متاح عند اتصال نظام التقييم' : 'Assignment creation available upon assessment connection'}
        >
          <Plus size={14} className="text-[#D6A53A]/60" />
          <span>{isAr ? 'إضافة واجب جديد' : 'New Assignment'}</span>
        </button>
      }
    >
      <div className="space-y-4">
        {assignments.length > 0 ? (
          <div className="space-y-3">
            {/* Populated when real assignments exist */}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
              <FileText size={28} />
            </div>
            <h3 className="text-base font-bold text-[#102033] mb-1">
              {isAr ? 'لا توجد تكليفات مضافة لهذا المقرر' : 'No assignments found for this course.'}
            </h3>
            <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed mb-6">
              {isAr
                ? 'ستظهر هنا الواجبات والتكليفات المعتمدة المرتبطة بهذا المقرر فور إنشائها.'
                : 'Assignments and coursework published for this course will appear here.'}
            </p>
            <Link
              to={`/${locale}/instructor/courses`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] rounded-lg text-xs font-bold transition-colors"
            >
              <span>{isAr ? 'العودة لقائمة المقررات' : 'Back to Courses'}</span>
            </Link>
          </div>
        )}
      </div>
    </PortalPage>
  );
};
