/**
 * ML Backend Service
 * 
 * This service provides high-level ML functions that use the backend API
 * It handles language detection, intent classification, answer generation, 
 * notes generation, quiz generation, and translation
 */

import {
  detectLanguage as apiDetectLanguage,
  classifyIntent as apiClassifyIntent,
  generateAnswer as apiGenerateAnswer,
  translateText as apiTranslateText,
  generateNotes as apiGenerateNotes,
  generateQuiz as apiGenerateQuiz,
  healthCheck,
} from './api';

export interface MLRequest {
  question?: string;
  text?: string;
  language: string;
  subject?: string;
  topic?: string;
  num_questions?: number;
}

export interface BilingualAnswer {
  localLanguage: {
    text: string;
    language: string;
  };
  english: {
    text: string;
    language: string;
  };
  confidence: number;
}

export interface BilingualNotes {
  localLanguage: {
    text: string;
    language: string;
  };
  english: {
    text: string;
    language: string;
  };
}

export interface QuizQuestion {
  id: string;
  questionLocal: string;
  questionEnglish: string;
  options: string[];
  correctAnswer: number;
  explanationLocal: string;
  explanationEnglish: string;
}

export interface QuizResponse {
  questions: QuizQuestion[];
}

/**
 * Check if backend is available
 */
export async function isBackendAvailable(): Promise<boolean> {
  try {
    await healthCheck();
    return true;
  } catch (error) {
    console.warn('Backend is not available:', error);
    return false;
  }
}

/**
 * Generate a bilingual answer to a question
 */
export async function generateAnswer(request: MLRequest): Promise<BilingualAnswer> {
  try {
    // Step 1: Detect language if not provided
    let detectedLang = request.language;
    if (request.question) {
      try {
        const langDetection = await apiDetectLanguage({ text: request.question });
        detectedLang = langDetection.language;
      } catch (error) {
        console.warn('Language detection failed, using provided language:', error);
      }
    }

    // Step 2: Classify intent
    let intent = 'general';
    if (request.question) {
      try {
        const intentClassification = await apiClassifyIntent({ text: request.question });
        intent = intentClassification.intent;
      } catch (error) {
        console.warn('Intent classification failed:', error);
      }
    }

    // Step 3: Create a prompt based on intent
    const prompt = createPromptFromQuestion(request.question || '', intent, request.subject);

    // Step 4: Generate answer in English
    const answerResponse = await apiGenerateAnswer({
      prompt,
      max_length: 300,
      temperature: 0.7,
    });

    const englishAnswer = answerResponse.answers[0]?.text || 'Unable to generate answer';

    // Step 5: Translate to local language if needed
    let localAnswer = englishAnswer;
    if (detectedLang !== 'en' && detectedLang !== 'en_Latn') {
      try {
        const translation = await apiTranslateText({
          text: englishAnswer,
          target_lang: detectedLang,
          source_lang: 'en',
        });
        localAnswer = translation.translated_text;
      } catch (error) {
        console.warn('Translation failed, using English answer:', error);
        localAnswer = englishAnswer;
      }
    }

    return {
      localLanguage: {
        text: localAnswer,
        language: detectedLang,
      },
      english: {
        text: englishAnswer,
        language: 'en',
      },
      confidence: 0.85,
    };
  } catch (error) {
    console.error('Error generating answer:', error);
    throw error;
  }
}

/**
 * Generate bilingual study notes
 */
export async function generateNotes(request: MLRequest): Promise<BilingualNotes> {
  try {
    // Create a prompt for notes generation
    const prompt = `Generate comprehensive study notes for the following topic:
Subject: ${request.subject || 'General'}
Topic: ${request.topic || 'Unknown'}

Please provide:
1. Key concepts and definitions
2. Important points to remember
3. Examples and applications
4. Summary

Format the notes clearly with sections.`;

    // Generate notes in English
    const notesResponse = await apiGenerateNotes({
      text: prompt,
      max_length: 500,
      temperature: 0.7,
    });

    const englishNotes = notesResponse.answers[0]?.text || 'Unable to generate notes';

    // Translate to local language if needed
    let localNotes = englishNotes;
    if (request.language !== 'en') {
      try {
        const translation = await apiTranslateText({
          text: englishNotes,
          target_lang: request.language,
          source_lang: 'en',
        });
        localNotes = translation.translated_text;
      } catch (error) {
        console.warn('Translation failed, using English notes:', error);
        localNotes = englishNotes;
      }
    }

    return {
      localLanguage: {
        text: localNotes,
        language: request.language,
      },
      english: {
        text: englishNotes,
        language: 'en',
      },
    };
  } catch (error) {
    console.error('Error generating notes:', error);
    throw error;
  }
}

/**
 * Generate a bilingual quiz
 */
