import { TRIGGERS, MAX_KEYWORD_TOKENS } from '@/config/triggers';
import type { SpeechRecognitionConstructor } from '@/types/speech';

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

  console.log('🧹 Normalized:', norm.trim());
  console.log('🎯 Looking for triggers:', triggers);

  // Find the last occurrence of any trigger phrase
  let bestMatch = { index: -1, trigger: '', position: -1 };
  
  for (const trigger of triggers) {
    const lowerTrigger = trigger.toLowerCase();
    const patterns = [
      ` ${lowerTrigger} `,
      ` ${lowerTrigger} itu `,
      ` ${lowerTrigger} ini `,
      `${lowerTrigger} `, // Support trigger at start of sentence
    ];
    
    console.log(`🔎 Checking trigger "${trigger}" (${lowerTrigger}):`, patterns);
    
    for (const pattern of patterns) {
      const index = norm.lastIndexOf(pattern);
      console.log(`   Pattern "${pattern}" found at index:`, index);
      if (index >= 0 && index > bestMatch.index) {
        bestMatch = { 
          index, 
          trigger: pattern.trim(), 
          position: index + pattern.length 
        };
        console.log('✅ New best match:', bestMatch);
      }
    }
  }

  if (bestMatch.index < 0) {
    console.log('❌ No trigger found');
    return null;
  }

  console.log('🎯 Best trigger match:', bestMatch);

  // Extract everything after the trigger
  let afterTrigger = norm.slice(bestMatch.position).trim();
  
  console.log('📝 Text after trigger:', afterTrigger);
  
  // Remove common Indonesian question particles and endings
  afterTrigger = afterTrigger.replace(/\b(ya|kan|dong|sih|nih|gak|ga|nggak|enggak)\b/g, ' ');
  
  // Stop at question mark or sentence endings
  const stopIndex = afterTrigger.search(/[?!.]/);
  if (stopIndex >= 0) {
    afterTrigger = afterTrigger.slice(0, stopIndex);
  }
  
  // Clean and tokenize
  const candidate = afterTrigger
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(word => word.length > 0 && !/^(yang|dan|atau|dari|ke|di|pada|untuk|dengan|oleh|akan|sudah|belum)$/.test(word)) // Remove common Indonesian stop words
    .slice(0, MAX_KEYWORD_TOKENS)
    .join(' ')
    .trim();

  console.log('🎁 Final keyword:', candidate || 'null');
  
  return candidate.length > 0 ? candidate : null;
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
