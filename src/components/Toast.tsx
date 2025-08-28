'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';
import { useMagicSearchStore } from '@/store/magic-search-store';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export default function Toast({ message, type, duration = 5000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { setError } = useMagicSearchStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        setError(null);
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, setError]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setError(null);
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/20 border-green-500/30';
      case 'error':
        return 'bg-red-500/20 border-red-500/30';
      case 'warning':
        return 'bg-orange-500/20 border-orange-500/30';
      case 'info':
        return 'bg-blue-500/20 border-blue-500/30';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`
      fixed top-4 right-4 z-50 
      transform transition-all duration-300 ease-out
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      <div className={`
        ${getColorClasses()}
        backdrop-blur-md rounded-xl p-4 border shadow-lg max-w-sm
        animate-in slide-in-from-right-full duration-300
      `}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 pt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium leading-relaxed">
              {message}
            </p>
          </div>
          
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-3 h-3 text-white/70" />
          </button>
        </div>
      </div>
    </div>
  );
}
