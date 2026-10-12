import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, AlertCircle, BookOpen, Clock, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import { useToast } from '../../components/ui/toast';

interface StudentRegistrationPageProps {
  locale: Locale;
}

export const StudentRegistrationPage: React.FC<StudentRegistrationPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const { toast } = useToast();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [searchTerm, setSearchTerm] = useState('');

  return (
    <PortalPage
      title={isAr ? 'التسجيل الفصلي للمقررات (الحذف والإضافة)' : 'Course Registration & Add/Drop'}
      subtitle={
        isAr
          ? 'إدارة الخطة الدراسية، تسجيل المقررات الأكاديمية، ومتابعة العبء الدراسي'
          : 'Course registration, schedule management, and academic credit load'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الطالب' : 'Student Portal', path: `/${locale}/student/dashboard` },
        { label: isAr ? 'التسجيل الفصلي' : 'Registration' },
      ]}
      locale={locale}
      actions={
        <Link
          to={`/${locale}/student/advising`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#082B50] hover:bg-[#061E38] text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
        >
          <BookOpen size={14} className="text-[#D6A53A]" />
          <span>{isAr ? 'الخطة الإرشادية' : 'Academic Advising Plan'}</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Registration Term Regulations Shell */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs flex items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center shrink-0 border border-[#DCE3EB]">
              <ShieldCheck size={22} className="text-[#D6A53A]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#102033]">
                {isAr ? 'بوابة التسجيل الأكاديمي' : 'Academic Registration Portal'}
              </h3>
              <p className="text-xs text-[#607086] mt-1 leading-relaxed">
                {isAr
                  ? 'يتم التسجيل في المقررات الدراسية وفق الخطة الدراسية لكل طالب والضوابط المنظمة للعبء الفصلي.'
                  : 'Course registration operates strictly in accordance with degree plans and academic regulations.'}
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-4 shadow-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3.5 text-[#607086]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAr ? 'البحث في دليل المقررات والشعب المتاحة...' : 'Search course catalog or open sections...'}
              className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl ps-10 pe-4 py-2.5 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50] transition-colors"
            />
          </div>
        </div>

        {/* Factual Academic Empty State */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-10 md:p-16 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
            <PlusCircle size={28} className="text-[#082B50]" />
          </div>

          <h3 className="text-base md:text-lg font-bold text-[#102033] mb-2">
            {isAr ? 'فترة التسجيل الفصلي غير متاحة حالياً' : 'Course registration period is currently closed'}
          </h3>

          <p className="text-xs text-[#607086] max-w-lg mx-auto mb-6 leading-relaxed">
            {isAr
              ? 'تُتاح عمليات تسجيل المقررات وفق المواعيد الرسمية المحددة في التقويم الأكاديمي.'
              : 'Course registration periods open in accordance with the official academic calendar.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to={`/${locale}/student/courses`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#082B50] hover:bg-[#061E38] text-white text-xs font-bold transition-colors shadow-xs"
            >
              <span>{isAr ? 'استعراض المقررات الحالية' : 'View Current Courses'}</span>
              <ArrowIcon size={14} />
            </Link>

            <Link
              to={`/${locale}/student/advising`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] text-xs font-semibold transition-colors"
            >
              <span>{isAr ? 'استشارة المرشد الأكاديمي' : 'Consult Academic Advisor'}</span>
            </Link>
          </div>
        </div>
      </div>
    </PortalPage>
  );
};
