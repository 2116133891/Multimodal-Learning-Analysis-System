// ===== 全局 Toast 通知管理器 =====
import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle2, Info, AlertOctagon } from 'lucide-react';

// ── Toast 类型定义 ──────────────────────────────────────
export type ToastType = 'warning' | 'success' | 'info' | 'error';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number; // 毫秒，默认 5000
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

// ── 图标和样式映射 ──────────────────────────────────────
const toastMeta: Record<ToastType, { icon: typeof AlertTriangle; bg: string; border: string; titleColor: string }> = {
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    titleColor: 'text-amber-800',
  },
  success: {
    icon: CheckCircle2,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    titleColor: 'text-emerald-800',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    titleColor: 'text-blue-800',
  },
  error: {
    icon: AlertOctagon,
    bg: 'bg-red-50',
    border: 'border-red-200',
    titleColor: 'text-red-800',
  },
};

// ── Toast 通知组件 ──────────────────────────────────────
function ToastNotification({ toast, onRemove }: { toast: ToastItem; onRemove: (id: string) => void }) {
  const meta = toastMeta[toast.type];
  const Icon = meta.icon;
  const [visible, setVisible] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    // 入场动画
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // 自动消失
  useEffect(() => {
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      setRemoving(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const handleClose = () => {
    setRemoving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 ${
        visible && !removing
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 translate-x-full'
      } ${meta.bg} ${meta.border}`}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">
        <Icon size={18} className={meta.titleColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${meta.titleColor}`}>{toast.title}</p>
        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>
      </div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 hover:bg-black/5 rounded-lg transition-colors"
        aria-label="关闭通知"
      >
        <X size={14} className="text-slate-400" />
      </button>
    </div>
  );
}

// ── Toast 容器（固定在右下角） ───────────────────────────
function ToastContainer({ toasts, onRemove }: { toasts: ToastItem[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastNotification toast={toast} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
}

// ── Provider 组件 ───────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counterRef = useRef(0);

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `toast_${Date.now()}_${counterRef.current++}`;
    setToasts(prev => [...prev.slice(-4), { ...toast, id }]); // 最多显示 5 条
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}
