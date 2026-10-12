import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Camera,
  Mic,
  Wifi,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Shield,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import { useToast } from '../../components/ui/toast';

interface StudentExamPrecheckPageProps {
  locale: Locale;
}

export const StudentExamPrecheckPage: React.FC<StudentExamPrecheckPageProps> = ({ locale }) => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAr } = useTranslation();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [cameraOk, setCameraOk] = useState(true);
  const [micOk, setMicOk] = useState(true);
  const [netOk, setNetOk] = useState(true);
  const [idOk, setIdOk] = useState(true);
  const [agreed, setAgreed] = useState(false);

  const allPassed = cameraOk && micOk && netOk && idOk && agreed;

  const handleStartExam = () => {
    if (!allPassed) {
      toast.error(
        isAr
          ? 'يرجى إتمام كافة بنود الفحص الأمني والموافقة على ميثاق النزاهة'
          : 'Please complete all system readiness checks and agree to the integrity code'
      );
      return;
    }
    navigate(`/${locale}/student/exams/${examId || 'active'}/attempt`);
  };

  return (
    <PortalPage
      title={isAr ? 'فحص جاهزية النظام للاختبار' : 'System & Proctoring Pre-Check'}
      subtitle={
        isAr
          ? 'التحقق من الكاميرا، الصوت، استقرار الاتصال، والنزاهة الأكاديمية'
          : 'Verify webcam, microphone, network stability, and academic integrity'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الطالب' : 'Student Portal', path: `/${locale}/student/dashboard` },
        { label: isAr ? 'الاختبارات' : 'Exams', path: `/${locale}/student/exams` },
        { label: isAr ? 'فحص الجاهزية' : 'System Pre-Check' },
      ]}
      locale={locale}
      actions={
        <Link
          to={`/${locale}/student/exams`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] rounded-lg text-xs font-bold transition-colors shadow-xs"
        >
          <ArrowIcon size={14} />
          <span>{isAr ? 'العودة لجدول الاختبارات' : 'Back to Exams'}</span>
        </Link>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Progress Grid Overview */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  cameraOk
                    ? 'bg-[#EFF3F8] text-[#082B50] border-[#DCE3EB]'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                <Camera size={20} />
              </div>
              <div>
                <span className="text-[11px] text-[#607086] block">
                  {isAr ? 'الخطوة 1' : 'Step 1'}
                </span>
                <span className="text-xs font-bold text-[#102033]">
                  {isAr ? 'كاميرا المراقبة' : 'Camera'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  micOk
                    ? 'bg-[#EFF3F8] text-[#082B50] border-[#DCE3EB]'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                <Mic size={20} />
              </div>
              <div>
                <span className="text-[11px] text-[#607086] block">
                  {isAr ? 'الخطوة 2' : 'Step 2'}
                </span>
                <span className="text-xs font-bold text-[#102033]">
                  {isAr ? 'التقاط الصوت' : 'Microphone'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  netOk
                    ? 'bg-[#EFF3F8] text-[#082B50] border-[#DCE3EB]'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                <Wifi size={20} />
              </div>
              <div>
                <span className="text-[11px] text-[#607086] block">
                  {isAr ? 'الخطوة 3' : 'Step 3'}
                </span>
                <span className="text-xs font-bold text-[#102033]">
                  {isAr ? 'سرعة الاتصال' : 'Network'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  idOk
                    ? 'bg-[#EFF3F8] text-[#082B50] border-[#DCE3EB]'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                <ShieldCheck size={20} />
              </div>
              <div>
                <span className="text-[11px] text-[#607086] block">
                  {isAr ? 'الخطوة 4' : 'Step 4'}
                </span>
                <span className="text-xs font-bold text-[#102033]">
                  {isAr ? 'التحقق الأمني' : 'Security Check'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Verification Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Camera Feed Simulation Shell */}
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera size={16} className="text-[#082B50]" />
                <h3 className="text-xs font-bold text-[#102033]">
                  {isAr ? 'فحص الكاميرا المباشرة' : 'Camera Feed Verification'}
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EFF3F8] text-[#082B50]">
                {cameraOk ? (isAr ? 'متصلة وبحالة جيدة' : 'Connected') : (isAr ? 'غير متصلة' : 'Disconnected')}
              </span>
            </div>

            <div className="bg-[#061E38] rounded-xl aspect-4/3 flex flex-col items-center justify-center relative overflow-hidden text-center p-4">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#D6A53A]/50 flex items-center justify-center mb-2">
                <Camera size={24} className="text-[#D6A53A]" />
              </div>
              <p className="text-white text-xs font-semibold">
                {isAr ? 'إطار التحقق من الكاميرا' : 'Proctoring Camera Frame'}
              </p>
              <p className="text-white/60 text-[10px] mt-1">
                {isAr ? 'تأكد من وضوح ملامح الوجه في منتصف الإطار' : 'Ensure face is clearly centered and illuminated'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setCameraOk(true);
                toast.info(isAr ? 'تم التحقق من جاهزية الكاميرا محليًا' : 'Camera device check completed locally');
              }}
              className="w-full py-2 bg-[#F7F9FC] hover:bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg text-xs font-bold text-[#082B50] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>{isAr ? 'إعادة اختبار الكاميرا' : 'Retest Camera'}</span>
            </button>
          </div>

          {/* Audio, Network & Environment Checklist */}
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#082B50]" />
                <h3 className="text-xs font-bold text-[#102033]">
                  {isAr ? 'مؤشرات النظام والشبكة' : 'Hardware & Network Indicators'}
                </h3>
              </div>

              {/* Mic row */}
              <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#DCE3EB] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <Mic size={16} className="text-[#082B50]" />
                  <div>
                    <span className="font-bold text-[#102033] block">
                      {isAr ? 'التقاط الصوت (الميكروفون)' : 'Microphone Status'}
                    </span>
                    <span className="text-[10px] text-[#607086]">
                      {micOk ? (isAr ? 'الإشارة الصوتية واضحة' : 'Clear Audio Signal') : (isAr ? 'غير مفعل' : 'Disabled')}
                    </span>
                  </div>
                </div>
                <CheckCircle2 size={16} className="text-[#082B50]" />
              </div>

              {/* Network latency row */}
              <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#DCE3EB] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <Wifi size={16} className="text-[#082B50]" />
                  <div>
                    <span className="font-bold text-[#102033] block">
                      {isAr ? 'استقرار الاتصال بالإنترنت' : 'Network Latency'}
                    </span>
                    <span className="text-[10px] text-[#607086]">
                      {netOk ? (isAr ? 'اتصال مستقر بالشبكة' : 'Stable Network Connection') : (isAr ? 'ضعيف' : 'Unstable')}
                    </span>
                  </div>
                </div>
                <CheckCircle2 size={16} className="text-[#082B50]" />
              </div>

              {/* Identity verification row */}
              <div className="p-3 rounded-xl bg-[#F7F9FC] border border-[#DCE3EB] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <CreditCard size={16} className="text-[#082B50]" />
                  <div>
                    <span className="font-bold text-[#102033] block">
                      {isAr ? 'التحقق من الهوية الأكاديمية' : 'Identity Verification'}
                    </span>
                    <span className="text-[10px] text-[#607086]">
                      {idOk ? (isAr ? 'تم التحقق من بيانات الحساب' : 'Identity Verified') : (isAr ? 'مطلوب التحقق' : 'Verification Required')}
                    </span>
                  </div>
                </div>
                <CheckCircle2 size={16} className="text-[#082B50]" />
              </div>
            </div>

            {/* Honor Code Checkbox */}
            <div className="pt-3 border-t border-[#DCE3EB]">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 rounded border-[#DCE3EB] text-[#082B50] focus:ring-[#082B50]"
                />
                <span className="text-[11px] text-[#102033] leading-relaxed">
                  {isAr
                    ? 'أقر بالتزامي الكامل بميثاق النزاهة الأكاديمية لأكاديمية نبا، وبعدم استخدام أي مراجع غير مصرح بها أو الاستعانة بأطراف خارجية أثناء أداء الاختبار.'
                    : 'I certify my commitment to NABA Academy academic integrity policy and will not use unauthorized materials or external assistance.'}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={handleStartExam}
            disabled={!allPassed}
            className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer ${
              allPassed
                ? 'bg-[#082B50] hover:bg-[#061E38] text-white'
                : 'bg-[#DCE3EB] text-[#607086] cursor-not-allowed'
            }`}
          >
            <ShieldCheck size={16} className={allPassed ? 'text-[#D6A53A]' : ''} />
            <span>{isAr ? 'بدء جلسة الاختبار الأكاديمي' : 'Enter Examination Session'}</span>
            <ArrowIcon size={14} />
          </button>
        </div>
      </div>
    </PortalPage>
  );
};
