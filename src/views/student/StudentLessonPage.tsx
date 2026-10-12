import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Play,
  CheckCircle2,
  Download,
  FileText,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  MessageSquare,
  Sparkles,
  Share2,
  Video,
  Clock,
  Layers,
  ArrowRight,
  ArrowLeft,
  Save,
} from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import { useToast } from '../../components/ui/toast';

interface StudentLessonPageProps {
  locale: Locale;
}

export const StudentLessonPage: React.FC<StudentLessonPageProps> = ({ locale }) => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { isAr } = useTranslation();
  const { toast } = useToast();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const PrevIcon = isAr ? ChevronRight : ChevronLeft;
  const NextIcon = isAr ? ChevronLeft : ChevronRight;

  const [activeTab, setActiveTab] = useState<'summary' | 'notes' | 'resources'>('summary');
  const [completed, setCompleted] = useState(false);
  const [studentNote, setStudentNote] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const displayCourseCode = courseId ? courseId.toUpperCase() : (isAr ? 'المقرر الأكاديمي' : 'Course');
  const displayLessonTitle = lessonId
    ? (isAr ? `المحاضرة التعليمية (${lessonId})` : `Lecture Session (${lessonId})`)
    : (isAr ? 'جلسة المحاضرة الرقمية' : 'Digital Lecture Session');

  const handleSaveNotes = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info(isAr ? 'ملاحظات مؤقتة للجلسة الحالية' : 'Temporary notes for current session');
  };

  return (
    <PortalPage
      title={displayLessonTitle}
      subtitle={
        isAr
          ? `القاعة التعليمية الرقمية — ${displayCourseCode}`
          : `Digital Lecture Room — ${displayCourseCode}`
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الطالب' : 'Student Portal', path: `/${locale}/student/dashboard` },
        { label: isAr ? 'المقررات الدراسية' : 'Courses', path: `/${locale}/student/courses` },
        {
          label: displayCourseCode,
          path: courseId ? `/${locale}/student/courses/${courseId}` : `/${locale}/student/courses`,
        },
        { label: isAr ? 'قاعة المحاضرة' : 'Lecture Room' },
      ]}
      locale={locale}
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setCompleted(!completed);
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
              completed
                ? 'bg-[#082B50] text-[#D6A53A] border border-[#082B50]'
                : 'bg-white border border-[#DCE3EB] text-[#082B50] hover:bg-[#EFF3F8]'
            }`}
          >
            <CheckCircle2 size={15} />
            <span>
              {completed
                ? (isAr ? 'تمت المشاهدة' : 'Watched')
                : (isAr ? 'تحديد كمشاهدة' : 'Mark as Watched')}
            </span>
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Video & Content Area (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* E-Learning Video Player Frame */}
          <div className="bg-[#061E38] rounded-2xl overflow-hidden shadow-md border border-[#082B50] aspect-video relative flex flex-col justify-between p-4 group">
            {/* Top Bar Info Overlay */}
            <div className="flex items-center justify-between text-xs text-white/80 z-10">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#082B50] text-[#D6A53A] font-mono font-bold text-[11px] border border-white/10">
                  {displayCourseCode}
                </span>
                <span className="font-semibold text-white truncate max-w-[200px] sm:max-w-md">
                  {displayLessonTitle}
                </span>
              </div>
            </div>

            {/* Center Play Button Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-t from-[#061E38]/90 via-transparent to-[#061E38]/60">
              <button
                type="button"
                onClick={() => {
                  setIsPlaying(!isPlaying);
                  toast.info(
                    isAr
                      ? 'البث الرقمي للمحاضرة متاح عبر منصة الفصول الافتراضية'
                      : 'Digital lecture broadcast accessible via virtual classroom player'
                  );
                }}
                className="w-16 h-16 rounded-full bg-[#082B50]/90 text-[#D6A53A] border-2 border-[#D6A53A] flex items-center justify-center hover:scale-105 hover:bg-[#082B50] transition-all shadow-lg cursor-pointer"
              >
                <Play size={28} className={isAr ? 'rotate-180 translate-x-0.5' : 'translate-x-0.5'} />
              </button>
              <p className="text-white text-xs font-semibold mt-3">
                {isAr ? 'انقر لتشغيل المحاضرة المسجلة' : 'Click to stream recorded lecture session'}
              </p>
              <p className="text-white/60 text-[11px] mt-1">
                {isAr ? 'منصة البث الأكاديمي الرقمي في أكاديمية نبا' : 'NABA Academy streaming delivery network'}
              </p>
            </div>

            {/* Bottom Controls Track */}
            <div className="z-10 bg-[#061E38]/80 backdrop-blur-xs rounded-xl p-2.5 border border-white/10 flex items-center justify-between text-xs text-white">
              <div className="flex items-center gap-3">
                <span className="text-[#D6A53A] font-mono font-bold text-[11px]">
                  00:00 / --:--
                </span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-[11px]">
                <Clock size={13} className="text-[#D6A53A]" />
                <span>{isAr ? 'جلسة تعليمية عن بُعد' : 'Virtual Classroom Session'}</span>
              </div>
            </div>
          </div>

          {/* Player Navigation & Quick Actions */}
          <div className="bg-white rounded-xl border border-[#DCE3EB] p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs text-xs">
            <Link
              to={courseId ? `/${locale}/student/courses/${courseId}` : `/${locale}/student/courses`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DCE3EB] hover:bg-[#EFF3F8] text-[#082B50] font-semibold transition-colors"
            >
              <ArrowIcon size={14} />
              <span>{isAr ? 'العودة لمحتوى المقرر' : 'Back to Course'}</span>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                to={`/${locale}/student/courses/${courseId || 'general'}/quiz`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#082B50] hover:bg-[#061E38] text-white font-bold transition-colors shadow-xs"
              >
                <span>{isAr ? 'اختبار فهم المحاضرة' : 'Lesson Quiz'}</span>
                <PrevIcon size={14} />
              </Link>
            </div>
          </div>

          {/* Lesson Tabs: Summary / Notes / Resources */}
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs">
            <div className="flex items-center gap-4 border-b border-[#DCE3EB] pb-3 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('summary')}
                className={`text-xs font-bold pb-2 transition-colors border-b-2 cursor-pointer ${
                  activeTab === 'summary'
                    ? 'border-[#082B50] text-[#082B50]'
                    : 'border-transparent text-[#607086] hover:text-[#102033]'
                }`}
              >
                {isAr ? 'محاور المحاضرة' : 'Lecture Overview'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className={`text-xs font-bold pb-2 transition-colors border-b-2 cursor-pointer ${
                  activeTab === 'notes'
                    ? 'border-[#082B50] text-[#082B50]'
                    : 'border-transparent text-[#607086] hover:text-[#102033]'
                }`}
              >
                {isAr ? 'ملاحظاتي الدراسية' : 'My Study Notes'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('resources')}
                className={`text-xs font-bold pb-2 transition-colors border-b-2 cursor-pointer ${
                  activeTab === 'resources'
                    ? 'border-[#082B50] text-[#082B50]'
                    : 'border-transparent text-[#607086] hover:text-[#102033]'
                }`}
              >
                {isAr ? 'المصادر والشرائح' : 'Slides & Resources'}
              </button>
            </div>

            {activeTab === 'summary' && (
              <div className="space-y-3 text-xs text-[#102033] leading-relaxed">
                <p className="text-[#607086]">
                  {isAr
                    ? 'تتضمن هذه المحاضرة الشرح النظري والتطبيقي للأهداف التعليمية المحددة في توصيف المقرر، مع مناقشة التطبيقات العملية والواجبات المرتبطة.'
                    : 'This lecture session covers the theoretical and practical concepts outlined in the course syllabus, alongside relevant applied coursework.'}
                </p>
                <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#DCE3EB] text-[#082B50] text-xs">
                  <span className="font-bold block mb-1">
                    {isAr ? 'إرشادات متابعة المحاضرة:' : 'Lecture Study Guidelines:'}
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-[#607086]">
                    <li>{isAr ? 'مراجعة الملاحظات وتدوين الأسئلة للاستفسار عبر المنتدى الأكاديمي' : 'Review key points and submit questions in the academic forum'}</li>
                    <li>{isAr ? 'إتمام الاختبار القصير بعد إنهاء مشاهدة كامل المادة التعليمية' : 'Complete the lesson quiz following the lecture review'}</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <form onSubmit={handleSaveNotes} className="space-y-3">
                <textarea
                  rows={5}
                  value={studentNote}
                  onChange={(e) => setStudentNote(e.target.value)}
                  placeholder={
                    isAr
                      ? 'دون ملاحظاتك واستفساراتك الخاصة بهذه المحاضرة هنا...'
                      : 'Write your private lecture study notes and reflections here...'
                  }
                  className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl p-3 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#607086]">
                    {isAr ? 'ملاحظات دراسية خاصة بالجلسة الحالية' : 'Temporary study notes for this session'}
                  </span>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#082B50] hover:bg-[#061E38] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    <Save size={14} className="text-[#D6A53A]" />
                    <span>{isAr ? 'تأكيد الملاحظة' : 'Save Session Note'}</span>
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'resources' && (
              <div className="text-center py-6 text-xs text-[#607086]">
                <FileText size={24} className="mx-auto mb-2 text-[#082B50]" />
                <p className="font-bold text-[#102033]">
                  {isAr ? 'الملفات المرفقة بالمحاضرة' : 'Lecture Attachment Files'}
                </p>
                <p className="text-[11px] mt-1">
                  {isAr
                    ? 'سيتم إدراج الشرائح التقديمية والمصادر الإثرائية هنا عند رفعها من مدرس المقرر.'
                    : 'Presentation slides and supplementary resources will appear here once uploaded.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Lecture Navigation & Index (1 Col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs">
            <h3 className="text-xs font-bold text-[#102033] uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>{isAr ? 'فهرس المحاضرات' : 'Lecture Index'}</span>
              <span className="text-[11px] font-mono text-[#D6A53A] font-bold">
                {displayCourseCode}
              </span>
            </h3>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-[#EFF3F8] border border-[#DCE3EB] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#082B50] text-[#D6A53A] flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </div>
                  <div>
                    <span className="font-bold text-[#082B50] block">
                      {isAr ? 'المحاضرة الحالية' : 'Current Lecture'}
                    </span>
                    <span className="text-[10px] text-[#607086]">
                      {completed ? (isAr ? 'تمت المشاهدة' : 'Completed') : (isAr ? 'قيد المتابعة' : 'In Progress')}
                    </span>
                  </div>
                </div>
                {completed ? (
                  <CheckCircle2 size={16} className="text-[#082B50]" />
                ) : (
                  <Play size={14} className="text-[#082B50]" />
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#DCE3EB] text-center">
              <Link
                to={`/${locale}/student/courses/${courseId || 'general'}`}
                className="text-xs font-bold text-[#082B50] hover:text-[#061E38] inline-flex items-center gap-1"
              >
                <span>{isAr ? 'عرض كافة محاضرات المقرر' : 'View All Course Lectures'}</span>
                <ArrowIcon size={12} />
              </Link>
            </div>
          </div>

          {/* Academic Support Card */}
          <div className="bg-[#EFF3F8] rounded-2xl border border-[#DCE3EB] p-5 text-xs">
            <h4 className="font-bold text-[#082B50] mb-1">
              {isAr ? 'هل لديك استفسار أكاديمي؟' : 'Academic Inquiries'}
            </h4>
            <p className="text-[#607086] text-[11px] mb-3 leading-relaxed">
              {isAr
                ? 'يمكنك طرح تساؤلاتك حول محتوى هذه المحاضرة عبر منتدى النقاش الأكاديمي أو استشارة المرشد.'
                : 'Ask questions regarding this lecture content in the academic discussion forum or contact advising.'}
            </p>
            <div className="flex items-center gap-2">
              <Link
                to={`/${locale}/student/forums`}
                className="px-3 py-1.5 rounded-lg bg-[#082B50] hover:bg-[#061E38] text-white font-bold text-[11px] transition-colors"
              >
                {isAr ? 'منتدى المقرر' : 'Course Forum'}
              </Link>
              <Link
                to={`/${locale}/student/advising`}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#DCE3EB] text-[#082B50] font-semibold text-[11px] hover:bg-[#F7F9FC] transition-colors"
              >
                {isAr ? 'الإرشاد الأكاديمي' : 'Advising'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PortalPage>
  );
};
