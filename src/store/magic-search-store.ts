import { create } from 'zustand';
import type { 
  ListeningState, 
  DetectedKeyword, 
  PredictionResult
} from '@/types/speech';

interface MagicSearchState {
  // Listening state
  listeningState: ListeningState;
  transcript: string;
  interimTranscript: string;
  
  // Detection state
  detectedKeyword: DetectedKeyword | null;
  showConfirmation: boolean;
  
  // Search state
  isSearching: boolean;
  currentPrediction: PredictionResult | null;
  searchHistory: PredictionResult[];
  
  // UI state
  showResults: boolean;
  error: string | null;
  
  // Actions
  setListeningState: (state: ListeningState) => void;
  setTranscript: (transcript: string | ((prev: string) => string)) => void;
  setInterimTranscript: (transcript: string) => void;
  setDetectedKeyword: (keyword: DetectedKeyword | null) => void;
  setShowConfirmation: (show: boolean) => void;
  setIsSearching: (searching: boolean) => void;
  setPredictionResult: (result: PredictionResult | null) => void;
  addToHistory: (result: PredictionResult) => void;
  setShowResults: (show: boolean) => void;
  setError: (error: string | null) => void;
  
  // Complex actions
  confirmSearch: (keyword: string) => Promise<void>;
  resetApp: () => void;
}

export const useMagicSearchStore = create<MagicSearchState>((set) => ({
  // Initial state
  listeningState: 'idle',
  transcript: '',
  interimTranscript: '',
  detectedKeyword: null,
  showConfirmation: false,
  isSearching: false,
  currentPrediction: null,
  searchHistory: [],
  showResults: false,
  error: null,
  
  // Basic actions
  setListeningState: (state) => set({ listeningState: state }),
  setTranscript: (transcript) => set((prevState) => ({
    transcript: typeof transcript === 'function' ? transcript(prevState.transcript) : transcript
  })),
  setInterimTranscript: (transcript) => set({ interimTranscript: transcript }),
  setDetectedKeyword: (keyword) => set({ detectedKeyword: keyword }),
  setShowConfirmation: (show) => set({ showConfirmation: show }),
  setIsSearching: (searching) => set({ isSearching: searching }),
  setPredictionResult: (result) => set({ currentPrediction: result }),
  addToHistory: (result) => set((state) => ({
    searchHistory: [result, ...state.searchHistory.slice(0, 4)] // Keep last 5
  })),
  setShowResults: (show) => set({ showResults: show }),
  setError: (error) => set({ error }),
  
  // Complex actions
  confirmSearch: async (keyword: string) => {
    console.log('🚀 confirmSearch called with keyword:', keyword);
    
    set({ 
      isSearching: true, 
      showConfirmation: false,
      error: null 
    });
    
    try {
      // Langsung redirect ke Google dengan keyword
      const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}&hl=id`;
      console.log('🔗 Redirecting to Google URL:', googleUrl);
      
      // Mark magic as used in localStorage
      localStorage.setItem('magic-used', 'true');
      localStorage.setItem('magic-used-timestamp', Date.now().toString());
      console.log('💾 Magic usage marked in localStorage');
      
      // Mark magic as used on server
      try {
        const response = await fetch('/api/magic-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          console.log('✅ Magic usage marked on server');
        } else {
          console.warn('⚠️ Failed to mark usage on server, but continuing...');
        }
      } catch (serverError) {
        console.warn('⚠️ Server marking failed:', serverError);
      }
      
      // Direct redirect (no popup, no new tab)
      console.log('🎯 Performing direct redirect...');
      window.location.replace(googleUrl); // Use replace to prevent back navigation
      
    } catch (error) {
      console.error('❌ Search failed:', error);
      set({
        error: 'Gagal membuka Google. Coba lagi.',
        isSearching: false
      });
    }
  },
  
  resetApp: () => set({
    listeningState: 'idle',
    transcript: '',
    interimTranscript: '',
    detectedKeyword: null,
    showConfirmation: false,
    isSearching: false,
    currentPrediction: null,
    showResults: false,
    error: null
  })
}));
