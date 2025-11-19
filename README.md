# Chatbot Tutor - India-Focused AI Learning Assistant

An AI-powered educational chatbot that helps students learn in their native language (Hindi, Telugu, Tamil, Kannada) with bilingual explanations in regional language + English.

## 🌟 Features

- **Bilingual Chat**: Ask questions and get explanations in your local language + English
- **Voice Input**: Speak your questions using voice recognition
- **Smart Notes**: Generate topic-wise study notes in bilingual format
- **Interactive Quizzes**: Take MCQ quizzes with bilingual questions and explanations
- **Progress Tracking**: Monitor your learning journey with detailed analytics
- **Multi-Language Support**: Hindi (हिंदी), Telugu (తెలుగు), Tamil (தமிழ்), Kannada (ಕನ್ನಡ), English

## 🛠️ Tech Stack

### Frontend
- **React** + **TypeScript** + **Vite**
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **Lucide React** for icons

### ML Services (Mock Implementation)
- Translation Model (Mock)
- LLM for explanations (Mock)
- Content Generator for notes and quizzes (Mock)
- Speech-to-Text and Text-to-Speech (Web Speech API)

### Deployment
- **Vercel** ready with optimized configuration

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd chatbot-tutor

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## 📁 Project Structure

```
chatbot-tutor/
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn UI components
│   │   ├── AuthPage.tsx     # Login/Register
│   │   ├── ChatPage.tsx     # Chat interface
│   │   ├── NotesPage.tsx    # Notes generation
│   │   ├── QuizPage.tsx     # Quiz interface
│   │   └── DashboardPage.tsx # Progress tracking
│   ├── services/
│   │   └── ml/              # ML model services
│   │       ├── translationModel.ts
│   │       ├── llmModel.ts
│   │       ├── contentGenerator.ts
│   │       ├── speechModel.ts
│   │       └── index.ts
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── vercel.json              # Vercel configuration
└── package.json
```

## 🤖 ML Services Architecture

### Current Implementation (Mock)
The app currently uses **mock ML services** that simulate:
- Bilingual answer generation
- Translation between languages
- Notes generation
- Quiz generation with explanations
- Speech recognition (using Web Speech API where available)

### Production Integration

To integrate real ML models, update the services in `/services/ml/`:

#### 1. LLM Integration (OpenAI/Google Gemini/Claude)

```typescript
// services/ml/llmModel.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

export async function generateAnswer(request: LLMRequest): Promise<BilingualAnswer> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a bilingual tutor. Answer in both ${request.language} and English.`
      },
      {
        role: "user",
        content: request.question
      }
    ],
  });
  
  // Parse and return bilingual response
}
```

#### 2. Translation API (Google Translate)

```typescript
// services/ml/translationModel.ts
import { Translate } from '@google-cloud/translate/v2';

const translate = new Translate({
  key: import.meta.env.VITE_GOOGLE_API_KEY,
});

export async function translateText(request: TranslationRequest) {
  const [translation] = await translate.translate(
    request.text,
    request.targetLang
  );
  return { translatedText: translation };
}
```

#### 3. Speech Services (Google Cloud Speech)

```typescript
// services/ml/speechModel.ts
import speech from '@google-cloud/speech';
import textToSpeech from '@google-cloud/text-to-speech';

// Implement real speech-to-text and text-to-speech
```

#### 4. Backend Integration (FastAPI)

For a complete production setup, connect to a FastAPI backend:

```typescript
// services/ml/llmModel.ts
export async function generateAnswer(request: LLMRequest): Promise<BilingualAnswer> {
  const response = await fetch('https://your-api.com/chat/ask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });
  
  return await response.json();
}
```

## 🌐 Supported Languages

| Language | Code | Script |
|----------|------|--------|
| Hindi | `hi` | देवनागरी |
| Telugu | `te` | తెలుగు |
| Tamil | `ta` | தமிழ் |
| Kannada | `kn` | ಕನ್ನಡ |
| English | `en` | Latin |

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
# App Configuration
VITE_APP_NAME=Chatbot Tutor
VITE_SUPPORTED_LANGUAGES=hi,te,ta,kn,en

# ML API Configuration (for production)
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_GOOGLE_API_KEY=your_google_api_key
VITE_LLM_API_URL=https://your-backend-api.com
VITE_TRANSLATION_API_URL=https://translation-api.com
VITE_SPEECH_API_URL=https://speech-api.com

# Feature Flags
VITE_USE_MOCK_DATA=true
```

## 📱 Features in Detail

### 1. Bilingual Chat
- Ask questions in any supported language
- Get dual explanations (local language + English)
- Voice input support using Web Speech API
- Contextual answers based on subject matter

### 2. Notes Generation
- Topic-wise bilingual study notes
- Structured content with key points
- Download notes as text files
- Organized by subject

### 3. Quiz System
- Bilingual MCQ questions
- Instant feedback with explanations
- Score tracking
- Review mode for completed quizzes

### 4. Progress Dashboard
- Learning streak tracking
- Subject-wise progress
- Accuracy metrics
- Recent activity timeline

## 🔧 Configuration

### Vercel Configuration (`vercel.json`)
- Optimized build settings for Vite
- SPA routing with rewrites
- Cache headers for static assets
- Environment variable support

### ML Service Configuration
Edit `/services/ml/index.ts` to configure:
- API endpoints
- Model parameters
- Feature flags
- Supported languages

## 🎯 Roadmap

- [ ] Real LLM integration (OpenAI/Gemini)
- [ ] Backend API with FastAPI + PostgreSQL
- [ ] User authentication with JWT
- [ ] Supabase integration for data persistence
- [ ] Advanced speech recognition
- [ ] Offline mode support
- [ ] PDF notes export
- [ ] Spaced repetition for quizzes
- [ ] Teacher/parent dashboard
- [ ] Performance analytics

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for learning and development.

## 👥 Support

For issues and questions, please open an issue on GitHub.

## 🙏 Acknowledgments

- NCERT for educational content structure
- Indian language communities
- Open source contributors

---

Built with ❤️ for Indian students to learn in their mother tongue
