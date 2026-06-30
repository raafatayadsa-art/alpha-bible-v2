# فتح Alpha في المتصفح — دليل سريع

## لماذا `localhost` لا يفتح عندك؟

عند العمل مع **Cloud Agent**، السيرفر يعمل على جهاز بعيد في السحابة — وليس على لابتوبك.
لذلك `http://localhost:5173` على متصفحك يبحث عن سيرفر على **جهازك** ولا يجده.

---

## الطريقة 1 — على لابتوبك (مثل `npm run dev` تماماً) ⭐ الأفضل

```bash
git clone https://github.com/raafatayadsa-art/alpha-bible-v2.git
cd alpha-bible-v2
git checkout cursor/profile-v3-redesign-43cc
npm install
npm run dev
```

يفتح المتصفح تلقائياً على: `http://localhost:5173/home`

| الصفحة | الرابط |
|--------|--------|
| الرئيسية | http://localhost:5173/home |
| الملف الشخصي | http://localhost:5173/profile |
| الكنيسة | http://localhost:5173/church |

---

## الطريقة 2 — رابط مباشر من السحابة (بدون تثبيت)

الوكيل يشغّل السيرفر + نفق عام. افتح:

**https://derby-widescreen-ruby-mineral.trycloudflare.com/home**

| الصفحة | الرابط |
|--------|--------|
| الملف الشخصي | https://derby-widescreen-ruby-mineral.trycloudflare.com/profile |

> ⚠️ هذا الرابط **مؤقت** — يتغير عند إعادة تشغيل النفق.

لإنشاء رابط جديد من المشروع:

```bash
npm run dev:browser
```

---

## الطريقة 3 — Cursor Ports (إن وُجد)

1. أسفل Cursor → تبويب **Ports** (بجانب Terminal)
2. ابحث عن منفذ **5173**
3. اضغط **Open in Browser**

أو أيقونة **🔌** أعلى يمين نافذة الـ Agent.

---

## ملخص

| الطريقة | متى تستخدمها |
|---------|----------------|
| `npm run dev` على لابتوبك | تطوير يومي — نفس تجربة اللابتوب |
| رابط trycloudflare | تجربة سريعة من الموبايل أو بدون clone |
| Cursor Ports | إن كنت داخل Cursor Desktop مع Agent |
