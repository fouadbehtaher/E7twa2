@echo off
setlocal
cd /d "%~dp0"

where python >nul 2>nul
if errorlevel 1 (
  echo Python 3 is required to run the local server.
  echo Install Python from https://www.python.org/downloads/
  echo Or run server.ps1 from PowerShell.
  pause
  exit /b 1
)

echo Starting Ehtewaa on http://localhost:3000/index.html
powershell -NoProfile -Command "Start-Sleep -Seconds 2; Start-Process 'http://localhost:3000/index.html'" >nul 2>nul
python -X utf8 server.py
