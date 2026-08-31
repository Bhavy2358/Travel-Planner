@echo off
title Travel Copilot Launcher
echo ===================================================
echo ✈️ Starting Travel Copilot (Backend + Frontend)
echo ===================================================
echo.

echo Starting FastAPI Backend Server on port 8000...
start cmd /k "cd backend && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

timeout /t 2 /nobreak >nul

echo Starting Vite Frontend Server on port 5173...
start cmd /k "cd frontend && npm run dev"

timeout /t 2 /nobreak >nul

echo.
echo Opening Travel Copilot in your browser...
start http://localhost:5173

echo.
echo ===================================================
echo ✅ Servers are running!
echo Frontend: http://localhost:5173
echo Backend API: http://127.0.0.1:8000/docs
echo ===================================================
