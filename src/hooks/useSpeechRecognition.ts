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

export function useSpeechRecognition() {
  const recognition = useRef<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const lastKeywordRef = useRef<{ keyword: string; timestamp: number } | null>(null);
  
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

      // Configure recognition
      rec.continuous = STT_CONFIG.continuous;
      rec.interimResults = STT_CONFIG.interimResults;
      rec.lang = STT_CONFIG.lang;
      rec.maxAlternatives = STT_CONFIG.maxAlternatives;

      rec.onstart = () => {
        setIsListening(true);
        setListeningState('listening');
        setError(null);
      };

      rec.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          
          // Try all alternatives for better accuracy
          let bestTranscript = '';
          for (let j = 0; j < Math.min(result.length, STT_CONFIG.maxAlternatives); j++) {
            const alternative = result[j];
            if (j === 0 || alternative.confidence > 0.7) { // Use alternative if high confidence
              bestTranscript = alternative.transcript;
              break;
            }
          }
          
          if (!bestTranscript) {
            bestTranscript = result[0].transcript; // Fallback to first alternative
          }

          if (result.isFinal) {
            finalTranscript += bestTranscript;
          } else {
            interimTranscript += bestTranscript;
          }
        }

        if (finalTranscript) {
          setTranscript(prev => (prev + ' ' + finalTranscript).trim());
          
          // Check for keyword in final transcript
          const keyword = extractKeyword(finalTranscript);
          if (keyword) {
            debouncedDetection.current(keyword);
          }
        }

        if (interimTranscript) {
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
        console.error('Speech recognition error:', event);
        setIsListening(false);
        
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setListeningState('no-permission');
          setError('Izin mikrofon diperlukan untuk menggunakan fitur ini');
        } else if (event.error === 'no-speech') {
          setListeningState('idle');
          setError('Tidak ada suara terdeteksi. Coba berbicara lebih jelas.');
        } else {
          setListeningState('error');
          setError('Terjadi kesalahan pada pengenalan suara');
        }
      };

      rec.onend = () => {
        setIsListening(false);
        setListeningState('idle');
        setInterimTranscript('');
      };

      rec.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      setError('Gagal memulai pengenalan suara');
      setListeningState('error');
    }
  };

  const stopListening = () => {
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
