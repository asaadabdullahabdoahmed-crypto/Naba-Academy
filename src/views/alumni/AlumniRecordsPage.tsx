import React from 'react';
import { useLocation } from 'react-router-dom';
import { FileText, Download, AlertCircle, FolderArchive, FileCheck } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface AlumniRecordsPageProps {
  locale: Locale;
}

export const AlumniRecordsPage: React.FC<AlumniRecordsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const location = useLocation();

  const isDocumentsView = location.pathname.includes('/alumni/documents');

  const pageTitle = isDocumentsView
    ? (isAr ? 'طلب الوثائق والإفادات الرسمية' : 'Document Orders & Records')
    : (isAr ? 'السجل الأكاديمي الرسمي' : 'Official Academic Transcript');

  const pageSubtitle = isDocumentsView
    ? (isAr
        ? 'طلب الوثائق الرسمية، إفادات التخرج، وكشوف الدرجات المعتمدة'
        : 'Order official transcripts, graduation letters, and certified documents')
    : (isAr
        ? 'السجل الأكاديمي الشامل، الساعات المنجزة، والدرجات المعتمدة'
        : 'Comprehensive academic transcript, completed credits, and conferred degree records');

  const MainIcon = isDocumentsView ? FolderArchive : FileText;

  return (
    <PortalPage
      title={pageTitle}
      subtitle={pageSubtitle}
      breadcrumbs={[
        { label: isAr ? 'بوابة الخريجين' : 'Alumni Portal', path: `/${locale}/alumni/dashboard` },
        { label: pageTitle },
      ]}
      locale={locale}
      actions={
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF3F8] text-[#607086] text-xs font-semibold border border-[#DCE3EB]">
            <AlertCircle size={14} className="text-[#607086]" />
            <span>{isAr ? 'في انتظار ربط الواجهة الخلفية' : 'Pending Backend Integration'}</span>
          </div>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#DCE3EB] text-[#607086] cursor-not-allowed rounded-lg text-xs font-bold transition-colors"
            title={isAr ? 'يتطلب ربط الواجهة الخلفية لتحميل الوثائق' : 'Requires backend connection to export documents'}
          >
            <Download size={14} />
            <span>{isAr ? 'تحميل السجل (PDF)' : 'Export Transcript (PDF)'}</span>
          </button>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Factual Academic Record Container */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] shadow-xs overflow-hidden">
          <div className="p-6 border-b border-[#DCE3EB] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#102033]">{pageTitle}</h3>
              <p className="text-xs text-[#607086] mt-0.5">{pageSubtitle}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center">
              <MainIcon size={20} />
            </div>
          </div>

          {/* Honest Institutional Empty State */}
          <div className="py-16 px-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
              <MainIcon size={26} />
            </div>
            <h4 className="text-sm font-bold text-[#102033] mb-1">
              {isDocumentsView
                ? (isAr ? 'لا توجد طلبات وثائق مسجلة حالياً' : 'No Document Orders on Record')
                : (isAr ? 'لا توجد سجلات أكاديمية متوفرة حالياً' : 'No Academic Transcript Records Available')}
            </h4>
            <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed">
              {isDocumentsView
                ? (isAr
                    ? 'ستظهر الوثائق والإفادات الرسمية وحالة تصديقها هنا فور تفعيل الربط مع عمادة القبول والتسجيل.'
                    : 'Official document orders and certification statuses will populate here once connected to the Deanship of Admissions.')
                : (isAr
                    ? 'ستظهر تفاصيل المقررات المنجزة، الساعات المعتمدة، والمعدل التراكمي فور استرجاع بيانات الخريج من قاعدة البيانات.'
                    : 'Completed course details, earned credit hours, and cumulative GPA will display once alumni records are retrieved from the database.')}
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF3F8] text-[#607086] text-[11px] font-semibold border border-[#DCE3EB]">
              <AlertCircle size={14} className="text-[#607086]" />
              <span>{isAr ? 'في انتظار ربط الواجهة الخلفية' : 'Pending Backend Integration'}</span>
            </div>
          </div>

          <div className="p-4 bg-[#EFF3F8]/40 border-t border-[#DCE3EB] flex items-center justify-between text-xs text-[#607086]">
            <span>{isAr ? 'السجل الأكاديمي الرقمي' : 'Digital Academic Transcript'}</span>
            <span className="font-semibold text-[#607086]">{isAr ? 'غير متصل' : 'Disconnected'}</span>
          </div>
        </div>
      </div>
    </PortalPage>
  );
};
