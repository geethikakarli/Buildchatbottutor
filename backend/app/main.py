from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
from typing import Dict, List, Optional, Union
import logging
import os
from dotenv import load_dotenv
from concurrent.futures import ThreadPoolExecutor
import asyncio

# Load environment variables from .env file
load_dotenv()

# Read allowed origins from environment (comma-separated), default to allow all
ALLOWED_ORIGINS_RAW = os.getenv('ALLOWED_ORIGINS', '*')
if ALLOWED_ORIGINS_RAW.strip() == '*':
    ALLOWED_ORIGINS = ["*"]
else:
    ALLOWED_ORIGINS = [o.strip() for o in ALLOWED_ORIGINS_RAW.split(',') if o.strip()]

# Import ML services
from .services.ml.language_detector import detect_language
from .services.ml.intent_classifier import classify_intent
from .services.ml.answer_generator import generate_answer, generate_notes, generate_quiz
from .services.ml.translator import translate_text, SUPPORTED_LANGUAGES, LANG_CODE_MAP
from .services.ml.groq_service import is_groq_available

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Chatbot Tutor API",
    description="API for the Chatbot Tutor application with ML models",
    version="1.0.0"
)

# Thread pool for running sync functions
executor = ThreadPoolExecutor(max_workers=4)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Fallback handler for CORS preflight requests. Some proxies or platforms
# may not forward OPTIONS requests to the app correctly; this explicit
# handler ensures a proper preflight response is returned.
@app.options("/{rest_of_path:path}")
async def preflight_handler(rest_of_path: str, request: Request):
    origin = request.headers.get("origin") or "*"

    # If ALLOWED_ORIGINS contains '*', allow any origin; otherwise only allow configured origins
    if ALLOWED_ORIGINS == ["*"]:
        allow_origin = origin
    else:
        allow_origin = origin if origin in ALLOWED_ORIGINS else (ALLOWED_ORIGINS[0] if ALLOWED_ORIGINS else "*")

    headers = {
        "Access-Control-Allow-Origin": allow_origin,
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Authorization,Content-Type,Accept",
        "Access-Control-Allow-Credentials": "true",
    }
    return PlainTextResponse("", status_code=200, headers=headers)

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize and log API status on startup"""
    logger.info("=" * 60)
    logger.info("🚀 Chatbot Tutor API Starting...")
    logger.info("=" * 60)
    
    # Check Groq availability
    if is_groq_available():
        logger.info("✅ Groq API is ENABLED - Using Groq for faster inference")
    else:
        logger.warning("⚠️  Groq API not configured - Using local models")
    
    logger.info("=" * 60)

# Request/Response Models
class LanguageDetectionRequest(BaseModel):
    text: str

class LanguageDetectionResponse(BaseModel):
    language: str
    confidence: float

class IntentClassificationRequest(BaseModel):
    text: str

class IntentClassificationResponse(BaseModel):
    intent: str
    confidence: float
    all_scores: Dict[str, float]

class TranslationRequest(BaseModel):
    text: str
    target_lang: str
    source_lang: str = "en"

class TranslationResponse(BaseModel):
    translated_text: str
    source_lang: str
    target_lang: str

class AnswerGenerationRequest(BaseModel):
    prompt: str
    max_length: int = 200
    temperature: float = 0.7

class AnswerGenerationResponse(BaseModel):
    answers: List[Dict[str, Union[str, float]]]

class NotesGenerationRequest(BaseModel):
    text: str
    max_length: int = 200
    temperature: float = 0.7

class QuizGenerationRequest(BaseModel):
    text: str
    num_questions: int = 5
    max_length: int = 500
    temperature: float = 0.7

# Health check endpoint
@app.get("/")
async def root():
    return {"status": "ok", "message": "Chatbot Tutor API is running"}

# Language detection endpoint
@app.post("/detect-language", response_model=LanguageDetectionResponse)
async def detect_language_endpoint(request: LanguageDetectionRequest):
    try:
        result = detect_language(request.text)
        return result
    except Exception as e:
        logger.error(f"Error in language detection: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Intent classification endpoint
@app.post("/classify-intent", response_model=IntentClassificationResponse)
async def classify_intent_endpoint(request: IntentClassificationRequest):
    try:
        result = classify_intent(request.text)
        return result
    except Exception as e:
        logger.error(f"Error in intent classification: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Translation endpoint
@app.post("/translate", response_model=TranslationResponse)
async def translate_endpoint(request: TranslationRequest):
    try:
        translated_text = translate_text(
            text=request.text,
            target_lang=request.target_lang,
            source_lang=request.source_lang
        )
        return {
            "translated_text": translated_text,
            "source_lang": request.source_lang,
            "target_lang": request.target_lang
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error in translation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Answer generation endpoint
@app.post("/generate-answer", response_model=AnswerGenerationResponse)
def generate_answer_endpoint(request: AnswerGenerationRequest):
    """Generate an answer for the given prompt."""
    try:
        print(f"[ENDPOINT] /generate-answer called")
        logger.info(f"[ENDPOINT] Generating answer for prompt...")
        
        answers = generate_answer(
            prompt=request.prompt,
            max_length=request.max_length,
            temperature=request.temperature
        )
        
        print(f"[ENDPOINT] Answer generated successfully")
        logger.info(f"[ENDPOINT] Successfully generated answers")
        return {"answers": answers}
    except Exception as e:
        print(f"[ENDPOINT] Exception: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        logger.error(f"Error in answer generation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Notes generation endpoint
@app.post("/generate-notes", response_model=AnswerGenerationResponse)
async def generate_notes_endpoint(request: NotesGenerationRequest):
    try:
        notes = generate_notes(
            text=request.text,
            max_length=request.max_length,
            temperature=request.temperature
        )
        return {"answers": notes}
    except Exception as e:
        logger.error(f"Error in notes generation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Quiz generation endpoint
@app.post("/generate-quiz", response_model=AnswerGenerationResponse)
async def generate_quiz_endpoint(request: QuizGenerationRequest):
    try:
        quiz = generate_quiz(
            text=request.text,
            num_questions=request.num_questions,
            max_length=request.max_length,
            temperature=request.temperature
        )
        return {"answers": quiz}
    except Exception as e:
        logger.error(f"Error in quiz generation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Get supported languages
@app.get("/supported-languages")
async def get_supported_languages():
    return {
        "supported_languages": list(SUPPORTED_LANGUAGES.keys()),
        "language_codes": LANG_CODE_MAP
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
