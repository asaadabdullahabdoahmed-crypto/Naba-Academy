import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Layers,
  GraduationCap,
  Clock,
  Headphones,
  Video,
  FileCheck2,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  FolderArchive,
  Laptop,
  Users,
  MessageSquare,
  ClipboardList,
  PlayCircle,
  Tv,
  Compass,
  FileText,
  Search,
  Award,
} from 'lucide-react';
import { Locale } from '../../i18n/dictionaries';
import { useTranslation } from '../../i18n/useTranslation';
import { ASSET_IMAGES } from '../../assets/branding/images';
import { NabaLogo } from '../../components/common/NabaLogo';

interface HomePageProps {
  locale: Locale;
  onOpenRouteVerifier?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // 8 E-Learning Capability Bar Items
  const capabilityBarItems = [
    {
      icon: Tv,
      titleAr: 'محاضرات مباشرة',
      titleEn: 'Live Lectures',
      subAr: 'تفاعل مع أساتذة مباشرة',
      subEn: 'Direct faculty interaction',
    },
    {
      icon: PlayCircle,
      titleAr: 'محاضرات مسجلة',
      titleEn: 'Recorded Lectures',
      subAr: 'شاهد في أي وقت',
      subEn: 'Watch anytime 24/7',
    },
    {
      icon: BookOpen,
      titleAr: 'مكتبة رقمية',
      titleEn: 'Digital Library',
      subAr: 'مصادر متنوعة وغنية',
      subEn: 'Rich scholarly sources',
    },
    {
      icon: FileCheck2,
      titleAr: 'اختبارات إلكترونية',
      titleEn: 'Online Exams',
      subAr: 'قيم مستواك أونلاين',
      subEn: 'Secure digital testing',
    },
    {
      icon: ClipboardList,
      titleAr: 'واجبات ومهام',
      titleEn: 'Assignments',
      subAr: 'سجل واجباتك بسهولة',
      subEn: 'Submit coursework easily',
    },
    {
      icon: MessageSquare,
      titleAr: 'منتديات نقاش',
      titleEn: 'Discussion Forums',
      subAr: 'تبادل الخبرات والأفكار',
      subEn: 'Peer & faculty exchange',
    },
    {
      icon: Headphones,
      titleAr: 'دعم الطلاب',
      titleEn: 'Student Support',
      subAr: 'مساعدة مستمرة',
      subEn: 'Continuous assistance',
    },
    {
      icon: Users,
      titleAr: 'فصول افتراضية',
      titleEn: 'Virtual Classrooms',
      subAr: 'تعلم بتقنية متقدمة',
      subEn: 'Advanced learning tech',
    },
  ];

  // Conceptual 6-Step Distance Learning Workflow
  const learningJourney = [
    {
      step: '01',
      icon: FileText,
      titleAr: 'القبول والتسجيل',
      titleEn: 'Enrollment',
      descAr: 'تقديم الطلب الإلكتروني واستلام الحساب الجامعي.',
      descEn: 'Online application and account activation.',
    },
    {
      step: '02',
      icon: Laptop,
      titleAr: 'الوصول للمقررات',
      titleEn: 'Course Access',
      descAr: 'استعراض المقررات المسجلة والخطط والمراجع.',
      descEn: 'Access enrolled course syllabus and learning materials.',
    },
    {
      step: '03',
      icon: Video,
      titleAr: 'المحتوى والمحاضرات',
      titleEn: 'Learning Content',
      descAr: 'حضور الفصول الافتراضية ومتابعة المحاضرات المسجلة.',
      descEn: 'Attend live virtual classes and access recorded lectures.',
    },
    {
      step: '04',
      icon: ClipboardList,
      titleAr: 'الواجبات والتكليفات',
      titleEn: 'Assignments & Quizzes',
      descAr: 'تسليم الواجبات الدراسية وأداء التقييمات الدورية.',
      descEn: 'Submit regular coursework and complete module quizzes.',
    },
    {
      step: '05',
      icon: FileCheck2,
      titleAr: 'الاختبارات الإلكترونية',
      titleEn: 'Digital Exams',
      descAr: 'أداء الاختبارات عبر المنصة الإلكترونية المخصصة.',
      descEn: 'Complete examinations through the digital assessment platform.',
    },
    {
      step: '06',
      icon: Award,
      titleAr: 'النتائج والتوثيق',
      titleEn: 'Academic Results',
      descAr: 'متابعة السجل الأكاديمي والدرجات الرسمية.',
      descEn: 'Review official grades and academic progress.',
    },
  ];

