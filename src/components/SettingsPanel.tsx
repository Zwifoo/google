'use client';

import { X, Shield, Volume2, History } from 'lucide-react';
import { useMagicSearchStore } from '@/store/magic-search-store';
import { TRIGGERS } from '@/config/triggers';

interface SettingsPanelProps {
  onClose: () => void;
}

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { searchHistory } = useMagicSearchStore();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Pengaturan</h2>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Trigger Words */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <Volume2 className="w-5 h-5 text-purple-300" />
              <h3 className="text-lg font-medium text-white">Kata Pemicu</h3>
            </div>
            <div className="bg-black/20 rounded-xl p-4 border border-white/10">
              <p className="text-sm text-white/70 mb-3">
                Kata-kata yang memicu pencarian otomatis:
              </p>
              <div className="flex flex-wrap gap-2">
                {TRIGGERS.map((trigger) => (
                  <span
                    key={trigger}
                    className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-white/10 rounded-full text-sm text-white font-medium"
                  >
                    &ldquo;{trigger}&rdquo;
                  </span>
                ))}
              </div>
              <p className="text-xs text-white/50 mt-3">
                Contoh penggunaan: &ldquo;Mantap tas hitam&rdquo;, &ldquo;Fix smartphone&rdquo;, &ldquo;Yakin laptop gaming?&rdquo;
              </p>
            </div>
          </section>

          {/* Privacy */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="w-5 h-5 text-green-300" />
              <h3 className="text-lg font-medium text-white">Privasi</h3>
            </div>
            <div className="bg-black/20 rounded-xl p-4 border border-white/10 space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm text-white font-medium">Audio Lokal</p>
                  <p className="text-xs text-white/60">
                    Semua pemrosesan suara dilakukan di browser Anda
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm text-white font-medium">Tidak Tersimpan</p>
                  <p className="text-xs text-white/60">
                    Rekaman suara tidak disimpan atau dikirim ke server
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm text-white font-medium">Google Search API</p>
                  <p className="text-xs text-white/60">
                    Hanya kata kunci yang dikirim ke Google untuk pencarian
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Search History */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <History className="w-5 h-5 text-blue-300" />
              <h3 className="text-lg font-medium text-white">Riwayat Pencarian</h3>
            </div>
            <div className="bg-black/20 rounded-xl p-4 border border-white/10">
              {searchHistory.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {searchHistory.map((search, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">
                          &ldquo;{search.keyword}&rdquo;
                        </p>
                        <p className="text-xs text-white/50">
                          {search.timestamp.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <span className="text-xs text-purple-300">
                        {search.results.length} hasil
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/60 text-center py-4">
                  Belum ada riwayat pencarian
                </p>
              )}
            </div>
          </section>

          {/* Info */}
          <section>
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-white/10">
              <h4 className="text-sm font-medium text-white mb-2">Magic Search v1.0</h4>
              <p className="text-xs text-white/60 leading-relaxed">
                Aplikasi pencarian ajaib dengan teknologi Speech Recognition untuk bahasa Indonesia. 
                Dibuat dengan Next.js, Tailwind CSS, dan Web Speech API.
              </p>
              <p className="text-xs text-purple-300 mt-2">
                Kompatibel dengan Chrome dan Edge pada Android/Desktop
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
