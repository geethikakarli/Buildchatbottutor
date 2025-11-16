# Chatbot Tutor Backend

This is the backend service for the Chatbot Tutor application, providing ML-powered features like language detection, intent classification, answer generation, and translation.

## Features

- **Language Detection**: Detect the language of input text
- **Intent Classification**: Classify user questions into categories
- **Answer Generation**: Generate answers to questions using FLAN-T5
- **Notes Generation**: Create concise study notes from text
- **Quiz Generation**: Generate quizzes from study material
- **Translation**: Translate text between English and Indian languages

## Setup

1. **Prerequisites**
   - Python 3.8+
   - pip

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the server**
   ```bash
   cd app
   uvicorn main:app --reload
   ```

   The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit `http://localhost:8000/docs` for interactive API documentation.

## Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Model cache directory (optional)
MODEL_CACHE_DIR=./models

# Server configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True
```

## API Endpoints

### Language Detection
- `POST /detect-language`
  - Request body: `{ "text": "Your text here" }`
  - Response: `{ "language": "en", "confidence": 0.99 }`

### Intent Classification
- `POST /classify-intent`
  - Request body: `{ "text": "What is photosynthesis?" }`
  - Response: `{ "intent": "definition", "confidence": 0.95, "all_scores": {...} }`

### Translation
- `POST /translate`
  - Request body: `{ "text": "Hello", "target_lang": "hi", "source_lang": "en" }`
  - Response: `{ "translated_text": "नमस्ते", "source_lang": "en", "target_lang": "hi" }`

### Answer Generation
- `POST /generate-answer`
  - Request body: `{ "prompt": "What is the capital of France?" }`
  - Response: `{ "answers": [{ "text": "Paris", "score": 0.95 }] }`

### Notes Generation
- `POST /generate-notes`
  - Request body: `{ "text": "Long text about photosynthesis..." }`
  - Response: `{ "answers": [{ "text": "- Photosynthesis converts light energy to chemical energy...", "score": 0.9 }] }`

### Quiz Generation
- `POST /generate-quiz`
  - Request body: `{ "text": "Text about history...", "num_questions": 3 }`
  - Response: `{ "answers": [{ "text": "Q: When did World War II end?\nA) 1943\nB) 1944\nC) 1945 [CORRECT]\nD) 1946", "score": 0.9 }] }`

## Model Information

- **Language Detection**: fastText (lid.176.bin)
- **Intent Classification**: DistilBERT Multilingual
- **Answer Generation**: FLAN-T5 Small
- **Translation**: IndicTrans2 (English to Indian languages)

## License

This project is licensed under the MIT License.
