"""
Test file for Chatbot Tutor Backend API
Tests all endpoints and ML services
"""

import requests
import json
import time
from typing import Dict, Any

# Configuration
BASE_URL = "http://localhost:8000"
TIMEOUT = 30

# Test data
TEST_QUESTIONS = {
    "english": "What is photosynthesis?",
    "hindi": "फोटोसिंथेसिस क्या है?",
    "telugu": "ఫోటోసింథసిస్ అంటే ఏమిటి?",
}

TEST_SUBJECTS = {
    "subject": "Science",
    "topic": "Photosynthesis"
}


class Colors:
    """ANSI color codes for terminal output"""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'


def print_header(text: str):
    """Print a formatted header"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}")
    print(f"{text}")
    print(f"{'='*60}{Colors.RESET}\n")


def print_success(text: str):
    """Print success message"""
    print(f"{Colors.GREEN}✓ {text}{Colors.RESET}")


def print_error(text: str):
    """Print error message"""
    print(f"{Colors.RED}✗ {text}{Colors.RESET}")


def print_info(text: str):
    """Print info message"""
    print(f"{Colors.YELLOW}ℹ {text}{Colors.RESET}")


def test_health_check():
    """Test health check endpoint"""
    print_header("Testing Health Check")
    
    try:
        response = requests.get(f"{BASE_URL}/", timeout=TIMEOUT)
        
        if response.status_code == 200:
            data = response.json()
            print_success(f"Health check passed: {data['message']}")
            return True
        else:
            print_error(f"Health check failed with status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Health check error: {str(e)}")
        return False


def test_detect_language():
    """Test language detection endpoint"""
    print_header("Testing Language Detection")
    
    results = []
    for lang, text in TEST_QUESTIONS.items():
        try:
            payload = {"text": text}
            response = requests.post(
                f"{BASE_URL}/detect-language",
                json=payload,
                timeout=TIMEOUT
            )
            
            if response.status_code == 200:
                data = response.json()
                print_success(f"Language detection for '{lang}': {data['language']} (confidence: {data['confidence']:.2f})")
                results.append(True)
            else:
                print_error(f"Language detection failed for '{lang}': {response.status_code}")
                results.append(False)
        except Exception as e:
            print_error(f"Language detection error for '{lang}': {str(e)}")
            results.append(False)
    
    return all(results)


def test_classify_intent():
    """Test intent classification endpoint"""
    print_header("Testing Intent Classification")
    
    test_intents = [
        "What is photosynthesis?",
        "Define photosynthesis",
        "Compare photosynthesis and respiration",
        "Give examples of photosynthesis",
        "Explain how photosynthesis works"
    ]
    
    results = []
    for question in test_intents:
        try:
            payload = {"text": question}
            response = requests.post(
                f"{BASE_URL}/classify-intent",
                json=payload,
                timeout=TIMEOUT
            )
            
            if response.status_code == 200:
                data = response.json()
                print_success(f"Intent for '{question}': {data['intent']} (confidence: {data['confidence']:.2f})")
                results.append(True)
            else:
                print_error(f"Intent classification failed: {response.status_code}")
                results.append(False)
        except Exception as e:
            print_error(f"Intent classification error: {str(e)}")
            results.append(False)
    
    return all(results)


def test_generate_answer():
    """Test answer generation endpoint"""
    print_header("Testing Answer Generation")
    
    try:
        payload = {
            "prompt": "What is photosynthesis? Explain in simple terms.",
            "max_length": 300,
            "temperature": 0.7
        }
        
        print_info("Generating answer (this may take a moment)...")
        start_time = time.time()
        
        response = requests.post(
            f"{BASE_URL}/generate-answer",
            json=payload,
            timeout=TIMEOUT
        )
        
        elapsed_time = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            if data['answers']:
                answer = data['answers'][0]['text']
                score = data['answers'][0]['score']
                print_success(f"Answer generated in {elapsed_time:.2f}s (score: {score:.2f})")
                print(f"\nAnswer: {answer[:200]}...\n")
                return True
            else:
                print_error("No answer generated")
                return False
        else:
            print_error(f"Answer generation failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print_error(f"Answer generation error: {str(e)}")
        return False


def test_generate_notes():
    """Test notes generation endpoint"""
    print_header("Testing Notes Generation")
    
    try:
        payload = {
            "text": "Photosynthesis",
            "max_length": 500,
            "temperature": 0.7
        }
        
        print_info("Generating notes (this may take a moment)...")
        start_time = time.time()
        
        response = requests.post(
            f"{BASE_URL}/generate-notes",
            json=payload,
            timeout=TIMEOUT
        )
        
        elapsed_time = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            if data['answers']:
                notes = data['answers'][0]['text']
                score = data['answers'][0]['score']
                print_success(f"Notes generated in {elapsed_time:.2f}s (score: {score:.2f})")
                print(f"\nNotes: {notes[:200]}...\n")
                return True
            else:
                print_error("No notes generated")
                return False
        else:
            print_error(f"Notes generation failed: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Notes generation error: {str(e)}")
        return False


def test_generate_quiz():
    """Test quiz generation endpoint"""
    print_header("Testing Quiz Generation")
    
    try:
        payload = {
            "text": "Photosynthesis is the process by which plants convert light energy into chemical energy",
            "num_questions": 3,
            "max_length": 1000,
            "temperature": 0.7
        }
        
        print_info("Generating quiz (this may take a moment)...")
        start_time = time.time()
        
        response = requests.post(
            f"{BASE_URL}/generate-quiz",
            json=payload,
            timeout=TIMEOUT
        )
        
        elapsed_time = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            if data['answers']:
                quiz = data['answers'][0]['text']
                score = data['answers'][0]['score']
                print_success(f"Quiz generated in {elapsed_time:.2f}s (score: {score:.2f})")
                print(f"\nQuiz: {quiz[:300]}...\n")
                return True
            else:
                print_error("No quiz generated")
                return False
        else:
            print_error(f"Quiz generation failed: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Quiz generation error: {str(e)}")
        return False


def test_translate():
    """Test translation endpoint"""
    print_header("Testing Translation")
    
    test_translations = [
        ("What is photosynthesis?", "hi"),
        ("What is photosynthesis?", "te"),
        ("What is photosynthesis?", "ta"),
    ]
    
    results = []
    for text, target_lang in test_translations:
        try:
            payload = {
                "text": text,
                "target_lang": target_lang,
                "source_lang": "en"
            }
            
            response = requests.post(
                f"{BASE_URL}/translate",
                json=payload,
                timeout=TIMEOUT
            )
            
            if response.status_code == 200:
                data = response.json()
                translated = data['translated_text']
                print_success(f"Translated to {target_lang}: {translated}")
                results.append(True)
            else:
                print_error(f"Translation to {target_lang} failed: {response.status_code}")
                results.append(False)
        except Exception as e:
            print_error(f"Translation error: {str(e)}")
            results.append(False)
    
    return all(results)


def run_all_tests():
    """Run all tests"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}")
    print("╔════════════════════════════════════════════════════════════╗")
    print("║   Chatbot Tutor Backend API - Comprehensive Test Suite    ║")
    print("╚════════════════════════════════════════════════════════════╝")
    print(f"{Colors.RESET}")
    
    print_info(f"Testing server at: {BASE_URL}")
    print_info(f"Timeout: {TIMEOUT}s\n")
    
    tests = [
        ("Health Check", test_health_check),
        ("Language Detection", test_detect_language),
        ("Intent Classification", test_classify_intent),
        ("Answer Generation", test_generate_answer),
        ("Notes Generation", test_generate_notes),
        ("Quiz Generation", test_generate_quiz),
        ("Translation", test_translate),
    ]
    
    results = {}
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print_error(f"Unexpected error in {test_name}: {str(e)}")
            results[test_name] = False
    
    # Print summary
    print_header("Test Summary")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = f"{Colors.GREEN}PASSED{Colors.RESET}" if result else f"{Colors.RED}FAILED{Colors.RESET}"
        print(f"{test_name}: {status}")
    
    print(f"\n{Colors.BOLD}Total: {passed}/{total} tests passed{Colors.RESET}\n")
    
    if passed == total:
        print_success("All tests passed! ✓")
    else:
        print_error(f"{total - passed} test(s) failed")
    
    return passed == total


if __name__ == "__main__":
    try:
        success = run_all_tests()
        exit(0 if success else 1)
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Tests interrupted by user{Colors.RESET}")
        exit(1)
