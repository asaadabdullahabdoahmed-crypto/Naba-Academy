import React from 'react';
import { Award, ShieldCheck, CheckCircle2, FileCheck, Layers, BookOpen } from 'lucide-react';
import { Locale } from '../../i18n/dictionaries';
import { useTranslation } from '../../i18n/useTranslation';

interface AccreditationPageProps {
  locale: Locale;
}

export const AccreditationPage: React.FC<AccreditationPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();

  const standards = [
    {
      titleAr: 'معايير جودة الخطط والمقررات الدراسية',
      titleEn: 'Curriculum & Course Quality Standards',
      descAr: 'تخضع جميع المناهج والمقررات لمراجعة دورية من قِبل لجان الخطط الدراسية لضمان مواكبتها لأحدث المعارف والتطبيقات العملية.',
      descEn: 'All academic syllabi and learning outcomes undergo systematic peer review by academic curriculum committees.',
    },
    {
      titleAr: 'حوكمة بيئة التعليم الإلكتروني والنزاهة',
      titleEn: 'Digital Learning Governance & Integrity',
      descAr: 'تطبيق السياسات الصارمة في التحقق من هوية الدارسين ومصداقية التقييمات والأعمال الأكاديمية المقدمة.',
      descEn: 'Enforcement of identity verification, academic honesty charters, and rigorous assessment protocols.',
    },
    {
      titleAr: 'تقييم مخرجات التعلم المستمر',
      titleEn: 'Continuous Learning Outcomes Assessment',
      descAr: 'قياس دوري لمستوى اكتساب المهارات والتحصيل العلمي للطلاب مع تطوير المقررات بناءً على المؤشرات الأكاديمية.',
      descEn: 'Continuous measurement of competencies and student achievement to drive instructional improvement.',
    },
    {
      titleAr: 'كفاءة وتطوير الكادر التدريسي',
      titleEn: 'Faculty Competence & Professional Development',
      descAr: 'استقطاب أساتذة ذوي كفاءة علمية عالية مع تقديم التدريب المستمر على أفضل ممارسات التدريس الرقمي التفاعلي.',
      descEn: 'Recruitment of distinguished faculty and continuous enablement in modern digital pedagogical methods.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#082B50]/10 text-[#082B50] text-xs font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D6A53A]" />
          <span>{isAr ? 'الجودة والاعتماد' : 'Quality & Accreditation'}</span>
        </div>
        <h1 className="text-3xl font-black text-[#082B50]">
          {isAr ? 'إطار ضمان الجودة والاعتماد الأكاديمي' : 'Academic Quality Assurance Framework'}
        </h1>
        <p className="text-xs md:text-sm text-[#607086]">
          {isAr
            ? 'تلتزم أكاديمية نبا بأعلى معايير الجودة المؤسسية والأكاديمية في التعليم الجامعي الرقمي'
            : 'NABA Academy is committed to institutional and programmatic quality standards in digital higher education'}
        </p>
      </div>

      {/* Quality Framework Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {standards.map((st, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs flex items-start gap-4"
          >
            <div className="w-11 h-11 rounded-xl bg-[#082B50]/10 text-[#082B50] flex items-center justify-center shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-[#102033]">
                {isAr ? st.titleAr : st.titleEn}
              </h3>
              <p className="text-xs text-[#607086] leading-relaxed">
                {isAr ? st.descAr : st.descEn}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Verification Notice */}
      <div className="bg-white rounded-2xl border border-[#DCE3EB] p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <Award className="text-[#D6A53A]" size={24} />
          <h3 className="text-base font-bold text-[#102033]">
            {isAr ? 'التحقق من الوثائق والشهادات الأكاديمية' : 'Digital Academic Credential Verification'}
          </h3>
        </div>
        <p className="text-xs text-[#607086] leading-relaxed">
          {isAr
            ? 'تصدر أكاديمية نبا وثائق التخرج والسجلات الأكاديمية الرسمية وفق آليات تدقيق موحدة، وتوفر بوابة خاصة للتحقق من صحة السجلات والوثائق للجهات الأكاديمية والمهنية.'
            : 'Graduation credentials and official academic transcripts are issued under verified institutional protocols with dedicated digital verification services.'}
        </p>
      </div>
    </div>
  );
};
