# Start FastAPI backend server
$backendPath = "c:\Users\gkaru\Downloads\Buildchatbottutor\backend"
$pythonExe = "$backendPath\venv\Scripts\python.exe"

Set-Location $backendPath

Write-Host "Starting FastAPI backend server..."
Write-Host "Python: $pythonExe"
Write-Host "Directory: $(Get-Location)"

& $pythonExe -m uvicorn app.main:app --host 0.0.0.0 --port 8000
