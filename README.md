# 🎯 تطبيق احتواء - Ehtewaa Maternity App

تطبيق متكامل لدعم النساء الحوامل والأمهات الجدد

## 🚀 البدء السريع

### المتطلبات:
- Node.js مثبت على جهازك
- حساب Firebase فعال
- متصفح حديث

### خطوات الإعداد:

#### 1️⃣ إعداد Firebase

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. أنشئ مشروع جديد أو استخدم مشروع موجود
3. انسخ بيانات الاعتماد من Firebase Settings
4. افتح ملف `firebase-config.js` وأدخل كل البيانات:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

#### 2️⃣ تفعيل خدمات Firebase

في Firebase Console، قم بتفعيل:
- ✅ **Authentication** (Email/Password)
- ✅ **Firestore Database** (في وضع التطوير)

#### 3️⃣ إنشاء قواعد Firestore

اتبع هذه الخطوات:

1. اذهب إلى **Firestore Database**
2. أنشئ مجموعة جديدة باسم `users`
3. أنشئ مستند تجريبي:

```
Collection: users
Document ID: test-user
Fields:
- fullName: "اختبار"
- email: "test@example.com"
- phone: "+201000000000"
- age: 25
- job: "محاسبة"
- childrenCount: 1
- status: "pregnant"
- createdAt: (Server timestamp)
```

#### 4️⃣ تشغيل الخادم

```bash
# افتح Terminal في المشروع
cd "New folder (7)"

# شغل الخادم
npm start
```

الخادم سيعمل على: **http://localhost:3000**

### 📱 الصفحات المتاحة:

| الصفحة | الرابط | الوصف |
|-------|--------|-------|
| الرئيسية | http://localhost:3000 | الصفحة الرئيسية |
| تسجيل الدخول | http://localhost:3000/login.html | دخول المستخدمين |
| إنشاء حساب | http://localhost:3000/signup.html | تسجيل مستخدم جديد |
| لوحة التحكم | http://localhost:3000/dashboard.html | عرض إحصائيات المستخدمين |

### 🔐 بيانات اختبار (Test Credentials):

```
البريد الإلكتروني: test@example.com
كلمة المرور: Test@123
```

### 📊 ميزات الداشبورد:

✅ عرض إجمالي المستخدمين
✅ إحصائيات النساء الحوامل
✅ إحصائيات الأمهات الجدد
✅ جدول تفصيلي للمستخدمين
✅ سجل النشاط الأخير
✅ تسجيل الخروج الآمن

### 🔧 استكشاف الأخطاء:

**المشروع لا يعمل؟**

1. تأكد من تثبيت Node.js:
   ```bash
   node --version
   npm --version
   ```

2. تحقق من بيانات Firebase في `firebase-config.js`

3. تأكد من تفعيل Authentication و Firestore في Firebase

4. افتح Console في المتصفح (F12) للتحقق من الأخطاء

### 📝 ملفات المشروع:

```
📁 New folder (7)
├── 📄 index.html           (الصفحة الرئيسية)
├── 📄 login.html           (صفحة تسجيل الدخول)
├── 📄 signup.html          (صفحة إنشاء الحساب)
├── 📄 dashboard.html       (لوحة التحكم)
├── 📄 auth.js              (منطق المصادقة)
├── 📄 firebase-config.js   (إعدادات Firebase)
├── 📄 server.js            (خادم محلي)
├── 📄 package.json         (معلومات المشروع)
└── 📄 README.md            (هذا الملف)
```

### 🎨 الألوان المستخدمة:

- اللون الأساسي: `#8B6FB3` (بنفسجي)
- اللون الثانوي: `#A97EC7` (بنفسجي فاتح)

### 📚 الموارد الإضافية:

- [Firebase Documentation](https://firebase.google.com/docs)
- [JavaScript MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [HTML Standards](https://html.spec.whatwg.org/)

### 💡 نصائح مهمة:

1. **الأمان**: لا تشرك مفاتيح Firebase مع أحد
2. **النسخ الاحتياطية**: احتفظ بنسخة احتياطية من بيانات Firebase
3. **الاختبار**: اختبر جميع الميزات قبل الإطلاق

### 🤝 الدعم:

إذا واجهت أي مشكلة، تحقق من:
- Console في المتصفح (F12)
- Firebase Console للتحقق من البيانات
- اتصالك بالإنترنت

---

**تم إنشاؤه بـ ❤️ من قبل فريق احتواء**
