#!/bin/bash
set -e
echo ""
echo "  ========================================"
echo "   Alpha Bible - تشغيل على المتصفح"
echo "  ========================================"
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "[خطأ] Node.js غير مثبت."
  echo "  حمّل من: https://nodejs.org"
  exit 1
fi

echo "Node: $(node -v)"
echo ""

if [ ! -d node_modules ]; then
  echo "جاري تثبيت الحزم..."
  npm install
fi

echo ""
echo "  المتصفح: http://localhost:5173/home"
echo "  الملف الشخصي: http://localhost:5173/profile"
echo "  لإيقاف السيرفر: Ctrl+C"
echo ""

npm run dev
