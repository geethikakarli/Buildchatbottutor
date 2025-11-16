import { useState } from 'react';
import { ArrowLeft, Plus, Trophy, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { generateQuiz } from '../services/mlBackend';

interface QuizPageProps {
  selectedLanguage: string;
  onBack: () => void;
}

interface Question {
  id: string;
  questionLocal: string;
  questionEnglish: string;
  options: string[];
  correctAnswer: number;
  explanationLocal: string;
  explanationEnglish: string;
}

interface Quiz {
  id: string;
  title: string;
  subject: string;
  questions: Question[];
  completed: boolean;
  score?: number;
  createdAt: Date;
}

interface QuizAttempt {
  answers: Record<string, number>;
  submitted: boolean;
}

const languageNames: Record<string, string> = {
  hi: 'Hindi',
  te: 'Telugu',
  ta: 'Tamil',
  kn: 'Kannada',
  en: 'English',
};

const mockQuizData: Record<string, Question[]> = {
  hi: [
    {
      id: 'q1',
      questionLocal: 'प्रकाश संश्लेषण के लिए कौन सा अंग जिम्मेदार है?',
      questionEnglish: 'Which organelle is responsible for photosynthesis?',
      options: ['माइटोकॉन्ड्रिया / Mitochondria', 'क्लोरोप्लास्ट / Chloroplast', 'राइबोसोम / Ribosome', 'न्यूक्लियस / Nucleus'],
      correctAnswer: 1,
      explanationLocal: 'क्लोरोप्लास्ट में क्लोरोफिल होता है जो प्रकाश को अवशोषित करता है।',
      explanationEnglish: 'Chloroplasts contain chlorophyll which absorbs light.',
    },
    {
      id: 'q2',
      questionLocal: 'प्रकाश संश्लेषण का उत्पाद क्या है?',
      questionEnglish: 'What is the product of photosynthesis?',
      options: ['CO2', 'H2O', 'ग्लूकोज / Glucose', 'N2'],
      correctAnswer: 2,
      explanationLocal: 'प्रकाश संश्लेषण ग्लूकोज और ऑक्सीजन का उत्पादन करता है।',
      explanationEnglish: 'Photosynthesis produces glucose and oxygen.',
    },
  ],
  te: [
    {
      id: 'q1',
      questionLocal: 'కిరణజన్య సంయోగక్రియకు బాధ్యత వహించే అవయవం ఏది?',
      questionEnglish: 'Which organelle is responsible for photosynthesis?',
      options: ['మైటోకాండ్రియా / Mitochondria', 'క్లోరోప్లాస్ట్ / Chloroplast', 'రైబోజోమ్ / Ribosome', 'న్యూక్లియస్ / Nucleus'],
      correctAnswer: 1,
      explanationLocal: 'క్లోరోప్లాస్ట్‌లో క్లోరోఫిల్ ఉంటుంది, ఇది కాంతిని గ్రహిస్తుంది.',
      explanationEnglish: 'Chloroplasts contain chlorophyll which absorbs light.',
    },
    {
      id: 'q2',
      questionLocal: 'కిరణజన్య సంయోగక్రియ ఉత్పత్తి ఏమిటి?',
      questionEnglish: 'What is the product of photosynthesis?',
      options: ['CO2', 'H2O', 'గ్లూకోజ్ / Glucose', 'N2'],
      correctAnswer: 2,
      explanationLocal: 'కిరణజన్య సంయోగక్రియ గ్లూకోజ్ మరియు ఆక్సిజన్‌ను ఉత్పత్తి చేస్తుంది.',
      explanationEnglish: 'Photosynthesis produces glucose and oxygen.',
    },
  ],
  ta: [
    {
      id: 'q1',
      questionLocal: 'ஒளிச்சேர்க்கைக்கு எந்த உறுப்பு பொறுப்பு?',
      questionEnglish: 'Which organelle is responsible for photosynthesis?',
      options: ['மைட்டோகாண்ட்ரியா / Mitochondria', 'குளோரோபிளாஸ்ட் / Chloroplast', 'ரைபோசோம் / Ribosome', 'நியூக்ளியஸ் / Nucleus'],
      correctAnswer: 1,
      explanationLocal: 'குளோரோபிளாஸ்ட்களில் குளோரோபில் உள்ளது, இது ஒளியை உறிஞ்சுகிறது.',
      explanationEnglish: 'Chloroplasts contain chlorophyll which absorbs light.',
    },
    {
      id: 'q2',
      questionLocal: 'ஒளிச்சேர்க்கையின் விளைபொருள் என்ன?',
      questionEnglish: 'What is the product of photosynthesis?',
      options: ['CO2', 'H2O', 'குளுக்கோஸ் / Glucose', 'N2'],
      correctAnswer: 2,
      explanationLocal: 'ஒளிச்சேர்க்கை குளுக்கோஸ் மற்றும் ஆக்ஸிஜனை உற்பத்தி செய்கிறது.',
      explanationEnglish: 'Photosynthesis produces glucose and oxygen.',
    },
  ],
  kn: [
    {
      id: 'q1',
      questionLocal: 'ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆಗೆ ಯಾವ ಅಂಗಕ ಜವಾಬ್ದಾರ?',
      questionEnglish: 'Which organelle is responsible for photosynthesis?',
      options: ['ಮೈಟೊಕಾಂಡ್ರಿಯಾ / Mitochondria', 'ಕ್ಲೋರೊಪ್ಲಾಸ್ಟ್ / Chloroplast', 'ರೈಬೋಸೋಮ್ / Ribosome', 'ನ್ಯೂಕ್ಲಿಯಸ್ / Nucleus'],
      correctAnswer: 1,
      explanationLocal: 'ಕ್ಲೋರೊಪ್ಲಾಸ್ಟ್‌ಗಳು ಕ್ಲೋರೊಫಿಲ್ ಹೊಂದಿರುತ್ತವೆ, ಇದು ಬೆಳಕನ್ನು ಹೀರಿಕೊಳ್ಳುತ್ತದೆ.',
      explanationEnglish: 'Chloroplasts contain chlorophyll which absorbs light.',
    },
    {
      id: 'q2',
      questionLocal: 'ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆಯ ಉತ್ಪನ್ನ ಏನು?',
      questionEnglish: 'What is the product of photosynthesis?',
      options: ['CO2', 'H2O', 'ಗ್ಲೂಕೋಸ್ / Glucose', 'N2'],
      correctAnswer: 2,
      explanationLocal: 'ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ ಗ್ಲೂಕೋಸ್ ಮತ್ತು ಆಮ್ಲಜನಕವನ್ನು ಉತ್ಪಾದಿಸುತ್ತದೆ.',
      explanationEnglish: 'Photosynthesis produces glucose and oxygen.',
    },
  ],
  en: [
    {
      id: 'q1',
      questionLocal: 'Which organelle is responsible for photosynthesis?',
      questionEnglish: 'Which organelle is responsible for photosynthesis?',
      options: ['Mitochondria', 'Chloroplast', 'Ribosome', 'Nucleus'],
      correctAnswer: 1,
      explanationLocal: 'Chloroplasts contain chlorophyll which absorbs light energy.',
      explanationEnglish: 'Chloroplasts are the site of photosynthesis in plant cells. They contain chlorophyll pigments that capture light energy.',
    },
    {
      id: 'q2',
      questionLocal: 'What is the main product of photosynthesis?',
      questionEnglish: 'What is the main product of photosynthesis?',
      options: ['Carbon Dioxide', 'Water', 'Glucose', 'Nitrogen'],
      correctAnswer: 2,
      explanationLocal: 'Photosynthesis produces glucose and oxygen as products.',
      explanationEnglish: 'The main products are glucose (C6H12O6) which stores chemical energy, and oxygen (O2) which is released as a byproduct.',
    },
  ],
};

export function QuizPage({ selectedLanguage, onBack }: QuizPageProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt>({
    answers: {},
    submitted: false,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');

  const handleGenerateQuiz = async () => {
    if (!subject || !topic) return;

    setIsGenerating(true);
    setIsDialogOpen(false);

    try {
      // Use ML service to generate quiz
      const quizData = await generateQuiz({
        subject: subject,
        topic: topic,
        language: selectedLanguage,
        num_questions: 5,
      });

      const newQuiz: Quiz = {
        id: 'quiz_' + Date.now(),
        title: topic,
        subject: subject,
        questions: quizData.questions,
        completed: false,
        createdAt: new Date(),
      };

      setQuizzes((prev) => [newQuiz, ...prev]);
      setSubject('');
      setTopic('');
    } catch (error) {
      console.error('Error generating quiz:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setQuizAttempt({
      answers: {},
      submitted: false,
    });
  };

  const handleSelectAnswer = (questionId: string, answerIndex: number) => {
    if (quizAttempt.submitted) return;
    setQuizAttempt((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answerIndex,
      },
    }));
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;

    const score = activeQuiz.questions.reduce((acc, question) => {
      return quizAttempt.answers[question.id] === question.correctAnswer ? acc + 1 : acc;
    }, 0);

    setQuizAttempt((prev) => ({ ...prev, submitted: true }));

    // Update quiz in list
    setQuizzes((prev) =>
      prev.map((q) =>
        q.id === activeQuiz.id
          ? { ...q, completed: true, score: score }
          : q
      )
    );
  };

  const handleBackToList = () => {
    setActiveQuiz(null);
    setQuizAttempt({ answers: {}, submitted: false });
  };

  if (activeQuiz) {
    const score = activeQuiz.questions.reduce((acc, question) => {
      return quizAttempt.answers[question.id] === question.correctAnswer ? acc + 1 : acc;
    }, 0);

    return (
      <div className="flex flex-col h-full bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={handleBackToList} className="text-gray-600">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h2 className="text-gray-900">{activeQuiz.title}</h2>
              <p className="text-gray-600">{activeQuiz.subject}</p>
            </div>
            {quizAttempt.submitted && (
              <div className="text-right">
                <div className="text-gray-900">
                  {score}/{activeQuiz.questions.length}
                </div>
                <div className="text-gray-600">Score</div>
              </div>
            )}
          </div>
        </div>

        {/* Questions */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeQuiz.questions.map((question, index) => {
            const selectedAnswer = quizAttempt.answers[question.id];
            const isCorrect = selectedAnswer === question.correctAnswer;
            const showResult = quizAttempt.submitted;

            return (
              <div key={question.id} className="bg-white rounded-xl p-4 shadow-sm">
                {/* Question Number & Text */}
                <div className="mb-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 mb-2">{question.questionLocal}</p>
                      <p className="text-gray-600">{question.questionEnglish}</p>
                    </div>
                    {showResult && (
                      <div>
                        {isCorrect ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-600" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-2 mb-4">
                  {question.options.map((option, optionIndex) => {
                    const isSelected = selectedAnswer === optionIndex;
                    const isCorrectOption = optionIndex === question.correctAnswer;
                    
                    let optionClass = 'border-2 border-gray-200 bg-white';
                    if (showResult) {
                      if (isCorrectOption) {
                        optionClass = 'border-2 border-green-500 bg-green-50';
                      } else if (isSelected && !isCorrect) {
                        optionClass = 'border-2 border-red-500 bg-red-50';
                      }
                    } else if (isSelected) {
                      optionClass = 'border-2 border-blue-500 bg-blue-50';
                    }

                    return (
                      <button
                        key={optionIndex}
                        onClick={() => handleSelectAnswer(question.id, optionIndex)}
                        disabled={quizAttempt.submitted}
                        className={`w-full text-left p-3 rounded-lg transition-all ${optionClass} ${
                          !quizAttempt.submitted ? 'hover:border-blue-300' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-blue-600' : 'border-gray-300'
                          }`}>
                            {isSelected && (
                              <div className="w-3 h-3 rounded-full bg-blue-600" />
                            )}
                          </div>
                          <span className="text-gray-900">{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {showResult && (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="text-blue-600 mb-2">Explanation</div>
                    <p className="text-gray-900 mb-1">{question.explanationLocal}</p>
                    <p className="text-gray-600">{question.explanationEnglish}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        {!quizAttempt.submitted && (
          <div className="bg-white border-t border-gray-200 p-4">
            <Button
              onClick={handleSubmitQuiz}
              disabled={Object.keys(quizAttempt.answers).length !== activeQuiz.questions.length}
              className="w-full max-w-lg mx-auto block"
            >
              Submit Quiz
            </Button>
          </div>
        )}

        {/* Result */}
        {quizAttempt.submitted && (
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="max-w-lg mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-3">
                <Trophy className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-gray-900 mb-1">Quiz Complete!</h3>
              <p className="text-gray-600 mb-4">
                You scored {score} out of {activeQuiz.questions.length}
              </p>
              <Button onClick={handleBackToList} className="w-full">
                Back to Quizzes
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-gray-600">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-gray-900">Quizzes</h2>
              <p className="text-gray-600">{quizzes.length} quizzes</p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full h-10 w-10 p-0">
                <Plus className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate New Quiz</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="math">Mathematics</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                      <SelectItem value="geography">Geography</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Photosynthesis"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <Button
                  onClick={handleGenerateQuiz}
                  disabled={!subject || !topic || isGenerating}
                  className="w-full"
                >
                  {isGenerating ? 'Generating...' : 'Generate Quiz'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quiz List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isGenerating && (
          <div className="bg-white rounded-xl p-6 shadow-sm text-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
              <Trophy className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
            <p className="text-gray-900">Generating bilingual quiz...</p>
            <p className="text-gray-600">Creating MCQs with explanations</p>
          </div>
        )}

        {quizzes.length === 0 && !isGenerating && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Trophy className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-gray-900 mb-2">No Quizzes Yet</h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              Generate bilingual quizzes to test your knowledge in {languageNames[selectedLanguage]} and English
            </p>
          </div>
        )}

        <div className="grid gap-3">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-gray-900 mb-1">{quiz.title}</h3>
                  <p className="text-gray-600">{quiz.subject}</p>
                </div>
                {quiz.completed && quiz.score !== undefined && (
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    {quiz.score}/{quiz.questions.length}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-gray-500">
                  {quiz.questions.length} questions
                </p>
                <Button
                  onClick={() => handleStartQuiz(quiz)}
                  size="sm"
                  variant={quiz.completed ? 'outline' : 'default'}
                >
                  {quiz.completed ? 'Review' : 'Start Quiz'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}