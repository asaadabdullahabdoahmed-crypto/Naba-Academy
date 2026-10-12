import React from 'react';
import { Users, GraduationCap, ShieldCheck, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { Locale } from '../../i18n/dictionaries';
import { useTranslation } from '../../i18n/useTranslation';
import { Link } from 'react-router-dom';

interface FacultyPublicPageProps {
  locale: Locale;
}

export const FacultyPublicPage: React.FC<FacultyPublicPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#082B50]/10 text-[#082B50] text-xs font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D6A53A]" />
          <span>{isAr ? 'الهيئة الأكاديمية' : 'Academic Faculty'}</span>
        </div>
        <h1 className="text-3xl font-black text-[#082B50]">
          {isAr ? 'أعضاء هيئة التدريس والباحثون' : 'Faculty Members & Researchers'}
        </h1>
        <p className="text-xs md:text-sm text-[#607086]">
          {isAr
            ? 'نخبة من الأساتذة والخبراء الأكاديميين المشرفين على البرامج والمقررات الدراسية في أكاديمية نبا'
            : 'Academic scholars and instructional faculty leading digital courses and curricula at NABA Academy'}
        </p>
      </div>

      {/* Institutional Faculty Directory State (Zero invented names, zero fake avatars) */}
      <div className="bg-white rounded-3xl border border-[#DCE3EB] p-10 md:p-14 text-center space-y-6 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-[#082B50]/10 text-[#082B50] flex items-center justify-center mx-auto">
          <Users size={32} />
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-lg font-bold text-[#102033]">
            {isAr ? 'دليل الهيئة التدريسية قيد التحديث' : 'Faculty Directory Under Academic Review'}
          </h3>
          <p className="text-xs text-[#607086] leading-relaxed">
            {isAr
              ? 'تتم حاليًا مراجعة وتحديث ملفات الكادر الأكاديمي وتوزيع الشعب الدراسية. سيتم عرض الدليل الأكاديمي المعتمد فور اكتمال التعيينات الفصلية.'
              : 'Faculty departmental assignments and course section leads are synchronized from the central academic staffing registry.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 max-w-3xl mx-auto text-start">
          <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#DCE3EB] space-y-1">
            <h4 className="text-xs font-bold text-[#102033]">
              {isAr ? 'الكفاءة والخبرة' : 'Academic Rigor'}
            </h4>
            <p className="text-xs text-[#607086]">
              {isAr ? 'حملة الدكتوراه والماجستير المتخصصون' : 'Qualified PhD & Master holders'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#DCE3EB] space-y-1">
            <h4 className="text-xs font-bold text-[#102033]">
              {isAr ? 'التفاعل الحي' : 'Live Interaction'}
            </h4>
            <p className="text-xs text-[#607086]">
              {isAr ? 'ساعات مكتبية ومحاضرات مباشرة' : 'Direct office hours & seminars'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#DCE3EB] space-y-1">
            <h4 className="text-xs font-bold text-[#102033]">
              {isAr ? 'الإشراف العلمي' : 'Research Advising'}
            </h4>
            <p className="text-xs text-[#607086]">
              {isAr ? 'إرشاد أكاديمي ومتابعة مستمرة' : 'Continuous student mentoring'}
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-center">
          <Link
            to={`/${locale}/about`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#082B50] hover:bg-[#061E38] text-white text-xs font-bold transition-colors shadow-xs"
          >
            <span>{isAr ? 'عن الأكاديمية' : 'About NABA Academy'}</span>
            <ArrowIcon size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};
