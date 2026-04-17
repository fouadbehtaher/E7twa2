// 🎯 تطبيق احتواء - نسخة Demo بدون Firebase
// Demo Version Without Firebase

// محاكاة Firebase Auth
export const auth = {
  currentUser: null,
  _listeners: [],
  
  addEventListener: function(callback) {
    this._listeners.push(callback);
  },
  
  notifyListeners: function() {
    this._listeners.forEach(listener => listener(this.currentUser));
  }
};

// محاكاة Firebase Firestore
export const db = {
  _collections: {
    users: []
  },
  
  getCollection: function(name) {
    return this._collections[name] || [];
  },
  
  addUser: function(uid, userData) {
    this._collections.users[uid] = {
      ...userData,
      uid: uid,
      createdAt: new Date()
    };
    this._saveToLocalStorage();
  },
  
  getUser: function(uid) {
    return this._collections.users[uid] || null;
  },
  
  getAllUsers: function() {
    return Object.values(this._collections.users);
  },
  
  _saveToLocalStorage: function() {
    localStorage.setItem('ehtewaa_users', JSON.stringify(this._collections.users));
  },
  
  _loadFromLocalStorage: function() {
    const data = localStorage.getItem('ehtewaa_users');
    if (data) {
      this._collections.users = JSON.parse(data);
    }
  }
};

// تحميل البيانات المحفوظة عند التهيئة
db._loadFromLocalStorage();

// 📝 ملاحظة: هذه نسخة Demo تستخدم localStorage
// البيانات تُحفظ في المتصفح محلياً وليس على خادم عن بعد