import React, { useState } from 'react';
import { Search, BookOpen, FileText, ArrowRight, ArrowLeft } from 'lucide-react';
import { Locale } from '../../i18n/dictionaries';
import { useTranslation } from '../../i18n/useTranslation';
import { Link } from 'react-router-dom';

interface PublicLibraryPageProps {
  locale: Locale;
}

export const PublicLibraryPage: React.FC<PublicLibraryPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#082B50]/10 text-[#082B50] text-xs font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D6A53A]" />
          <span>{isAr ? 'المصادر الرقمية' : 'Digital Resources'}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-[#082B50] tracking-tight">
          {isAr ? 'المكتبة الأكاديمية الرقمية' : 'Digital Academic Library'}
        </h1>
        <p className="text-xs md:text-sm text-[#607086]">
          {isAr
            ? 'بوابة المصادر المعرفية والكتب المنهجية والمراجع العلمية المعتمدة لطلاب وباحثي الأكاديمية'
            : 'Access scholarly textbooks, syllabi references, and digital research archives at NABA Academy'}
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-[#DCE3EB] shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { key: 'ALL', labelAr: 'كافة المصادر', labelEn: 'All Resources' },
            { key: 'BOOKS', labelAr: 'الكتب المنهجية', labelEn: 'Textbooks' },
            { key: 'PAPERS', labelAr: 'الأوراق البحثية', labelEn: 'Research Papers' },
            { key: 'THESES', labelAr: 'الرسائل الجامعية', labelEn: 'Theses & Dissertations' },
          ].map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.key
                  ? 'bg-[#082B50] text-white shadow-xs'
                  : 'bg-[#F7F9FC] hover:bg-[#EFF3F8] text-[#607086] border border-[#DCE3EB]'
              }`}
            >
              {isAr ? cat.labelAr : cat.labelEn}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-[#607086]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? 'البحث في الفهرس الرقمي...' : 'Search digital library index...'}
            className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl ps-9 pe-3 py-2 text-xs text-[#102033] placeholder-[#607086] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
          />
        </div>
      </div>

      {/* Institutional Pending Index State (No invented books, authors or fake file sizes) */}
      <div className="bg-white rounded-3xl border border-[#DCE3EB] p-10 md:p-14 text-center space-y-5 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-[#082B50]/10 text-[#082B50] flex items-center justify-center mx-auto">
          <BookOpen size={32} />
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-lg font-bold text-[#102033]">
            {isAr ? 'فهرس المكتبة الرقمية قيد الفهرسة المركزية' : 'Digital Repository Indexing in Progress'}
          </h3>
          <p className="text-xs text-[#607086] leading-relaxed">
            {isAr
              ? 'تتم فهرسة المراجع والكتب المقررة والأبحاث الأكاديمية وربطها مع مستودع الكائنات التعليمية السحابي. ستظهر المصادر المعتمدة تلقائيًا فور اكتمال الربط.'
              : 'Scholarly references, course textbooks, and digital learning objects are indexed and integrated directly from the institutional repository backend.'}
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