  // Neutral Descriptive FAQs
  const faqs = [
    {
      qAr: 'ما هي طبيعة الدراسة في أكاديمية نبا؟',
      qEn: 'What is the mode of study at NABA Academy?',
      aAr: 'تعتمد أكاديمية نبا نموذج التعليم الإلكتروني والتعليم عن بعد، حيث يتلقى الطلاب المحاضرات عبر الفصول الافتراضية والمنصات الرقمية التفاعلية.',
      aEn: 'NABA Academy operates on an e-learning and distance education model, delivering coursework through interactive virtual classrooms and digital platforms.',
    },
    {
      qAr: 'كيف يتم إجراء الاختبارات والتقييمات؟',
      qEn: 'How are examinations and evaluations conducted?',
      aAr: 'تُجرى التقييمات عبر منصة الاختبارات الإلكترونية المخصصة وفق المعايير الأكاديمية المنظمة للمقررات.',
      aEn: 'Assessments are conducted through a dedicated digital platform in accordance with academic guidelines.',
    },
    {
      qAr: 'كيف يمكن للطالب التواصل مع أعضاء هيئة التدريس؟',
      qEn: 'How do students communicate with faculty members?',
      aAr: 'توفر المنصة أدوات تواصل تشمل الساعات المكتبية الافتراضية ونظام الرسائل الأكاديمية والمنتديات الدراسية.',
      aEn: 'The platform provides communication tools including virtual office hours, academic messaging, and course forums.',
    },
    {
      qAr: 'هل تتوفر خدمات الإرشاد الأكاديمي والدعم الفني؟',
      qEn: 'Are academic advising and support services available?',
      aAr: 'نعم، توفر المنصة قنوات للتواصل مع المرشدين الأكاديميين وفريق الدعم الفني للمستفيدين.',
      aEn: 'Yes, the platform provides dedicated channels for academic advising and technical assistance.',
    },
  ];

