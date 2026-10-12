import React, { useState } from 'react';
import { HelpCircle, Plus, Search, BookOpen, Layers } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import { QuestionType } from '../../types/assessment';

interface InstructorQuestionBankPageProps {
  locale: Locale;
}

export const InstructorQuestionBankPage: React.FC<InstructorQuestionBankPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // Honest data-driven container: empty until real questions are connected from repository
  const questions: any[] = [];

  return (
    <PortalPage
      title={isAr ? 'بنك الأسئلة الأكاديمي' : 'Question Bank Repository'}
      subtitle={
        isAr
          ? 'إدارة بنود التقييم ونماذج الأسئلة المعتمدة للمقررات الدراسية'
          : 'Manage assessment items and question templates for assigned courses'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة المحاضر' : 'Faculty Portal', path: `/${locale}/instructor/dashboard` },
        { label: isAr ? 'بنك الأسئلة' : 'Question Bank' },
      ]}
      locale={locale}
      actions={
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#082B50]/40 text-white/50 rounded-lg text-xs font-semibold cursor-not-allowed border border-[#DCE3EB]"
          title={isAr ? 'إنشاء الأسئلة متاح عند ربط مستودع التقييم' : 'Question creation available upon repository connection'}
        >
          <Plus size={14} className="text-[#D6A53A]/60" />
          <span>{isAr ? 'إضافة سؤال جديد' : 'New Question Item'}</span>
        </button>
      }
    >
      <div className="space-y-4">
        {/* Search & Domain Supported Question Type Filter */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-[#607086]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAr ? 'بحث بنص السؤال...' : 'Search question statement...'}
              className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg ps-9 pe-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full sm:w-56 bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
          >
            <option value="ALL">{isAr ? 'كافة أنواع الأسئلة' : 'All Question Types'}</option>
            <option value="multiple_choice">{isAr ? 'اختيار من متعدد' : 'Multiple Choice'}</option>
            <option value="true_false">{isAr ? 'صح / خطأ' : 'True / False'}</option>
            <option value="short_answer">{isAr ? 'إجابة قصيرة' : 'Short Answer'}</option>
          </select>
        </div>

        {/* Empty State Shell */}
        {questions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-12 text-center shadow-xs flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-[#EFF3F8] border border-[#DCE3EB] flex items-center justify-center text-[#082B50] mb-4">
              <HelpCircle size={32} />
            </div>
            <h3 className="text-base font-bold text-[#082B50] mb-2">
              {isAr ? 'لا تتوفر بنود أسئلة في المستودع حالياً' : 'No Question Items Available in Repository'}
            </h3>
            <p className="text-xs text-[#607086] max-w-md leading-relaxed mb-6">
              {isAr
                ? 'يتم تغذية بنك الأسئلة من قبل منسقي المقررات وأعضاء هيئة التدريس لإنشاء الاختبارات الموحدة.'
                : 'Assessment items are populated by course coordinators and faculty for standardized assessments.'}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EFF3F8] text-[11px] font-medium text-[#607086] border border-[#DCE3EB]">
              <Layers size={13} className="text-[#082B50]" />
              <span>{isAr ? 'الأنواع المعتمدة: اختيار من متعدد، صح/خطأ، إجابة قصيرة' : 'Supported: Multiple Choice, True/False, Short Answer'}</span>
            </div>
          </div>
        ) : null}
      </div>
    </PortalPage>
  );
};
