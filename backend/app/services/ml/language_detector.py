from langdetect import detect_langs, LangDetectException

# Language code mapping
LANG_MAP = {
    'hi': 'hi',
    'te': 'te',
    'ta': 'ta',
    'kn': 'kn',
    'en': 'en',
    'mr': 'hi',
    'gu': 'hi',
    'bn': 'hi',
}


def detect_language(text: str) -> dict:
    """
    Detect the language of the input text using langdetect
    
    Args:
        text: Input text to detect language
        
    Returns:
        Dictionary with language code and confidence
    """
    try:
        # Get all language probabilities
        langs = detect_langs(text)
        
        if langs:
            detected_lang = langs[0].lang
            confidence = langs[0].prob
            
            # Map to supported languages
            language = LANG_MAP.get(detected_lang, detected_lang)
            
            return {
                "language": language,
                "confidence": float(confidence)
            }
        else:
            return {
                "language": "en",
                "confidence": 0.5
            }
    except LangDetectException:
        # Default to English if detection fails
        return {
            "language": "en",
            "confidence": 0.5
        }
