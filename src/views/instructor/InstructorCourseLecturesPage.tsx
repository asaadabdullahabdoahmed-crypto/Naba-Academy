import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Video, Plus, ArrowRight, ArrowLeft } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface InstructorCourseLecturesPageProps {
  locale: Locale;
}

export const InstructorCourseLecturesPage: React.FC<InstructorCourseLecturesPageProps> = ({ locale }) => {
  const { courseId } = useParams<{ courseId: string }>();
  const { isAr } = useTranslation();

  // Honest data-driven container: empty until real backend data is connected
  const lectures: any[] = [];

  return (
    <PortalPage
      title={isAr ? `محاضرات المقرر: ${courseId || 'المقرر'}` : `Course Lectures: ${courseId || 'Course'}`}
      subtitle={
        isAr
          ? 'إدارة المحاضرات المرئية، التسجيلات السحابية، ورفع الجلسات التفاعلية'
          : 'Manage on-demand video lectures, cloud recordings, and instructional materials'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة المحاضر' : 'Faculty Portal', path: `/${locale}/instructor/dashboard` },
        { label: isAr ? 'المقررات المكلفة' : 'Courses', path: `/${locale}/instructor/courses` },
        { label: courseId || (isAr ? 'المقرر' : 'Course'), path: `/${locale}/instructor/courses/${courseId || 'default'}` },
        { label: isAr ? 'المحاضرات' : 'Lectures' },
      ]}
      locale={locale}
      actions={
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#082B50]/40 text-white/50 rounded-lg text-xs font-semibold cursor-not-allowed border border-[#DCE3EB]"
          title={isAr ? 'إضافة المحاضرات تتطلب اتصال خدمة التخزين' : 'Adding lectures requires storage connection'}
        >
          <Plus size={14} className="text-[#D6A53A]/60" />
          <span>{isAr ? 'إضافة محاضرة جديدة' : 'Add New Lecture'}</span>
        </button>
      }
    >
      <div className="space-y-4">
        {lectures.length > 0 ? (
          <div className="space-y-3">
            {/* Populated when real lectures exist */}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
              <Video size={28} />
            </div>
            <h3 className="text-base font-bold text-[#102033] mb-1">
              {isAr ? 'لا توجد محاضرات مسجلة لهذا المقرر' : 'No lectures found for this course.'}
            </h3>
            <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed mb-6">
              {isAr
                ? 'ستظهر هنا كافة المحاضرات المسجلة والجلسات المباشرة المرتبطة بهذا المقرر فور جدولتها.'
                : 'All recorded lectures and scheduled live sessions for this course will appear here.'}
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