  return (
    <div className="bg-[#F7F9FC] text-[#102033] min-h-screen">
      {/* 1. HERO SECTION (Light & Open Composition with Decorative Graduate Imagery) */}
      <section className="relative bg-linear-to-b from-[#EFF3F8] to-[#F7F9FC] pt-12 pb-16 md:pt-16 md:pb-24 border-b border-[#DCE3EB] overflow-hidden">
        {/* Subtle Background Watermarks */}
        <div className="absolute top-0 end-0 w-96 h-96 bg-[#D6A53A]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 start-0 w-96 h-96 bg-[#082B50]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Right Column (in RTL): Hero Text & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-start">
              {/* Institution Crest Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#DCE3EB] shadow-2xs">
                <NabaLogo size="sm" variant="dark" showSubtitle={false} showText={false} />
                <span className="text-xs font-bold text-[#082B50]">
                  {isAr ? 'أكاديمية نبا • NABA Academy' : 'NABA Academy • أكاديمية نبا'}
                </span>
              </div>

              {/* Main Headline */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-black text-[#082B50] tracking-tight leading-tight">
                  {isAr ? (
                    <>
                      تعليم إلكتروني .. بلا حدود <br />
                      <span className="text-[#D6A53A]">بناء مستقبلك يبدأ من هنا</span>
                    </>
                  ) : (
                    <>
                      E-Learning Without Boundaries <br />
                      <span className="text-[#D6A53A]">Building Your Future Starts Here</span>
                    </>
                  )}
                </h1>
              </div>

              {/* Subtitle (Neutral General Copy) */}
              <p className="text-sm md:text-base text-[#607086] leading-relaxed max-w-xl font-normal">
                {isAr
                  ? 'تعلم عن بعد مع بيئة تعليمية تفاعلية، وبرامج تعليمية متخصصة، تلبي تطلعاتك وتواكب متطلبات المستقبل وتدعم مسيرتك الأكاديمية بمرونة.'
                  : 'Distance learning with an interactive educational environment and specialized academic programs designed for flexible higher education.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to={`/${locale}/auth/register`}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#D6A53A] hover:bg-[#B88725] text-[#061E38] font-black text-xs md:text-sm transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  <GraduationCap size={18} />
                  <span>{isAr ? 'ابدأ رحلتك التعليمية' : 'Start Your Learning Journey'}</span>
                </Link>

                <Link
                  to={`/${locale}/programs`}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#082B50] hover:bg-[#061E38] text-white font-bold text-xs md:text-sm transition-all shadow-sm cursor-pointer"
                >
                  <Compass size={17} className="text-[#D6A53A]" />
                  <span>{isAr ? 'استكشف البرامج' : 'Explore Programs'}</span>
                </Link>
              </div>

              {/* General Descriptive Features (Neutral, no unverified accreditation claims) */}
              <div className="pt-4 flex flex-wrap items-center gap-4 text-xs text-[#607086]">
                <div className="flex items-center gap-1.5 font-semibold text-[#082B50]">
                  <CheckCircle2 size={15} className="text-[#198754]" />
                  <span>{isAr ? 'تعليم إلكتروني مرن' : 'Flexible E-Learning'}</span>
                </div>
                <span className="text-[#DCE3EB]">|</span>
                <div className="flex items-center gap-1.5 font-semibold text-[#082B50]">
                  <CheckCircle2 size={15} className="text-[#198754]" />
                  <span>{isAr ? 'مرونة كاملة في المتابعة' : 'Flexible Study Schedule'}</span>
                </div>
                <span className="text-[#DCE3EB]">|</span>
                <div className="flex items-center gap-1.5 font-semibold text-[#082B50]">
                  <CheckCircle2 size={15} className="text-[#198754]" />
                  <span>{isAr ? 'منصة اختبارات إلكترونية' : 'Digital Assessment Platform'}</span>
                </div>
              </div>
            </div>

            {/* Left Column (in RTL): Decorative Graduate Imagery */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md lg:max-w-none">
                {/* Main Graduates Photo Container with Required Respectful Alt Text */}
                <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-white">
                  <img
                    src={ASSET_IMAGES.heroGraduates}
                    alt={
                      isAr
                        ? 'صورة تعبيرية عن التعلم والإنجاز الأكاديمي'
                        : 'Illustrative image representing learning and academic achievement'
                    }
                    className="w-full h-auto object-cover max-h-[460px]"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-[#082B50]/30 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Floating Academic Badge (Neutral) */}
                <div className="absolute -bottom-4 start-4 sm:start-8 bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-[#DCE3EB] shadow-lg flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#082B50] text-[#D6A53A] flex items-center justify-center shrink-0">
                    <Laptop size={20} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#082B50]">
                      {isAr ? 'بيئة تعليمية رقمية' : 'Digital Learning Environment'}
                    </h5>
                    <p className="text-[10px] text-[#607086]">
                      {isAr ? 'فصول ومحاضرات تفاعلية' : 'Interactive classes & coursework'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. E-LEARNING CAPABILITY HORIZONTAL BAR (DEEP NAVY STRIP) */}
      <section className="bg-[#082B50] text-white py-6 border-y border-[#061E38] shadow-inner">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 text-center">
            {capabilityBarItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center p-2 rounded-xl hover:bg-white/5 transition-colors group cursor-default"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/10 group-hover:bg-[#D6A53A] text-[#D6A53A] group-hover:text-[#061E38] flex items-center justify-center mb-2 transition-all">
                    <Icon size={20} />
                  </div>
                  <h4 className="text-xs font-bold text-white mb-0.5 truncate w-full">
                    {isAr ? item.titleAr : item.titleEn}
                  </h4>
                  <p className="text-[10px] text-white/70 line-clamp-1">
                    {isAr ? item.subAr : item.subEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. OFFICIAL ANNOUNCEMENT / CMS BANNER AREA (HONEST NEUTRAL EMPTY STATE) */}
      <section className="py-8 bg-white border-b border-[#DCE3EB]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="p-4 sm:p-5 rounded-xl bg-[#EFF3F8] border border-[#DCE3EB] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-start">
              <div className="w-9 h-9 rounded-lg bg-[#082B50] text-[#D6A53A] flex items-center justify-center shrink-0">
                <Calendar size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#082B50]">
                  {isAr ? 'الإعلانات والتعاميم الأكاديمية' : 'Announcements & Academic Notices'}
                </h4>
                <p className="text-[11px] text-[#607086] mt-0.5">
                  {isAr
                    ? 'لا توجد إعلانات أو تعاميم متاحة للعرض حاليًا.'
                    : 'No announcements or notices are currently available to display.'}
                </p>
              </div>
            </div>

            <Link
              to={`/${locale}/calendar`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-[#F7F9FC] border border-[#DCE3EB] text-[#082B50] text-xs font-bold transition-colors self-end md:self-auto shrink-0"
            >
              <span>{isAr ? 'التقويم الأكاديمي' : 'Academic Calendar'}</span>
              <ArrowIcon size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. ABOUT NABA ACADEMY */}
      <section className="py-14 md:py-20 border-b border-[#DCE3EB] bg-[#F7F9FC]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <div className="inline-block text-xs font-bold text-[#D6A53A] uppercase tracking-wider mb-2">
                {isAr ? 'عن الأكاديمية' : 'About NABA Academy'}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#082B50] tracking-tight mb-4">
                {isAr
                  ? 'تعليم جامعي رقمي يجمع بين الرصانة ومرونة التقنية'
                  : 'Digital higher education combining academic focus and technological flexibility'}
              </h2>
              <p className="text-xs md:text-sm text-[#607086] leading-relaxed mb-4">
                {isAr
                  ? 'تأسست أكاديمية نبا لتقديم برامج التعليم الإلكتروني عن بعد، مرتكزة على نظم حديثة لإدارة التعلم والتقييم الرقمي المستمر.'
                  : 'NABA Academy was established to deliver digital distance learning programs, utilizing modern learning management and continuous evaluation systems.'}
              </p>
              <p className="text-xs md:text-sm text-[#607086] leading-relaxed mb-6">
                {isAr
                  ? 'تهدف المنصة إلى تيسير الوصول إلى المعرفة الأكاديمية وتمكين الدارسين من تحقيق أهدافهم العلمية عبر بيئة تفاعلية.'
                  : 'The platform aims to facilitate access to academic knowledge, empowering students to achieve their educational goals through an interactive environment.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white border border-[#DCE3EB]">
                  <h4 className="text-xs font-bold text-[#082B50] mb-1">
                    {isAr ? 'الرسالة الأكاديمية' : 'Academic Mission'}
                  </h4>
                  <p className="text-[11px] text-[#607086] leading-relaxed">
                    {isAr
                      ? 'تقديم تعليم إلكتروني يدعم تنمية المعرفة التخصصية والمهارات الأكاديمية.'
                      : 'Delivering e-learning that supports specialized knowledge and academic skills.'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#DCE3EB]">
                  <h4 className="text-xs font-bold text-[#082B50] mb-1">
                    {isAr ? 'الرؤية المستقبلية' : 'Future Vision'}
                  </h4>
                  <p className="text-[11px] text-[#607086] leading-relaxed">
                    {isAr
                      ? 'الريادة والتميز في حلول التعليم الجامعي الإلكتروني والتعلم عن بعد.'
                      : 'Leadership in digital higher education and distance learning solutions.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Educational Governance Visual Panel */}
            <div className="p-6 md:p-8 rounded-2xl bg-[#082B50] text-white border border-[#061E38] shadow-md">
              <h3 className="text-base md:text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ShieldCheck size={20} className="text-[#D6A53A]" />
                <span>{isAr ? 'معايير المنظومة التعليمية' : 'Educational Standards'}</span>
              </h3>
              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3 pb-3 border-b border-white/10">
                  <span className="w-6 h-6 rounded-md bg-[#D6A53A] text-[#061E38] flex items-center justify-center font-bold text-[11px] shrink-0">
                    1
                  </span>
                  <div>
                    <h5 className="font-bold text-white mb-0.5">
                      {isAr ? 'إدارة الخطط والمناهج' : 'Curricula Management'}
                    </h5>
                    <p className="text-white/70 text-[11px] leading-relaxed">
                      {isAr
                        ? 'إشراف أكاديمي مباشر على إعداد الخطط الدراسية وتوصيف المقررات.'
                        : 'Academic supervision over course syllabi and degree plans.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pb-3 border-b border-white/10">
                  <span className="w-6 h-6 rounded-md bg-[#D6A53A] text-[#061E38] flex items-center justify-center font-bold text-[11px] shrink-0">
                    2
                  </span>
                  <div>
                    <h5 className="font-bold text-white mb-0.5">
                      {isAr ? 'فصول افتراضية تفاعلية' : 'Interactive Virtual Sessions'}
                    </h5>
                    <p className="text-white/70 text-[11px] leading-relaxed">
                      {isAr
                        ? 'ربط مباشر بين المحاضرات الحية والمصادر الإثرائية المسجلة.'
                        : 'Direct connection between live lectures and recorded learning resources.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-md bg-[#D6A53A] text-[#061E38] flex items-center justify-center font-bold text-[11px] shrink-0">
                    3
                  </span>
                  <div>
                    <h5 className="font-bold text-white mb-0.5">
                      {isAr ? 'أنظمة التقييم والتوثيق' : 'Assessment & Records System'}
                    </h5>
                    <p className="text-white/70 text-[11px] leading-relaxed">
                      {isAr
                        ? 'توثيق دقيق لكافة الأنشطة الأكاديمية ونتائج التقييم الإلكتروني.'
                        : 'Precise records for all academic activities and assessment results.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ACADEMIC PROGRAMS SECTION (CORRECTED EMPTY STATE) */}
      <section className="py-14 md:py-20 bg-white border-b border-[#DCE3EB]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-block text-xs font-bold text-[#D6A53A] uppercase tracking-wider mb-2">
                {isAr ? 'الدليل الأكاديمي' : 'Academic Directory'}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#082B50] tracking-tight">
                {isAr ? 'البرامج والخطط الدراسية' : 'Programs & Curricula'}
              </h2>
            </div>
            <Link
              to={`/${locale}/programs`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#082B50] hover:text-[#174F89] transition-colors self-start md:self-auto"
            >
              <span>{isAr ? 'عرض دليل البرامج' : 'View Programs Directory'}</span>
              <ArrowIcon size={14} />
            </Link>
          </div>

          {/* Corrected Neutral Empty State: No invented operational facts */}
          <div className="bg-[#F7F9FC] rounded-2xl border border-[#DCE3EB] p-8 md:p-12 text-center max-w-2xl mx-auto shadow-xs">
            <div className="w-14 h-14 rounded-xl bg-white text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
              <Layers size={26} />
            </div>
            <h3 className="text-base md:text-lg font-bold text-[#102033] mb-2">
              {isAr ? 'لا توجد برامج متاحة للعرض حاليًا' : 'No programs are currently available to display.'}
            </h3>
            <p className="text-xs text-[#607086] leading-relaxed max-w-lg mx-auto mb-6">
              {isAr
                ? 'ستظهر البرامج والخطط الدراسية هنا عند توفرها في النظام الأكاديمي.'
                : 'Programs and curricula will appear here once available in the academic system.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                to={`/${locale}/admissions`}
                className="px-4 py-2.5 rounded-lg bg-[#082B50] text-white hover:bg-[#061E38] text-xs font-bold transition-colors"
              >
                {isAr ? 'معلومات القبول والتسجيل' : 'Admissions Information'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CONCEPTUAL DISTANCE LEARNING JOURNEY */}
      <section className="py-14 md:py-20 border-b border-[#DCE3EB] bg-[#EFF3F8]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-block text-xs font-bold text-[#D6A53A] uppercase tracking-wider mb-2">
              {isAr ? 'رحلة التعلم عن بعد' : 'Distance Learning Journey'}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#082B50] tracking-tight">
              {isAr ? 'المسار التعليمي الرقمي' : 'The Digital Academic Path'}
            </h2>
            <p className="text-xs md:text-sm text-[#607086] mt-2 leading-relaxed">
              {isAr
                ? 'مراحل متكاملة تضمن تجربة تعليمية واضحة من التقديم وحتى التخرج.'
                : 'Clear operational stages from initial admission to academic graduation.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {learningJourney.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-xl border border-[#DCE3EB] shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="text-xl font-black text-[#D6A53A] mb-2">{step.step}</div>
                    <div className="w-8 h-8 rounded-lg bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mb-3">
                      <Icon size={16} />
                    </div>
                    <h4 className="text-xs font-bold text-[#082B50] mb-1">
                      {isAr ? step.titleAr : step.titleEn}
                    </h4>
                    <p className="text-[11px] text-[#607086] leading-relaxed">
                      {isAr ? step.descAr : step.descEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. NEWS & CMS SECTION (CORRECTED EMPTY STATE) */}
      <section className="py-14 md:py-20 bg-white border-b border-[#DCE3EB]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-block text-xs font-bold text-[#D6A53A] uppercase tracking-wider mb-2">
                {isAr ? 'المركز الإعلامي' : 'Media & News Center'}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#082B50] tracking-tight">
                {isAr ? 'الأخبار والفعاليات الأكاديمية' : 'Academic News & Notices'}
              </h2>
            </div>
            <Link
              to={`/${locale}/news`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#082B50] hover:text-[#174F89] transition-colors self-start md:self-auto"
            >
              <span>{isAr ? 'أرشيف الأخبار' : 'News Archive'}</span>
              <ArrowIcon size={14} />
            </Link>
          </div>

          <div className="p-8 rounded-xl bg-[#F7F9FC] border border-[#DCE3EB] text-center max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-lg bg-white text-[#607086] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
              <Calendar size={22} />
            </div>
            <h4 className="text-sm font-bold text-[#102033] mb-1">
              {isAr ? 'لا توجد أخبار أو إعلانات متاحة للعرض حاليًا' : 'No news or announcements are currently available to display.'}
            </h4>
            <p className="text-xs text-[#607086]">
              {isAr
                ? 'ستظهر الأخبار والبيانات الرسمية هنا عند نشرها في النظام.'
                : 'Official news and updates will appear here once published in the system.'}
            </p>
          </div>
        </div>
      </section>

      {/* 8. DIGITAL LIBRARY OVERVIEW */}
      <section className="py-14 md:py-20 border-b border-[#DCE3EB] bg-[#F7F9FC]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="p-8 md:p-12 rounded-2xl bg-[#082B50] text-white flex flex-col lg:flex-row items-center justify-between gap-8 shadow-lg">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#061E38] text-[#D6A53A] text-xs font-semibold mb-4 border border-[#D6A53A]/30">
                <BookOpen size={14} />
                <span>{isAr ? 'المستودع المعرفي الرقمي' : 'Digital Knowledge Repository'}</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                {isAr ? 'المكتبة الأكاديمية الرقمية' : 'The Academic Digital Library'}
              </h3>
              <p className="text-xs md:text-sm text-white/80 leading-relaxed">
                {isAr
                  ? 'توفر أكاديمية نبا مستودعاً رقمياً يضم المراجع والمقررات الدراسية والأبحاث العلمية لتيسير البحث والتعلم المستقل للطلاب والباحثين.'
                  : 'NABA Academy maintains a digital repository of course textbooks, academic references, and scholarly resources supporting self-paced research.'}
              </p>
            </div>
            <div className="shrink-0">
              <Link
                to={`/${locale}/library`}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#D6A53A] hover:bg-[#B88725] text-[#061E38] font-black text-xs md:text-sm transition-colors shadow-sm"
              >
                <span>{isAr ? 'دخول المكتبة الرقمية' : 'Access Digital Library'}</span>
                <ArrowIcon size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQS & INQUIRIES */}
      <section className="py-14 md:py-20 bg-white border-b border-[#DCE3EB]">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <div className="inline-block text-xs font-bold text-[#D6A53A] uppercase tracking-wider mb-2">
              {isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#082B50] tracking-tight">
              {isAr ? 'إجابات على الاستفسارات الأكاديمية الشائعة' : 'Answers to Frequently Asked Questions'}
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-[#DCE3EB] bg-[#F7F9FC] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 text-start font-bold text-xs md:text-sm text-[#082B50] flex items-center justify-between gap-4 cursor-pointer hover:bg-[#EFF3F8] transition-colors"
                  >
                    <span>{isAr ? faq.qAr : faq.qEn}</span>
                    <HelpCircle size={16} className={`shrink-0 ${isOpen ? 'text-[#D6A53A]' : 'text-[#607086]'}`} />
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-[#607086] leading-relaxed border-t border-[#DCE3EB]/40 bg-white">
                      {isAr ? faq.aAr : faq.aEn}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10. ADMISSIONS & CONTACT BANNER (CORRECTED: NO HARDCODED UNVERIFIED PHONE/EMAIL) */}
      <section className="py-12 bg-[#EFF3F8]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 md:p-8 rounded-2xl bg-white border border-[#DCE3EB] shadow-xs">
            <div>
              <h3 className="text-base md:text-lg font-bold text-[#082B50] mb-1">
                {isAr ? 'مركز الاستفسارات والدعم الأكاديمي' : 'Academic Support & Inquiries Desk'}
              </h3>
              <p className="text-xs text-[#607086]">
                {isAr
                  ? 'يمكن للطلبة والمتقدمين التواصل مع فريق الدعم الأكاديمي عبر بوابة التواصل الرسمية.'
                  : 'Students and applicants may submit academic inquiries through the official portal.'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to={`/${locale}/contact`}
                className="px-5 py-2.5 rounded-lg bg-[#082B50] hover:bg-[#061E38] text-white text-xs font-bold transition-colors"
              >
                {isAr ? 'الانتقال إلى بوابة التواصل' : 'Go to Contact Portal'}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
