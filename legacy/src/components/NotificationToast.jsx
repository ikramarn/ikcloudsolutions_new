import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export const NotificationToast = () => {
  const { notification } = useApp();

  if (!notification) return null;

  const isSuccess = notification.type === 'success';
  const isInfo = notification.type === 'info';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce duration-500">
      <div className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl border shadow-2xl glass-panel text-xs font-medium ${
        isSuccess 
          ? 'border-emerald-500/50 text-emerald-300 bg-emerald-950/80 shadow-emerald-500/20' 
          : isInfo 
          ? 'border-cyan-500/50 text-cyan-300 bg-cyan-950/80 shadow-cyan-500/20' 
          : 'border-amber-500/50 text-amber-300 bg-amber-950/80 shadow-amber-500/20'
      }`}>
        {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
        {isInfo && <Info className="w-4 h-4 text-cyan-400 shrink-0" />}
        {!isSuccess && !isInfo && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
        <span>{notification.message}</span>
      </div>
    </div>
  );
};
