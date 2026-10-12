import React, { useEffect, useRef } from 'react';
import { AlertTriangle, AlertCircle, HelpCircle, X } from 'lucide-react';
import { useTranslation } from '../../../i18n/useTranslation';
import type { DialogVariant } from '../../../types';

export type { DialogVariant };

export interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: DialogVariant;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = 'primary',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const { d } = useTranslation();
  const resolvedConfirmLabel = confirmLabel || d.common.confirm;
  const resolvedCancelLabel = cancelLabel || d.common.cancel;
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Focus appropriate button
    const timer = setTimeout(() => {
      if (variant === 'danger') {
        cancelBtnRef.current?.focus();
      } else {
        confirmBtnRef.current?.focus();
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (!isLoading) {
          onCancel();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, variant, isLoading, onCancel]);

  if (!isOpen) return null;

  let iconNode = <HelpCircle className="w-6 h-6 text-[#17324d]" />;
  let iconBg = 'bg-[#eaf0f5]';
  let confirmBtnBg = 'bg-[#17324d] hover:bg-[#0f2438] text-white';

  if (variant === 'danger') {
    iconNode = <AlertCircle className="w-6 h-6 text-[#C23B3B]" />;
    iconBg = 'bg-[#fef2f2]';
    confirmBtnBg = 'bg-[#C23B3B] hover:bg-[#a12f2f] text-white';
  } else if (variant === 'warning') {
    iconNode = <AlertTriangle className="w-6 h-6 text-[#D97706]" />;
    iconBg = 'bg-[#fffbeb]';
    confirmBtnBg = 'bg-[#D97706] hover:bg-[#b45309] text-white';
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-dialog-title"
      aria-describedby={description ? 'confirmation-dialog-description' : undefined}
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-[#17202a]/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      {/* Backdrop click */}
      <div
        className="fixed inset-0"
        onClick={() => {
          if (!isLoading) onCancel();
        }}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md max-h-[90vh] bg-white rounded-2xl border border-[#e4e7ec] shadow-2xl overflow-y-auto z-10 p-5 md:p-6 text-start">
        {/* Header with Icon and Close Button */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
              {iconNode}
            </div>
            <h3
              id="confirmation-dialog-title"
              className="text-sm md:text-base font-bold text-[#17202a] leading-tight"
            >
              {title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            aria-label={resolvedCancelLabel}
            className="p-1.5 rounded-lg text-[#667085] hover:text-[#17202a] hover:bg-[#f8fafc] transition-colors disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body Description */}
        {description && (
          <p
            id="confirmation-dialog-description"
            className="text-xs md:text-sm text-[#667085] leading-relaxed mb-6"
          >
            {description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#e4e7ec]">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl border border-[#e4e7ec] bg-white hover:bg-[#f8fafc] text-xs font-semibold text-[#17202a] transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#17324d]/20 disabled:opacity-50"
          >
            {resolvedCancelLabel}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs focus:outline-hidden focus:ring-2 focus:ring-offset-1 focus:ring-[#17324d] disabled:opacity-50 flex items-center gap-2 ${confirmBtnBg}`}
          >
            {isLoading && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            <span>{resolvedConfirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
