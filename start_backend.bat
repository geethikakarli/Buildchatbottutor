@echo off
cd /d "c:\Users\gkaru\Downloads\Buildchatbottutor\backend"
call venv\Scripts\activate.bat
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
