import { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

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

interface AuthPageProps {
  onLogin: (user: StudentProfile) => void;
}

export function AuthPage({ onLogin }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration fields
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  // Onboarding fields
  const [grade, setGrade] = useState('');
  const [school, setSchool] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [preparationStatus, setPreparationStatus] = useState('');
  const [targetExam, setTargetExam] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [studyHours, setStudyHours] = useState('');

  const grades = ['6', '7', '8', '9', '10', '11', '12', 'College'];
  const subjectsList = ['Math', 'Science', 'English', 'Hindi', 'Social Studies', 'Physics', 'Chemistry', 'Biology'];
  const examList = ['School Exams', 'Board Exams', 'Competitive Exams', 'JEE', 'NEET', 'None Yet'];
  const goalsList = ['Improve Grades', 'Clear Doubts', 'Competitive Exam Prep', 'Learn Concepts', 'Build Confidence'];
  const studyHoursList = ['< 1 hour', '1-2 hours', '2-3 hours', '3-4 hours', '> 4 hours'];

  const toggleSubject = (subject: string) => {
    setSubjects(prev => 
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  const toggleGoal = (goal: string) => {
    setGoals(prev => 
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      const user: StudentProfile = {
        id: 'user_' + Date.now(),
        email: email,
        name: email.split('@')[0],
        grade: '',
        school: '',
        subjects: [],
        preparationStatus: '',
        targetExam: '',
        goals: [],
        studyHours: '',
      };
      onLogin(user);
      setLoading(false);
    }, 800);
  };

  const handleRegisterNext = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onboardingStep === 1) {
      if (!name || !regEmail || !regPassword) return;
      setOnboardingStep(2);
    } else if (onboardingStep === 2) {
      if (!grade || !school) return;
      setOnboardingStep(3);
    } else if (onboardingStep === 3) {
      if (subjects.length === 0) return;
      setOnboardingStep(4);
    } else if (onboardingStep === 4) {
      if (!preparationStatus || !targetExam) return;
      setOnboardingStep(5);
    } else if (onboardingStep === 5) {
      if (goals.length === 0) return;
      setOnboardingStep(6);
    } else if (onboardingStep === 6) {
      if (!studyHours) return;
      completeOnboarding();
    }
  };

  const handlePrevious = () => {
    if (onboardingStep > 1) {
      setOnboardingStep(onboardingStep - 1);
    }
  };

  const completeOnboarding = async () => {
    setLoading(true);
    
    setTimeout(() => {
      const user: StudentProfile = {
        id: 'user_' + Date.now(),
        email: regEmail,
        name: name,
        grade: grade,
        school: school,
        subjects: subjects,
        preparationStatus: preparationStatus,
        targetExam: targetExam,
        goals: goals,
        studyHours: studyHours,
      };
      onLogin(user);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 max-h-[90vh] overflow-y-auto">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <img 
            src="/assets/app_logo.png" 
            alt="Chatbot Tutor Logo" 
            className="w-16 h-16 mx-auto mb-4 object-contain"
          />
          <h1 className="text-gray-900 mb-2">Chatbot Tutor</h1>
          <p className="text-gray-600">Learn in your language</p>
        </div>

        {/* Login/Register Toggle */}
        {onboardingStep === 1 || isLogin ? (
          <div className="flex gap-2 bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => {
                setIsLogin(true);
                setOnboardingStep(1);
              }}
              className={`flex-1 py-2 rounded-md transition-colors ${
                isLogin ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setOnboardingStep(1);
              }}
              className={`flex-1 py-2 rounded-md transition-colors ${
                !isLogin ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
            >
              Register
            </button>
          </div>
        ) : null}

        {/* Progress Indicator */}
        {!isLogin && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all"
                  style={{ width: `${(onboardingStep / 6) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">{onboardingStep}/6</span>
            </div>
            <p className="text-sm text-gray-600">
              {onboardingStep === 1 && 'Account Details'}
              {onboardingStep === 2 && 'Academic Info'}
              {onboardingStep === 3 && 'Select Subjects'}
              {onboardingStep === 4 && 'Preparation Status'}
              {onboardingStep === 5 && 'Learning Goals'}
              {onboardingStep === 6 && 'Study Hours'}
            </p>
          </div>
        )}

        {/* LOGIN FORM */}
        {isLogin ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1.5"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        ) : (
          /* REGISTRATION ONBOARDING STEPS */
          <form onSubmit={handleRegisterNext} className="space-y-4">
            {/* STEP 1: BASIC INFO */}
            {onboardingStep === 1 && (
              <>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="student@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="reg-password">Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="Create a password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    className="mt-1.5"
                  />
                </div>
              </>
            )}

            {/* STEP 2: ACADEMIC INFO */}
            {onboardingStep === 2 && (
              <>
                <div>
                  <Label htmlFor="grade">Grade/Class</Label>
                  <select
                    id="grade"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    required
                    className="w-full mt-1.5 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select your grade</option>
                    {grades.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="school">School/Institution</Label>
                  <Input
                    id="school"
                    type="text"
                    placeholder="Your school name"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    required
                    className="mt-1.5"
                  />
                </div>
              </>
            )}

            {/* STEP 3: SELECT SUBJECTS */}
            {onboardingStep === 3 && (
              <div>
                <Label>Select Your Subjects (choose at least one)</Label>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {subjectsList.map(subject => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => toggleSubject(subject)}
                      className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                        subjects.includes(subject)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: PREPARATION STATUS */}
            {onboardingStep === 4 && (
              <>
                <div>
                  <Label htmlFor="status">Current Preparation Status</Label>
                  <select
                    id="status"
                    value={preparationStatus}
                    onChange={(e) => setPreparationStatus(e.target.value)}
                    required
                    className="w-full mt-1.5 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select status</option>
                    <option value="beginner">Just Started</option>
                    <option value="intermediate">Already Studying</option>
                    <option value="advanced">Advanced Level</option>
                    <option value="revision">Revision Phase</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="exam">Target Exam/Goal</Label>
                  <select
                    id="exam"
                    value={targetExam}
                    onChange={(e) => setTargetExam(e.target.value)}
                    required
                    className="w-full mt-1.5 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select target</option>
                    {examList.map(exam => (
                      <option key={exam} value={exam}>{exam}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* STEP 5: LEARNING GOALS */}
            {onboardingStep === 5 && (
              <div>
                <Label>What are your learning goals? (select all that apply)</Label>
                <div className="space-y-2 mt-3">
                  {goalsList.map(goal => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => toggleGoal(goal)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left text-sm font-medium ${
                        goals.includes(goal)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {goals.includes(goal) && <CheckCircle2 className="w-4 h-4" />}
                        {goal}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 6: STUDY HOURS */}
            {onboardingStep === 6 && (
              <div>
                <Label>How many hours can you study daily?</Label>
                <div className="grid grid-cols-1 gap-2 mt-3">
                  {studyHoursList.map(hours => (
                    <button
                      key={hours}
                      type="button"
                      onClick={() => setStudyHours(hours)}
                      className={`p-3 rounded-lg border-2 transition-all text-left font-medium ${
                        studyHours === hours
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {hours}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-6">
              {onboardingStep > 1 && !isLogin && (
                <Button 
                  type="button" 
                  onClick={handlePrevious}
                  variant="outline"
                  className="flex-1"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
              <Button 
                type="submit" 
                className={`flex-1 ${onboardingStep > 1 ? '' : 'w-full'}`}
                disabled={loading}
              >
                {loading ? 'Processing...' : (onboardingStep === 6 ? 'Complete Setup' : 'Next')}
                {onboardingStep < 6 && !loading && <ChevronRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </form>
        )}


      </div>
    </div>
  );
}
