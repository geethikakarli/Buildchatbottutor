import { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { ChatPage } from './components/ChatPage';
import { NotesPage } from './components/NotesPage';
import { QuizPage } from './components/QuizPage';
import { DashboardPage } from './components/DashboardPage';
import { Home, MessageSquare, FileText, Brain, BarChart3 } from 'lucide-react';

type Page = 'home' | 'chat' | 'notes' | 'quiz' | 'dashboard';

interface User {
  id: string;
  email: string;
  name: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('hi');

  // Check for stored user session
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setCurrentPage('home');
  };

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {currentPage === 'home' && (
          <HomePage
            userName={user.name}
            onNavigate={setCurrentPage}
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            onLogout={handleLogout}
          />
        )}
        {currentPage === 'chat' && (
          <ChatPage
            selectedLanguage={selectedLanguage}
            onBack={() => setCurrentPage('home')}
          />
        )}
        {currentPage === 'notes' && (
          <NotesPage
            selectedLanguage={selectedLanguage}
            onBack={() => setCurrentPage('home')}
          />
        )}
        {currentPage === 'quiz' && (
          <QuizPage
            selectedLanguage={selectedLanguage}
            onBack={() => setCurrentPage('home')}
          />
        )}
        {currentPage === 'dashboard' && (
          <DashboardPage
            onBack={() => setCurrentPage('home')}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 px-4 py-2 safe-area-pb">
        <div className="flex justify-around items-center max-w-lg mx-auto">
          <NavButton
            icon={Home}
            label="Home"
            active={currentPage === 'home'}
            onClick={() => setCurrentPage('home')}
          />
          <NavButton
            icon={MessageSquare}
            label="Chat"
            active={currentPage === 'chat'}
            onClick={() => setCurrentPage('chat')}
          />
          <NavButton
            icon={FileText}
            label="Notes"
            active={currentPage === 'notes'}
            onClick={() => setCurrentPage('notes')}
          />
          <NavButton
            icon={Brain}
            label="Quiz"
            active={currentPage === 'quiz'}
            onClick={() => setCurrentPage('quiz')}
          />
          <NavButton
            icon={BarChart3}
            label="Progress"
            active={currentPage === 'dashboard'}
            onClick={() => setCurrentPage('dashboard')}
          />
        </div>
      </nav>
    </div>
  );
}

interface NavButtonProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavButton({ icon: Icon, label, active, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
        active ? 'text-blue-600' : 'text-gray-600'
      }`}
    >
      <Icon className={`w-6 h-6 ${active ? 'stroke-2' : 'stroke-1.5'}`} />
      <span className="text-xs">{label}</span>
    </button>
  );
}

interface HomePageProps {
  userName: string;
  onNavigate: (page: Page) => void;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  onLogout: () => void;
}

function HomePage({
  userName,
  onNavigate,
  selectedLanguage,
  onLanguageChange,
  onLogout,
}: HomePageProps) {
  const languages = [
    { code: 'hi', name: 'हिंदी', label: 'Hindi' },
    { code: 'te', name: 'తెలుగు', label: 'Telugu' },
    { code: 'ta', name: 'தமிழ்', label: 'Tamil' },
    { code: 'kn', name: 'ಕನ್ನಡ', label: 'Kannada' },
    { code: 'en', name: 'English', label: 'English' },
  ];

  const features = [
    {
      icon: MessageSquare,
      title: 'Ask Doubts',
      description: 'Get instant bilingual explanations',
      page: 'chat' as Page,
      color: 'bg-blue-500',
    },
    {
      icon: FileText,
      title: 'Generate Notes',
      description: 'Create topic-wise study material',
      page: 'notes' as Page,
      color: 'bg-green-500',
    },
    {
      icon: Brain,
      title: 'Practice Quiz',
      description: 'Test your knowledge with MCQs',
      page: 'quiz' as Page,
      color: 'bg-purple-500',
    },
    {
      icon: BarChart3,
      title: 'Track Progress',
      description: 'View your learning journey',
      page: 'dashboard' as Page,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="min-h-full bg-gradient-to-b from-blue-50 to-white p-4 pb-20">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 pt-2">
          <div>
            <h1 className="text-gray-900 mb-1">Welcome back, {userName}! 👋</h1>
            <p className="text-gray-600">Ready to learn today?</p>
          </div>
          <button
            onClick={onLogout}
            className="text-gray-600 hover:text-gray-900 px-3 py-2"
          >
            Logout
          </button>
        </div>

        {/* Language Selector */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <label className="block text-gray-700 mb-3">Learning Language</label>
          <div className="grid grid-cols-2 gap-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => onLanguageChange(lang.code)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedLanguage === lang.code
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="text-lg mb-1">{lang.name}</div>
                <div className="text-xs text-gray-600">{lang.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="space-y-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.page}
                onClick={() => onNavigate(feature.page)}
                className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
              >
                <div className={`${feature.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
