import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  Library,
  MonitorPlay,
  ShieldCheck,
} from 'lucide-react';
import { Locale } from '../../i18n/dictionaries';
import { useTranslation } from '../../i18n/useTranslation';
import { ASSET_IMAGES } from '../../assets/branding/images';

interface HomePageProps {
  locale: Locale;
  onOpenRouteVerifier?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const services = [
    {
      icon: BookOpen,
      title: isAr ? 'المقررات الدراسية' : 'Courses',
      description: isAr ? 'اطلع على مقرراتك وموادها التعليمية.' : 'View your courses and learning materials.',
      to: `/${locale}/student/courses`,
    },
    {
      icon: CalendarDays,
      title: isAr ? 'الجدول الدراسي' : 'Academic schedule',
      description: isAr ? 'تابع المحاضرات والنشاطات المعروضة.' : 'Review lectures and scheduled activities.',
      to: `/${locale}/student/schedule`,
    },
    {
      icon: MonitorPlay,
      title: isAr ? 'المحاضرات' : 'Lectures',
      description: isAr ? 'ادخل إلى المحاضرات والمحتوى المتاح.' : 'Access lectures and available learning content.',
      to: `/${locale}/student/lectures`,
    },
    {
      icon: ClipboardCheck,
      title: isAr ? 'الواجبات والاختبارات' : 'Assignments and exams',
      description: isAr ? 'راجع المهام والتقييمات المدرجة في حسابك.' : 'Review tasks and assessments in your account.',
      to: `/${locale}/student/assignments`,
    },
    {
      icon: Library,
      title: isAr ? 'المكتبة الرقمية' : 'Digital library',
      description: isAr ? 'استكشف مصادر المكتبة المتاحة للزيارة.' : 'Explore public library resources.',
      to: `/${locale}/library`,
    },
    {
      icon: ShieldCheck,
      title: isAr ? 'الدعم الأكاديمي' : 'Academic support',
      description: isAr ? 'أرسل طلبًا أو تواصل عبر مسارات الدعم.' : 'Submit a request or use available support routes.',
      to: `/${locale}/student/support`,
    },
  ];

  const reasons = [
    {
      icon: MonitorPlay,
      title: isAr ? 'تجربة تعليمية منظمة' : 'Organized learning',
      text: isAr ? 'تجميع المقررات والمحاضرات والمهام ضمن رحلة أكاديمية واضحة.' : 'Courses, lectures, and tasks in a clear academic experience.',
    },
    {
      icon: BookOpen,
      title: isAr ? 'واجهة عربية سهلة' : 'Accessible Arabic interface',
      text: isAr ? 'تنقل مريح مع دعم كامل لاتجاه القراءة من اليمين إلى اليسار.' : 'Comfortable navigation with full right-to-left support.',
    },
    {
      icon: GraduationCap,
      title: isAr ? 'متابعة الأنشطة الأكاديمية' : 'Academic activity tracking',
      text: isAr ? 'صفحات مخصصة للنتائج والجدول والتسجيل والملف الأكاديمي.' : 'Dedicated pages for records, schedule, registration, and profile.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#1E293B]">
      <section className="px-4 pb-12 pt-6 md:px-6 md:pb-16 md:pt-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[24px] bg-[#09294D] text-white">
          <div className="grid items-center lg:grid-cols-12">
            <div className="px-6 py-10 sm:px-10 lg:col-span-7 lg:px-14 lg:py-16">
              <h1 className="max-w-xl text-[clamp(2rem,6vw,3.25rem)] font-black leading-[1.25]">
                {isAr ? 'مستقبلك يبدأ من هنا' : 'Your future starts here'}
              </h1>
              <p className="mt-5 max-w-xl text-[15px] leading-8 text-white/80 sm:text-base">
                {isAr
                  ? 'اكتشف تجربة تعليمية حديثة تساعدك على تنظيم دراستك، والوصول إلى مقرراتك، ومتابعة رحلتك الأكاديمية بسهولة.'
                  : 'Discover a modern learning experience that helps you organize study, access courses, and follow your academic journey.'}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to={`/${locale}/programs`}
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#0284C7] px-5 text-sm font-bold text-white transition-colors hover:bg-[#0369A1]"
                >
                  <span>{isAr ? 'استكشف المقررات' : 'Explore courses'}</span>
                  <ArrowIcon size={17} aria-hidden="true" />
                </Link>
                <Link
                  to={`/${locale}/auth/login`}
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/30 px-5 text-sm font-bold text-white transition-colors hover:bg-white/10"
                >
                  {isAr ? 'تسجيل الدخول' : 'Sign in'}
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5">
              <img
                src={ASSET_IMAGES.heroGraduates}
                alt={isAr ? 'طلاب يتعاونون في بيئة أكاديمية' : 'Students collaborating in an academic setting'}
                className="h-72 w-full object-cover lg:h-[440px]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="max-w-2xl">
            <h2 className="text-[clamp(1.5rem,4vw,2rem)] font-black text-[#09294D]">
              {isAr ? 'كل ما تحتاجه في مكان واحد' : 'Everything you need in one place'}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#64748B]">
              {isAr
                ? 'خدمات تعليمية وأكاديمية تساعدك على متابعة رحلتك الدراسية.'
                : 'Academic services that help you follow your learning journey.'}
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Link
                  key={service.title}
                  to={service.to}
                  className="rounded-[14px] border border-[#CBD5E1] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#0284C7]/50 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0284C7]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#E0F2FE] text-[#0284C7]">
                    <Icon size={21} aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-[#1E293B]">{service.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#64748B]">{service.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid items-center gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 className="text-[clamp(1.5rem,4vw,2rem)] font-black text-[#09294D]">
                {isAr ? 'لماذا أكاديمية نبأ؟' : 'Why NABA Academy?'}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-[#64748B]">
                {isAr
                  ? 'منصة أكاديمية حديثة تجمع الأدوات المتاحة للطلاب وأعضاء هيئة التدريس والإداريين.'
                  : 'A modern academic platform for student, faculty, and administrative tools.'}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {reasons.map((reason) => {
                const Icon = reason.icon;
                return (
                  <div key={reason.title} className="rounded-[14px] border border-[#CBD5E1] bg-white p-5">
                    <Icon size={22} className="text-[#0284C7]" aria-hidden="true" />
                    <h3 className="mt-4 font-bold text-[#1E293B]">{reason.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#64748B]">{reason.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
