from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
from typing import Dict, List, Optional, Union
import os

# Model configuration
MODEL_NAME = "ai4bharat/indictrans2-en-indic"
CACHE_DIR = os.path.join(os.path.dirname(__file__), "../../models")

# Supported languages with their codes
SUPPORTED_LANGUAGES = {
    "hindi": "hin_Deva",
    "telugu": "tel_Telu",
    "tamil": "tam_Taml",
    "kannada": "kan_Knda",
    "english": "eng_Latn"
}

# Language code mapping for the model
LANG_CODE_MAP = {
    "hi": "hin_Deva",
    "te": "tel_Telu",
    "ta": "tam_Taml",
    "kn": "kan_Knda",
    "en": "eng_Latn"
}

# Initialize model and tokenizer
tokenizer = None
model = None

def load_model():
    """Load the translation model."""
    global tokenizer, model
    
    if tokenizer is None:
        tokenizer = AutoTokenizer.from_pretrained(
            MODEL_NAME,
            cache_dir=CACHE_DIR,
            src_lang="eng_Latn"
        )
    
    if model is None:
        try:
            # Try to load with 8-bit quantization if available
            from transformers import BitsAndBytesConfig
            quantization_config = BitsAndBytesConfig(load_in_8bit=True)
            model = AutoModelForSeq2SeqLM.from_pretrained(
                MODEL_NAME,
                cache_dir=CACHE_DIR,
                device_map="auto",
                quantization_config=quantization_config
            )
        except (ImportError, AttributeError):
            # Fallback to FP16 if 8-bit not available
            model = AutoModelForSeq2SeqLM.from_pretrained(
                MODEL_NAME,
                cache_dir=CACHE_DIR,
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
            )
        
        model.eval()  # Set to evaluation mode
    
    return model, tokenizer

def translate_text(
    text: str,
    target_lang: str,
    source_lang: str = "en",
    max_length: int = 200,
    **kwargs
) -> str:
    """
    Translate text from source language to target language.
    
    Args:
        text: Text to translate
        target_lang: Target language code (e.g., 'hi', 'te', 'ta', 'kn', 'en')
        source_lang: Source language code (default: 'en')
        max_length: Maximum length of the generated translation
        
    Returns:
        Translated text
    """
    if not text.strip():
        return ""
    
    # Normalize language codes
    source_lang = source_lang.lower()
    target_lang = target_lang.lower()
    
    # Get full language codes
    src_lang_code = LANG_CODE_MAP.get(source_lang)
    tgt_lang_code = LANG_CODE_MAP.get(target_lang)
    
    if not src_lang_code or not tgt_lang_code:
        raise ValueError(f"Unsupported language pair: {source_lang} -> {target_lang}")
    
    # If source and target languages are the same, return the original text
    if source_lang == target_lang:
        return text
    
    model, tokenizer = load_model()
    
    # Prepare input
    inputs = tokenizer(
        text,
        return_tensors="pt",
        padding=True,
        truncation=True,
        max_length=512
    )
    
    # Move to device (GPU if available)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    inputs = {k: v.to(device) for k, v in inputs.items()}
    
    # Generate translation
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            forced_bos_token_id=tokenizer.lang_code_to_id[tgt_lang_code],
            max_length=max_length,
            **kwargs
        )
    
    # Decode and clean up the output
    translated_text = tokenizer.batch_decode(outputs, skip_special_tokens=True)[0]
    
    return translated_text

def translate_to_local(text: str, target_lang: str, source_lang: str = "en") -> str:
    """
    Translate text to a local Indian language.
    
    Args:
        text: Text to translate
        target_lang: Target language code (e.g., 'hi', 'te', 'ta', 'kn')
        source_lang: Source language code (default: 'en')
        
    Returns:
        Translated text
    """
    return translate_text(text, target_lang, source_lang)

def translate_to_english(text: str, source_lang: str) -> str:
    """
    Translate text from a local language to English.
    
    Args:
        text: Text to translate
        source_lang: Source language code (e.g., 'hi', 'te', 'ta', 'kn')
        
    Returns:
        Translated text in English
    """
    return translate_text(text, "en", source_lang)
