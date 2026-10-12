import React from 'react';
import type { ToastType } from '../../../types';

export type { ToastType };

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

export interface ToastOptions {
  description?: string;
  duration?: number;
}

export interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'>) => string;
  dismissToast: (id: string) => void;
  toast: {
    success: (title: string, options?: ToastOptions | string) => string;
    error: (title: string, options?: ToastOptions | string) => string;
    warning: (title: string, options?: ToastOptions | string) => string;
    info: (title: string, options?: ToastOptions | string) => string;
  };
}
