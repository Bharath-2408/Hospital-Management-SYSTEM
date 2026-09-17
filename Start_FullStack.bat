@echo off
title Smart Hospital Full-Stack Dev Server Launcher
echo ============================================================
echo   Starting Smart Hospital & Patient Management System
echo ============================================================
echo.
echo [1/3] Starting Django REST Backend on http://127.0.0.1:8000/ ...
start "Django API Server" cmd /k "cd /d %~dp0backend && .\venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Vite + React SPA Frontend on http://localhost:5173/ ...
start "React Vite Server" cmd /k "cd /d %~dp0frontend && npm run dev"
timeout /t 4 /nobreak >nul

echo [3/3] Launching application in browser...
start "" "http://localhost:5173"

echo.
echo [OK] All services running! You can close this launcher window.
timeout /t 5 >nul
