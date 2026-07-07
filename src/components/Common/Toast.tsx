import { useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
  duration?: number;
}

export const Toast = ({ type, message, onClose, duration = 4000 }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    error: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
    warning: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    info: 'bg-sky-500/15 border-sky-500/30 text-sky-400'
  };

  const icons = {
    success: <CheckCircle className="w-4.5 h-4.5" />,
    error: <AlertCircle className="w-4.5 h-4.5" />,
    warning: <AlertCircle className="w-4.5 h-4.5" />,
    info: <Info className="w-4.5 h-4.5" />
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex items-center gap-3 px-4.5 py-3 rounded-xl border backdrop-blur-md shadow-2xl z-[9999] pointer-events-auto max-w-sm w-full font-sans ${colors[type]}`}
      role="alert"
    >
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <span className="text-xs font-semibold tracking-wide leading-relaxed">{message}</span>
      <button 
        onClick={onClose} 
        className="ml-auto text-current/60 hover:text-current hover:bg-white/5 p-1 rounded-lg transition-all cursor-pointer"
        aria-label="Dismiss feedback"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
};
