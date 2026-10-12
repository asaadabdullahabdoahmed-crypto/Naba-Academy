import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { ToastItem } from './toast.types';
import { useTranslation } from '../../../i18n/useTranslation';

interface ToastViewportProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastViewport: React.FC<ToastViewportProps> = ({ toasts, onDismiss }) => {
  const { d } = useTranslation();
  const v = d.views.shared.toastViewport;

  if (toasts.length === 0) return null;

  return (
    <div
      aria-label={v.notifications}
      className="fixed bottom-5 end-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((t) => {
        const isError = t.type === 'error';
        const role = isError ? 'alert' : 'status';

        let iconNode = <CheckCircle2 className="w-5 h-5 text-[#16835D] shrink-0" />;
        let borderColor = 'border-s-[#16835D] border-s-4';

        if (t.type === 'warning') {
          iconNode = <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0" />;
          borderColor = 'border-s-[#D97706] border-s-4';
        } else if (t.type === 'error') {
          iconNode = <AlertCircle className="w-5 h-5 text-[#C23B3B] shrink-0" />;
          borderColor = 'border-s-[#C23B3B] border-s-4';
        } else if (t.type === 'info') {
          iconNode = <Info className="w-5 h-5 text-[#2563EB] shrink-0" />;
          borderColor = 'border-s-[#2563EB] border-s-4';
        }

        return (
          <div
            key={t.id}
            role={role}
            aria-live={isError ? 'assertive' : 'polite'}
            className={`pointer-events-auto bg-white border border-[#e4e7ec] ${borderColor} shadow-lg rounded-xl p-3.5 flex items-start gap-3 transition-all transform animate-in fade-in slide-in-from-bottom-2`}
          >
            <div className="pt-0.5">{iconNode}</div>
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold text-[#17202a] leading-tight break-words">
                {t.title}
              </h5>
              {t.description && (
                <p className="text-[11px] text-[#667085] mt-1 leading-relaxed break-words">
                  {t.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              aria-label={v.closeNotification}
              className="p-1 -me-1 -mt-1 rounded-md text-[#667085] hover:text-[#17202a] hover:bg-[#f8fafc] transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
