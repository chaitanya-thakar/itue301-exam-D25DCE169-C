@echo off
title MedCare Plus - Hospital Appointment System Launcher
echo ================================================================
echo   MedCare Plus - Hospital Appointment System Launcher
echo ================================================================
echo.

cd /d "%~dp0"

echo [1/3] Ensuring ports 5000 and 5173 are free...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :5000 ^| findstr LISTENING') do (
    if not "%%a"=="" taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :5173 ^| findstr LISTENING') do (
    if not "%%a"=="" taskkill /F /PID %%a >nul 2>&1
)

echo [2/3] Starting Backend Server on port 5000...
start "MedCare Plus - Backend Server" cmd /k "cd /d "%~dp0backend" && node server.js"

timeout /t 2 /nobreak >nul

echo [3/3] Starting Frontend React App on port 5173...
start "MedCare Plus - Frontend App" cmd /k "cd /d "%~dp0frontend" && npm.cmd run dev"

timeout /t 2 /nobreak >nul

echo.
echo ================================================================
echo   All Services are Running:
echo   - Frontend UI:   http://localhost:5173
echo   - Backend API:   http://localhost:5000
echo   - Health Check:  http://localhost:5000/api/v1/health
echo ================================================================
echo.

start http://localhost:5173

pause
