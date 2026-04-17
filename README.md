# احتواء - Ehtewaa

تطبيق ويب عربي ثابت لدعم الحوامل والأمهات الجدد. المشروع مبني بملفات `HTML/CSS/JavaScript` فقط، والبيانات التجريبية تحفظ محليًا داخل المتصفح باستخدام `localStorage`.

## ما الذي يحتويه المشروع؟

- صفحة رئيسية وخدمات متعددة للأمومة.
- تسجيل دخول وإنشاء حساب.
- تقييم أولي للأم وحفظه محليًا.
- لوحة تحكم لعرض المستخدمين المسجلين على نفس الجهاز والمتصفح.
- قسم دعم نفسي مفتوح مجانًا داخل الموقع.

## التشغيل السريع

### الطريقة الأسرع

```bash
npm start
```

إذا ظهر خطأ متعلق بـ `ExecutionPolicy` في PowerShell على ويندوز، استخدم:

```bash
npm.cmd start
```

### أو مباشرة عبر Python

```bash
python -X utf8 server.py
```

### أو عبر PowerShell

```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```

## الفتح من أجهزة أخرى

الخادم الآن مهيأ ليستمع على الشبكة المحلية كلها بشكل افتراضي (`0.0.0.0`).

بعد التشغيل:

- افتح من نفس الجهاز: `http://localhost:3000/index.html`
- افتح من جهاز آخر: استخدم أحد الروابط التي تظهر في نافذة التشغيل مثل `http://192.168.1.5:3000/index.html`

لكي يفتح المشروع من هاتف أو لابتوب آخر:

1. اجعل الجهازين على نفس شبكة الـ Wi-Fi أو نفس الشبكة المحلية.
2. اترك نافذة الخادم مفتوحة أثناء الاستخدام.
3. إذا ظهر تنبيه من جدار حماية ويندوز، اسمح لـ Python أو PowerShell على الشبكات الخاصة `Private networks`.

## تخصيص عنوان التشغيل

- المنفذ الافتراضي: `3000`
- العنوان الافتراضي: `0.0.0.0`

يمكنك تغييرهما عبر متغيرات البيئة:

```powershell
$env:HOST = "127.0.0.1"
$env:PORT = "3001"
python -X utf8 server.py
```

استخدم `127.0.0.1` إذا أردت حصر التشغيل على نفس الجهاز فقط.

## ملاحظات مهمة

- هذا المشروع لا يحتاج Firebase حاليًا.
- لا توجد قاعدة بيانات خارجية؛ كل البيانات تحفظ داخل المتصفح محليًا.
- الحسابات والبيانات المحفوظة في `localStorage` لا تنتقل تلقائيًا بين الأجهزة.
- ملف `server.py` مخصص للتشغيل المحلي، ويمكن نشر الصفحات الثابتة عبر GitHub Pages.

## نشره على GitHub

1. أنشئ مستودعًا جديدًا على GitHub.
2. ارفع ملفات المشروع كما هي.
3. لا ترفع الملفات المستثناة في `.gitignore`.
4. إذا أردت نشر الموقع:
   - ادفع المشروع إلى الفرع `main`.
   - افتح `Settings` داخل المستودع.
   - اختر `Pages`.
   - اجعل النشر من `GitHub Actions`.
   - ملف الـ workflow جاهز داخل `.github/workflows/pages.yml`.

## ملفات GitHub المضافة

- `.gitattributes`: لتوحيد تنسيقات الملفات.
- `.nojekyll`: لتفادي أي معالجة غير لازمة في GitHub Pages.
- `.github/workflows/pages.yml`: للنشر التلقائي إلى GitHub Pages عند كل push على `main`.
- `GITHUB-UPLOAD-STEPS.txt`: أوامر الربط والرفع السريعة.

## بنية الملفات الأساسية

```text
about.html
auth.js
baby-care.html
breastfeeding-nutrition.html
community.html
dashboard.html
firebase-config.js
index.html
login.html
mental-support.html
online-services.html
physical-wellness.html
privacy-policy.html
self-care.html
services.html
signup.html
styles.css
server.py
server.ps1
START.bat
```

## ملفات المستودع المهمة

- `.gitignore`: يستبعد ملفات السجلات والملفات المحلية.
- `LICENSE`: رخصة MIT.
- `README.md`: توثيق المشروع.
- `GETTING-STARTED.txt`: بدء سريع.
- `RUN-METHODS.txt`: طرق التشغيل.
- `SETUP-SUMMARY.txt`: ملخص الجاهزية.

## ملاحظات خاصة بالبيانات

- الحسابات التي تنشئها تظهر فقط على نفس الجهاز ونفس المتصفح.
- إذا أردت تصفير البيانات التجريبية، احذف مفاتيح `ehtewaa_users` و`ehtewaa_currentUser` من `localStorage`.

## الترخيص

هذا المشروع مرخص برخصة MIT. راجع ملف `LICENSE`.
