import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  Award,
  Video,
  ClipboardList,
  Bell,
  ArrowRight,
  ArrowLeft,
  FolderArchive,
  PlusCircle,
  Headphones,
  CheckCircle2,
  Tv,
} from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface StudentDashboardPageProps {
  locale: Locale;
}

export const StudentDashboardPage: React.FC<StudentDashboardPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <PortalPage
      title={isAr ? 'لوحة تحكم الطالب' : 'Student Dashboard'}
      subtitle={
        isAr
          ? 'مرحباً بك في رحلتك التعليمية مع أكاديمية نبا'
          : 'Welcome to your academic journey with NABA Academy'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الطالب' : 'Student Portal', path: `/${locale}/student/dashboard` },
        { label: isAr ? 'الرئيسية' : 'Dashboard' },
      ]}
      locale={locale}
      actions={
        <div className="flex items-center gap-2">
          <Link
            to={`/${locale}/student/registration`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#082B50] hover:bg-[#061E38] text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            <PlusCircle size={14} className="text-[#D6A53A]" />
            <span>{isAr ? 'التسجيل الفصلي للمقررات' : 'Course Registration'}</span>
          </Link>
          <Link
            to={`/${locale}/student/schedule`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] rounded-lg text-xs font-bold transition-colors"
          >
            <Calendar size={14} />
            <span>{isAr ? 'الجدول الدراسي' : 'Class Schedule'}</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Top Section: دوراتي الحالية (Current Courses) */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#DCE3EB]">
            <div>
              <h3 className="text-base font-bold text-[#082B50]">
                {isAr ? 'المقررات الدراسية' : 'Enrolled Courses'}
              </h3>
              <p className="text-xs text-[#607086] mt-0.5">
                {isAr ? 'قائمة المقررات المسجلة للطالب' : 'List of enrolled academic courses'}
              </p>
            </div>
            <Link
              to={`/${locale}/student/courses`}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#082B50] hover:text-[#174F89]"
            >
              <span>{isAr ? 'عرض الكل' : 'View All'}</span>
              <ArrowIcon size={13} />
            </Link>
          </div>

          {/* Corrected Neutral Empty State (No assumed operational facts) */}
          <div className="py-12 px-4 text-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
              <BookOpen size={24} />
            </div>
            <h4 className="text-sm font-bold text-[#102033] mb-1">
              {isAr ? 'لا توجد مقررات مسجلة حاليًا' : 'No courses are currently registered.'}
            </h4>
            <p className="text-xs text-[#607086] leading-relaxed mb-5">
              {isAr
                ? 'ستظهر المقررات الدراسية هنا عند توفر بيانات التسجيل في النظام.'
                : 'Courses will appear here when registration data becomes available in the system.'}
            </p>
            <Link
              to={`/${locale}/student/registration`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#082B50] hover:bg-[#061E38] text-white text-xs font-bold transition-colors shadow-xs"
            >
              <PlusCircle size={14} className="text-[#D6A53A]" />
              <span>{isAr ? 'التسجيل الفصلي للمقررات' : 'Go to Course Registration'}</span>
            </Link>
          </div>
        </div>

        {/* Bottom Three Cards (Neutral Empty States, No assumptions) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: المحاضرات */}
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DCE3EB]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#EFF3F8] text-[#082B50] flex items-center justify-center">
                    <Tv size={15} />
                  </div>
                  <h4 className="text-xs font-bold text-[#082B50]">
                    {isAr ? 'المحاضرات المجدولة' : 'Scheduled Lectures'}
                  </h4>
                </div>
              </div>

              <div className="py-8 text-center">
                <div className="w-10 h-10 rounded-xl bg-[#EFF3F8] text-[#607086] flex items-center justify-center mx-auto mb-2">
                  <Video size={18} />
                </div>
                <h5 className="text-xs font-bold text-[#102033] mb-1">
                  {isAr ? 'لا توجد محاضرات مجدولة حاليًا' : 'No upcoming lectures scheduled.'}
                </h5>
                <p className="text-[11px] text-[#607086]">
                  {isAr ? 'ستظهر المحاضرات هنا عند توفر جدول الحصص.' : 'Lectures will appear here once the timetable is published.'}
                </p>
              </div>
            </div>

            <Link
              to={`/${locale}/student/schedule`}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#EFF3F8] hover:bg-[#DCE3EB]/60 text-[#082B50] text-xs font-semibold transition-colors mt-2"
            >
              <span>{isAr ? 'الجدول الدراسي' : 'View Schedule'}</span>
              <ArrowIcon size={12} />
            </Link>
          </div>

          {/* Card 2: الواجبات والتكليفات */}
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DCE3EB]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#EFF3F8] text-[#082B50] flex items-center justify-center">
                    <ClipboardList size={15} />
                  </div>
                  <h4 className="text-xs font-bold text-[#082B50]">
                    {isAr ? 'الواجبات والتكليفات' : 'Assignments & Coursework'}
                  </h4>
                </div>
              </div>

              <div className="py-8 text-center">
                <div className="w-10 h-10 rounded-xl bg-[#EFF3F8] text-[#607086] flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 size={18} />
                </div>
                <h5 className="text-xs font-bold text-[#102033] mb-1">
                  {isAr ? 'لا توجد واجبات حالية' : 'No current assignments.'}
                </h5>
                <p className="text-[11px] text-[#607086]">
                  {isAr ? 'ستظهر الواجبات والتكليفات هنا عند إدراجها.' : 'Coursework items will appear here when assigned.'}
                </p>
              </div>
            </div>

            <Link
              to={`/${locale}/student/assignments`}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#EFF3F8] hover:bg-[#DCE3EB]/60 text-[#082B50] text-xs font-semibold transition-colors mt-2"
            >
              <span>{isAr ? 'قائمة الواجبات' : 'Assignments List'}</span>
              <ArrowIcon size={12} />
            </Link>
          </div>

          {/* Card 3: الإشعارات */}
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DCE3EB]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#EFF3F8] text-[#082B50] flex items-center justify-center">
                    <Bell size={15} />
                  </div>
                  <h4 className="text-xs font-bold text-[#082B50]">
                    {isAr ? 'الإشعارات الأكاديمية' : 'Academic Notices'}
                  </h4>
                </div>
              </div>

              <div className="py-8 text-center">
                <div className="w-10 h-10 rounded-xl bg-[#EFF3F8] text-[#607086] flex items-center justify-center mx-auto mb-2">
                  <Clock size={18} />
                </div>
                <h5 className="text-xs font-bold text-[#102033] mb-1">
                  {isAr ? 'لا توجد إشعارات حالية' : 'No current notifications.'}
                </h5>
                <p className="text-[11px] text-[#607086]">
                  {isAr ? 'ستظهر الإشعارات هنا عند صدورها.' : 'Notifications will appear here as they are issued.'}
                </p>
              </div>
            </div>

            <Link
              to={`/${locale}/student/messages`}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#EFF3F8] hover:bg-[#DCE3EB]/60 text-[#082B50] text-xs font-semibold transition-colors mt-2"
            >
              <span>{isAr ? 'مركز الرسائل' : 'Message Center'}</span>
              <ArrowIcon size={12} />
            </Link>
          </div>
        </div>

        {/* Quick Academic Hub Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            to={`/${locale}/student/library`}
            className="p-4 rounded-xl bg-white border border-[#DCE3EB] hover:border-[#082B50]/30 transition-all shadow-xs flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-[#EFF3F8] text-[#082B50] flex items-center justify-center shrink-0">
              <FolderArchive size={18} />
            </div>
            <div>
              <h5 className="text-xs font-bold text-[#102033]">{isAr ? 'المكتبة الرقمية' : 'Digital Library'}</h5>
              <p className="text-[10px] text-[#607086]">{isAr ? 'المراجع والمقررات' : 'Scholarly texts'}</p>
            </div>
          </Link>

          <Link
            to={`/${locale}/student/exams`}
            className="p-4 rounded-xl bg-white border border-[#DCE3EB] hover:border-[#082B50]/30 transition-all shadow-xs flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-[#EFF3F8] text-[#082B50] flex items-center justify-center shrink-0">
              <Award size={18} />
            </div>
            <div>
              <h5 className="text-xs font-bold text-[#102033]">{isAr ? 'جدول الاختبارات' : 'Exam Schedule'}</h5>
              <p className="text-[10px] text-[#607086]">{isAr ? 'مواعيد التقييم' : 'Assessment calendar'}</p>
            </div>
          </Link>

          <Link
            to={`/${locale}/student/advising`}
            className="p-4 rounded-xl bg-white border border-[#DCE3EB] hover:border-[#082B50]/30 transition-all shadow-xs flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-[#EFF3F8] text-[#082B50] flex items-center justify-center shrink-0">
              <GraduationCap size={18} />
            </div>
            <div>
              <h5 className="text-xs font-bold text-[#102033]">{isAr ? 'الإرشاد الأكاديمي' : 'Academic Advising'}</h5>
              <p className="text-[10px] text-[#607086]">{isAr ? 'التواصل مع المرشد' : 'Advisor contact'}</p>
            </div>
          </Link>

          <Link
            to={`/${locale}/student/support`}
            className="p-4 rounded-xl bg-white border border-[#DCE3EB] hover:border-[#082B50]/30 transition-all shadow-xs flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-[#EFF3F8] text-[#082B50] flex items-center justify-center shrink-0">
              <Headphones size={18} />
            </div>
            <div>
              <h5 className="text-xs font-bold text-[#102033]">{isAr ? 'الدعم الأكاديمي' : 'Academic Support'}</h5>
              <p className="text-[10px] text-[#607086]">{isAr ? 'خدمات المستفيدين' : 'Helpdesk tickets'}</p>
            </div>
          </Link>
        </div>
      </div>
    </PortalPage>
  );
};
