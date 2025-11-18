import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MessageSquare,
  BookOpen,
  Trophy,
  Zap,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { Button } from './ui/button';

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

interface ActivityItem {
  type: 'question' | 'notes' | 'quiz';
  description: string;
  timestamp: string;
}

interface StudentProgress {
  totalQuestionsAsked: number;
  notesGenerated: number;
  quizzesCompleted: number;
  totalQuestionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  currentStreak: number;
  lastActivityTime: number;
  subjectProgress: Record<string, number>;
  recentActivity: ActivityItem[];
}

const subjectColors: Record<string, string> = {
  Mathematics: 'bg-blue-500',
  Physics: 'bg-purple-500',
  Chemistry: 'bg-green-500',
  Biology: 'bg-cyan-500',
  English: 'bg-pink-500',
  History: 'bg-amber-500',
  Geography: 'bg-emerald-500',
  'Computer Science': 'bg-indigo-500',
  'Social Science': 'bg-orange-500',
  Science: 'bg-teal-500',
};

export function DashboardPage({
  student,
  onBack,
  onNavigateToChat,
  onNavigateToNotes,
  onNavigateToQuiz,
}: {
  student: StudentProfile;
  onBack: () => void;
  onNavigateToChat: () => void;
  onNavigateToNotes: () => void;
  onNavigateToQuiz: () => void;
}) {
  const [progress, setProgress] = useState<StudentProgress>({
    totalQuestionsAsked: 0,
    notesGenerated: 0,
    quizzesCompleted: 0,
    totalQuestionsAnswered: 0,
    correctAnswers: 0,
    accuracy: 0,
    currentStreak: 0,
    lastActivityTime: 0,
    subjectProgress: {},
    recentActivity: [],
  });

  useEffect(() => {
    const loadProgress = () => {
      const progressKey = `progress_${student.id}`;
      const savedProgress = localStorage.getItem(progressKey);
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      }
    };

    loadProgress();
    const interval = setInterval(loadProgress, 1000);
    return () => clearInterval(interval);
  }, [student.id]);

  const getPreparationRecommendation = () => {
    const status = student.preparationStatus;
    if (status === 'Just_started') {
      return 'Focus on building fundamentals. Try asking doubts and generating notes!';
    } else if (status === 'Mid_stage') {
      return 'Great progress! Practice with quizzes to test your knowledge.';
    } else if (status === 'Almost_done') {
      return 'Excellent! Keep practicing with quizzes to maximize your preparation.';
    }
    return 'Keep up the great work!';
  };

  const formatActivityTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'question':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'notes':
        return <BookOpen className="w-4 h-4 text-green-500" />;
      case 'quiz':
        return <Trophy className="w-4 h-4 text-purple-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {student.name}! 🎓
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {student.targetExam} • Grade {student.grade}
            </p>
          </div>
          <div className="w-6" />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-4 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                <p className="text-xs text-gray-600 font-medium">Questions Asked</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {progress.totalQuestionsAsked}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-green-500" />
                <p className="text-xs text-gray-600 font-medium">Notes Generated</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {progress.notesGenerated}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-purple-500" />
                <p className="text-xs text-gray-600 font-medium">Quizzes Completed</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {progress.quizzesCompleted}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <p className="text-xs text-gray-600 font-medium">Accuracy</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {progress.accuracy}%
              </p>
            </div>
          </div>

          {/* Streak & Recommendations */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Current Streak */}
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-6 h-6 text-amber-500" />
                <h3 className="text-lg font-semibold text-gray-900">Current Streak</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold text-amber-600">
                  {progress.currentStreak}
                </p>
                <p className="text-gray-600">days 🔥</p>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Keep the streak alive! Study tomorrow to extend it.
              </p>
            </div>

            {/* Preparation Status */}
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-6 h-6 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900">Preparation Status</h3>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {student.preparationStatus.replace(/_/g, ' ')}
              </p>
              <p className="text-xs text-gray-700 bg-blue-50 rounded p-2">
                💡 {getPreparationRecommendation()}
              </p>
            </div>
          </div>

          {/* Subject Progress */}
          {progress.subjectProgress && Object.keys(progress.subjectProgress).length > 0 && (
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Progress</h3>
              <div className="space-y-3">
                {Object.entries(progress.subjectProgress).map(([subject, percent]) => (
                  <div key={subject}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{subject}</span>
                      <span className="text-xs font-semibold text-gray-600">
                        {Math.min(percent, 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          subjectColors[subject] || 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning Goals */}
          {student.goals.length > 0 && (
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Learning Goals</h3>
              <div className="space-y-2">
                {student.goals.map((goal, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm">
                    <span className="text-lg">🎯</span>
                    <span className="text-gray-700">{goal}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                onClick={onNavigateToChat}
                variant="outline"
                className="justify-start gap-2 h-auto py-3"
              >
                <MessageSquare className="w-5 h-5 text-blue-500" />
                <div className="text-left">
                  <div className="font-semibold">Ask Doubts</div>
                  <div className="text-xs text-gray-600">
                    {progress.totalQuestionsAsked} questions
                  </div>
                </div>
              </Button>

              <Button
                onClick={onNavigateToNotes}
                variant="outline"
                className="justify-start gap-2 h-auto py-3"
              >
                <BookOpen className="w-5 h-5 text-green-500" />
                <div className="text-left">
                  <div className="font-semibold">Generate Notes</div>
                  <div className="text-xs text-gray-600">
                    {progress.notesGenerated} notes
                  </div>
                </div>
              </Button>

              <Button
                onClick={onNavigateToQuiz}
                variant="outline"
                className="justify-start gap-2 h-auto py-3"
              >
                <Trophy className="w-5 h-5 text-purple-500" />
                <div className="text-left">
                  <div className="font-semibold">Practice Quiz</div>
                  <div className="text-xs text-gray-600">
                    {progress.quizzesCompleted} completed
                  </div>
                </div>
              </Button>
            </div>
          </div>

          {/* Recent Activity */}
          {progress.recentActivity.length > 0 && (
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {progress.recentActivity.slice(0, 10).map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm">
                    <div className="flex-shrink-0 mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatActivityTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Student Info */}
          <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Study Plan</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-blue-800">
              <div>
                <p className="font-semibold">Subjects</p>
                <p>{student.subjects.join(', ')}</p>
              </div>
              <div>
                <p className="font-semibold">Study Hours</p>
                <p>{student.studyHours} hours/day</p>
              </div>
              <div>
                <p className="font-semibold">Target</p>
                <p>{student.targetExam}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
