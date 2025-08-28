export const TRIGGERS = ["Browsing", "Brosing", "Brosin", "Googling", "Gukling", "Guling", "Searching", "Serching", "Sercing"] as const;

export const MAX_KEYWORD_TOKENS = 6;

export const DEBOUNCE_MS = 1000;

export const STT_CONFIG = {
  lang: 'id-ID',
  continuous: true,
  interimResults: true,
  maxAlternatives: 3, // Increased for better recognition
} as const;

export const SEARCH_CONFIG = {
  maxResults: 5,
  searchTimeout: 5000,
} as const;

export const UI_CONFIG = {
  confirmTimeout: 1200,
  animationDuration: 250,
  maxTranscriptLength: 500,
} as const;
