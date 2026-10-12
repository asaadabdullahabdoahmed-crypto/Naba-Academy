import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Search, Filter, Users, BookOpen, Clock, Calendar, ArrowRight, ArrowLeft } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import { useToast } from '../../components/ui/toast';

interface InstructorSectionsPageProps {
  locale: Locale;
}

export const InstructorSectionsPage: React.FC<InstructorSectionsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  // Honest data-driven container: empty until real sections exist
  const sections: any[] = [];

  return (
    <PortalPage
      title={isAr ? 'الشُعب الدراسية والمجموعات' : 'Course Sections & Groups'}
      subtitle={
        isAr
          ? 'إدارة الشعب الدراسية المكلفة، مواعيد المحاضرات الأسبوعية، وقاعات البث'
          : 'Manage assigned course sections, weekly meeting schedules, and virtual classrooms'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة المحاضر' : 'Faculty Portal', path: `/${locale}/instructor/dashboard` },
        { label: isAr ? 'الشُعب الدراسية' : 'Sections' },
      ]}
      locale={locale}
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-4 shadow-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-[#607086]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAr ? 'بحث برمز الشعبة أو اسم المقرر...' : 'Search section code or course name...'}
              className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg ps-9 pe-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
            />
          </div>
        </div>

        {/* Sections Container */}
        {sections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" />
        ) : (
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
              <Layers size={28} />
            </div>
            <h3 className="text-base font-bold text-[#102033] mb-1">
              {isAr ? 'لا توجد شُعب دراسية مكلفة حالياً' : 'No sections currently assigned.'}
            </h3>
            <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed mb-6">
              {isAr
                ? 'ستظهر هنا كافة الشُعب وقاعات المحاضرات المعتمدة فور صدور جدول التدريس الفصلي من القسم الأكاديمي.'
                : 'Assigned sections and meeting schedules will appear here once finalized by the academic department.'}
            </p>
            <Link
              to={`/${locale}/instructor/dashboard`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] rounded-lg text-xs font-bold transition-colors"
            >
              <span>{isAr ? 'العودة للوحة التحكم' : 'Return to Dashboard'}</span>
            </Link>
          </div>
        )}
      </div>
    </PortalPage>
  );
};
