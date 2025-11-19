// Test the new parseQuizText function

interface QuizQuestion {
  id: string;
  questionLocal: string;
  questionEnglish: string;
  options: string[];
  correctAnswer: number;
  explanationLocal: string;
  explanationEnglish: string;
}

function parseQuizText(quizText: string, language: string): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  
  try {
    // Split by "Q:" at the beginning of lines
    const questionBlocks = quizText.split(/^\s*Q:\s*/m).slice(1);

    for (const block of questionBlocks) {
      if (!block.trim().length) continue;

      try {
        const lines = block.split('\n');
        
        // First non-empty line is the question
        let questionText = '';
        let lineIndex = 0;
        
        for (; lineIndex < lines.length; lineIndex++) {
          const trimmed = lines[lineIndex].trim();
          if (trimmed && !trimmed.match(/^[A-D]\)/)) {
            questionText = trimmed
              .replace(/\*\*/g, '')
              .replace(/\*/g, '')
              .trim();
            lineIndex++;
            break;
          }
        }

        if (!questionText) continue;

        const options: string[] = [];
        let correctAnswerIndex = -1;
        let explanation = '';

        // Process remaining lines
        for (; lineIndex < lines.length; lineIndex++) {
          const line = lines[lineIndex].trim();
          
          // Skip empty lines
          if (!line) continue;

          // Check for [CORRECT] marker
          if (line === '[CORRECT]' || line.startsWith('[CORRECT]')) {
            // The next non-empty line should contain the correct option
            for (let k = lineIndex + 1; k < lines.length; k++) {
              const nextLine = lines[k].trim();
              if (nextLine.match(/^[A-D]\)/)) {
                const correctLetter = nextLine.match(/^([A-D])/)[1];
                correctAnswerIndex = correctLetter.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
                break;
              }
            }
            continue;
          }

          // Match option patterns: "A) text"
          const optionMatch = line.match(/^[A-D]\)\s+(.+)$/);
          if (optionMatch) {
            const optionText = optionMatch[1]
              .replace(/\*\*/g, '')
              .replace(/\*/g, '')
              .trim();
            options.push(optionText);
            continue;
          }

          // If we have all options, rest is explanation
          if (options.length === 4) {
            explanation = lines.slice(lineIndex).map(l => l.trim()).filter(l => l).join(' ');
            break;
          }
        }

        // Fallback: if no answer marked with [CORRECT], default to first
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
            explanationLocal: explanation.trim() || 'No explanation provided.',
            explanationEnglish: explanation.trim() || 'No explanation provided.',
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

// Test with actual Groq output
const testQuiz = `Q: What is the primary byproduct of photosynthesis in plants?

A) Glucose and oxygen
B) Glucose and carbon dioxide
C) Oxygen and water
D) Carbon dioxide and nitrogen

[CORRECT] A) Glucose and oxygen
Explanation: During photosynthesis, plants use sunlight, water, and carbon dioxide to produce glucose (a type of sugar that serves as energy for the plant) and oxygen as a byproduct. This process is essential for plant growth and is also crucial for the oxygen supply in the Earth's atmosphere.`;

const parsed = parseQuizText(testQuiz, 'en');

console.log('Parsed questions:', parsed.length);
parsed.forEach((q, i) => {
  console.log(`\n=== Question ${i + 1} ===`);
  console.log(`Text: ${q.questionEnglish}`);
  console.log(`Options:`);
  q.options.forEach((opt, j) => {
    console.log(`  ${String.fromCharCode(65 + j)}) ${opt}`);
  });
  console.log(`Correct Answer: ${String.fromCharCode(65 + q.correctAnswer)}) ${q.options[q.correctAnswer]}`);
  console.log(`Explanation: ${q.explanationEnglish}`);
});
