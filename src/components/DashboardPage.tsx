import { ArrowLeft, TrendingUp, BookOpen, Brain, Target } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Progress } from './ui/progress';

interface DashboardPageProps {
  onBack: () => void;
}

export function DashboardPage({ onBack }: DashboardPageProps) {
  // Mock progress data
  const stats = {
    totalQuestions: 47,
    questionsAnswered: 32,
    correctAnswers: 28,
    notesGenerated: 12,
    quizzesCompleted: 5,
    currentStreak: 7,
  };

  const recentActivity = [
    {
      id: '1',
      type: 'quiz',
      title: 'Photosynthesis Quiz',
      score: '4/5',
      date: '2 hours ago',
    },
    {
      id: '2',
      type: 'note',
      title: 'Cell Structure Notes',
      date: '5 hours ago',
    },
    {
      id: '3',
      type: 'chat',
      title: 'Asked about Newton\'s Laws',
      date: 'Yesterday',
    },
    {
      id: '4',
      type: 'quiz',
      title: 'Algebra Basics Quiz',
      score: '5/5',
      date: '2 days ago',
    },
  ];

  const subjectProgress = [
    { subject: 'Science', progress: 75, color: 'bg-blue-500' },
    { subject: 'Mathematics', progress: 60, color: 'bg-green-500' },
    { subject: 'History', progress: 45, color: 'bg-purple-500' },
    { subject: 'Geography', progress: 30, color: 'bg-orange-500' },
  ];

  const accuracy = Math.round((stats.correctAnswers / stats.questionsAnswered) * 100);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-gray-600">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-gray-900">Your Progress</h2>
            <p className="text-gray-600">Track your learning journey</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <Target className="w-4 h-4" />
                Accuracy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-900 mb-1">{accuracy}%</div>
              <p className="text-gray-600">{stats.correctAnswers}/{stats.questionsAnswered} correct</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <TrendingUp className="w-4 h-4" />
                Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-900 mb-1">{stats.currentStreak} days</div>
              <p className="text-gray-600">Keep it up! 🔥</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <BookOpen className="w-4 h-4" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-900 mb-1">{stats.notesGenerated}</div>
              <p className="text-gray-600">Notes created</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <Brain className="w-4 h-4" />
                Quizzes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-900 mb-1">{stats.quizzesCompleted}</div>
              <p className="text-gray-600">Quizzes done</p>
            </CardContent>
          </Card>
        </div>

        {/* Subject Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Subject-wise Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subjectProgress.map((item) => (
              <div key={item.subject}>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">{item.subject}</span>
                  <span className="text-gray-600">{item.progress}%</span>
                </div>
                <Progress value={item.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0"
              >
                <div className={`p-2 rounded-lg ${
                  activity.type === 'quiz'
                    ? 'bg-purple-100'
                    : activity.type === 'note'
                    ? 'bg-green-100'
                    : 'bg-blue-100'
                }`}>
                  {activity.type === 'quiz' ? (
                    <Brain className="w-4 h-4 text-purple-600" />
                  ) : activity.type === 'note' ? (
                    <BookOpen className="w-4 h-4 text-green-600" />
                  ) : (
                    <Target className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-gray-900">{activity.title}</p>
                    {activity.score && (
                      <span className="text-green-600">{activity.score}</span>
                    )}
                  </div>
                  <p className="text-gray-600">{activity.date}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weekly Goal */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Weekly Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Questions Answered</span>
                <span className="text-gray-600">32/50</span>
              </div>
              <Progress value={64} className="h-2" />
            </div>
            <p className="text-gray-600">18 more to reach your weekly goal!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
