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
    Generate an answer using Groq API.
    
    Args:
        prompt: The input prompt/question
        max_tokens: Maximum tokens in response
        temperature: Controls randomness
        
    Returns:
        List of dictionaries containing generated answers
    """
    if not is_groq_available():
        raise ValueError("Groq API is not configured. Set GROQ_API_KEY environment variable.")
    
    if not prompt.strip():
        return [{"text": "", "score": 0.0}]
    
    try:
        message = client.messages.create(
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
        
        # Extract the response text
        response_text = message.content[0].text if message.content else ""
        
        return [
            {
                "text": response_text,
                "score": 0.95
            }
        ]
    except Exception as e:
        raise Exception(f"Groq API error: {str(e)}")


def generate_notes_groq(
    text: str,
    max_tokens: int = 500,
    temperature: float = 0.7,
) -> List[Dict[str, str]]:
    """Generate study notes using Groq API."""
    prompt = f"""Generate comprehensive and well-structured study notes for the following topic:

{text}

Please provide:
1. Key concepts and definitions
2. Important points to remember
3. Examples and applications
4. Summary

Format the notes clearly with sections and bullet points."""
    
    return generate_answer_groq(prompt, max_tokens, temperature)


def generate_quiz_groq(
    text: str,
    num_questions: int = 5,
    max_tokens: int = 1000,
    temperature: float = 0.7,
) -> List[Dict[str, str]]:
    """Generate quiz questions using Groq API."""
    prompt = f"""Generate {num_questions} multiple-choice questions based on the following topic:

{text}

For each question, provide:
1. The question
2. Four options (A, B, C, D)
3. The correct answer (mark with [CORRECT])
4. A brief explanation

Format each question clearly with Q: prefix and options with A), B), C), D) prefixes."""
    
    return generate_answer_groq(prompt, max_tokens, temperature)
