#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import http.server
import socketserver
import os
from pathlib import Path
from urllib.parse import urlparse

PORT = 3000
HOST = 'localhost'

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # تحويل المسار
        if self.path == '/':
            self.path = '/index.html'
        
        return http.server.SimpleHTTPRequestHandler.do_GET(self)
    
    def end_headers(self):
        # إضافة رؤوس CORS
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

# الذهاب إلى مجلد الملفات
os.chdir(Path(__file__).parent)

with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
    print('\n' + '='*50)
    print('🚀 خادم احتواء قيد التشغيل')
    print('='*50)
    print(f'\n✅ الخادم يعمل على: http://{HOST}:{PORT}\n')
    print('الصفحات المتاحة:')
    print(f'  📱 الصفحة الرئيسية: http://{HOST}:{PORT}/index.html')
    print(f'  🔐 تسجيل الدخول: http://{HOST}:{PORT}/login.html')
    print(f'  ➕ إنشاء حساب: http://{HOST}:{PORT}/signup.html')
    print(f'  📊 لوحة التحكم: http://{HOST}:{PORT}/dashboard.html')
    print(f'  ⚙️  دليل الإعداد: http://{HOST}:{PORT}/setup.html')
    print('\n' + '='*50)
    print('اضغط Ctrl+C لإيقاف الخادم')
    print('='*50 + '\n')
    
    httpd.serve_forever()
