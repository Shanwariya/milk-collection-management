import React from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Toast = () => {
  const { toast } = useApp();

  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 left-4 sm:left-auto sm:max-w-md z-50 animate-bounce transition-all duration-300">
      <div className={`p-4 rounded-2xl shadow-xl border flex items-center gap-3 backdrop-blur-md ${
        isSuccess 
          ? 'bg-emerald-900/90 text-emerald-100 border-emerald-500/50 shadow-emerald-900/20' 
          : 'bg-rose-900/90 text-rose-100 border-rose-500/50 shadow-rose-900/20'
      }`}>
        {isSuccess ? (
          <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
        ) : (
          <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
        )}
        <div className="text-sm font-semibold flex-1">{toast.message}</div>
      </div>
    </div>
  );
};
