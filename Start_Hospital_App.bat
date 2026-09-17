@echo off
title Smart Hospital Management System - 1-Click Launch
echo ============================================================
echo   Smart Hospital & Patient Management System
echo ============================================================
echo.
echo [1/2] Opening Standalone Application in default browser...
start "" "%~dp0index.html"
echo.
echo [OK] Application successfully opened in browser!
echo.
echo ============================================================
echo Quick Access Credentials:
echo   - Administrator: admin@hospital.local / Admin@123
echo   - Doctor:        doctor@hospital.local / Doctor@123
echo   - Receptionist:  reception@hospital.local / Recep@123
echo   - Patient:       patient@hospital.local / Patient@123
echo   - Accountant:    billing@hospital.local / Account@123
echo ============================================================
echo.
echo For full-stack Django + React servers, run: Start_FullStack.bat
echo.
timeout /t 5 >nul
