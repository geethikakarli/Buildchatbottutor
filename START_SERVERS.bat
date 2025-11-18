@echo off
REM Start Backend Server
start "Backend Server" cmd /k "cd /d c:\Users\gkaru\Downloads\Buildchatbottutor\backend && python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

REM Wait a moment for backend to start
timeout /t 2 /nobreak

REM Start Frontend Dev Server
start "Frontend Dev Server" cmd /k "cd /d c:\Users\gkaru\Downloads\Buildchatbottutor && npm run dev"

echo.
echo ============================================
echo Chatbot Tutor - Starting Both Servers
echo ============================================
echo.
echo Backend: http://127.0.0.1:8000
echo Frontend: http://localhost:3000
echo.
echo Both servers are starting in separate windows...
echo.
pause
