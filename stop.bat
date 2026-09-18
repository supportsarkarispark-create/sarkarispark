@echo off
title Sarkari Spark - Stop Project
echo ===================================================
echo       Stopping Sarkari Spark Application
echo ===================================================
echo.

echo Stopping Node.js processes (Backend & Frontend)...
taskkill /F /IM node.exe 2>nul

echo.
echo ===================================================
echo All servers have been stopped successfully!
echo ===================================================
timeout /t 3 /nobreak >nul
