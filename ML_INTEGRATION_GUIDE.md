# ML Models Integration Guide

This document explains how to set up and run the integrated ML models for the Chatbot Tutor application.

## Architecture Overview

The application now uses a **backend-frontend architecture**:

- **Backend (Python)**: Runs ML models using FastAPI
- **Frontend (React/TypeScript)**: Makes API calls to the backend

## Backend Setup

### 1. Install Python Dependencies

```bash
cd backend
python -m venv venv

# On Windows
.\venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Start the Backend Server

```bash
cd app
uvicorn main:app --reload
```

The backend will be available at `http://localhost:8000`

### 3. Access API Documentation

Once running, visit:
- **Interactive Docs**: `http://localhost:8000/docs`
- **Alternative Docs**: `http://localhost:8000/redoc`

## Frontend Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Endpoint

The frontend is configured to use `http://localhost:8000` by default.

To change this, edit `.env`:

```env
VITE_API_BASE_URL=http://your-backend-url:8000
```

### 3. Start Frontend Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## ML Models Overview

### 1. Language Detection (fastText)
- **Model**: `lid.176.bin`
- **Size**: ~1 MB
- **Supported Languages**: hi, te, ta, kn, en
- **Endpoint**: `POST /detect-language`

### 2. Intent Classification (DistilBERT)
- **Model**: `distilbert-base-multilingual-cased`
- **Size**: ~50 MB
- **Purpose**: Classify question types
- **Endpoint**: `POST /classify-intent`

### 3. Answer Generation (FLAN-T5 Small)
- **Model**: `google/flan-t5-small`
- **Size**: ~75 MB
- **Purpose**: Generate answers, notes, and quizzes
- **Endpoints**:
  - `POST /generate-answer`
  - `POST /generate-notes`
  - `POST /generate-quiz`

### 4. Translation (IndicTrans2)
- **Model**: `ai4bharat/indictrans2-en-indic`
- **Size**: ~70 MB
- **Purpose**: Translate between English and Indian languages
- **Endpoint**: `POST /translate`

## API Endpoints

### Language Detection
```bash
POST /detect-language
Content-Type: application/json

{
  "text": "नमस्ते दुनिया"
}

Response:
{
  "language": "hi",
  "confidence": 0.99
}
```

### Intent Classification
```bash
POST /classify-intent
Content-Type: application/json

{
  "text": "What is photosynthesis?"
}

Response:
{
  "intent": "definition",
  "confidence": 0.95,
  "all_scores": {
    "definition": 0.95,
    "concept": 0.03,
    ...
  }
}
```

### Answer Generation
```bash
POST /generate-answer
Content-Type: application/json

{
  "prompt": "What is the capital of France?",
  "max_length": 200,
  "temperature": 0.7
}

Response:
{
  "answers": [
    {
      "text": "Paris is the capital of France...",
      "score": 0.95
    }
  ]
}
```

### Translation
```bash
POST /translate
Content-Type: application/json

{
  "text": "Hello, how are you?",
  "target_lang": "hi",
  "source_lang": "en"
}

Response:
{
  "translated_text": "नमस्ते, आप कैसे हैं?",
  "source_lang": "en",
  "target_lang": "hi"
}
```

### Notes Generation
```bash
POST /generate-notes
Content-Type: application/json

{
  "text": "Generate notes on photosynthesis",
  "max_length": 500
}

Response:
{
  "answers": [
    {
      "text": "Key concepts:\n1. Photosynthesis...",
      "score": 0.9
    }
  ]
}
```

### Quiz Generation
```bash
POST /generate-quiz
Content-Type: application/json

{
  "text": "Generate quiz on photosynthesis",
  "num_questions": 5,
  "max_length": 1000
}

Response:
{
  "answers": [
    {
      "text": "Q: What is photosynthesis?\nA) Process of...",
      "score": 0.9
    }
  ]
}
```

## Frontend Integration

The frontend uses the following service files:

### `src/services/api.ts`
Low-level API client that communicates with the backend.

### `src/services/mlBackend.ts`
High-level ML service that:
1. Detects language
2. Classifies intent
3. Generates answers
4. Translates responses
5. Generates notes and quizzes

### Updated Components
- **ChatPage**: Uses `generateAnswer()` for Q&A
- **NotesPage**: Uses `generateNotes()` for study notes
- **QuizPage**: Uses `generateQuiz()` for MCQ generation

## Workflow

### Chat Flow
1. User asks a question
2. Frontend detects language
3. Frontend classifies intent
4. Backend generates answer in English
5. Backend translates to user's language
6. Frontend displays bilingual response

### Notes Generation Flow
1. User selects subject and topic
2. Backend generates comprehensive notes
3. Backend translates to user's language
4. Frontend displays bilingual notes

### Quiz Generation Flow
1. User selects subject and topic
2. Backend generates MCQ questions
3. Questions are parsed and displayed
4. User attempts quiz
5. Scores are calculated

## Troubleshooting

### Backend Won't Start
- Ensure Python 3.8+ is installed
- Check if port 8000 is available
- Verify all dependencies are installed: `pip install -r requirements.txt`

### Models Not Downloading
- Models auto-download on first use
- Ensure internet connection is stable
- Check disk space (total ~200 MB needed)

### API Calls Failing
- Verify backend is running: `http://localhost:8000/`
- Check frontend `.env` file has correct API URL
- Check browser console for error messages

### Slow Response Times
- First request downloads models (~2-3 minutes)
- Subsequent requests are faster (cached models)
- Consider using GPU for faster inference

## Performance Optimization

### For Production
1. Use quantized models (8-bit) for faster inference
2. Add caching layer for common queries
3. Use GPU if available
4. Implement request batching
5. Add rate limiting

### For Development
- Models are cached locally
- Use smaller batch sizes
- Disable analytics logging

## Environment Variables

### Backend
```env
MODEL_CACHE_DIR=./models
HOST=0.0.0.0
PORT=8000
DEBUG=True
```

### Frontend
```env
VITE_API_BASE_URL=http://localhost:8000
```

## Next Steps

1. **Start Backend**: `cd backend/app && uvicorn main:app --reload`
2. **Start Frontend**: `npm run dev`
3. **Test Chat**: Ask a question in the Chat page
4. **Test Notes**: Generate notes for a topic
5. **Test Quiz**: Generate and attempt a quiz

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation at `http://localhost:8000/docs`
3. Check browser console for error messages
4. Review backend logs for server errors
