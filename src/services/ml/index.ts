/**
 * ML Services Export Module
 * 
 * Central export point for all ML-related services
 */

// Translation services
export {
  translateText,
  batchTranslate,
  detectLanguage,
  type TranslationRequest,
  type TranslationResponse,
} from './translationModel';

// LLM services
export {
  generateAnswer,
  generateEmbedding,
  type LLMRequest,
  type BilingualAnswer,
} from './llmModel';

// Content generation services
export {
  generateNotes,
  generateQuiz,
  type NotesRequest,
  type BilingualNotes,
  type QuizRequest,
  type QuizQuestion,
  type QuizResponse,
} from './contentGenerator';

// Speech services
export {
  speechToText,
  textToSpeech,
  getAvailableVoices,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  type SpeechToTextRequest,
  type SpeechToTextResponse,
  type TextToSpeechRequest,
} from './speechModel';

/**
 * Configuration for ML services
 * 
 * In production, these would come from environment variables
 */
export const ML_CONFIG = {
  // API endpoints (for production)
  TRANSLATION_API_URL: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TRANSLATION_API_URL) || '',
  LLM_API_URL: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_LLM_API_URL) || '',
  SPEECH_API_URL: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SPEECH_API_URL) || '',
  
  // API keys (use environment variables in production)
  OPENAI_API_KEY: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENAI_API_KEY) || '',
  GOOGLE_API_KEY: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_API_KEY) || '',
  
  // Model configuration
  DEFAULT_MODEL: 'gpt-4',
  TEMPERATURE: 0.7,
  MAX_TOKENS: 1000,
  
  // Supported languages
  SUPPORTED_LANGUAGES: ['hi', 'te', 'ta', 'kn', 'en'],
  
  // Feature flags
  USE_MOCK_DATA: true, // Set to false when real APIs are configured
  ENABLE_CACHING: true,
  ENABLE_ANALYTICS: false,
};

/**
 * Utility function to check if ML services are properly configured
 */
export function isMLConfigured(): boolean {
  if (ML_CONFIG.USE_MOCK_DATA) {
    return true;
  }
  
  return !!(
    ML_CONFIG.LLM_API_URL &&
    (ML_CONFIG.OPENAI_API_KEY || ML_CONFIG.GOOGLE_API_KEY)
  );
}

/**
 * Get ML service status
 */
export function getMLServiceStatus() {
  return {
    configured: isMLConfigured(),
    useMockData: ML_CONFIG.USE_MOCK_DATA,
    supportedLanguages: ML_CONFIG.SUPPORTED_LANGUAGES,
    speechRecognitionAvailable: isSpeechRecognitionSupported(),
    speechSynthesisAvailable: isSpeechSynthesisSupported(),
  };
}
