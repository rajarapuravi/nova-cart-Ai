@echo off
echo Starting NovaCart AI...

echo.
echo [1/2] Starting Backend (Django)...
start "NovaCart Backend" cmd /k "cd /d %~dp0backend && python manage.py runserver 8000"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend (Vite)...
start "NovaCart Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo  NovaCart AI is starting...
echo  Frontend: http://localhost:5173
echo  Backend:  http://localhost:8000/api
echo  Admin:    http://localhost:5173/admin
echo ========================================
echo.
echo Credentials:
echo  Admin: admin@novacart.ai / Admin@123
echo  User:  user@novacart.ai  / User@123
