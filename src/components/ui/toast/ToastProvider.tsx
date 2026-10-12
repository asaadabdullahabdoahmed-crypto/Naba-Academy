import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { ToastItem, ToastContextValue, ToastOptions } from './toast.types';
import { ToastViewport } from './ToastViewport';

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timeoutsRef.current.has(id)) {
      clearTimeout(timeoutsRef.current.get(id)!);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (toastData: Omit<ToastItem, 'id'>) => {
      const id = 'toast_' + Math.random().toString(36).substring(2, 9);
      const duration = toastData.duration ?? 4000;

      const newToast: ToastItem = {
        id,
        ...toastData,
      };

      setToasts((prev) => [...prev.slice(-4), newToast]); // keep max 5 stacked

      if (duration > 0) {
        const timer = setTimeout(() => {
          dismissToast(id);
        }, duration);
        timeoutsRef.current.set(id, timer);
      }

      return id;
    },
    [dismissToast]
  );

  const normalizeOptions = (options?: ToastOptions | string): ToastOptions => {
    if (typeof options === 'string') {
      return { description: options };
    }
    return options || {};
  };

  const toastMethods = {
    success: useCallback(
      (title: string, options?: ToastOptions | string) => {
        const opt = normalizeOptions(options);
        return showToast({ type: 'success', title, description: opt.description, duration: opt.duration });
      },
      [showToast]
    ),
    error: useCallback(
      (title: string, options?: ToastOptions | string) => {
        const opt = normalizeOptions(options);
        return showToast({ type: 'error', title, description: opt.description, duration: opt.duration });
      },
      [showToast]
    ),
    warning: useCallback(
      (title: string, options?: ToastOptions | string) => {
        const opt = normalizeOptions(options);
        return showToast({ type: 'warning', title, description: opt.description, duration: opt.duration });
      },
      [showToast]
    ),
    info: useCallback(
      (title: string, options?: ToastOptions | string) => {
        const opt = normalizeOptions(options);
        return showToast({ type: 'info', title, description: opt.description, duration: opt.duration });
      },
      [showToast]
    ),
  };

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        dismissToast,
        toast: toastMethods,
      }}
    >
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
