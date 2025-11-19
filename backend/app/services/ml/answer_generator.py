from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
from typing import Dict, List, Optional
import os
from .groq_service import is_groq_available, generate_answer_groq, generate_notes_groq, generate_quiz_groq

# Model configuration
MODEL_NAME = "google/flan-t5-small"
CACHE_DIR = os.path.join(os.path.dirname(__file__), "../../models")

# Initialize model and tokenizer
tokenizer = None
model = None

def load_model():
    """Load the answer generation model."""
    global tokenizer, model
    
    if tokenizer is None:
        tokenizer = AutoTokenizer.from_pretrained(
            MODEL_NAME,
            cache_dir=CACHE_DIR
        )
    
    if model is None:
        # Try to load with 8-bit quantization if available
        try:
            from transformers import BitsAndBytesConfig
            quantization_config = BitsAndBytesConfig(load_in_8bit=True)
            model = AutoModelForSeq2SeqLM.from_pretrained(
                MODEL_NAME,
                cache_dir=CACHE_DIR,
                device_map="auto",
                quantization_config=quantization_config
            )
        except ImportError:
            # Fallback to FP16 if 8-bit not available
            model = AutoModelForSeq2SeqLM.from_pretrained(
                MODEL_NAME,
                cache_dir=CACHE_DIR,
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
            )
        
        model.eval()  # Set to evaluation mode
    
    return model, tokenizer

def generate_answer(
    prompt: str,
    max_length: int = 200,
    temperature: float = 0.7,
    top_p: float = 0.9,
    top_k: int = 50,
    num_return_sequences: int = 1
) -> List[Dict[str, str]]:
    """
    Generate an answer based on the given prompt.
    Uses Groq API if available, falls back to local model.
    
    Args:
        prompt: The input prompt/question
        max_length: Maximum length of the generated text
        temperature: Controls randomness (lower = more deterministic)
        top_p: Nucleus sampling parameter
        top_k: Top-k sampling parameter
        num_return_sequences: Number of sequences to generate
        
    Returns:
        List of dictionaries containing generated answers and their scores
    """
    if not prompt.strip():
        return [{"text": "", "score": 0.0}]
    
    # Try Groq API first
    if is_groq_available():
        try:
            print(f"[ANSWER_GEN] Attempting Groq API...")
            result = generate_answer_groq(prompt, max_length, temperature)
            print(f"[ANSWER_GEN] ✓ Successfully got answer from Groq")
            return result
        except Exception as e:
            print(f"[ANSWER_GEN] ✗ Groq failed: {e}")
            import traceback
            traceback.print_exc()
    else:
        print(f"[ANSWER_GEN] Groq not available")
    
    # Fallback to local model
    print(f"[ANSWER_GEN] Falling back to local model...")
    try:
        model, tokenizer = load_model()
        
        # Tokenize input
        inputs = tokenizer(
            prompt,
            return_tensors="pt",
            truncation=True,
            max_length=512,
            padding=True
        )
        
        # Move to device (GPU if available)
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        # Generate output
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_length=max_length,
                temperature=temperature,
                top_p=top_p,
                top_k=top_k,
                num_return_sequences=num_return_sequences,
                do_sample=True,
                no_repeat_ngram_size=3,
                early_stopping=True
            )
        
        # Decode and process outputs
        results = []
        for i, output in enumerate(outputs):
            text = tokenizer.decode(output, skip_special_tokens=True)
            # Simple heuristic for score (can be replaced with model scores if available)
            score = 1.0 - (i * 0.1)  # First result has highest score
            results.append({
                "text": text,
                "score": min(max(score, 0), 1.0)  # Ensure score is between 0 and 1
            })
        
        print(f"[ANSWER_GEN] ✓ Got answer from local model")
        return results
    except Exception as e:
        print(f"[ANSWER_GEN] ✗ Local model also failed: {e}")
        import traceback
        traceback.print_exc()
        return [{"text": "Error generating answer", "score": 0.0}]

def generate_notes(text: str, **kwargs) -> List[Dict[str, str]]:
    """Generate study notes from the given text."""
    # Try Groq API first
    if is_groq_available():
        try:
            print(f"[GROQ] Attempting to generate notes using Groq API...")
            max_length = kwargs.get('max_length', 500)
            temperature = kwargs.get('temperature', 0.7)
            result = generate_notes_groq(text, max_length, temperature)
            print(f"[GROQ] ✓ Successfully used Groq API for notes")
            return result
        except Exception as e:
            print(f"[GROQ] ✗ Groq API error for notes: {e}")
            import traceback
            traceback.print_exc()
    else:
        print(f"[GROQ] Groq API not available for notes")
    
    # Fallback to local model
    print(f"[LOCAL] Falling back to local ML model for notes...")
    prompt = f"Summarize the following text into concise study notes:\n\n{text}"
    return generate_answer(prompt, **kwargs)

def generate_quiz(text: str, num_questions: int = 5, **kwargs) -> List[Dict[str, str]]:
    """Generate a quiz with questions and answers from the given text."""
    # Try Groq API first
    if is_groq_available():
        try:
            print(f"[GROQ] Attempting to generate quiz using Groq API...")
            max_length = kwargs.get('max_length', 1000)
            temperature = kwargs.get('temperature', 0.7)
            result = generate_quiz_groq(text, num_questions, max_length, temperature)
            print(f"[GROQ] ✓ Successfully used Groq API for quiz")
            return result
        except Exception as e:
            print(f"[GROQ] ✗ Groq API error for quiz: {e}")
            import traceback
            traceback.print_exc()
    else:
        print(f"[GROQ] Groq API not available for quiz")
    
    # Fallback to local model
    print(f"[LOCAL] Falling back to local ML model for quiz...")
    prompt = f"Generate {num_questions} multiple-choice questions with answers based on the following text. Format each question with 'Q:' and options as 'A)', 'B)', etc. with the correct answer marked with [CORRECT]:\n\n{text}"
    return generate_answer(prompt, **kwargs)
