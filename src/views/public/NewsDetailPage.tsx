import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Newspaper, ArrowRight, ArrowLeft } from 'lucide-react';
import { Locale } from '../../i18n/dictionaries';
import { useTranslation } from '../../i18n/useTranslation';

interface NewsDetailPageProps {
  locale: Locale;
}

export const NewsDetailPage: React.FC<NewsDetailPageProps> = ({ locale }) => {
  const { newsId } = useParams<{ newsId: string }>();
  const { isAr } = useTranslation();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-16 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#607086]">
        <Link to={`/${locale}`} className="hover:text-[#082B50]">
          {isAr ? 'الرئيسية' : 'Home'}
        </Link>
        <span>/</span>
        <Link to={`/${locale}/news`} className="hover:text-[#082B50]">
          {isAr ? 'المركز الإعلامي' : 'News'}
        </Link>
        <span>/</span>
        <span className="text-[#082B50] font-bold">
          {newsId || (isAr ? 'تفاصيل الخبر' : 'News Article')}
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-[#DCE3EB] p-8 md:p-12 shadow-xs text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-[#082B50]/10 text-[#082B50] flex items-center justify-center mx-auto">
          <Newspaper size={32} />
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <h2 className="text-lg font-bold text-[#102033]">
            {isAr ? 'الخبر غير متوفر حاليًا' : 'Article Currently Unavailable'}
          </h2>
          <p className="text-xs text-[#607086] leading-relaxed">
            {isAr
              ? 'لم يتم العثور على محتوى معتمد لهذا المعرّف، أو أن الخبر قيد المراجعة في نظام إدارة المحتوى.'
              : 'No verified editorial release is associated with this identifier in the current CMS registry.'}
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <Link
            to={`/${locale}/news`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#082B50] hover:bg-[#061E38] text-white text-xs font-bold transition-colors shadow-xs"
          >
            <span>{isAr ? 'العودة لصفحة الأخبار' : 'Back to News Index'}</span>
            <ArrowIcon size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};
