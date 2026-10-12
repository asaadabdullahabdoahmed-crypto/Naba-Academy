import React from 'react';
import { Compass, Shield, Award, BookOpen, Layers, Laptop, Users } from 'lucide-react';
import { Locale } from '../../i18n/dictionaries';
import { useTranslation } from '../../i18n/useTranslation';
import { NabaLogo } from '../../components/common/NabaLogo';

interface AboutPageProps {
  locale: Locale;
}

export const AboutPage: React.FC<AboutPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16 space-y-12">
      {/* Institutional Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#082B50]/10 text-[#082B50] text-xs font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D6A53A]" />
          <span>{isAr ? 'عن الأكاديمية' : 'About NABA Academy'}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-[#082B50] tracking-tight">
          {isAr
            ? 'أكاديمية نبا للتعليم الإلكتروني والتعليم عن بعد'
            : 'NABA Academy for Digital Higher Education'}
        </h1>
        <p className="text-xs md:text-sm text-[#607086] leading-relaxed">
          {isAr
            ? 'مؤسسة أكاديمية متخصصة في توفير التعليم الجامعي الرقمي والتعليم المستمر عبر منظومة تقنية متكاملة تدمج بين الرصانة الأكاديمية ومرونة التعلم الإلكتروني الحديث.'
            : 'An integrated higher education institution dedicated to digital university education, delivering rigorous academic curricula through modern distance-learning architectures.'}
        </p>
      </div>

      {/* Vision, Mission, Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#082B50]/10 text-[#082B50] flex items-center justify-center">
            <Compass size={22} className="text-[#082B50]" />
          </div>
          <h3 className="text-base font-bold text-[#102033]">
            {isAr ? 'الرؤية الأكاديمية' : 'Academic Vision'}
          </h3>
          <p className="text-xs text-[#607086] leading-relaxed">
            {isAr
              ? 'الريادة في تقديم تعليم جامعي رقمي يواكب متطلبات العصر، ويمكّن الدارسين من اكتساب المعرفة والمهارات التخصصية بجودة أكاديمية رفيعة.'
              : 'To be a premier digital academic institution recognized for educational excellence, academic integrity, and innovative distance-learning methodologies.'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#174F89]/10 text-[#174F89] flex items-center justify-center">
            <Award size={22} className="text-[#174F89]" />
          </div>
          <h3 className="text-base font-bold text-[#102033]">
            {isAr ? 'الرسالة الأكاديمية' : 'Academic Mission'}
          </h3>
          <p className="text-xs text-[#607086] leading-relaxed">
            {isAr
              ? 'إتاحة فرص التعليم العالي المتميز لجميع الطلاب والمهنيين عبر برامج أكاديمية متطورة وبيئة تعليمية تفاعلية مدعومة بأحدث التقنيات.'
              : 'Delivering rigorous, accessible digital university education that empowers learners through active learning technologies, verified knowledge, and professional development.'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#D6A53A]/15 text-[#D6A53A] flex items-center justify-center">
            <Shield size={22} className="text-[#082B50]" />
          </div>
          <h3 className="text-base font-bold text-[#102033]">
            {isAr ? 'القيم المؤسسية' : 'Core Values'}
          </h3>
          <p className="text-xs text-[#607086] leading-relaxed">
            {isAr
              ? 'النزاهة الأكاديمية، الشفافية المؤسسية، الابتكار في أساليب التدريس، والالتزام بأعلى معايير الجودة والتحسين المستمر.'
              : 'Academic integrity, institutional transparency, pedagogical innovation, and commitment to continuous educational quality standards.'}
          </p>
        </div>
      </div>

      {/* Platform & Pedagogical Capabilities */}
      <div className="bg-white rounded-2xl border border-[#DCE3EB] p-8 shadow-xs space-y-6">
        <div>
          <span className="text-xs font-bold text-[#D6A53A] uppercase tracking-wider">
            {isAr ? 'البيئة التعليمية المتكاملة' : 'Integrated Learning Environment'}
          </span>
          <h2 className="text-xl font-bold text-[#082B50] tracking-tight mt-1">
            {isAr ? 'مرتكزات منظومة التعلم الرقمي في أكاديمية نبا' : 'NABA Digital Learning Ecosystem'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-[#F7F9FC] border border-[#DCE3EB] space-y-2">
            <Laptop size={20} className="text-[#082B50]" />
            <h4 className="text-sm font-bold text-[#102033]">
              {isAr ? 'تعليم تفاعلي هجين' : 'Synchronous & Asynchronous Delivery'}
            </h4>
            <p className="text-xs text-[#607086] leading-relaxed">
              {isAr
                ? 'محاضرات مباشرة تفاعلية مع أعضاء هيئة التدريس، إلى جانب تسجيلات عالية الدقة ومحتوى رقمي متوفر على مدار الساعة.'
                : 'Interactive live sessions combined with high-fidelity archived lectures and modular digital learning objects.'}
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#F7F9FC] border border-[#DCE3EB] space-y-2">
            <Layers size={20} className="text-[#174F89]" />
            <h4 className="text-sm font-bold text-[#102033]">
              {isAr ? 'بوابات أكاديمية متخصصة' : 'Dedicated Stakeholder Portals'}
            </h4>
            <p className="text-xs text-[#607086] leading-relaxed">
              {isAr
                ? 'واجهات مستقلة ومصممة لكل فئة: الطلاب، أعضاء هيئة التدريس، رؤساء الأقسام، إدارة النظام، والخريجين.'
                : 'Dedicated functional workspaces for students, faculty instructors, department heads, administrators, and alumni.'}
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#F7F9FC] border border-[#DCE3EB] space-y-2">
            <BookOpen size={20} className="text-[#D6A53A]" />
            <h4 className="text-sm font-bold text-[#102033]">
              {isAr ? 'تقييم ونزاهة أكاديمية' : 'Academic Evaluation & Integrity'}
            </h4>
            <p className="text-xs text-[#607086] leading-relaxed">
              {isAr
                ? 'أنظمة متطورة لإدارة الاختبارات والواجبات، ومتابعة الحضور، وتدقيق المستندات والوثائق الأكاديمية الرسمية.'
                : 'Rigorous assessment structures, verifiable grading policies, assignment submissions, and secure digital records.'}
            </p>
          </div>
        </div>
      </div>

      {/* Institutional Academic Councils (Neutral structure, no invented names or rankings) */}
      <div className="bg-white rounded-2xl border border-[#DCE3EB] p-8 shadow-xs space-y-6">
        <div>
          <span className="text-xs font-bold text-[#D6A53A] uppercase tracking-wider">
            {isAr ? 'الهيكل المؤسسي' : 'Institutional Structure'}
          </span>
          <h2 className="text-xl font-bold text-[#082B50] tracking-tight mt-1">
            {isAr ? 'المجالس والعمادات الأكاديمية' : 'Academic Councils & Deanships'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#DCE3EB] text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#082B50] text-white flex items-center justify-center mx-auto">
              <Shield size={18} />
            </div>
            <h4 className="text-xs font-bold text-[#102033]">
              {isAr ? 'مجلس الأمناء' : 'Board of Trustees'}
            </h4>
            <p className="text-[11px] text-[#607086]">
              {isAr ? 'التوجيه الإستراتيجي والحوكمة' : 'Strategic Governance'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#DCE3EB] text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#174F89] text-white flex items-center justify-center mx-auto">
              <Users size={18} />
            </div>
            <h4 className="text-xs font-bold text-[#102033]">
              {isAr ? 'المجلس الأكاديمي' : 'Academic Council'}
            </h4>
            <p className="text-[11px] text-[#607086]">
              {isAr ? 'الخطط الدراسية والمناهج' : 'Curricula & Study Plans'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#DCE3EB] text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#082B50] text-white flex items-center justify-center mx-auto">
              <BookOpen size={18} />
            </div>
            <h4 className="text-xs font-bold text-[#102033]">
              {isAr ? 'عمادة القبول والتسجيل' : 'Deanship of Admissions'}
            </h4>
            <p className="text-[11px] text-[#607086]">
              {isAr ? 'شؤون الطلاب والوثائق' : 'Student Records & Enrollment'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#DCE3EB] text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#174F89] text-white flex items-center justify-center mx-auto">
              <Award size={18} />
            </div>
            <h4 className="text-xs font-bold text-[#102033]">
              {isAr ? 'لجنة الجودة والاعتماد' : 'Quality & Accreditation Committee'}
            </h4>
            <p className="text-[11px] text-[#607086]">
              {isAr ? 'معايير البرامج والتقويم' : 'Program Evaluation & Standards'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
