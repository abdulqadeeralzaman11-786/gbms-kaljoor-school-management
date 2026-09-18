import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { toast } = useApp();

  if (!toast.visible) return null;

  const bgStyles = {
    success: 'bg-emerald-900/90 text-white border-emerald-700',
    error: 'bg-rose-900/90 text-white border-rose-700',
    info: 'bg-blue-900/90 text-white border-blue-700',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md shadow-2xl rounded-xl border backdrop-blur-md p-4 transition-all duration-300 no-print">
      <div className={`flex items-center gap-3 ${bgStyles[toast.type]} rounded-lg p-3`}>
        {icons[toast.type]}
        <p className="text-xs sm:text-sm font-medium pr-2">{toast.message}</p>
      </div>
    </div>
  );
};
