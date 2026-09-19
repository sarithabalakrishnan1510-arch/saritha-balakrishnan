import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, X, Share2 } from 'lucide-react';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type?: 'copied' | 'success' | 'info';
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'> | string) => void;
  showCopiedToast: (title: string, customMessage?: string) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((toastArg: Omit<ToastItem, 'id'> | string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastItem = typeof toastArg === 'string'
      ? { id, title: toastArg, type: 'info', duration: 3000 }
      : { ...toastArg, id, duration: toastArg.duration ?? 3000 };

    setToasts(prev => [...prev.slice(-3), newToast]); // keep last 4 max

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, newToast.duration);
    }
  }, [dismissToast]);

  const showCopiedToast = useCallback((title: string, customMessage?: string) => {
    showToast({
      title: 'Link Copied to Clipboard!',
      description: customMessage || `Shareable link for "${title}" is ready to paste.`,
      type: 'copied',
      duration: 3000
    });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, showCopiedToast, dismissToast }}>
      {children}

      {/* Floating Toast Container */}
      <div 
        id="global-toast-container"
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto rounded-xl bg-[#13151f]/95 border border-emerald-500/30 text-white p-3.5 shadow-2xl backdrop-blur-xl flex items-start gap-3 ring-1 ring-emerald-500/20"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 mt-0.5">
                {toast.type === 'copied' ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Share2 className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-white tracking-tight">
                    {toast.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => dismissToast(toast.id)}
                    className="text-zinc-400 hover:text-white p-0.5 rounded transition-colors"
                    aria-label="Dismiss toast"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {toast.description && (
                  <p className="text-[11px] text-zinc-300 mt-0.5 leading-snug line-clamp-2">
                    {toast.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
