# ⲁ ابدأ هنا — افتح Alpha في المتصفح

## المشكلة

روابط السحابة (`trycloudflare.com`) **قد لا تفتح** في مصر أو على بعض الشبكات.
الحل الوحيد المضمون: تشغيل المشروع **على لابتوبك** — نفس `npm run dev`.

---

## Windows (الأسهل)

### 1) ثبّت Node.js (مرة واحدة فقط)

افتح: **https://nodejs.org**  
حمّل **LTS** وثبّته → Next → Next → Finish

### 2) حمّل المشروع

افتح **Command Prompt** أو **PowerShell**:

```
git clone https://github.com/raafatayadsa-art/alpha-bible-v2.git
cd alpha-bible-v2
git checkout cursor/profile-v3-redesign-43cc
```

### 3) شغّل التطبيق

**طريقة أ:** دبل كليك على:
```
scripts\START_ALPHA_WINDOWS.bat
```

**طريقة ب:** في Terminal:
```
npm install
npm run dev
```

### 4) افتح المتصفح

```
http://localhost:5173/home
http://localhost:5173/profile
```

---

## Mac

```bash
git clone https://github.com/raafatayadsa-art/alpha-bible-v2.git
cd alpha-bible-v2
git checkout cursor/profile-v3-redesign-43cc
chmod +x scripts/START_ALPHA_MAC.sh
./scripts/START_ALPHA_MAC.sh
```

---

## لو معندكش Git

1. افتح: https://github.com/raafatayadsa-art/alpha-bible-v2
2. اضغط **Code** → **Download ZIP**
3. فك الضغط
4. افتح Terminal داخل المجلد
5. `npm install` ثم `npm run dev`

---

## Cursor Desktop (بدون Cloud Agent)

1. **File → Open Folder** → اختر مجلد المشروع
2. **Terminal → New Terminal**
3. اكتب: `npm install` ثم `npm run dev`
4. افتح: http://localhost:5173/profile

---

## لقطات الشاشة (بدون سيرفر)

افتح في Cursor:
`reports/assets/profile-v3-section1-hero.png`

---

## مساعدة

| السؤال | الجواب |
|--------|--------|
| `npm` مش معروف | ثبّت Node.js من nodejs.org |
| المنفذ مشغول | `npm run dev -- --port 3000` |
| الصفحة فاضية | انتظر 10 ثوانٍ بعد `npm run dev` |
