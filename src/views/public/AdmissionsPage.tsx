import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, ArrowLeft, FileText, UserCheck, ShieldCheck, HelpCircle } from 'lucide-react';
import { Locale } from '../../i18n/dictionaries';
import { useTranslation } from '../../i18n/useTranslation';

interface AdmissionsPageProps {
  locale: Locale;
}

export const AdmissionsPage: React.FC<AdmissionsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const steps = [
    {
      step: '01',
      titleAr: 'إنشاء الحساب وبدء الطلب',
      titleEn: 'Create Account & Start Application',
      descAr: 'تعبئة البيانات الأساسية للمتقدم واختيار المسار الأكاديمي المطلوب عبر بوابة القبول.',
      descEn: 'Submit applicant personal information and select the target academic program path.',
    },
    {
      step: '02',
      titleAr: 'رفع المستندات الرسمية',
      titleEn: 'Upload Official Documents',
      descAr: 'تحميل الشهادات الدراسية السابقة، وثيقة الهوية الرسمية، وأي سجلات أكاديمية مطلوبة.',
      descEn: 'Upload prior academic certificates, official national ID / passport, and transcripts.',
    },
    {
      step: '03',
      titleAr: 'التدقيق والمطابقة الأكاديمية',
      titleEn: 'Academic Review & Verification',
      descAr: 'مراجعة وتدقيق المستندات من قِبل عمادة القبول والتسجيل للتحقق من استيفاء المتطلبات.',
      descEn: 'Verification and evaluation of credentials conducted by the Admissions & Registration team.',
    },
    {
      step: '04',
      titleAr: 'القبول وإصدار الرقم الجامعي',
      titleEn: 'Acceptance & University ID Issuance',
      descAr: 'إصدار إشعار القبول الرسمي وتفعيل الحساب الجامعي لبدء تسجيل المقررات الدراسية.',
      descEn: 'Issuance of official acceptance notice, University ID generation, and portal course enrollment.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16 space-y-12">
      {/* Title Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#082B50]/10 text-[#082B50] text-xs font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D6A53A]" />
          <span>{isAr ? 'القبول والتسجيل' : 'Admissions & Enrollment'}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-[#082B50] tracking-tight">
          {isAr ? 'إجراءات وشروط القبول الجامعي' : 'Academic Admission Guidelines & Process'}
        </h1>
        <p className="text-xs md:text-sm text-[#607086]">
          {isAr
            ? 'خطوات واضحة وميسرة للالتحاق بالبرامج الأكاديمية عبر منظومة التعلم الرقمي في أكاديمية نبا'
            : 'Clear, streamlined admission workflows for digital higher education programs at NABA Academy'}
        </p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {steps.map((s) => (
          <div
            key={s.step}
            className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs relative flex flex-col justify-between"
          >
            <div>
              <div className="text-2xl font-black text-[#082B50]/20 mb-2 font-mono">{s.step}</div>
              <h3 className="text-sm font-bold text-[#102033] mb-1.5">
                {isAr ? s.titleAr : s.titleEn}
              </h3>
              <p className="text-xs text-[#607086] leading-relaxed">
                {isAr ? s.descAr : s.descEn}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#DCE3EB]/60">
              <span className="text-[11px] font-semibold text-[#174F89]">
                {isAr ? 'المرحلة ' + s.step : 'Phase ' + s.step}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* General Admission Requirements & Guidelines (No invented GPA cutoffs or quotas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 md:p-8 space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <FileText className="text-[#082B50]" size={20} />
            <h2 className="text-base font-bold text-[#102033]">
              {isAr ? 'المتطلبات العامة للتقديم' : 'General Admission Requirements'}
            </h2>
          </div>
          <ul className="space-y-3 text-xs text-[#607086]">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-[#174F89] shrink-0 mt-0.5" />
              <span>
                {isAr
                  ? 'الحصول على شهادة الثانوية العامة أو ما يعادلها لمرحلة البكالوريوس، أو شهادة البكالوريوس للدراسات العليا.'
                  : 'High school diploma or certified equivalent for undergraduate, or Bachelor degree for graduate studies.'}
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-[#174F89] shrink-0 mt-0.5" />
              <span>
                {isAr
                  ? 'تقديم وثيقة الهوية الوطنية أو الإقامة النظامية سارية المفعول أو جواز السفر للمتقدمين الدوليين.'
                  : 'Valid National ID / Iqama or passport for international applicants.'}
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-[#174F89] shrink-0 mt-0.5" />
              <span>
                {isAr
                  ? 'رفع السجل الأكاديمي الأصلي وكافة الوثائق الرسمية المطلوبة بصيغة رقمية واضحة.'
                  : 'Official transcript and certified documentation in clear digital format.'}
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-[#174F89] shrink-0 mt-0.5" />
              <span>
                {isAr
                  ? 'استيفاء أي متطلبات خاصة يحددها القسم الأكاديمي المعني بالبرنامج.'
                  : 'Fulfillment of any departmental prerequisite criteria for specific disciplines.'}
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 md:p-8 space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-[#082B50]" size={20} />
              <h2 className="text-base font-bold text-[#102033]">
                {isAr ? 'بدء التقديم الإلكتروني' : 'Start Digital Application'}
              </h2>
            </div>
            <p className="text-xs text-[#607086] leading-relaxed">
              {isAr
                ? 'يمكنك إنشاء طلب قبول جديد ومتابعة حالة المعالجة ومطابقة الوثائق عبر بوابة القبول الإلكترونية.'
                : 'Submit a new admission application or track review status online via the digital admissions portal.'}
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Link
              to={`/${locale}/auth/register`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#082B50] hover:bg-[#061E38] text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              <span>{isAr ? 'تقديم طلب جديد' : 'New Application'}</span>
              <ArrowIcon size={14} />
            </Link>
            <Link
              to={`/${locale}/auth/application-status`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F7F9FC] hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] rounded-xl text-xs font-bold transition-colors"
            >
              <span>{isAr ? 'متابعة حالة الطلب' : 'Track Status'}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
