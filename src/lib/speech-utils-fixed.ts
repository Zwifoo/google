import { TRIGGERS, MAX_KEYWORD_TOKENS } from '@/config/triggers';
import type { SpeechRecognitionConstructor } from '@/types/speech';

/**
 * Simple string similarity checker (Levenshtein-like)
 */
function getSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1;
  if (str1.length === 0 || str2.length === 0) return 0;
  
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => 
    Array(str1.length + 1).fill(null)
  );
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + cost
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Extracts keyword from Indonesian text after trigger phrases
 * @param text - The text to analyze
 * @param triggers - Array of trigger words to look for
 * @returns Extracted keyword or null if none found
 */
export function extractKeyword(text: string, triggers = TRIGGERS): string | null {
  if (!text || !text.trim()) return null;

  // Debug logging
  console.log('🔍 Speech input:', text);

  // Normalize text: lowercase, remove filler words, clean up spaces
  const norm = ` ${text
    .toLowerCase()
    .replace(/\b(e+h*|em+|hmm+|aa+h*|uh+|oh+|ah+|eh+)\b/g, ' ') // Remove Indonesian filler words
    .replace(/[.,!;:]/g, ' ') // Replace punctuation with spaces
    .replace(/\s+/g, ' ') // Multiple spaces to single
    .trim()} `; // Add spaces at start and end for pattern matching

  if (!norm.trim()) return null;

  // Find the last occurrence of any trigger phrase
  let bestMatch = { index: -1, trigger: '', position: -1 };
  
  for (const trigger of triggers) {
    const lowerTrigger = trigger.toLowerCase();
    
    // Main patterns with exact matching (prioritize exact matches)
    const exactPatterns = [
      ` ${lowerTrigger} `,           // " pilih "
      ` ${lowerTrigger} itu `,       // " pilih itu "
      ` ${lowerTrigger} ini `,       // " pilih ini "
      `${lowerTrigger} `,            // "pilih " (at start)
      ` ${lowerTrigger}`,            // " pilih" (at end)  
      ` ${lowerTrigger}kan `,        // " pilihkan "
      ` ${lowerTrigger}lah `,        // " pilihlah "
      ` ${lowerTrigger} dong `,      // " pilih dong "
      ` ${lowerTrigger} aja `,       // " pilih aja "
      ` ${lowerTrigger} deh `,       // " pilih deh "
    ];
    
    // Only add partial patterns for specific triggers to avoid false matches
    const partialPatterns = [];
    if (lowerTrigger === 'googling') {
      partialPatterns.push(' googlin ', ' gugling ');
    } else if (lowerTrigger === 'memilih') {
      partialPatterns.push(' milih ');
    }
    
    const allPatterns = [...exactPatterns, ...partialPatterns];
    
    
    // First try exact pattern matching
    for (const pattern of allPatterns) {
      const index = norm.lastIndexOf(pattern);
      console.log(`   Pattern "${pattern}" found at index:`, index);
      if (index >= 0 && index > bestMatch.index) {
        bestMatch = { 
          index, 
          trigger: pattern.trim(), 
          position: index + pattern.length 
        };
      }
    }
    
    // If no exact match found, try fuzzy matching for this trigger (with stricter threshold)
    if (bestMatch.index < 0) {
      const words = norm.trim().split(' ');
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const similarity = getSimilarity(word, lowerTrigger);
        // Increased threshold to 85% to reduce false positives
        if (similarity >= 0.85 && word.length >= Math.min(4, lowerTrigger.length - 1)) {
          console.log(`🎯 Fuzzy match: "${word}" ~= "${lowerTrigger}" (${Math.round(similarity * 100)}%)`);
          const wordIndex = norm.indexOf(` ${word} `);
          if (wordIndex >= 0 && wordIndex > bestMatch.index) {
            bestMatch = { 
              index: wordIndex, 
              trigger: word, 
              position: wordIndex + word.length + 2 // +2 for spaces
            };
          }
        }
      }
    }
  }

  if (bestMatch.index < 0) {
    return null;
  }


  // Extract everything after the trigger
  let afterTrigger = norm.slice(bestMatch.position).trim();
  
  
  // Remove common Indonesian question particles and endings - be more selective
  afterTrigger = afterTrigger.replace(/\b(ya|kan|dong|sih|nih|gak|ga|nggak|enggak|lah|deh|aja)\b/g, ' ');
  
  // Stop at question mark or sentence endings
  const stopIndex = afterTrigger.search(/[?!.]/);
  if (stopIndex >= 0) {
    afterTrigger = afterTrigger.slice(0, stopIndex);
  }
  
  console.log('🧹 After particle removal:', afterTrigger);
  
  // Clean and preserve meaningful multi-word phrases
  const words = afterTrigger
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(word => {
      // Keep word if:
      // 1. Not empty
      // 2. Not a very common stop word (reduced list)
      // 3. Length > 1 to avoid single letters
      return word.length > 1 && 
             !/^(warna|berwarna|yang|tadi|dan|saya|aku|gue|lu|kamu|dia|mereka|kita|anda|beliau|coba|atau|percaya|gak|nggak|enggak|dari|ke|di|pada|untuk|dengan|oleh|akan|sudah|belum|ini|itu|sama|juga|biar|kalau|kalo|apa|siapa|kapan|dimana|kenapa|bagaimana|gimana|nih|deh|dong|kok|sih|kan|ya|lah|loh|toh|nah|oke|okeh|hmm|pasti|betul|bener|iya|tidak|mungkin|tapi|lalu|kemudian|terus|karena|sehingga|supaya|agar|namun|walaupun|maupun|meskipun|jadi|sekarang|nanti|besok|kemarin|barusan)$/.test(word);
    });
  
  
  // Take up to MAX_KEYWORD_TOKENS words and join them
  const candidate = words
    .slice(0, MAX_KEYWORD_TOKENS)
    .join(' ')
    .trim();

  
  // Additional validation: ensure keyword is meaningful
  if (candidate.length > 0) {
    // Must be at least 2 characters and not just numbers/punctuation
    if (candidate.length >= 2 && /[a-zA-Z]/.test(candidate)) {
      return candidate;
    } else {
      return null;
    }
  }
  
  return null;
}

/**
 * Check if the browser supports Web Speech API
 */
export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && 
         ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
}

/**
 * Get SpeechRecognition constructor
 */
export function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;
  
  const debouncedFunc = ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T & { cancel: () => void };
  
  debouncedFunc.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  
  return debouncedFunc;
}

