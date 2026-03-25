'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';

export type ToastStatus = 'uploading' | 'analyzing' | 'complete' | 'error';

export interface Toast {
  id: string;
  title: string;
  message: string;
  status: ToastStatus;
  progress: number;
  createdAt: number;
  auditId?: string;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id' | 'createdAt'>) => string;
  updateToast: (id: string, updates: Partial<Toast>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const addToast = useCallback((toast: Omit<Toast, 'id' | 'createdAt'>) => {
    const id = `toast-${++counterRef.current}-${Date.now()}`;
    const newToast: Toast = {
      ...toast,
      id,
      createdAt: Date.now(),
    };
    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const updateToast = useCallback((id: string, updates: Partial<Toast>) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, updateToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast, index) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          index={index}
          onRemove={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
}

function ToastItem({ toast, index, onRemove }: { toast: Toast; index: number; onRemove: () => void }) {
  const [isExiting, setIsExiting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(onRemove, 300);
  };

  // Auto-remove completed/error toasts after 5s
  const autoRemoveRef = useRef<NodeJS.Timeout>(undefined);
  if ((toast.status === 'complete' || toast.status === 'error') && !autoRemoveRef.current && !isHovered) {
    autoRemoveRef.current = setTimeout(handleRemove, 5000);
  }

  const statusConfig = {
    uploading: {
      icon: <UploadIcon />,
      gradient: 'from-[#4fd1c5] to-[#38b2ac]',
      pulse: true,
    },
    analyzing: {
      icon: <AnalyzeIcon />,
      gradient: 'from-[#4fd1c5] to-[#319795]',
      pulse: true,
    },
    complete: {
      icon: <CheckIcon />,
      gradient: 'from-[#34d399] to-[#10b981]',
      pulse: false,
    },
    error: {
      icon: <ErrorIcon />,
      gradient: 'from-[#f87171] to-[#ef4444]',
      pulse: false,
    },
  };

  const config = statusConfig[toast.status];

  return (
    <div
      className={`
        pointer-events-auto
        w-[340px] overflow-hidden rounded-2xl
        backdrop-blur-xl
        border border-white/10
        shadow-2xl shadow-black/20
        transition-all duration-300 ease-out
        ${isExiting ? 'toast-exit' : 'toast-enter'}
        ${isHovered ? 'scale-[1.02] shadow-black/30' : ''}
      `}
      style={{
        background: 'linear-gradient(135deg, rgba(30,37,52,0.95) 0%, rgba(20,26,38,0.98) 100%)',
        animationDelay: `${index * 50}ms`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect */}
      <div
        className={`absolute -inset-1 rounded-2xl opacity-20 blur-xl transition-opacity duration-500 bg-gradient-to-r ${config.gradient}`}
        style={{ opacity: isHovered ? 0.3 : 0.15 }}
      />

      {/* Content */}
      <div className="relative p-4">
        <div className="flex items-start gap-3">
          {/* Animated icon */}
          <div
            className={`
              relative flex-shrink-0 w-10 h-10 rounded-xl
              flex items-center justify-center
              bg-gradient-to-br ${config.gradient}
              shadow-lg
              ${config.pulse ? 'animate-pulse-slow' : ''}
            `}
          >
            <div className={`text-white ${toast.status === 'analyzing' ? 'animate-spin-slow' : ''}`}>
              {config.icon}
            </div>

            {/* Ripple effect for active states */}
            {config.pulse && (
              <div className="absolute inset-0 rounded-xl animate-ping-slow opacity-30 bg-gradient-to-br from-[#4fd1c5] to-transparent" />
            )}
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-semibold text-sm text-white truncate">
                {toast.title}
              </h4>
              <button
                onClick={handleRemove}
                className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/10 transition-all"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-white/60 mt-0.5 truncate">
              {toast.message}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        {(toast.status === 'uploading' || toast.status === 'analyzing') && (
          <div className="mt-3 relative">
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${config.gradient} transition-all duration-500 ease-out relative overflow-hidden`}
                style={{ width: `${toast.progress}%` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 shimmer-effect" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] text-white/40 font-medium tracking-wide uppercase">
                {toast.status === 'uploading' ? 'Subiendo archivos' : 'Analizando con IA'}
              </span>
              <span className="text-[10px] text-[#4fd1c5] font-semibold tabular-nums">
                {toast.progress}%
              </span>
            </div>
          </div>
        )}

        {/* Success message */}
        {toast.status === 'complete' && (
          <div className="mt-3 flex items-center gap-2 py-2 px-3 rounded-lg bg-[#34d399]/10 border border-[#34d399]/20">
            <div className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />
            <span className="text-xs text-[#34d399] font-medium">
              Auditoría completada - Ver en Historial
            </span>
          </div>
        )}

        {/* Error message */}
        {toast.status === 'error' && (
          <div className="mt-3 flex items-center gap-2 py-2 px-3 rounded-lg bg-[#f87171]/10 border border-[#f87171]/20">
            <div className="w-1.5 h-1.5 rounded-full bg-[#f87171]" />
            <span className="text-xs text-[#f87171] font-medium">
              Error en la auditoría
            </span>
          </div>
        )}
      </div>

      {/* Bottom accent line */}
      <div className={`h-0.5 bg-gradient-to-r ${config.gradient}`} />
    </div>
  );
}

// Icons
function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17,8 12,3 7,8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function AnalyzeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}
