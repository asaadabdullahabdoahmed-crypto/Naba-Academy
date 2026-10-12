import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, GraduationCap, BookOpen, ArrowRight, ArrowLeft, Layers, AlertCircle } from 'lucide-react';
import { Locale } from '../../i18n/dictionaries';
import { useTranslation } from '../../i18n/useTranslation';

interface ProgramsPageProps {
  locale: Locale;
}

export const ProgramsPage: React.FC<ProgramsPageProps> = ({ locale }) => {
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
          <span>{isAr ? 'الدليل الأكاديمي' : 'Academic Prospectus'}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-[#082B50] tracking-tight">
          {isAr ? 'البرامج والتخصصات الأكاديمية' : 'Academic Programs & Degrees'}
        </h1>
        <p className="text-xs md:text-sm text-[#607086]">
          {isAr
            ? 'دليل البرامج الأكاديمية وخطط الدراسة الرقمية المعتمدة في أكاديمية نبا'
            : 'Explore approved academic degree programs and digital curricula at NABA Academy'}
        </p>
      </div>

      {/* Filter & Search Toolbar (Ready for Catalog Integration) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-[#DCE3EB] shadow-xs">
        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { key: 'ALL', labelAr: 'كافة البرامج', labelEn: 'All Programs' },
            { key: 'UG', labelAr: 'البكالوريوس', labelEn: 'Undergraduate' },
            { key: 'PG', labelAr: 'الدراسات العليا', labelEn: 'Postgraduate' },
            { key: 'DIP', labelAr: 'الدبلومات التخصصية', labelEn: 'Diplomas' },
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

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-[#607086]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? 'البحث في دليل البرامج...' : 'Search program catalog...'}
            className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl ps-9 pe-3 py-2 text-xs text-[#102033] placeholder-[#607086] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
          />
        </div>
      </div>

      {/* Professional Institutional Catalog State */}
      <div className="bg-white rounded-2xl border border-[#DCE3EB] p-10 md:p-14 text-center space-y-5 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-[#082B50]/10 text-[#082B50] flex items-center justify-center mx-auto">
          <GraduationCap size={32} />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-lg font-bold text-[#102033]">
            {isAr ? 'دليل البرامج قيد المزامنة' : 'Program Catalog Ready for Synchronization'}
          </h3>
          <p className="text-xs text-[#607086] leading-relaxed">
            {isAr
              ? 'تتم حاليًا مراجعة واعتماد الخطط الدراسية وربط الدليل الأكاديمي مع قاعدة بيانات المقررات المركزية. سيتم إدراج البرامج فور اكتمال الربط.'
              : 'Academic study plans and program curricula are prepared to synchronize directly from the central academic registry upon backend connection.'}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={`/${locale}/admissions`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#082B50] hover:bg-[#061E38] text-white text-xs font-bold transition-colors shadow-xs"
          >
            <span>{isAr ? 'شروط وإجراءات القبول' : 'Admission Guidelines'}</span>
            <ArrowIcon size={14} />
          </Link>
          <Link
            to={`/${locale}/elearning`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#F7F9FC] hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] text-xs font-bold transition-colors"
          >
            <BookOpen size={14} className="text-[#174F89]" />
            <span>{isAr ? 'التعرف على بيئة التعلم' : 'E-Learning Environment'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
