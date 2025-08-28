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

  // Client-side guard: Check if magic has been used
  useEffect(() => {
    const checkMagicUsed = async () => {
      // Check localStorage first (faster)
      const localUsed = localStorage.getItem('magic-used');
      if (localUsed === 'true') {
        console.log('🔒 Magic already used (localStorage), redirecting...');
        window.location.replace('https://www.google.com');
        return;
      }
      
      // Check server-side cookie as backup
      try {
        const response = await fetch('/api/magic-status', {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (data.isUsed) {
          console.log('🔒 Magic already used (server cookie), redirecting...');
          localStorage.setItem('magic-used', 'true'); // Sync localStorage
          window.location.replace('https://www.google.com');
        }
      } catch (error) {
        console.warn('⚠️ Failed to check server status:', error);
      }
    };
    
    checkMagicUsed();
  }, []);

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
