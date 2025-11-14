/**
 * Speech-to-Text and Text-to-Speech Service
 * 
 * In production, integrate with:
 * 1. Google Cloud Speech-to-Text API (supports Indian languages)
 * 2. Azure Speech Services
 * 3. AWS Transcribe
 * 4. Bhashini (Government of India's speech API)
 * 5. Web Speech API (browser-based, limited language support)
 */

export interface SpeechToTextRequest {
  audioBlob?: Blob;
  language: string;
  useWebAPI?: boolean;
}

export interface SpeechToTextResponse {
  text: string;
  confidence: number;
  language: string;
  alternativeTranscripts?: string[];
}

export interface TextToSpeechRequest {
  text: string;
  language: string;
  voice?: string;
  speed?: number;
}

/**
 * Convert speech to text using Web Speech API or mock
 */
export async function speechToText(request: SpeechToTextRequest): Promise<SpeechToTextResponse> {
  // Check if Web Speech API is available
  if (request.useWebAPI && 'webkitSpeechRecognition' in window) {
    return webSpeechRecognition(request.language);
  }

  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Mock transcriptions based on language
  const mockTranscriptions: Record<string, string[]> = {
    hi: [
      'प्रकाश संश्लेषण क्या है',
      'कोशिका की संरचना समझाइए',
      'न्यूटन के नियम बताइए',
    ],
    te: [
      'కిరణజన్య సంయోగక్రియ అంటే ఏమిటి',
      'కణ నిర్మాణాన్ని వివరించండి',
      'న్యూటన్ నియమాలను చెప్పండి',
    ],
    ta: [
      'ஒளிச்சேர்க்கை என்றால் என்ன',
      'செல் அமைப்பை விளக்கவும்',
      'நியூட்டன் விதிகளைச் சொல்லுங்கள்',
    ],
    kn: [
      'ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ ಎಂದರೇನು',
      'ಕೋಶ ರಚನೆಯನ್ನು ವಿವರಿಸಿ',
      'ನ್ಯೂಟನ್ ನಿಯಮಗಳನ್ನು ಹೇಳಿ',
    ],
    en: [
      'What is photosynthesis',
      'Explain cell structure',
      'State Newton\'s laws',
    ],
  };

  const transcripts = mockTranscriptions[request.language] || mockTranscriptions['en'];
  const randomTranscript = transcripts[Math.floor(Math.random() * transcripts.length)];

  return {
    text: randomTranscript,
    confidence: 0.92,
    language: request.language,
    alternativeTranscripts: transcripts.filter(t => t !== randomTranscript).slice(0, 2),
  };
}

/**
 * Use browser's Web Speech API for real speech recognition
 */
function webSpeechRecognition(language: string): Promise<SpeechToTextResponse> {
  return new Promise((resolve, reject) => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    
    if (!SpeechRecognition) {
      reject(new Error('Speech Recognition not supported in this browser'));
      return;
    }

    const recognition = new SpeechRecognition();
    
    // Map our language codes to Web Speech API language codes
    const languageMap: Record<string, string> = {
      hi: 'hi-IN',
      te: 'te-IN',
      ta: 'ta-IN',
      kn: 'kn-IN',
      en: 'en-IN',
    };

    recognition.lang = languageMap[language] || 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onresult = (event: any) => {
      const results = event.results[0];
      const transcript = results[0].transcript;
      const confidence = results[0].confidence;
      
      const alternatives: string[] = [];
      for (let i = 1; i < results.length; i++) {
        alternatives.push(results[i].transcript);
      }

      resolve({
        text: transcript,
        confidence,
        language,
        alternativeTranscripts: alternatives,
      });
    };

    recognition.onerror = (event: any) => {
      reject(new Error(`Speech recognition error: ${event.error}`));
    };

    recognition.start();
  });
}

/**
 * Convert text to speech
 */
export async function textToSpeech(request: TextToSpeechRequest): Promise<void> {
  // Check if Web Speech API is available
  if ('speechSynthesis' in window) {
    return webSpeechSynthesis(request);
  }

  // For production, integrate with:
  // - Google Cloud Text-to-Speech
  // - Azure Speech Services
  // - Amazon Polly
  
  console.log('Text-to-Speech not available in this environment');
}

/**
 * Use browser's Web Speech Synthesis API
 */
function webSpeechSynthesis(request: TextToSpeechRequest): Promise<void> {
  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(request.text);
    
    // Map our language codes to Web Speech API language codes
    const languageMap: Record<string, string> = {
      hi: 'hi-IN',
      te: 'te-IN',
      ta: 'ta-IN',
      kn: 'kn-IN',
      en: 'en-IN',
    };

    utterance.lang = languageMap[request.language] || 'en-IN';
    utterance.rate = request.speed || 1.0;
    
    // Try to find a voice for the specified language
    const voices = speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(utterance.lang.split('-')[0]));
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));

    speechSynthesis.speak(utterance);
  });
}

/**
 * Get available voices for a language
 */
export function getAvailableVoices(language: string): SpeechSynthesisVoice[] {
  if (!('speechSynthesis' in window)) {
    return [];
  }

  const languageMap: Record<string, string> = {
    hi: 'hi',
    te: 'te',
    ta: 'ta',
    kn: 'kn',
    en: 'en',
  };

  const langCode = languageMap[language] || 'en';
  const voices = speechSynthesis.getVoices();
  
  return voices.filter(voice => voice.lang.startsWith(langCode));
}

/**
 * Check if speech recognition is supported
 */
export function isSpeechRecognitionSupported(): boolean {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

/**
 * Check if speech synthesis is supported
 */
export function isSpeechSynthesisSupported(): boolean {
  return 'speechSynthesis' in window;
}
