# Deployment Guide - Chatbot Tutor

## 📦 Vercel Deployment (Recommended)

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

### Manual Deployment

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```

4. **Set Environment Variables**
```bash
vercel env add VITE_OPENAI_API_KEY
vercel env add VITE_GOOGLE_API_KEY
# Add other environment variables as needed
```

5. **Deploy to Production**
```bash
vercel --prod
```

### Continuous Deployment

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables in the Vercel dashboard
6. Deploy!

Every push to `main` branch will trigger automatic deployment.

---

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t chatbot-tutor .
```

### Run Container

```bash
docker run -p 3000:3000 \
  -e VITE_OPENAI_API_KEY=your_key \
  -e VITE_GOOGLE_API_KEY=your_key \
  chatbot-tutor
```

### Docker Compose

```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - VITE_OPENAI_API_KEY=${OPENAI_API_KEY}
      - VITE_GOOGLE_API_KEY=${GOOGLE_API_KEY}
```

Run with:
```bash
docker-compose up -d
```

---

## ☁️ Other Platforms

### Netlify

1. **Create `netlify.toml`**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. **Deploy**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### AWS Amplify

1. Connect your GitHub repository
2. Set build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
3. Configure environment variables
4. Deploy

### Azure Static Web Apps

```bash
# Install Azure CLI
npm install -g @azure/static-web-apps-cli

# Deploy
swa deploy ./dist
```

---

## 🔧 Backend API Deployment (FastAPI)

If you're building the FastAPI backend, here's how to deploy it:

### Deploy to Railway

1. Create `railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

2. Deploy:
```bash
railway up
```

### Deploy to Render

1. Create `render.yaml`:
```yaml
services:
  - type: web
    name: chatbot-tutor-api
    env: python
    buildCommand: "pip install -r requirements.txt"
    startCommand: "uvicorn main:app --host 0.0.0.0 --port $PORT"
    envVars:
      - key: OPENAI_API_KEY
        sync: false
      - key: DATABASE_URL
        fromDatabase:
          name: chatbot-db
          property: connectionString

databases:
  - name: chatbot-db
    plan: free
```

2. Connect GitHub and deploy

### Deploy to Google Cloud Run

```bash
# Build container
gcloud builds submit --tag gcr.io/PROJECT_ID/chatbot-api

# Deploy
gcloud run deploy chatbot-api \
  --image gcr.io/PROJECT_ID/chatbot-api \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated
```

---

## 🗄️ Database Setup

### Supabase (Recommended)

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the schema migrations:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chat history
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  question TEXT NOT NULL,
  answer_local TEXT,
  answer_english TEXT,
  language VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notes
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  title VARCHAR(255),
  subject VARCHAR(100),
  topic VARCHAR(255),
  content_local TEXT,
  content_english TEXT,
  language VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Quizzes
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  title VARCHAR(255),
  subject VARCHAR(100),
  questions JSONB,
  score INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Progress tracking
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  notes_generated INTEGER DEFAULT 0,
  quizzes_completed INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  last_active DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

3. Get your API keys from Project Settings
4. Add to `.env`:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### PostgreSQL on Railway

```bash
# Create database
railway add postgres

# Get connection string
railway variables
```

---

## 🔐 API Keys Setup

### OpenAI API

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create API key
3. Add to environment variables

### Google Cloud (Translation & Speech)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Enable APIs:
   - Cloud Translation API
   - Cloud Speech-to-Text API
   - Cloud Text-to-Speech API
3. Create credentials
4. Add API key to environment variables

### Azure Speech Services (Alternative)

1. Go to [portal.azure.com](https://portal.azure.com)
2. Create a "Speech" resource
3. Get API key and region
4. Add to environment variables

---

## 📊 Monitoring & Analytics

### Vercel Analytics

```bash
npm install @vercel/analytics
```

```typescript
// main.tsx
import { Analytics } from '@vercel/analytics/react';

<Analytics />
```

### Sentry Error Tracking

```bash
npm install @sentry/react
```

```typescript
// main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
});
```

---

## 🧪 Testing Before Deployment

```bash
# Build locally
npm run build

# Preview production build
npm run preview

# Test on different devices
npm run dev -- --host
```

---

## ✅ Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] API keys are valid and have sufficient quota
- [ ] Database migrations applied
- [ ] Production build tested locally
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Mobile responsiveness verified
- [ ] API rate limiting configured
- [ ] Analytics setup (optional)
- [ ] Error tracking setup (optional)

---

## 🚀 Performance Optimization

### Enable Caching
```typescript
// vercel.json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Code Splitting
Already configured with Vite's automatic code splitting.

### Image Optimization
Use Vercel's Image optimization or Cloudinary.

---

## 📱 PWA Setup (Optional)

```bash
npm install vite-plugin-pwa -D
```

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Chatbot Tutor',
        short_name: 'Tutor',
        description: 'AI Learning Assistant',
        theme_color: '#3b82f6',
      }
    })
  ]
}
```

---

## 🆘 Troubleshooting

### Build Fails
```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

### Environment Variables Not Working
- Make sure they start with `VITE_`
- Restart dev server after adding new variables
- Check Vercel dashboard for production variables

### API Errors
- Verify API keys are correct
- Check API quota/limits
- Ensure CORS is configured

---

For more help, open an issue on GitHub!
