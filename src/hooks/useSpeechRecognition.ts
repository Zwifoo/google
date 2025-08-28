'use client';

import { useEffect, useRef, useState } from 'react';
import { useMagicSearchStore } from '@/store/magic-search-store';
import { 
  getSpeechRecognition, 
  isSpeechRecognitionSupported,
  extractKeyword,
  debounce
} from '@/lib/speech-utils-fixed';
import { STT_CONFIG, DEBOUNCE_MS, UI_CONFIG } from '@/config/triggers';
import type { SpeechRecognition, SpeechRecognitionEvent } from '@/types/speech';

// Mobile detection helper
function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function useSpeechRecognition() {
  const recognition = useRef<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const lastKeywordRef = useRef<{ keyword: string; timestamp: number } | null>(null);
  const shouldKeepListening = useRef(false); // Flag to track if we want to keep listening
  
  const {
    setListeningState,
    setTranscript,
    setInterimTranscript,
    setDetectedKeyword,
    setShowConfirmation,
    setError,
    confirmSearch
  } = useMagicSearchStore();

  // Debounced keyword detection
  const debouncedDetection = useRef(
    debounce((...args: unknown[]) => {
      const keyword = args[0] as string;
      const now = Date.now();
      const lastKeyword = lastKeywordRef.current;
      
      // Skip if same keyword detected within debounce period
      if (lastKeyword && lastKeyword.keyword === keyword && (now - lastKeyword.timestamp) < DEBOUNCE_MS) {
        return;
      }
      
      lastKeywordRef.current = { keyword, timestamp: now };
      
      setDetectedKeyword({
        text: keyword,
        timestamp: new Date()
      });
      setShowConfirmation(true);
      
      // Auto-confirm after timeout
      setTimeout(() => {
        if (useMagicSearchStore.getState().showConfirmation) {
          confirmSearch(keyword);
        }
      }, UI_CONFIG.confirmTimeout);
      
    }, 150)
  );

  const startListening = async () => {
    if (!isSpeechRecognitionSupported()) {
      setError('Browser tidak mendukung Speech Recognition. Gunakan Chrome atau Edge.');
      setListeningState('error');
      return;
    }

    // Set state to requesting permission
    setListeningState('requesting-permission');
    setError(null);

    // Request microphone permission first
    try {
      console.log('🎤 Meminta izin mikrofon...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Izin mikrofon diberikan');
      
      // Stop the stream immediately since we only need permission
      stream.getTracks().forEach(track => track.stop());
    } catch (permissionError) {
      console.error('❌ Izin mikrofon ditolak:', permissionError);
      setError('Izin mikrofon diperlukan. Silakan izinkan akses mikrofon dan coba lagi.');
      setListeningState('no-permission');
      return;
    }

    try {
      const SpeechRecognitionClass = getSpeechRecognition();
      if (!SpeechRecognitionClass) {
        setError('Speech Recognition tidak tersedia');
        setListeningState('error');
        return;
      }

      recognition.current = new SpeechRecognitionClass();
      const rec = recognition.current;

      // Configure recognition with mobile-specific settings
      const isOnMobile = isMobile();
      rec.continuous = isOnMobile ? false : STT_CONFIG.continuous; // Disable continuous on mobile
      rec.interimResults = STT_CONFIG.interimResults;
      rec.lang = STT_CONFIG.lang;
      rec.maxAlternatives = STT_CONFIG.maxAlternatives;
      
      console.log('📱 Mobile device detected:', isOnMobile);
      console.log('⚙️ Using continuous mode:', rec.continuous);

      rec.onstart = () => {
        console.log('🎤 Speech recognition started');
        setIsListening(true);
        setListeningState('listening');
        setError(null);
        shouldKeepListening.current = true;
        
        // Clear previous transcripts when starting fresh
        setTranscript('');
        setInterimTranscript('');
      };

      rec.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        // Process all results from the current recognition session
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;

          if (result.isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Update transcripts - don't accumulate, replace instead
        if (finalTranscript) {
          console.log('📝 Final transcript:', finalTranscript);
          setTranscript(finalTranscript); // Replace, don't accumulate
          
          // Check for keyword in final transcript
          const keyword = extractKeyword(finalTranscript);
          if (keyword) {
            console.log('🎯 Final keyword found:', keyword);
            debouncedDetection.current(keyword);
          }
        }

        if (interimTranscript) {
          console.log('⏳ Interim transcript:', interimTranscript);
          setInterimTranscript(interimTranscript);
          
          // Only check interim results if transcript is long enough and seems complete
          // This reduces false positives from partial speech
          if (interimTranscript.length > 10 && interimTranscript.endsWith(' ')) {
            const keyword = extractKeyword(interimTranscript);
            if (keyword && keyword.length > 3) { // Require minimum keyword length
              console.log('🚀 Interim keyword detected:', keyword);
              debouncedDetection.current(keyword);
            }
          }
        }
      };

      rec.onerror = (event) => {
        console.error('🚨 Speech recognition error:', event);
        setIsListening(false);
        
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setListeningState('no-permission');
          setError('Izin mikrofon diperlukan untuk menggunakan fitur ini');
        } else if (event.error === 'no-speech') {
          console.log('⚠️ No speech detected, continuing...');
          // Don't show error for no-speech, just continue listening
          setListeningState('listening');
          setError(null);
        } else if (event.error === 'audio-capture') {
          setListeningState('error');
          setError('Gagal mengakses mikrofon. Pastikan mikrofon tidak digunakan aplikasi lain.');
        } else if (event.error === 'network') {
          setListeningState('error');  
          setError('Masalah koneksi internet. Periksa koneksi Anda.');
        } else {
          console.log('🔄 Speech recognition error, will retry:', event.error);
          setListeningState('error');
          setError('Terjadi kesalahan pada pengenalan suara');
        }
      };

      rec.onend = () => {
        console.log('🏁 Speech recognition ended');
        setIsListening(false);
        setInterimTranscript('');
        
        // Auto-restart for mobile if still in listening state
        const currentState = useMagicSearchStore.getState().listeningState;
        if (currentState === 'listening' && shouldKeepListening.current) {
          console.log('🔄 Auto-restarting recognition for mobile...');
          setTimeout(() => {
            if (recognition.current && shouldKeepListening.current) {
              try {
                recognition.current.start();
              } catch (restartError) {
                console.error('❌ Failed to auto-restart:', restartError);
                setListeningState('idle');
                shouldKeepListening.current = false;
              }
            }
          }, 100);
        } else {
          setListeningState('idle');
          shouldKeepListening.current = false;
        }
      };

      rec.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      setError('Gagal memulai pengenalan suara');
      setListeningState('error');
    }
  };

  const stopListening = () => {
    console.log('🛑 Stopping speech recognition');
    shouldKeepListening.current = false; // Stop auto-restart
    if (recognition.current) {
      recognition.current.stop();
    }
    setIsListening(false);
    setListeningState('idle');
    setInterimTranscript('');
  };

  // Cleanup
  useEffect(() => {
    const currentDebounce = debouncedDetection.current;
    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
      currentDebounce.cancel();
    };
  }, []);

  return {
    startListening,
    stopListening,
    isListening,
    isSupported: isSpeechRecognitionSupported()
  };
}
