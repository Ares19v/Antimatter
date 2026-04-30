@echo off
title Antimatter — Project Cleaning Suite
color 0B
cls

echo.
echo   ============================================================
echo    ANTIMATTER  ^|  Project Cleaning Suite  ^|  v1.0.0
echo   ============================================================
echo.

REM ─── Check Node.js ─────────────────────────────────────────
echo   [*] Checking dependencies...
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo   [!] ERROR: Node.js is not installed or not in PATH.
    echo       Please install Node.js from https://nodejs.org and re-run.
    pause
    exit /b 1
)

REM ─── Install root dependencies if needed ────────────────────
if not exist "node_modules" (
    echo   [*] Installing CLI ^& Backend dependencies...
    npm install --silent
    if %ERRORLEVEL% neq 0 (
        echo   [!] Failed to install CLI dependencies. Run "npm install" manually.
        pause
        exit /b 1
    )
)

REM ─── Install UI dependencies if needed ──────────────────────
if not exist "ui\node_modules" (
    echo   [*] Installing React UI dependencies...
    cd ui && npm install --silent && cd ..
    if %ERRORLEVEL% neq 0 (
        echo   [!] Failed to install UI dependencies. Run "npm install" inside /ui manually.
        pause
        exit /b 1
    )
)

echo   [✓] Dependencies ready.
echo.

REM ─── Launch Backend ─────────────────────────────────────────
echo   [*] Launching backend server on http://localhost:4000 ...
start "Antimatter Backend" cmd /k "title Antimatter Backend && npm run serve"

REM ─── Small delay so backend registers first ─────────────────
timeout /t 2 /nobreak >nul

REM ─── Launch Frontend ────────────────────────────────────────
echo   [*] Launching React GUI...
start "Antimatter GUI" cmd /k "title Antimatter GUI && cd ui && npm run dev"

echo.
echo   [✓] Antimatter is launching. Your browser will open automatically.
echo       Backend: http://localhost:4000
echo       GUI:     http://localhost:5173
echo.
echo   Press any key to close this launcher window.
echo   ============================================================
pause >nul
