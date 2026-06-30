@echo off
chcp 65001 >nul
echo.
echo  ========================================
echo   Alpha Bible - تشغيل على المتصفح
echo  ========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [خطأ] Node.js غير مثبت.
  echo.
  echo  1. افتح: https://nodejs.org
  echo  2. حمّل النسخة LTS وثبّتها
  echo  3. أعد فتح هذا الملف
  echo.
  pause
  exit /b 1
)

echo Node: 
node -v
echo.

if not exist node_modules (
  echo جاري تثبيت الحزم... قد يستغرق دقائق
  call npm install
)

echo.
echo  جاري فتح التطبيق...
echo  المتصفح سيفتح على: http://localhost:5173/home
echo.
echo  الملف الشخصي: http://localhost:5173/profile
echo.
echo  لإيقاف السيرفر: اضغط Ctrl+C
echo.

call npm run dev
pause
