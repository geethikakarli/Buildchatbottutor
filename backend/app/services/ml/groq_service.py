"""
Groq API Service for faster inference
Uses Groq's API for answer generation, notes, and quiz generation
"""

import os
import logging
from groq import Groq
from typing import List, Dict
from dotenv import load_dotenv
import sys

# Load environment variables from backend/.env explicitly
env_path = os.path.join(os.path.dirname(__file__), '../../../.env')
load_dotenv(env_path)

logger = logging.getLogger(__name__)

# Initialize Groq client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
print(f"[GROQ_SERVICE] GROQ_API_KEY present: {bool(GROQ_API_KEY)}")
print(f"[GROQ_SERVICE] API Key (first 10 chars): {GROQ_API_KEY[:10] if GROQ_API_KEY else 'None'}")

client = None
try:
    if GROQ_API_KEY:
        print(f"[GROQ_SERVICE] Initializing Groq client...")
        client = Groq(api_key=GROQ_API_KEY)
        print(f"[GROQ_SERVICE] Groq client initialized successfully")
        logger.info(f"Groq API Key loaded successfully")
    else:
        print(f"[GROQ_SERVICE] No API key found")
except Exception as e:
    print(f"[GROQ_SERVICE] Failed to initialize Groq client: {e}")
    logger.warning(f"Failed to initialize Groq client: {e}")
    client = None

# Model configuration
# Using Groq's available models
# Check https://console.groq.com/docs/models for the latest available models
MODEL_NAME = "llama-3.1-8b-instant"  # Groq's fast model (mixtral and llama-3.1-70b are decommissioned)

# Log Groq status
if client is not None:
    print(f"[GROQ_SERVICE] Groq API is AVAILABLE")
else:
    print(f"[GROQ_SERVICE] Groq API NOT available")


def is_groq_available() -> bool:
    """Check if Groq API is configured."""
    available = client is not None and GROQ_API_KEY is not None
    if available:
        logger.debug("Using Groq API for inference")
    return available


def generate_answer_groq(
    prompt: str,
    max_tokens: int = 300,
    temperature: float = 0.7,
) -> List[Dict[str, str]]:
    """
    Generate an answer using Groq API with token limiting.
    
    Args:
        prompt: The input prompt/question
        max_tokens: Maximum tokens in response (limited to 1024 for complex queries)
        temperature: Controls randomness (0.0 to 2.0)
        
    Returns:
        List of dictionaries containing generated answers
    """
    if not is_groq_available():
        raise ValueError("Groq API is not configured. Set GROQ_API_KEY environment variable.")
    
    if not prompt.strip():
        return [{"text": "", "score": 0.0}]
    
    # Token limiting for complex queries
    # Limit max_tokens based on query complexity
    if len(prompt.split()) > 100:
        # Complex query - limit tokens more strictly
        max_tokens = min(max_tokens, 512)
        logger.info(f"Complex query detected - limiting tokens to {max_tokens}")
    else:
        # Simple query - allow more tokens
        max_tokens = min(max_tokens, 1024)
    
    # Ensure temperature is within valid range
    temperature = max(0.0, min(2.0, temperature))
    
    try:
        print(f"[GROQ] Calling Groq API...")
        print(f"[GROQ] Client: {client is not None}")
        print(f"[GROQ] Model: {MODEL_NAME}")
        print(f"[GROQ] Max tokens: {max_tokens}")
        
        # Use a simple timeout mechanism
        import signal
        
        def timeout_handler(signum, frame):
            raise TimeoutError("Groq API request timed out")
        
        # Set 30 second timeout
        #signal.signal(signal.SIGALRM, timeout_handler)
        #signal.alarm(30)
        
        try:
            print(f"[GROQ] Making API call...")
            message = client.chat.completions.create(
                model=MODEL_NAME,
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            
            #signal.alarm(0)  # Cancel alarm
            
            print(f"[GROQ] Got response from API")
            
            # Extract the response text
            if message.choices and len(message.choices) > 0:
                response_text = message.choices[0].message.content
                print(f"[GROQ] Response success: {len(response_text)} chars")
                return [{"text": response_text, "score": 0.95}]
            else:
                print(f"[GROQ] No choices in response")
                return [{"text": "No response generated", "score": 0.0}]
                
        except TimeoutError as te:
            print(f"[GROQ] Timeout: {te}")
            raise
        
    except Exception as e:
        print(f"[GROQ] Exception: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        logger.error(f"Groq API error: {str(e)}")
        raise


def generate_notes_groq(
    text: str,
    max_tokens: int = 500,
    temperature: float = 0.7,
) -> List[Dict[str, str]]:
    """Generate study notes using Groq API with token limiting."""
    prompt = f"""Generate comprehensive and well-structured study notes for the following topic:

{text}

Please provide:
1. Key concepts and definitions
2. Important points to remember
3. Examples and applications
4. Summary

Format the notes clearly with sections and bullet points."""
    
    # For notes, use higher token limit (up to 1024)
    max_tokens = min(max_tokens, 1024)
    return generate_answer_groq(prompt, max_tokens, temperature)


def generate_quiz_groq(
    text: str,
    num_questions: int = 5,
    max_tokens: int = 1000,
    temperature: float = 0.7,
) -> List[Dict[str, str]]:
    """Generate quiz questions using Groq API with token limiting."""
    prompt = f"""Generate {num_questions} multiple-choice questions based on the following topic:

{text}

For each question, provide:
1. The question
2. Four options (A, B, C, D)
3. The correct answer (mark with [CORRECT])
4. A brief explanation

Format each question clearly with Q: prefix and options with A), B), C), D) prefixes."""
    
    # For quiz, use higher token limit (up to 2048 for complex queries)
    max_tokens = min(max_tokens, 2048)
    return generate_answer_groq(prompt, max_tokens, temperature)
