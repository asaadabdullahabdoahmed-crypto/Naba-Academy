import React from 'react';
import { Newspaper, Bell, Calendar, ArrowRight, ArrowLeft } from 'lucide-react';
import { Locale } from '../../i18n/dictionaries';
import { useTranslation } from '../../i18n/useTranslation';
import { Link } from 'react-router-dom';

interface NewsPageProps {
  locale: Locale;
}

export const NewsPage: React.FC<NewsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#082B50]/10 text-[#082B50] text-xs font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D6A53A]" />
          <span>{isAr ? 'المركز الإعلامي' : 'Media Center'}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-[#082B50] tracking-tight">
          {isAr ? 'الأخبار والإعلانات الرسمية' : 'Official News & Announcements'}
        </h1>
        <p className="text-xs md:text-sm text-[#607086]">
          {isAr
            ? 'متابعة أحدث المستجدات والفعاليات والإعلانات الأكاديمية الصادرة عن أكاديمية نبا'
            : 'Stay updated with official institutional announcements and academic notices from NABA Academy'}
        </p>
      </div>

      {/* Institutional Empty State (No fabricated articles or fake achievements) */}
      <div className="bg-white rounded-3xl border border-[#DCE3EB] p-10 md:p-14 text-center space-y-5 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-[#082B50]/10 text-[#082B50] flex items-center justify-center mx-auto">
          <Newspaper size={32} />
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-lg font-bold text-[#102033]">
            {isAr ? 'لا توجد أخبار منشورة حاليًا' : 'No Published Announcements at Present'}
          </h3>
          <p className="text-xs text-[#607086] leading-relaxed">
            {isAr
              ? 'تتم إدارة ونشر الأخبار الرسمية والإعلانات الأكاديمية عبر نظام إدارة المحتوى (CMS) فور اعتمادها من المركز الإعلامي.'
              : 'Institutional news and media releases are published through the CMS upon official editorial authorization.'}
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <Link
            to={`/${locale}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#082B50] hover:bg-[#061E38] text-white text-xs font-bold transition-colors shadow-xs"
          >
            <span>{isAr ? 'العودة للرئيسية' : 'Back to Home'}</span>
            <ArrowIcon size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};
