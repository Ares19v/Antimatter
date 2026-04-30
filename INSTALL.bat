@echo off
title Antimatter — Installer
color 0B
cls

echo.
echo   ============================================================
echo    ANTIMATTER  ^|  Installer  ^|  v1.0.0
echo   ============================================================
echo.
echo   This will install all dependencies for the Antimatter suite.
echo   (CLI, Backend, React GUI, and IDE Extension)
echo.

REM ─── Check Node.js ─────────────────────────────────────────
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo   [!] ERROR: Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)
echo   [✓] Node.js detected.

REM ─── Root (CLI + Backend) ───────────────────────────────────
echo   [*] Installing CLI ^& Backend dependencies...
npm install
if %ERRORLEVEL% neq 0 ( echo   [!] Failed. && pause && exit /b 1 )
echo   [✓] CLI ^& Backend ready.

REM ─── Build CLI ──────────────────────────────────────────────
echo   [*] Compiling TypeScript CLI...
npm run build
if %ERRORLEVEL% neq 0 ( echo   [!] CLI build failed. && pause && exit /b 1 )
echo   [✓] CLI compiled.

REM ─── React UI ───────────────────────────────────────────────
echo   [*] Installing React GUI dependencies...
cd ui && npm install
if %ERRORLEVEL% neq 0 ( echo   [!] UI install failed. && cd .. && pause && exit /b 1 )
cd ..
echo   [✓] React GUI ready.

REM ─── IDE Extension ──────────────────────────────────────────
echo   [*] Installing IDE Extension dependencies...
cd ide-extension && npm install
if %ERRORLEVEL% neq 0 ( echo   [!] Extension install failed. && cd .. && pause && exit /b 1 )
npm run package
cd ..
echo   [✓] IDE Extension packaged: ide-extension/antimatter-ide-1.0.0.vsix

echo.
echo   ============================================================
echo   [✓] Installation complete!
echo.
echo   HOW TO USE:
echo     - GUI:           Double-click Run_Project.bat
echo     - CLI:           Run 'antimatter' in any terminal
echo     - IDE Extension: Right-click ide-extension/antimatter-ide-1.0.0.vsix
echo                      and select 'Install Extension VSIX'
echo   ============================================================
echo.
pause
