'use client';

import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { useMagicSearchStore } from '@/store/magic-search-store';
import { UI_CONFIG } from '@/config/triggers';

export default function ConfirmationOverlay() {
  const [countdown, setCountdown] = useState(UI_CONFIG.confirmTimeout / 100);
  const { detectedKeyword, confirmSearch, setShowConfirmation } = useMagicSearchStore();

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          // Auto-confirm ketika countdown habis
          if (detectedKeyword) {
            console.log('⏰ Auto-confirming search for:', detectedKeyword.text);
            confirmSearch(detectedKeyword.text);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [detectedKeyword, confirmSearch]);

  const handleConfirm = () => {
    if (detectedKeyword) {
      console.log('✅ Manual confirm for:', detectedKeyword.text);
      confirmSearch(detectedKeyword.text);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  if (!detectedKeyword) return null;

  const progress = (countdown / (UI_CONFIG.confirmTimeout / 100)) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl max-w-md w-full mx-4 transform animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {/* Countdown Ring */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="2"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="2"
              strokeDasharray={`${progress}, 100`}
              className="transition-all duration-100 ease-linear"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🔮</span>
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-white">Kata Kunci Terdeteksi</h2>
          
          <div className="bg-black/20 rounded-xl p-4 border border-white/10">
            <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text">
              &ldquo;{detectedKeyword.text}&rdquo;
            </p>
            <p className="text-sm text-white/60 mt-2">
              {detectedKeyword.timestamp.toLocaleTimeString('id-ID')}
            </p>
          </div>

          <p className="text-white/80 text-sm">
            Buka Google dalam <span className="font-bold text-purple-300">{Math.ceil(countdown / 10)}</span> detik...
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-8">
          <button
            onClick={handleCancel}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/20"
          >
            <X className="w-4 h-4" />
            <span>Batal</span>
          </button>
          
          <button
            onClick={handleConfirm}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl transition-all shadow-lg"
          >
            <Check className="w-4 h-4" />
            <span>Konfirmasi</span>
          </button>
        </div>

        {/* Progress indicator */}
        <div className="mt-4 bg-white/10 rounded-full h-1 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-100 ease-linear"
            style={{ width: `${100 - progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
