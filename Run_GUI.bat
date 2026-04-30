@echo off
echo Starting Antimatter Backend Server...
start cmd /k "npm run serve"

echo Starting Antimatter GUI...
start cmd /k "cd ui && npm run dev"

echo Both services are starting. The GUI will open in your browser shortly!
