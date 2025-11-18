@echo off
cd /d "c:\Users\gkaru\Downloads\Buildchatbottutor\backend"
python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
pause