export async function generateQuiz(request: MLRequest): Promise<QuizResponse> {
  try {
    const numQuestions = request.num_questions || 5;

    // Create a prompt for quiz generation
    const prompt = `Generate ${numQuestions} multiple-choice questions for the following topic:
Subject: ${request.subject || 'General'}
Topic: ${request.topic || 'Unknown'}

For each question, provide:
1. The question in English
2. Four options (A, B, C, D)
3. The correct answer
4. A brief explanation

Format each question clearly with Q: prefix and options with A), B), C), D) prefixes.
Mark the correct answer with [CORRECT] tag.`;

    // Generate quiz in English
    const quizResponse = await apiGenerateQuiz({
      text: prompt,
      num_questions: numQuestions,
      max_length: 1000,
      temperature: 0.7,
    });

    const quizText = quizResponse.answers[0]?.text || '';

    // Parse the quiz text into structured questions
    const questions = parseQuizText(quizText, request.language);

    return {
      questions,
    };
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
}

/**
 * Helper function to create a prompt from a question
 */
function createPromptFromQuestion(question: string, intent: string, subject?: string): string {
  let prompt = '';

  switch (intent) {
    case 'definition':
      prompt = `Define and explain: ${question}`;
      break;
    case 'concept':
      prompt = `Explain the concept of: ${question}`;
      break;
    case 'numerical':
      prompt = `Solve this problem: ${question}`;
      break;
    case 'comparison':
      prompt = `Compare and contrast: ${question}`;
      break;
    case 'explanation':
      prompt = `Explain in detail: ${question}`;
      break;
    case 'example':
      prompt = `Provide examples of: ${question}`;
      break;
    default:
      prompt = `Answer this question: ${question}`;
  }

  if (subject) {
    prompt += ` (Subject: ${subject})`;
  }

  return prompt;
}

/**
 * Helper function to parse quiz text into structured questions
 */
function parseQuizText(quizText: string, language: string): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  
  try {
    // Split by question markers (handle "**Q:" and "Q:" formats)
    const questionBlocks = quizText.split(/\*?\*?Q\d+:?\*?\*?/).slice(1); // Skip first empty element

    for (const block of questionBlocks) {
      if (!block.trim().length) continue;

      try {
        const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length < 5) continue;

        // First line is the question
        let questionText = lines[0]
          .replace(/\*\*/g, '') // Remove bold markers
          .replace(/\*/g, '') // Remove other markdown
          .replace(/^#+\s+/, '') // Remove heading markers
          .trim();

        const options: string[] = [];
        let correctAnswerIndex = -1;
        let explanation = '';
        let answerLine = '';

        for (let j = 1; j < lines.length; j++) {
          const line = lines[j];

          // Look for "Answer:" line
          if (line.match(/^Answer:\s*[A-D]\)/i)) {
            answerLine = line;
          }

          // Look for explanation
          if (line.match(/^Explanation:/i)) {
            explanation = lines.slice(j + 1).join(' ').trim();
            break;
          }

          // Match option patterns: "A) text"
          const optionMatch = line.match(/^[A-D]\)\s+(.+)$/);
          if (optionMatch) {
            const optionText = optionMatch[1]
              .replace(/\*\*/g, '') // Remove bold
              .replace(/\*/g, '') // Remove markdown
              .trim();

            options.push(optionText);
          }
        }

        // Extract correct answer from "Answer: B) ..." format
        if (answerLine && correctAnswerIndex === -1) {
          const answerMatch = answerLine.match(/Answer:\s*([A-D])\)/i);
          if (answerMatch) {
            const answerLetter = answerMatch[1].toUpperCase();
            const answerIndex = answerLetter.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
            if (answerIndex >= 0 && answerIndex < options.length) {
              correctAnswerIndex = answerIndex;
            }
          }
        }

        // Fallback: try to find correct answer in options (some models might mark it inline)
        if (correctAnswerIndex === -1 && options.length === 4) {
          for (let k = 0; k < options.length; k++) {
            if (options[k].includes('[CORRECT]') || options[k].includes('***')) {
              correctAnswerIndex = k;
              // Clean the option text
              options[k] = options[k]
                .replace(/\[CORRECT\]/g, '')
                .replace(/\*\*\*/g, '')
                .trim();
              break;
            }
          }
        }

        // If still no answer found, default to first option
        if (correctAnswerIndex === -1 && options.length === 4) {
          correctAnswerIndex = 0;
        }

        // Only add if we have all 4 options
        if (options.length === 4 && correctAnswerIndex >= 0) {
          const question: QuizQuestion = {
            id: `q_${questions.length + 1}`,
            questionLocal: questionText,
            questionEnglish: questionText,
            options,
            correctAnswer: correctAnswerIndex,
            explanationLocal: explanation || 'Refer to the options for more details.',
            explanationEnglish: explanation || 'Refer to the options for more details.',
          };
          questions.push(question);
        }
      } catch (error) {
        console.warn('Failed to parse question block:', error);
      }
    }
  } catch (error) {
    console.warn('Failed to parse quiz text:', error);
  }

  return questions;
}
