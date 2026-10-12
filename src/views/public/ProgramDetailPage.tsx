import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, ArrowLeft, BookOpen, Clock, FileCheck } from 'lucide-react';
import { Locale } from '../../i18n/dictionaries';
import { useTranslation } from '../../i18n/useTranslation';

interface ProgramDetailPageProps {
  locale: Locale;
}

export const ProgramDetailPage: React.FC<ProgramDetailPageProps> = ({ locale }) => {
  const { programId } = useParams<{ programId: string }>();
  const { isAr } = useTranslation();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#607086]">
        <Link to={`/${locale}`} className="hover:text-[#082B50]">
          {isAr ? 'الرئيسية' : 'Home'}
        </Link>
        <span>/</span>
        <Link to={`/${locale}/programs`} className="hover:text-[#082B50]">
          {isAr ? 'البرامج الأكاديمية' : 'Programs'}
        </Link>
        <span>/</span>
        <span className="text-[#082B50] font-bold">
          {programId || (isAr ? 'تفاصيل البرنامج' : 'Program Details')}
        </span>
      </div>

      {/* Program Details Card / Pending Registry Sync */}
      <div className="bg-white rounded-3xl border border-[#DCE3EB] p-8 md:p-12 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#DCE3EB]">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#082B50]/10 text-[#082B50] text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D6A53A]" />
              <span>{isAr ? 'سجل البرامج الأكاديمية' : 'Academic Registry Record'}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-[#082B50]">
              {isAr ? 'تفاصيل الخطة الدراسية والبرنامج' : 'Academic Program Curriculum & Syllabus'}
            </h1>
            <p className="text-xs md:text-sm text-[#607086] max-w-2xl leading-relaxed">
              {isAr
                ? 'رمز البرنامج المرجعي: ' + (programId || '—') + '. يتم تحميل المخرجات التعليمية والمقررات الدراسية مباشرة من السجل الأكاديمي.'
                : 'Program Identifier: ' + (programId || '—') + '. Syllabi and learning outcomes load from the central academic registry.'}
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <Link
              to={`/${locale}/admissions`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#082B50] hover:bg-[#061E38] text-white text-xs font-bold transition-colors shadow-xs"
            >
              <span>{isAr ? 'التقديم والقبول' : 'Apply for Admission'}</span>
              <ArrowIcon size={14} />
            </Link>
          </div>
        </div>

        {/* Informative Institutional Notice */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-5 rounded-2xl bg-[#F7F9FC] border border-[#DCE3EB] space-y-2">
            <GraduationCap size={20} className="text-[#082B50]" />
            <h4 className="text-xs font-bold text-[#102033]">
              {isAr ? 'الدرجة الأكاديمية' : 'Academic Degree'}
            </h4>
            <p className="text-xs text-[#607086]">
              {isAr
                ? 'تحدد عند اختيار التخصص في نموذج القبول والتسجيل.'
                : 'Assigned upon formal major selection via admissions.'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F7F9FC] border border-[#DCE3EB] space-y-2">
            <Clock size={20} className="text-[#174F89]" />
            <h4 className="text-xs font-bold text-[#102033]">
              {isAr ? 'نمط الدراسة' : 'Study Delivery'}
            </h4>
            <p className="text-xs text-[#607086]">
              {isAr
                ? 'تعليم رقمي وعن بُعد متكامل عبر منصة نبا.'
                : '100% digital distance-learning via NABA ecosystem.'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F7F9FC] border border-[#DCE3EB] space-y-2">
            <FileCheck size={20} className="text-[#D6A53A]" />
            <h4 className="text-xs font-bold text-[#102033]">
              {isAr ? 'الخطة والمقررات' : 'Study Plan & Offerings'}
            </h4>
            <p className="text-xs text-[#607086]">
              {isAr
                ? 'متاحة للطلاب المسجلين عبر بوابة الطالب الأكاديمية.'
                : 'Accessible to enrolled students via Student Portal.'}
            </p>
          </div>
        </div>

        <div className="pt-4 flex justify-start">
          <Link
            to={`/${locale}/programs`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#082B50] hover:text-[#174F89]"
          >
            <ArrowIcon size={14} className="rotate-180" />
            <span>{isAr ? 'العودة إلى دليل البرامج' : 'Back to Programs Catalog'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
