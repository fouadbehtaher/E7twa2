@echo off
setlocal
cd /d "%~dp0"

if "%PORT%"=="" set "PORT=3000"
if "%HOST%"=="" set "HOST=0.0.0.0"

where python >nul 2>nul
if errorlevel 1 (
  echo Python 3 is required to run the local server.
  echo Install Python from https://www.python.org/downloads/
  echo Or run server.ps1 from PowerShell.
  pause
  exit /b 1
)

echo Starting Ehtewaa on the local network...
echo This device: http://localhost:%PORT%/index.html
echo Other devices: use the Wi-Fi IP shown in the server window.
powershell -NoProfile -Command "Start-Sleep -Seconds 2; Start-Process 'http://localhost:%PORT%/index.html'" >nul 2>nul
python -X utf8 server.py
