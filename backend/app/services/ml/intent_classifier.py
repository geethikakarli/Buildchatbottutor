from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
from typing import Dict, Any
import os

# Model configuration
MODEL_NAME = "distilbert-base-multilingual-cased"
CACHE_DIR = os.path.join(os.path.dirname(__file__), "../../models")

# Intent labels (customize based on your needs)
INTENT_LABELS = [
    "definition",
    "concept",
    "numerical",
    "comparison",
    "explanation",
    "example",
    "other"
]

# Initialize model and tokenizer
tokenizer = None
model = None

def load_model():
    """Load the intent classification model."""
    global tokenizer, model
    
    if tokenizer is None:
        tokenizer = AutoTokenizer.from_pretrained(
            MODEL_NAME,
            cache_dir=CACHE_DIR
        )
    
    if model is None:
        model = AutoModelForSequenceClassification.from_pretrained(
            MODEL_NAME,
            num_labels=len(INTENT_LABELS),
            cache_dir=CACHE_DIR
        )
        model.eval()  # Set to evaluation mode
    
    return model, tokenizer

def classify_intent(text: str, threshold: float = 0.5) -> Dict[str, Any]:
    """
    Classify the intent of the input text.
    
    Args:
        text: Input text to classify
        threshold: Confidence threshold for prediction
        
    Returns:
        Dictionary containing:
        - intent: Predicted intent label
        - confidence: Confidence score
        - all_scores: Confidence scores for all intents
    """
    if not text.strip():
        return {
            "intent": "other",
            "confidence": 0.0,
            "all_scores": {label: 0.0 for label in INTENT_LABELS}
        }
    
    model, tokenizer = load_model()
    
    # Tokenize input
    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        max_length=512,
        padding=True
    )
    
    # Get predictions
    with torch.no_grad():
        outputs = model(**inputs)
        
    # Apply softmax to get probabilities
    probs = torch.nn.functional.softmax(outputs.logits, dim=-1)[0]
    
    # Get predicted intent and confidence
    confidence, pred_idx = torch.max(probs, dim=0)
    intent = INTENT_LABELS[pred_idx.item()]
    
    # Get all scores
    all_scores = {
        label: float(probs[i]) 
        for i, label in enumerate(INTENT_LABELS)
    }
    
    return {
        "intent": intent,
        "confidence": float(confidence),
        "all_scores": all_scores
    }
