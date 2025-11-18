import { useState, useMemo } from 'react';
import { ArrowLeft, Plus, Trophy, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

interface StudentProfile {
  id: string;
  email: string;
  name: string;
  grade: string;
  school: string;
  subjects: string[];
  preparationStatus: string;
  targetExam: string;
  goals: string[];
  studyHours: string;
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
  hi: 'हिंदी',
  te: 'తెలుగు',
  ta: 'தமிழ்',
  kn: 'ಕನ್ನಡ',
  en: 'English',
};

export function QuizPage({
  student,
  selectedLanguage,
  onBack,
}: {
  student: StudentProfile;
  selectedLanguage: string;
  onBack: () => void;
}) {
  // Safety check for student prop
  if (!student || !student.subjects) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Loading student data...</p>
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt>({
    answers: {},
    submitted: false,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');

  const updateProgress = (subject: string, score: number, totalQuestions: number) => {
    try {
      const progressKey = `progress_${student.id}`;
      const savedProgress = localStorage.getItem(progressKey);
      const progress = savedProgress ? JSON.parse(savedProgress) : {};

      progress.quizzesCompleted = (progress.quizzesCompleted || 0) + 1;
      progress.totalQuestionsAnswered = (progress.totalQuestionsAnswered || 0) + totalQuestions;
      progress.correctAnswers = (progress.correctAnswers || 0) + score;

      progress.accuracy =
        progress.totalQuestionsAnswered > 0
          ? Math.round((progress.correctAnswers / progress.totalQuestionsAnswered) * 100)
          : 0;

      if (!progress.subjectProgress) {
        progress.subjectProgress = {};
      }
      progress.subjectProgress[subject] = (progress.subjectProgress[subject] || 0) + 10;

      const lastActivityTime = progress.lastActivityTime || 0;
      const now = Date.now();
      const hoursSinceLastActivity = (now - lastActivityTime) / (1000 * 60 * 60);

      if (hoursSinceLastActivity < 24) {
        progress.currentStreak = (progress.currentStreak || 0) + 1;
      } else {
        progress.currentStreak = 1;
      }
      progress.lastActivityTime = now;

      if (!progress.recentActivity) {
        progress.recentActivity = [];
      }
      progress.recentActivity.unshift({
        type: 'quiz',
        description: `Completed quiz: ${subject} - ${topic} (${score}/${totalQuestions})`,
        timestamp: new Date().toISOString(),
      });
      progress.recentActivity = progress.recentActivity.slice(0, 10);

      localStorage.setItem(progressKey, JSON.stringify(progress));
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!subject || !topic) return;

    setIsGenerating(true);
    setIsDialogOpen(false);

    try {
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
      setActiveQuiz(newQuiz);
      setSubject('');
      setTopic('');
      setQuizAttempt({ answers: {}, submitted: false });
    } catch (error) {
      console.error('Error generating quiz:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerChange = (questionId: string, optionIndex: number) => {
    if (!quizAttempt.submitted) {
      setQuizAttempt((prev) => ({
        ...prev,
        answers: { ...prev.answers, [questionId]: optionIndex },
      }));
    }
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;

    const score = activeQuiz.questions.reduce((acc, question) => {
      return quizAttempt.answers[question.id] === question.correctAnswer ? acc + 1 : acc;
    }, 0);

    setQuizAttempt((prev) => ({ ...prev, submitted: true }));

    setQuizzes((prev) =>
      prev.map((q) =>
        q.id === activeQuiz.id ? { ...q, completed: true, score: score } : q
      )
    );

    updateProgress(activeQuiz.subject, score, activeQuiz.questions.length);
  };

  const handleBackToList = () => {
    setActiveQuiz(null);
    setQuizAttempt({ answers: {}, submitted: false });
  };

  const isQuestionAnswered = (questionId: string) => {
    return quizAttempt.answers[questionId] !== undefined;
  };

  if (activeQuiz) {
    const score = activeQuiz.questions.reduce((acc, question) => {
      return quizAttempt.answers[question.id] === question.correctAnswer ? acc + 1 : acc;
    }, 0);

    const allAnswered = activeQuiz.questions.every((q) => isQuestionAnswered(q.id));

    return (
      <div className="flex flex-col h-full bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
          <div className="flex items-center justify-between gap-3 max-w-4xl mx-auto">
            <button
              onClick={handleBackToList}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">
                {activeQuiz.title}
              </h2>
              <p className="text-sm text-gray-600">{activeQuiz.subject}</p>
            </div>
            {quizAttempt.submitted && (
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">
                  {score}/{activeQuiz.questions.length}
                </p>
                <p className="text-xs text-gray-600">
                  {Math.round((score / activeQuiz.questions.length) * 100)}%
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            {activeQuiz.questions.map((question, index) => {
              const isAnswered = isQuestionAnswered(question.id);
              const selectedAnswer = quizAttempt.answers[question.id];
              const isCorrect = selectedAnswer === question.correctAnswer;

              return (
                <div key={question.id} className="bg-white rounded-lg p-6 border border-gray-200">
                  {/* Question */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">
                        Question {index + 1}
                      </h3>
                      {quizAttempt.submitted && isAnswered && (
                        <div>
                          {isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-gray-700 mb-4">
                      {selectedLanguage === 'en'
                        ? question.questionEnglish
                        : question.questionLocal}
                    </p>
                  </div>

                  {/* Options */}
                  <div className="space-y-2 mb-4">
                    {question.options.map((option, optIndex) => {
                      const isSelected = selectedAnswer === optIndex;
                      const isCorrectOption = optIndex === question.correctAnswer;

                      let bgColor = 'bg-gray-50 border-gray-200';
                      let textColor = 'text-gray-900';

                      if (quizAttempt.submitted) {
                        if (isCorrectOption) {
                          bgColor = 'bg-green-50 border-green-500';
                          textColor = 'text-green-900';
                        } else if (isSelected && !isCorrect) {
                          bgColor = 'bg-red-50 border-red-500';
                          textColor = 'text-red-900';
                        }
                      } else if (isSelected) {
                        bgColor = 'bg-blue-50 border-blue-500';
                        textColor = 'text-blue-900';
                      }

                      return (
                        <button
                          key={optIndex}
                          onClick={() => handleAnswerChange(question.id, optIndex)}
                          disabled={quizAttempt.submitted}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all ${bgColor} ${textColor} disabled:opacity-75`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'border-current bg-current text-white'
                                  : 'border-gray-300'
                              }`}
                            >
                              {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                            <span>{option}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation (after submission) */}
                  {quizAttempt.submitted && isAnswered && (
                    <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <p className="text-sm font-semibold text-blue-900 mb-1">Explanation:</p>
                      <p className="text-sm text-blue-800">
                        {selectedLanguage === 'en'
                          ? question.explanationEnglish
                          : question.explanationLocal}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        {!quizAttempt.submitted && (
          <div className="bg-white border-t border-gray-200 px-4 py-3 sticky bottom-0">
            <div className="max-w-4xl mx-auto flex justify-between">
              <div className="text-sm text-gray-600">
                {Object.keys(quizAttempt.answers).length}/{activeQuiz.questions.length} answered
              </div>
              <Button
                onClick={handleSubmitQuiz}
                disabled={!allAnswered}
                className="gap-2"
              >
                <Trophy className="w-4 h-4" />
                Submit Quiz
              </Button>
            </div>
          </div>
        )}

        {quizAttempt.submitted && (
          <div className="bg-white border-t border-gray-200 px-4 py-3 sticky bottom-0">
            <div className="max-w-4xl mx-auto flex justify-between">
              <Button variant="outline" onClick={handleBackToList}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Quizzes
              </Button>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {score}/{activeQuiz.questions.length}
                </p>
                <p className="text-sm text-gray-600">
                  {Math.round((score / activeQuiz.questions.length) * 100)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between gap-3 max-w-4xl mx-auto">
          <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Practice Quiz</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                New Quiz
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Generate New Quiz</DialogTitle>
                <DialogDescription>
                  Select a subject and topic to generate a practice quiz in your preferred language.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {student.subjects.map((subj) => (
                        <SelectItem key={subj} value={subj}>
                          {subj}
                        </SelectItem>
                      ))}
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

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-4">
          {quizzes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96">
              <Trophy className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-600 text-center">
                No quizzes yet. Create your first quiz!
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {quizzes.map((quiz) => (
                <button
                  key={quiz.id}
                  onClick={() => {
                    setActiveQuiz(quiz);
                    setQuizAttempt({ answers: {}, submitted: false });
                  }}
                  className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {quiz.title}
                      </h3>
                      <p className="text-sm text-gray-600">{quiz.subject}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {quiz.questions.length} questions
                      </p>
                    </div>
                    {quiz.completed && (
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {quiz.score}/{quiz.questions.length}
                        </div>
                        <p className="text-xs text-gray-600">
                          {Math.round(((quiz.score || 0) / quiz.questions.length) * 100)}%
                        </p>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
