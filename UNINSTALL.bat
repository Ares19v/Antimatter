@echo off
title Antimatter — Uninstaller
color 0C
cls

echo.
echo   ============================================================
echo    ANTIMATTER  ^|  Uninstaller  ^|  v1.0.0
echo   ============================================================
echo.
echo   This will remove all installed dependencies (node_modules).
echo   Your source code and settings will NOT be deleted.
echo.
set /p confirm=   Are you sure? (Y/N): 
if /i "%confirm%" neq "Y" (
    echo   [i] Uninstall cancelled.
    pause
    exit /b 0
)

echo.
echo   [*] Removing root node_modules...
if exist "node_modules" rmdir /s /q "node_modules"
echo   [✓] Root node_modules removed.

echo   [*] Removing UI node_modules...
if exist "ui\node_modules" rmdir /s /q "ui\node_modules"
echo   [✓] UI node_modules removed.

echo   [*] Removing IDE Extension node_modules...
if exist "ide-extension\node_modules" rmdir /s /q "ide-extension\node_modules"
echo   [✓] Extension node_modules removed.

echo   [*] Removing compiled output...
if exist "dist" rmdir /s /q "dist"
if exist "ide-extension\dist" rmdir /s /q "ide-extension\dist"
echo   [✓] Compiled output removed.

echo.
echo   ============================================================
echo   [✓] Uninstall complete. Run INSTALL.bat to reinstall.
echo   ============================================================
echo.
pause
