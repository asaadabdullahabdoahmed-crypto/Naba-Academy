import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BookOpen,
  Play,
  FileText,
  Clock,
  ArrowRight,
  ArrowLeft,
  Layers,
  HelpCircle,
  FolderArchive,
  CheckCircle2,
} from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface StudentCourseDetailPageProps {
  locale: Locale;
}

export const StudentCourseDetailPage: React.FC<StudentCourseDetailPageProps> = ({ locale }) => {
  const { courseId } = useParams<{ courseId: string }>();
  const { d, isAr } = useTranslation();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [activeTab, setActiveTab] = useState<'modules' | 'syllabus' | 'resources'>('modules');

  return (
    <PortalPage
      title={isAr ? 'تفاصيل المقرر الدراسي' : 'Course Details'}
      subtitle={
        isAr
          ? 'استعراض محتوى المقرر، المحاضرات التعليمية، والمصادر الأكاديمية'
          : 'Review course curriculum, learning modules, and academic resources'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الطالب' : 'Student Portal', path: `/${locale}/student/dashboard` },
        { label: isAr ? 'المقررات الدراسية' : 'Courses', path: `/${locale}/student/courses` },
        { label: courseId || (isAr ? 'المقرر' : 'Course') },
      ]}
      locale={locale}
      actions={
        <Link
          to={`/${locale}/student/courses`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] rounded-lg text-xs font-bold transition-colors"
        >
          <ArrowIcon size={14} />
          <span>{isAr ? 'العودة للمقررات' : 'Back to Courses'}</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Course Header Shell */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#DCE3EB]">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#EFF3F8] text-[#082B50] text-[11px] font-bold mb-2">
                <BookOpen size={13} className="text-[#D6A53A]" />
                <span>{courseId || (isAr ? 'رمز المقرر' : 'Course Code')}</span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-[#102033]">
                {isAr ? 'مقرر دراسي مسجل' : 'Registered Academic Course'}
              </h2>
              <p className="text-xs text-[#607086] mt-1">
                {isAr ? 'المنصة التعليمية للمقرر والمحاضرات الرقمية' : 'Digital learning portal for course materials and lectures'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/${locale}/student/schedule`}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#EFF3F8] hover:bg-[#DCE3EB]/60 text-[#082B50] rounded-lg text-xs font-semibold transition-colors"
              >
                <Clock size={14} />
                <span>{isAr ? 'جدول المحاضرات' : 'Class Timetable'}</span>
              </Link>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="pt-4 flex items-center gap-2 border-b border-[#DCE3EB]/60">
            <button
              type="button"
              onClick={() => setActiveTab('modules')}
              className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'modules'
                  ? 'border-[#082B50] text-[#082B50]'
                  : 'border-transparent text-[#607086] hover:text-[#102033]'
              }`}
            >
              {isAr ? 'الوحدات والمحاضرات' : 'Modules & Lectures'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('syllabus')}
              className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'syllabus'
                  ? 'border-[#082B50] text-[#082B50]'
                  : 'border-transparent text-[#607086] hover:text-[#102033]'
              }`}
            >
              {isAr ? 'الخطة والتوصيف' : 'Syllabus & Objectives'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('resources')}
              className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'resources'
                  ? 'border-[#082B50] text-[#082B50]'
                  : 'border-transparent text-[#607086] hover:text-[#102033]'
              }`}
            >
              {isAr ? 'المراجع والمصادر' : 'Resources & Files'}
            </button>
          </div>
        </div>

        {/* Content Area with Professional Empty States (Zero Fake Lessons) */}
        {activeTab === 'modules' && (
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-8 md:p-14 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
              <Layers size={26} />
            </div>
            <h3 className="text-base font-bold text-[#102033] mb-1">
              {isAr ? 'لا توجد دروس أو محاضرات متاحة للعرض حاليًا' : 'No lessons or lecture modules are currently available.'}
            </h3>
            <p className="text-xs text-[#607086] max-w-md mx-auto mb-5 leading-relaxed">
              {isAr
                ? 'ستظهر الوحدات التعليمية، روابط البث المباشر، والمحاضرات المسجلة هنا فور إتاحتها من أستاذ المقرر.'
                : 'Learning modules, virtual class links, and recorded sessions will appear here once published.'}
            </p>
            <Link
              to={`/${locale}/student/courses`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#082B50] hover:bg-[#061E38] text-white text-xs font-bold rounded-lg transition-colors"
            >
              <span>{isAr ? 'العودة إلى قائمة المقررات' : 'Return to Courses List'}</span>
            </Link>
          </div>
        )}

        {activeTab === 'syllabus' && (
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-8 text-center shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-[#EFF3F8] text-[#607086] flex items-center justify-center mx-auto mb-3">
              <FileText size={22} />
            </div>
            <h4 className="text-sm font-bold text-[#102033] mb-1">
              {isAr ? 'خطة المقرر وتوصيف المنهج' : 'Course Syllabus'}
            </h4>
            <p className="text-xs text-[#607086] max-w-md mx-auto">
              {isAr
                ? 'سيتم إدراج توصيف المقرر، مخرجات التعلم المستهدفة، وتوزيع الدرجات هنا عند اعتمادها.'
                : 'Course syllabus, learning outcomes, and assessment distribution will appear here once published.'}
            </p>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-8 text-center shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-[#EFF3F8] text-[#607086] flex items-center justify-center mx-auto mb-3">
              <FolderArchive size={22} />
            </div>
            <h4 className="text-sm font-bold text-[#102033] mb-1">
              {isAr ? 'المراجع والملفات الإثرائية' : 'Course Resources'}
            </h4>
            <p className="text-xs text-[#607086] max-w-md mx-auto">
              {isAr
                ? 'لا توجد ملفات أو كتب منشورة لهذا المقرر حاليًا. ستظهر الملفات المرفوعة هنا.'
                : 'No course files or textbooks uploaded at this time. Shared files will appear here.'}
            </p>
          </div>
        )}
      </div>
    </PortalPage>
  );
};
