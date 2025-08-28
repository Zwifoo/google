'use client';

import { useMagicSearchStore } from '@/store/magic-search-store';
import { TRIGGERS } from '@/config/triggers';
import WaveformVisualizer from './WaveformVisualizer';

interface ListeningViewProps {
  onToggleListening: () => void;
}

export default function ListeningView({ onToggleListening }: ListeningViewProps) {
  const { transcript, interimTranscript, listeningState, isSearching } = useMagicSearchStore();
  
  const combinedTranscript = `${transcript} ${interimTranscript}`.trim();
  const isListening = listeningState === 'listening';

  // Show searching feedback
  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🪄</span>
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Membuka Google Search...</h2>
          <p className="text-purple-200">Keajaiban sedang terjadi! ✨</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      {/* Waveform Visualizer */}
      <div className="relative">
        <WaveformVisualizer isActive={isListening} />
      </div>

      {/* Transcript Display */}
      <div className="w-full max-w-2xl">
        {combinedTranscript ? (
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-sm font-medium text-purple-200 mb-3">Transkripsi:</h3>
            <p className="text-white text-lg leading-relaxed min-h-[2rem]">
              {combinedTranscript}
              {interimTranscript && (
                <span className="text-white/60 italic"> {interimTranscript}</span>
              )}
            </p>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                {isListening ? 'Mendengarkan...' : 'Siap Mendengarkan'}
              </h2>
              <p className="text-purple-200 text-sm max-w-md mx-auto">
                {isListening 
                  ? 'Ucapkan kata kunci setelah trigger phrase untuk memulai pencarian ajaib'
                  : 'Tekan tombol mikrofon untuk memulai'
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Trigger Hint */}
      {/* <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-center space-x-2 text-sm">
          <span className="text-purple-200">Kata pemicu:</span>
          <div className="flex space-x-2">
            {TRIGGERS.map((trigger, index) => (
              <span
                key={trigger}
                className="px-2 py-1 bg-white/10 rounded-full text-white font-medium text-xs"
              >
                &ldquo;{trigger}&rdquo;{index < TRIGGERS.length - 1 && ','}
              </span>
            ))}
          </div>
        </div>
        <p className="text-xs text-purple-300 text-center mt-2">
          Contoh: &ldquo;Mantap tas hitam&rdquo; atau &ldquo;Fix laptop gaming&rdquo; atau &ldquo;Yakin sepatu merah?&rdquo;
        </p>
      </div> */}

      {/* Status Messages */}
      {listeningState === 'requesting-permission' && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-yellow-200 font-medium">Meminta Izin Mikrofon</span>
          </div>
          <p className="text-yellow-200 text-sm">
            Silakan klik &ldquo;Izinkan&rdquo; pada popup browser untuk menggunakan mikrofon
          </p>
        </div>
      )}

      {listeningState === 'no-permission' && (
        <div className="bg-orange-500/20 border border-orange-500/30 rounded-xl p-4 text-center">
          <p className="text-orange-200 text-sm">
            Aplikasi memerlukan izin mikrofon untuk berfungsi. Silakan berikan izin dan coba lagi.
          </p>
        </div>
      )}

      {listeningState === 'error' && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-center">
          <p className="text-red-200 text-sm">
            Terjadi kesalahan pada sistem pengenalan suara. Coba refresh halaman.
          </p>
        </div>
      )}
    </div>
  );
}
