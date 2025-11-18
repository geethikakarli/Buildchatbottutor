"""
Groq API Service for faster inference
Uses Groq's API for answer generation, notes, and quiz generation
"""

import os
import logging
from groq import Groq
from typing import List, Dict
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# Initialize Groq client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# Model configuration
MODEL_NAME = "mixtral-8x7b-32768"  # Fast and powerful model

# Log Groq status
if GROQ_API_KEY:
    logger.info(f"✓ Groq API Key loaded successfully")
else:
    logger.warning("✗ Groq API Key not found - will use local models")


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
        logger.info(f"Groq API call: model={MODEL_NAME}, max_tokens={max_tokens}, temp={temperature}")
        
        message = client.chat.completions.create(
            model=MODEL_NAME,
            max_tokens=max_tokens,
            temperature=temperature,
            top_p=0.95,
            top_k=40,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )
        
        # Extract the response text
        response_text = message.choices[0].message.content if message.choices else ""
        
        # Log token usage
        if hasattr(message, 'usage'):
            logger.info(f"Tokens used - Input: {message.usage.prompt_tokens}, Output: {message.usage.completion_tokens}")
        
        return [
            {
                "text": response_text,
                "score": 0.95
            }
        ]
    except Exception as e:
        logger.error(f"Groq API error: {str(e)}")
        raise Exception(f"Groq API error: {str(e)}")


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
