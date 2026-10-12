import React from 'react';
import { Video, ShieldCheck, Laptop, Smartphone, BookOpen, MessageSquare, ClipboardList, PlayCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Locale } from '../../i18n/dictionaries';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation';

interface ElearningPlatformPageProps {
  locale: Locale;
}

export const ElearningPlatformPage: React.FC<ElearningPlatformPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const features = [
    {
      titleAr: 'محاضرات تفاعلية مباشرة',
      titleEn: 'Live Interactive Lectures',
      descAr: 'بث مباشر عالي الدقة يتيح التواصل الصوتي والمرئي، والمحادثة المباشرة مع أعضاء هيئة التدريس.',
      descEn: 'High-definition synchronous sessions with audio/video exchange and real-time interaction.',
      icon: Video,
    },
    {
      titleAr: 'أرشيف رقمي على مدار الساعة',
      titleEn: '24/7 Recorded Archives',
      descAr: 'تسجيلات كاملة لجميع المحاضرات تتاح تلقائيًا بعد انتهائها للمراجعة والاستذكار في أي وقت.',
      descEn: 'Automated archiving of all lecture sessions available on demand for review.',
      icon: PlayCircle,
    },
    {
      titleAr: 'بيئة تقييم واختبارات آمنة',
      titleEn: 'Secure Assessment Environment',
      descAr: 'منظومة اختبارات رقمية مؤمنة تدعم أسئلة الاختيار من متعدد والمقالية مع التحقق المنهجي.',
      descEn: 'Structured digital testing engine supporting multiple question types with verified grading.',
      icon: ShieldCheck,
    },
    {
      titleAr: 'تسليم ومتابعة التكليفات والواجبات',
      titleEn: 'Assignments & Coursework Submissions',
      descAr: 'رفع التكليفات بصيغ متعددة مع رصد التغذية الراجعة الأكاديمية والدرجات عبر البوابة.',
      descEn: 'Multi-format submission portal with instructor feedback and gradebook integration.',
      icon: ClipboardList,
    },
    {
      titleAr: 'منتديات النقاش الأكاديمي',
      titleEn: 'Academic Discussion Forums',
      descAr: 'مساحات مخصصة لتبادل الأسئلة والأفكار ومناقشة الموضوعات الدراسية مع الأساتذة والزملاء.',
      descEn: 'Dedicated topic boards for peer discussions, questions, and instructor clarification.',
      icon: MessageSquare,
    },
    {
      titleAr: 'توافق كامل مع مختلف الأجهزة',
      titleEn: 'Responsive Multi-Device Access',
      descAr: 'واجهة متجاوبة تعمل بسلاسة على الحواسيب الشخصية، الأجهزة اللوحية، والهواتف الذكية.',
      descEn: 'Fluid responsive design accessible across desktop browsers, tablets, and mobile devices.',
      icon: Laptop,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#082B50]/10 text-[#082B50] text-xs font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D6A53A]" />
          <span>{isAr ? 'التعليم الرقمي' : 'Digital Learning'}</span>
        </div>
        <h1 className="text-3xl font-black text-[#082B50]">
          {isAr ? 'منظومة التعلم الإلكتروني في نبا' : 'NABA Digital Learning Ecosystem'}
        </h1>
        <p className="text-xs md:text-sm text-[#607086]">
          {isAr
            ? 'بيئة تعليمية سحابية متطورة مصممة لدعم تجربة جامعية متكاملة وموثوقة عن بُعد'
            : 'A modern cloud-native academic environment built for high-performance distance higher education'}
        </p>
      </div>

      {/* Capabilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((ft, idx) => {
          const IconComp = ft.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs flex flex-col justify-between hover:border-[#174F89]/40 transition-all"
            >
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-[#082B50]/10 text-[#082B50] flex items-center justify-center">
                  <IconComp size={22} />
                </div>
                <h3 className="text-sm font-bold text-[#102033]">
                  {isAr ? ft.titleAr : ft.titleEn}
                </h3>
                <p className="text-xs text-[#607086] leading-relaxed">
                  {isAr ? ft.descAr : ft.descEn}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Access Portals Callout */}
      <div className="bg-[#061E38] text-white rounded-3xl p-8 md:p-10 text-center space-y-4 border border-[#082B50]">
        <h3 className="text-xl font-bold">
          {isAr ? 'الدخول إلى البوابات الأكاديمية' : 'Access Academic Portals'}
        </h3>
        <p className="text-xs text-white/80 max-w-lg mx-auto leading-relaxed">
          {isAr
            ? 'سجّل دخولك بحسابك الجامعي للوصول إلى مقرراتك وجدولك الدراسي والتفاعل مع المحاضرات.'
            : 'Sign in with your institutional credentials to access your courses, schedule, and learning activities.'}
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            to={`/${locale}/auth/login`}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#D6A53A] hover:bg-[#c4942e] text-[#061E38] rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            <span>{isAr ? 'تسجيل الدخول' : 'Sign In'}</span>
            <ArrowIcon size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};
