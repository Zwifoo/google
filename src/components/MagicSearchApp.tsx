'use client';

import { useState, useEffect } from 'react';
import { useMagicSearchStore } from '@/store/magic-search-store';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import Toast from './Toast';

export default function MagicSearchApp() {
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  
  const {
    listeningState,
    error
  } = useMagicSearchStore();
  
  const {
    startListening,
    stopListening,
    isListening
  } = useSpeechRecognition();

  // Double tap detection
  const handleTap = () => {
    const now = Date.now();
    const timeDiff = now - lastTapTime;
    
    if (timeDiff < 300) { // Double tap within 300ms
      setTapCount(2);
      handleToggleListening();
    } else {
      setTapCount(1);
    }
    
    setLastTapTime(now);
  };

  // Reset tap count after timeout
  useEffect(() => {
    if (tapCount === 1) {
      const timeout = setTimeout(() => setTapCount(0), 300);
      return () => clearTimeout(timeout);
    }
  }, [tapCount]);

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div 
      className="min-h-screen bg-white flex items-center justify-center cursor-pointer select-none"
      onClick={handleTap}
      style={{ 
        WebkitUserSelect: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      {/* Minimal dot indicator in center */}
      <div 
        className={`
          w-3 h-3 rounded-full transition-all duration-500
          ${isListening 
            ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50' 
            : listeningState === 'requesting-permission'
              ? 'bg-yellow-500 animate-pulse'
              : listeningState === 'error' 
                ? 'bg-red-500'
                : 'bg-white'
          }
        `}
      />
      
      {/* Hidden error toast - only shows if critical error */}
      {error && <Toast message={error} type="error" />}
    </div>
  );
}
