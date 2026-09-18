@echo off
title Sarkari Spark - Start Project
echo ===================================================
echo       Starting Sarkari Spark Application
echo ===================================================
echo.

:: Ensure Node.js is in PATH
set "PATH=%PATH%;C:\Program Files\nodejs"

:: Ensure MongoDB service is started if on Windows
net start MongoDB >nul 2>&1

echo [1/3] Starting Backend API Server (Port 5000)...
start "Sarkari Spark - Backend" cmd /k "cd /d "%~dp0backend" && set "PATH=%%PATH%%;C:\Program Files\nodejs" && node server.js"

echo [2/3] Starting Frontend Next.js Server (Port 3000)...
start "Sarkari Spark - Frontend" cmd /k "cd /d "%~dp0frontend" && set "PATH=%%PATH%%;C:\Program Files\nodejs" && npm.cmd run dev"

echo [3/3] Initializing servers... Please wait 8 seconds...
timeout /t 8 /nobreak >nul

echo Opening browser at http://localhost:3000...
start http://localhost:3000

echo.
echo ===================================================
echo   Project started successfully!
echo   Frontend Website: http://localhost:3000
echo   Backend API:      http://localhost:5000
echo.
echo   Do not close the two server command windows.
echo   You can minimize them.
echo ===================================================
pause
