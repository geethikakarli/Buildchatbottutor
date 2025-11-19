#!/usr/bin/env python
import requests
import json
import sys

try:
    print("Sending request to http://127.0.0.1:8000/generate-answer")
    
    response = requests.post(
        'http://127.0.0.1:8000/generate-answer',
        json={
            'prompt': 'Hello world',
            'max_length': 50,
            'temperature': 0.5
        },
        timeout=300
    )
    
    print(f"Response status: {response.status_code}")
    print(f"Response content: {response.text[:500]}")
    data = response.json()
    print(f"Answer: {data['answers'][0]['text']}")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
