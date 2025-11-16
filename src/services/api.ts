/**
 * Backend API Service
 * 
 * This service handles all communication with the Python backend
 * running on http://localhost:8000
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Types
export interface DetectLanguageRequest {
  text: string;
}

export interface DetectLanguageResponse {
  language: string;
  confidence: number;
}

export interface ClassifyIntentRequest {
  text: string;
}

export interface ClassifyIntentResponse {
  intent: string;
  confidence: number;
  all_scores: Record<string, number>;
}

export interface GenerateAnswerRequest {
  prompt: string;
  max_length?: number;
  temperature?: number;
}

export interface GenerateAnswerResponse {
  answers: Array<{
    text: string;
    score: number;
  }>;
}

export interface TranslateRequest {
  text: string;
  target_lang: string;
  source_lang?: string;
}

export interface TranslateResponse {
  translated_text: string;
  source_lang: string;
  target_lang: string;
}

export interface GenerateNotesRequest {
  text: string;
  max_length?: number;
  temperature?: number;
}

export interface GenerateQuizRequest {
  text: string;
  num_questions?: number;
  max_length?: number;
  temperature?: number;
}

// Helper function to make API calls
async function apiCall<T>(
  endpoint: string,
  method: 'GET' | 'POST' = 'POST',
  body?: Record<string, any>
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `API Error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

// API Functions

/**
 * Detect the language of input text
 */
export async function detectLanguage(
  request: DetectLanguageRequest
): Promise<DetectLanguageResponse> {
  return apiCall<DetectLanguageResponse>('/detect-language', 'POST', request);
}

/**
 * Classify the intent of input text
 */
export async function classifyIntent(
  request: ClassifyIntentRequest
): Promise<ClassifyIntentResponse> {
  return apiCall<ClassifyIntentResponse>('/classify-intent', 'POST', request);
}

/**
 * Generate an answer based on a prompt
 */
export async function generateAnswer(
  request: GenerateAnswerRequest
): Promise<GenerateAnswerResponse> {
  return apiCall<GenerateAnswerResponse>('/generate-answer', 'POST', request);
}

/**
 * Translate text to a target language
 */
export async function translateText(
  request: TranslateRequest
): Promise<TranslateResponse> {
  return apiCall<TranslateResponse>('/translate', 'POST', request);
}

/**
 * Generate study notes from text
 */
export async function generateNotes(
  request: GenerateNotesRequest
): Promise<GenerateAnswerResponse> {
  return apiCall<GenerateAnswerResponse>('/generate-notes', 'POST', request);
}

/**
 * Generate a quiz from text
 */
export async function generateQuiz(
  request: GenerateQuizRequest
): Promise<GenerateAnswerResponse> {
  return apiCall<GenerateAnswerResponse>('/generate-quiz', 'POST', request);
}

/**
 * Get supported languages
 */
export async function getSupportedLanguages(): Promise<{
  supported_languages: string[];
  language_codes: Record<string, string>;
}> {
  return apiCall('/supported-languages', 'GET');
}

/**
 * Health check - verify backend is running
 */
export async function healthCheck(): Promise<{ status: string; message: string }> {
  return apiCall('/', 'GET');
}
