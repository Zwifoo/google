'use client';

import { useState } from 'react';
import { Mic, MicOff, Volume2, Settings } from 'lucide-react';
import { useMagicSearchStore } from '@/store/magic-search-store';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import ListeningView from './ListeningView';
import ConfirmationOverlay from './ConfirmationOverlay';
import SettingsPanel from './SettingsPanel';
import Toast from './Toast';

export default function MagicSearchApp() {
  const [showSettings, setShowSettings] = useState(false);
  const {
    listeningState,
    showConfirmation,
    error,
    confirmSearch,
    resetApp
  } = useMagicSearchStore();
  
  const {
    startListening,
    stopListening,
    isListening
  } = useSpeechRecognition();

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleReset = () => {
    stopListening();
    resetApp();
  };

  // Test function untuk debug
  const handleTestSearch = () => {
    console.log('🧪 Testing direct Google search...');
    confirmSearch('test search');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 sm:p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
            <Volume2 className="w-6 h-6 text-purple-200" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
              Search
            </h1>
            <p className="text-sm text-purple-300">Pencarian Ajaib Indonesia</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 bg-white/10 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 px-4 sm:px-6 pb-24">
        <ListeningView onToggleListening={handleToggleListening} />
      </main>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/50 to-transparent backdrop-blur-sm">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={handleToggleListening}
              disabled={listeningState === 'no-permission' || listeningState === 'requesting-permission'}
              className={`
                w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center
                transition-all duration-300 transform hover:scale-105 active:scale-95
                ${isListening 
                  ? 'bg-red-500 shadow-lg shadow-red-500/50 animate-pulse' 
                  : listeningState === 'requesting-permission'
                    ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50 animate-pulse'
                    : 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50'
                }
                ${(listeningState === 'no-permission' || listeningState === 'requesting-permission') ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {isListening ? (
                <MicOff className="w-8 h-8 sm:w-10 sm:h-10" />
              ) : (
                <Mic className="w-8 h-8 sm:w-10 sm:h-10" />
              )}
            </button>
            
            {isListening && (
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-white/10 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors text-sm font-medium"
              >
                Reset
              </button>
            )}
            
            {/* Test button untuk debug */}
            <button
              onClick={handleTestSearch}
              className="px-6 py-3 bg-red-500/20 rounded-full backdrop-blur-sm hover:bg-red-500/30 transition-colors text-sm font-medium border border-red-400/30"
            >
              🧪 Test Google
            </button>
          </div>
          
          {/* Status indicator */}
          <div className="text-center mt-3">
            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium
              ${listeningState === 'listening' ? 'bg-green-500/20 text-green-200' :
                listeningState === 'requesting-permission' ? 'bg-yellow-500/20 text-yellow-200' :
                listeningState === 'error' ? 'bg-red-500/20 text-red-200' :
                listeningState === 'no-permission' ? 'bg-orange-500/20 text-orange-200' :
                'bg-white/10 text-white/70'
              }
            `}>
              <div className={`w-2 h-2 rounded-full ${
                listeningState === 'listening' ? 'bg-green-400 animate-pulse' :
                listeningState === 'requesting-permission' ? 'bg-yellow-400 animate-pulse' :
                listeningState === 'error' ? 'bg-red-400' :
                listeningState === 'no-permission' ? 'bg-orange-400' :
                'bg-white/50'
              }`}></div>
              <span>
                {listeningState === 'listening' ? 'Mendengarkan...' :
                 listeningState === 'requesting-permission' ? 'Meminta izin mikrofon...' :
                 listeningState === 'error' ? 'Error' :
                 listeningState === 'no-permission' ? 'Izin mikrofon diperlukan' :
                 'Siap mendengarkan'}
              </span>
            </div>
          </div>
        </div>

      {/* Overlays */}
      {showConfirmation && <ConfirmationOverlay />}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      {error && <Toast message={error} type="error" />}
    </div>
  );
}

