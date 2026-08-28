import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

interface ToastNotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ message, type, onClose }) => {
  const bgStyles = {
    success: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200',
    error: 'bg-rose-950/90 border-rose-500/50 text-rose-200',
    info: 'bg-cyan-950/90 border-cyan-500/50 text-cyan-200'
  };

  const Icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400" />,
    info: <Info className="w-5 h-5 text-cyan-400" />
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-slide-up ${bgStyles[type]}`}>
      {Icons[type]}
      <span className="text-sm font-medium pr-2">{message}</span>
      <button 
        onClick={onClose}
        className="p-1 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
