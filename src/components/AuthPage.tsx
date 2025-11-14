import { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface AuthPageProps {
  onLogin: (user: { id: string; email: string; name: string }) => void;
}

export function AuthPage({ onLogin }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Mock successful auth
      const user = {
        id: 'user_' + Date.now(),
        email: email,
        name: name || email.split('@')[0],
      };
      onLogin(user);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
            <GraduationCap className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-gray-900 mb-2">Chatbot Tutor</h1>
          <p className="text-gray-600">Learn in your language</p>
        </div>

        {/* Auth Toggle */}
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-md transition-colors ${
              isLogin ? 'bg-white shadow-sm' : 'text-gray-600'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-md transition-colors ${
              !isLogin ? 'bg-white shadow-sm' : 'text-gray-600'
            }`}
          >
            Register
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
                className="mt-1.5"
              />
            </div>
          )}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1.5"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
          </Button>
        </form>

        {/* Demo Notice */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-blue-800">
            <strong>Demo Mode:</strong> Use any email/password to try the app
          </p>
        </div>

        {/* Supported Languages */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-2">Supported Languages:</p>
          <div className="flex gap-2 justify-center flex-wrap">
            <span className="px-3 py-1 bg-gray-100 rounded-full">हिंदी</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full">తెలుగు</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full">தமிழ்</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full">ಕನ್ನಡ</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full">English</span>
          </div>
        </div>
      </div>
    </div>
  );
}
