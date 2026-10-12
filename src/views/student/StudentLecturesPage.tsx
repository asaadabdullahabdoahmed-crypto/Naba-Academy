import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlayCircle,
  Video,
  Clock,
  Search,
  Calendar,
  Layers,
  ArrowRight,
  ArrowLeft,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface StudentLecturesPageProps {
  locale: Locale;
}

export const StudentLecturesPage: React.FC<StudentLecturesPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <PortalPage
      title={isAr ? 'المحاضرات التعليمية والجلسات التفاعلية' : 'Lectures & Interactive Sessions'}
      subtitle={
        isAr
          ? 'استعراض المحاضرات المباشرة وتسجيلات الجلسات الرقمية'
          : 'Browse virtual class sessions and digital lecture recordings'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الطالب' : 'Student Portal', path: `/${locale}/student/dashboard` },
        { label: isAr ? 'المحاضرات' : 'Lectures' },
      ]}
      locale={locale}
      actions={
        <Link
          to={`/${locale}/student/schedule`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#082B50] hover:bg-[#061E38] text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
        >
          <Calendar size={14} className="text-[#D6A53A]" />
          <span>{isAr ? 'الجدول الأسبوعي' : 'Weekly Timetable'}</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3.5 text-[#607086]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAr ? 'البحث في عناوين المحاضرات أو رموز المقررات...' : 'Search lectures by title or course...'}
              className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl ps-10 pe-4 py-2.5 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-[#607086] font-medium hidden md:inline">
              {isAr ? 'بث المحاضرات الرقمية' : 'Digital Class Broadcast'}
            </span>
          </div>
        </div>

        {/* Honest Institutional Empty State */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-10 md:p-16 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
            <Video size={28} className="text-[#082B50]" />
          </div>

          <h3 className="text-base md:text-lg font-bold text-[#102033] mb-2">
            {isAr ? 'لا توجد جلسات محاضرات مجدولة حاليًا' : 'No lecture sessions currently scheduled'}
          </h3>

          <p className="text-xs text-[#607086] max-w-lg mx-auto mb-6 leading-relaxed">
            {isAr
              ? 'ستظهر هنا روابط البث المباشر للفصول الافتراضية والتسجيلات المؤرشفة عند بدء الجلسات الأكاديمية للفصل الدراسي.'
              : 'Live stream links and archived recorded sessions will appear here once academic classes commence.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to={`/${locale}/student/courses`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#082B50] hover:bg-[#061E38] text-white text-xs font-bold transition-colors shadow-xs"
            >
              <span>{isAr ? 'استعراض المقررات المسجلة' : 'View Registered Courses'}</span>
              <ArrowIcon size={14} />
            </Link>

            <Link
              to={`/${locale}/student/schedule`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] text-xs font-semibold transition-colors"
            >
              <Clock size={14} />
              <span>{isAr ? 'مواعيد المحاضرات الأسبوعية' : 'Weekly Timetable'}</span>
            </Link>
          </div>
        </div>
      </div>
    </PortalPage>
  );
};
