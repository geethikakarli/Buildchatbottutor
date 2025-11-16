# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Terminal 1: Start Backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
cd app
uvicorn main:app --reload
```

**Wait for**: `Uvicorn running on http://127.0.0.1:8000`

### Terminal 2: Start Frontend

```bash
npm install
npm run dev
```

**Wait for**: `Local: http://localhost:5173/`

### Open Browser

Visit: `http://localhost:5173`

---

## ✅ Test the Integration

### 1. Chat Page
- Select a language (Hindi, Telugu, Tamil, Kannada, or English)
- Ask a question: "What is photosynthesis?"
- See bilingual response

### 2. Notes Page
- Click "+" button
- Select subject: "Science"
- Enter topic: "Photosynthesis"
- Get bilingual study notes

### 3. Quiz Page
- Click "+" button
- Select subject: "Science"
- Enter topic: "Photosynthesis"
- Attempt the generated quiz

---

## 📊 What's Happening Behind the Scenes

```
Your Question
    ↓
Frontend detects language (fastText)
    ↓
Frontend classifies intent (DistilBERT)
    ↓
Backend generates answer (FLAN-T5)
    ↓
Backend translates to your language (IndicTrans2)
    ↓
You see bilingual response
```

---

## 🔗 Useful Links

| Link | Purpose |
|------|---------|
| `http://localhost:5173` | Frontend App |
| `http://localhost:8000` | Backend API |
| `http://localhost:8000/docs` | API Documentation |
| `http://localhost:8000/redoc` | Alternative API Docs |

---

## ⚠️ First Time Setup

**First request will take 2-3 minutes** because:
1. Models are downloading (~200 MB)
2. Models are being loaded into memory
3. Initialization is happening

**Subsequent requests are fast** (< 5 seconds)

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Kill process if needed
taskkill /PID <PID> /F
```

### Frontend won't connect to backend
- Check `.env` file has correct URL
- Verify backend is running
- Check browser console for errors

### Models not downloading
- Check internet connection
- Ensure disk space (200 MB minimum)
- Check backend logs

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `backend/app/main.py` | Backend API |
| `src/services/api.ts` | API Client |
| `src/services/mlBackend.ts` | ML Service |
| `src/components/ChatPage.tsx` | Chat Interface |
| `.env` | Configuration |

---

## 💡 Tips

1. **Use Chrome DevTools** to see API calls
2. **Check backend logs** for detailed errors
3. **Read ML_INTEGRATION_GUIDE.md** for detailed setup
4. **Models cache locally** - no re-download needed
5. **Change language** to test multilingual support

---

## 🎯 Next Steps

1. ✅ Get it running (this guide)
2. 📖 Read `ML_INTEGRATION_GUIDE.md` for details
3. 🔧 Customize prompts in `src/services/mlBackend.ts`
4. 🚀 Deploy to production

---

**Ready?** Open `http://localhost:5173` and start using the app!
