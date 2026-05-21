@echo off
REM تطبيق احتواء - بدء سريع
REM ========================================

echo.
echo ╔════════════════════════════════════════╗
echo ║    تطبيق احتواء - بدء سريع             ║
echo ║  Ehtewaa Maternity App - Quick Start  ║
echo ╚════════════════════════════════════════╝
echo.

REM الحصول على المسار الحالي
set MYPATH=%~dp0

REM فتح صفحة الإعدادات
echo ✅ جاري فتح صفحة الإعدادات...
start "" "%MYPATH%setup.html"

echo.
echo ✨ تم فتح صفحة الإعدادات في المتصفح!
echo.
echo 📋 الخطوات التالية:
echo   1. اقرأ دليل الإعداد في المتصفح
echo   2. أنشئ مشروع Firebase
echo   3. حدّث firebase-config.js ببيانات Firebase
echo   4. استخدم Live Server لتشغيل المشروع
echo.
echo 📁 الملفات المهمة:
echo   • setup.html      → دليل الإعداد
echo   • RUN-METHODS.txt → طرق التشغيل
echo   • README.md       → التوثيق الكامل
echo.
echo 🔗 لتشغيل المشروع، استخدم:
echo   • Live Server (الأفضل) - من VS Code
echo   • أو انقر مرتين على index.html
echo.
pause
