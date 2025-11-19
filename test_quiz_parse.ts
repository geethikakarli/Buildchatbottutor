// Test script to validate quiz parsing

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
    // Split by question markers (handle both "Q:" and "**Q:**" and "Q1:", "Q2:" formats)
    const questionPattern = /\*?\*?Q\d*:?\*?\*?|^(?=\n?[A-D]\))/gm;
    const questionBlocks = quizText.split(/\*?\*?Q\d+:?\*?\*?/);

    for (let i = 1; i < questionBlocks.length; i++) {
      const block = questionBlocks[i].trim();
      if (!block) continue;

      try {
        const lines = block.split('\n').filter(line => line.trim());
        if (lines.length < 5) continue;

        // Remove markdown formatting from question text
        let questionText = lines[0]
          .replace(/\*\*/g, '') // Remove bold markers
          .replace(/\*\*/g, '') // Remove bold markers
          .replace(/\*/g, '') // Remove other markdown
          .replace(/^#+\s+/, '') // Remove heading markers
          .trim();
        
        const options: string[] = [];
        let correctAnswerIndex = -1;
        let explanation = '';

        for (let j = 1; j < lines.length; j++) {
          let line = lines[j].trim();
          
          // Look for explanation lines
          if (line.toLowerCase().includes('explanation') || line.toLowerCase().includes('answer')) {
            explanation = lines.slice(j).join('\n').trim();
            break;
          }
          
          // Match option patterns: "A)", "A)", "A) ", "A) text", etc.
          const optionMatch = line.match(/^[A-D]\)\s*(.*?)(?:\s*\[(CORRECT|Answer)\])?$/i);
          
          if (optionMatch) {
            let optionText = optionMatch[1]
              .replace(/\*\*/g, '') // Remove bold
              .replace(/\*/g, '') // Remove markdown
              .trim();
            
            options.push(optionText);
            
            // Check if this option is marked as correct
            if (line.includes('[CORRECT]') || line.includes('CORRECT') || line.includes('Answer:')) {
              correctAnswerIndex = options.length - 1;
            }
          }
        }

        // If no explicit correct answer marked, try to infer from explanation or use first option
        if (correctAnswerIndex === -1 && options.length === 4) {
          // Try to find which option is mentioned in explanation
          const explanationLower = explanation.toLowerCase();
          for (let k = 0; k < options.length; k++) {
            const optionLower = options[k].toLowerCase();
            if (explanationLower.includes(optionLower.substring(0, Math.min(10, optionLower.length)))) {
              correctAnswerIndex = k;
              break;
            }
          }
          // Fallback to first option if still not found
          if (correctAnswerIndex === -1) {
            correctAnswerIndex = 0;
          }
        }

        // Only add if we have all 4 options
        if (options.length === 4) {
          const question: QuizQuestion = {
            id: `q_${questions.length + 1}`,
            questionLocal: questionText,
            questionEnglish: questionText,
            options,
            correctAnswer: correctAnswerIndex,
            explanationLocal: explanation || 'See options above',
            explanationEnglish: explanation || 'See options above',
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

// Sample quiz text from Groq
const sampleQuizText = `Here are 2 multiple-choice questions on the topic of Photosynthesis:

**Q: What is the primary role of chlorophyll in photosynthesis?**

A) To break down carbohydrates into glucose
B) To absorb and utilize sunlight for energy
C) To release oxygen as a byproduct of photosynthesis
D) To regulate the enzyme activity in the chloroplasts

**Answer: B) To absorb and utilize sunlight for energy**

Explanation: Chlorophyll is the pigment in plants that absorbs light energy, primarily in the blue and red wavelengths. This light energy is converted into chemical energy in the form of ATP and NADPH, which are then used to produce glucose.

---

**Q: Which of the following is NOT a product of the light-dependent reactions of photosynthesis?**

A) ATP
B) NADPH
C) Glucose
D) Oxygen

**Answer: C) Glucose**

Explanation: Glucose is a product of the light-independent reactions (Calvin cycle) or the dark reactions of photosynthesis. The light-dependent reactions produce ATP, NADPH, and oxygen. Glucose is synthesized in the Calvin cycle using the ATP and NADPH produced by the light reactions.`;

const parsed = parseQuizText(sampleQuizText, 'en');
console.log('Parsed questions:', parsed.length);
parsed.forEach((q, i) => {
  console.log(`\nQuestion ${i + 1}:`);
  console.log(`  Text: ${q.questionEnglish}`);
  console.log(`  Options:`, q.options);
  console.log(`  Correct Answer Index: ${q.correctAnswer} (${q.options[q.correctAnswer]})`);
  console.log(`  Explanation: ${q.explanationEnglish.substring(0, 100)}...`);
});
