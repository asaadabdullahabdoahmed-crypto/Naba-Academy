import React from 'react';
import { Shield, BookOpen, AlertCircle, FileCheck } from 'lucide-react';
import { Locale } from '../../i18n/dictionaries';
import { useTranslation } from '../../i18n/useTranslation';

interface TermsPageProps {
  locale: Locale;
}

export const TermsPage: React.FC<TermsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-16 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#082B50]/10 text-[#082B50] text-xs font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D6A53A]" />
          <span>{isAr ? 'اللوائح والأنظمة' : 'Terms & Regulations'}</span>
        </div>
        <h1 className="text-3xl font-black text-[#082B50]">
          {isAr ? 'شروط الخدمة وميثاق النزاهة الأكاديمية' : 'Terms of Service & Academic Charter'}
        </h1>
        <p className="text-xs md:text-sm text-[#607086]">
          {isAr
            ? 'الميثاق المنظم لحقوق وواجبات الطلاب والمنسوبين في بيئة التعليم الجامعي الرقمي'
            : 'Governing terms, student code of conduct, and academic integrity regulations at NABA Academy'}
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#DCE3EB] p-8 md:p-10 space-y-6 text-xs md:text-sm text-[#344054] leading-relaxed shadow-xs">
        <div className="space-y-2">
          <h2 className="text-base font-bold text-[#102033] flex items-center gap-2">
            <BookOpen size={18} className="text-[#082B50]" />
            <span>{isAr ? '1. ميثاق النزاهة الأكاديمية' : '1. Academic Integrity Honor Code'}</span>
          </h2>
          <p className="text-[#607086] text-xs leading-relaxed">
            {isAr
              ? 'يلتزم كل طالب بتقديم أعماله وتكليفاته واختباراته بمجهوده الفردي الكامل وتجنب أي ممارسات تتعارض مع الأمانة العلمية أو تنتحل جهود الآخرين.'
              : 'All enrolled students commit to submitting their own genuine work on assignments, quizzes, and examinations without unauthorized assistance or plagiarism.'}
          </p>
        </div>

        <div className="space-y-2 pt-4 border-t border-[#DCE3EB]">
          <h2 className="text-base font-bold text-[#102033] flex items-center gap-2">
            <Shield size={18} className="text-[#174F89]" />
            <span>{isAr ? '2. سرية بيانات الحساب الأكاديمي' : '2. Academic Account Credentials'}</span>
          </h2>
          <p className="text-[#607086] text-xs leading-relaxed">
            {isAr
              ? 'بيانات تسجيل الدخول إلى البوابة الأكاديمية شخصية وسرية، ويتحمل صاحب الحساب كامل المسؤولية عن أي نشاط يتم من خلاله.'
              : 'University portal credentials are strictly personal and non-transferable; users bear full responsibility for all activities conducted under their authenticated account.'}
          </p>
        </div>

        <div className="space-y-2 pt-4 border-t border-[#DCE3EB]">
          <h2 className="text-base font-bold text-[#102033] flex items-center gap-2">
            <FileCheck size={18} className="text-[#D6A53A]" />
            <span>{isAr ? '3. الالتزام باللوائح الدراسية' : '3. Compliance with Academic Bylaws'}</span>
          </h2>
          <p className="text-[#607086] text-xs leading-relaxed">
            {isAr
              ? 'تخضع متطلبات التخرج، وحساب المعدلات، وإجراءات الحذف والإضافة والانسحاب، للوائح المنظمة المعتمدة من مجلس الأكاديمية.'
              : 'Graduation fulfillment, GPA computations, enrollment add/drop deadlines, and appeal procedures conform strictly to approved university bylaws.'}
          </p>
        </div>
      </div>
    </div>
  );
};
