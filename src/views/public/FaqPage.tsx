import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Locale } from '../../i18n/dictionaries';
import { useTranslation } from '../../i18n/useTranslation';

interface FaqPageProps {
  locale: Locale;
}

export const FaqPage: React.FC<FaqPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      qAr: 'ما هي طبيعة ونمط التعليم في أكاديمية نبا؟',
      qEn: 'What is the learning delivery mode at NABA Academy?',
      aAr: 'تعتمد الأكاديمية نمط التعليم الجامعي الرقمي والتعليم عن بعد، حيث تُقدَّم المحاضرات والأنشطة عبر منظومة سحابية متكاملة تشمل محاضرات حية متزامنة، وتسجيلات مؤرشفة، ومنتديات نقاش تفاعلية.',
      aEn: 'The academy operates as a digital distance-learning higher education institution, delivering lectures, course materials, and assessments through a centralized cloud-native platform.',
    },
    {
      qAr: 'كيف تتم متابعة الحضور والأنشطة الأكاديمية؟',
      qEn: 'How are attendance and academic activities tracked?',
      aAr: 'يتم تسجيل حضور المحاضرات المباشرة ورصد المشاركات والتكليفات إلكترونيًا عبر بوابة الطالب الأكاديمية، مع إتاحة لوحة تحكم تفصيلية تبيّن نسبة الإنجاز والدرجات.',
      aEn: 'Live lecture attendance, assignments, and academic milestones are automatically recorded through the Student Portal with continuous progress tracking.',
    },
    {
      qAr: 'كيف تُجرى الاختبارات والتقييمات الفصلية؟',
      qEn: 'How are course assessments and examinations conducted?',
      aAr: 'تُجرى الاختبارات عبر بيئة الاختبارات الإلكترونية المؤمنة والمدمجة في المنصة، والتي تطبق معايير النزاهة الأكاديمية ومراقبة الالتزام بالتعليمات.',
      aEn: 'Examinations take place within a secure digital assessment environment adhering to rigorous institutional integrity and proctoring guidelines.',
    },
    {
      qAr: 'هل يمكن معادلة مقررات دراسية سابقة؟',
      qEn: 'Can prior completed coursework be transferred?',
      aAr: 'تتيح عمادة القبول والتسجيل إمكانية تقديم طلب معادلة للمقررات المستوفية للشروط وفق لائحة المعادلات الأكاديمية المعتمدة بعد مراجعة السجلات الرسمية.',
      aEn: 'Transfer credit evaluation is available through the Deanship of Admissions & Registration based on official academic transcripts and syllabus alignment.',
    },
    {
      qAr: 'ما هي طرق الدفع المالي وسداد الرسوم المتاحة؟',
      qEn: 'What tuition and fee payment channels are available?',
      aAr: 'تتيح المنظومة خيارات السداد الرقمي عبر بوابات الدفع الإلكتروني المعتمدة وتوفير فواتير رقمية وسندات سداد موثقة عبر بوابة الطالب المالية.',
      aEn: 'The platform provides secure digital payment processing channels and automated financial receipts through the Student Finance portal.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-16 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#082B50]/10 text-[#082B50] text-xs font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D6A53A]" />
          <span>{isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-[#082B50] tracking-tight">
          {isAr ? 'إجابات على أبرز الاستفسارات الأكاديمية' : 'Common Academic & Platform Inquiries'}
        </h1>
        <p className="text-xs md:text-sm text-[#607086]">
          {isAr
            ? 'دليل الإجابات السريعة حول متطلبات القبول ونمط الدراسة والمنظومة الرقمية'
            : 'Find clear information regarding admissions, digital learning, and academic procedures'}
        </p>
      </div>

      {/* Accordions */}
      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-[#DCE3EB] shadow-xs overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-4 md:p-5 text-start flex items-center justify-between gap-4 font-bold text-xs md:text-sm text-[#102033] hover:bg-[#F7F9FC] transition-colors cursor-pointer"
              >
                <span>{isAr ? faq.qAr : faq.qEn}</span>
                {isOpen ? (
                  <ChevronUp size={18} className="text-[#082B50] shrink-0" />
                ) : (
                  <ChevronDown size={18} className="text-[#607086] shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-4 md:px-5 pb-5 text-xs text-[#607086] leading-relaxed border-t border-[#DCE3EB]/60 pt-3 bg-[#F7F9FC]/40">
                  {isAr ? faq.aAr : faq.aEn}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
