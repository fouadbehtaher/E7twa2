import { auth, db } from "./firebase-config.js";

// 🎯 محاكاة Firebase Auth Functions
const ADMIN_EMAILS = ["admin@example.com"];
const DEMO_USERS = [
  {
    uid: "demo_admin",
    fullName: "سارة أحمد",
    email: "admin@example.com",
    phone: "01012345678",
    age: 28,
    job: "أخصائية دعم",
    childrenCount: 1,
    status: "mother",
    pregnancyMonth: null,
    pregnancyWeeks: null,
    babyAgeMonths: 6,
    deliveryType: "natural",
    mentalState: "stable",
    physicalState: "good",
    fatigueLevel: "medium",
    breastfeedingIssues: "none",
    sleepIssues: "interrupted",
    needSpecialist: "no",
    password: "123456"
  },
  {
    uid: "demo_user",
    fullName: "مريم علي",
    email: "user@example.com",
    phone: "01123456789",
    age: 25,
    job: "معلمة",
    childrenCount: 0,
    status: "pregnant",
    pregnancyMonth: "5",
    pregnancyWeeks: 22,
    babyAgeMonths: null,
    deliveryType: null,
    mentalState: "anxious",
    physicalState: "average",
    fatigueLevel: "high",
    breastfeedingIssues: "need_guidance",
    sleepIssues: "bad",
    needSpecialist: "yes",
    password: "123456"
  }
];
async function mockCreateUserWithEmailAndPassword(email, password) {
  // التحقق من عدم تواجد البريد
  const users = JSON.parse(localStorage.getItem('ehtewaa_users') || '{}');
  if (Object.values(users).some(u => u.email === email)) {
    throw { code: "auth/email-already-in-use", message: "Email already in use" };
  }
  
  const uid = 'user_' + Date.now();
  return { user: { uid, email } };
}

async function mockSignInWithEmailAndPassword(email, password) {
  const users = JSON.parse(localStorage.getItem('ehtewaa_users') || '{}');
  const user = Object.values(users).find(u => u.email === email && u.password === password);

  if (!user) {
    const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (demoUser) {
      mockSetDoc(demoUser.uid, demoUser);
      auth.currentUser = { uid: demoUser.uid, email };
      auth.notifyListeners();
      localStorage.setItem('ehtewaa_currentUser', JSON.stringify(auth.currentUser));
      return { user: auth.currentUser };
    }
    throw { code: "auth/invalid-credential", message: "Invalid email or password" };
  }
  
  auth.currentUser = { uid: user.uid, email };
  auth.notifyListeners();
  localStorage.setItem('ehtewaa_currentUser', JSON.stringify(auth.currentUser));
  return { user: auth.currentUser };
}

async function mockSignOut() {
  auth.currentUser = null;
  auth.notifyListeners();
  localStorage.removeItem('ehtewaa_currentUser');
}

function mockSetDoc(uid, data) {
  const users = JSON.parse(localStorage.getItem('ehtewaa_users') || '{}');
  users[uid] = { ...data, uid, password: data.password, createdAt: new Date().toISOString() };
  localStorage.setItem('ehtewaa_users', JSON.stringify(users));
}

function mockGetDoc(uid) {
  const users = JSON.parse(localStorage.getItem('ehtewaa_users') || '{}');
  return users[uid] || null;
}

// استرجاع المستخدم الحالي عند التحميل
const savedUser = localStorage.getItem('ehtewaa_currentUser');
if (savedUser) {
  auth.currentUser = JSON.parse(savedUser);
}

function ensureDemoUsers() {
  const users = JSON.parse(localStorage.getItem('ehtewaa_users') || '{}');

  DEMO_USERS.forEach((user) => {
    const exists = Object.values(users).some((u) => u.email === user.email);
    if (!exists) {
      mockSetDoc(user.uid, user);
    }
  });
}

ensureDemoUsers();

// ========================
// Helper Functions
// ========================

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function clearTexts(className) {
  document.querySelectorAll("." + className).forEach(el => el.textContent = "");
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^(\+20|0)?1[0125]\d{8}$/.test(phone.trim());
}


/* =========================
   SIGN UP
========================= */
const signupForm = document.getElementById("signupForm");

if (signupForm) {
  const statusField = document.getElementById("status");
  const pregnancyFields = document.getElementById("pregnancyFields");
  const postpartumFields = document.getElementById("postpartumFields");

  function toggleConditionalFields() {
    const status = statusField.value;

    pregnancyFields.classList.add("hidden");
    postpartumFields.classList.add("hidden");

    if (status === "pregnant") {
      pregnancyFields.classList.remove("hidden");
    }

    if (status === "mother" || status === "new_mother") {
      postpartumFields.classList.remove("hidden");
    }
  }

  statusField.addEventListener("change", toggleConditionalFields);
  toggleConditionalFields();

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    clearTexts("error");
    setText("generalError", "");
    setText("successMessage", "");

    let valid = true;

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const age = document.getElementById("age").value.trim();
    const job = document.getElementById("job").value.trim();
    const childrenCount = document.getElementById("childrenCount").value.trim();
    const status = document.getElementById("status").value;
    const pregnancyMonth = document.getElementById("pregnancyMonth").value;
    const pregnancyWeeks = document.getElementById("pregnancyWeeks").value.trim();
    const babyAgeMonths = document.getElementById("babyAgeMonths").value.trim();
    const deliveryType = document.getElementById("deliveryType").value;
    const mentalState = document.getElementById("mentalState").value;
    const physicalState = document.getElementById("physicalState").value;
    const fatigueLevel = document.getElementById("fatigueLevel").value;
    const breastfeedingIssues = document.getElementById("breastfeedingIssues").value;
    const sleepIssues = document.getElementById("sleepIssues").value;
    const needSpecialist = document.getElementById("needSpecialist").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const submitBtn = document.getElementById("submitBtn");

    if (fullName.length < 3) {
      setText("fullNameError", "الاسم لازم يكون 3 حروف أو أكثر");
      valid = false;
    }

    if (!validateEmail(email)) {
      setText("emailError", "البريد الإلكتروني غير صحيح");
      valid = false;
    }

    if (!validatePhone(phone)) {
      setText("phoneError", "رقم الهاتف غير صحيح");
      valid = false;
    }

    if (!age || Number(age) < 15 || Number(age) > 60) {
      setText("ageError", "العمر لازم يكون بين 15 و 60");
      valid = false;
    }

    if (job.length < 2) {
      setText("jobError", "اكتبي الوظيفة بشكل صحيح");
      valid = false;
    }

    if (childrenCount === "" || Number(childrenCount) < 0) {
      setText("childrenCountError", "عدد الأطفال غير صحيح");
      valid = false;
    }

    if (!status) {
      setText("statusError", "اختاري الحالة");
      valid = false;
    }

    if (status === "pregnant") {
      if (!pregnancyMonth) {
        setText("pregnancyMonthError", "اختاري شهر الحمل");
        valid = false;
      }

      if (!pregnancyWeeks || Number(pregnancyWeeks) < 1 || Number(pregnancyWeeks) > 40) {
        setText("pregnancyWeeksError", "أسبوع الحمل لازم يكون بين 1 و 40");
        valid = false;
      }
    }

    if (status === "mother" || status === "new_mother") {
      if (babyAgeMonths === "" || Number(babyAgeMonths) < 0) {
        setText("babyAgeMonthsError", "اكتبي عمر الطفل بالشهور");
        valid = false;
      }

      if (!deliveryType) {
        setText("deliveryTypeError", "اختاري نوع الولادة");
        valid = false;
      }
    }

    if (!mentalState) {
      setText("mentalStateError", "اختاري الحالة النفسية");
      valid = false;
    }

    if (!physicalState) {
      setText("physicalStateError", "اختاري الحالة الجسدية");
      valid = false;
    }

    if (!fatigueLevel) {
      setText("fatigueLevelError", "اختاري مستوى الإرهاق");
      valid = false;
    }

    if (!breastfeedingIssues) {
      setText("breastfeedingIssuesError", "اختاري حالة الرضاعة");
      valid = false;
    }

    if (!sleepIssues) {
      setText("sleepIssuesError", "اختاري حالة النوم");
      valid = false;
    }

    if (!needSpecialist) {
      setText("needSpecialistError", "حددي إذا كنتِ تحتاجين دعم أخصائي");
      valid = false;
    }

    if (password.length < 6) {
      setText("passwordError", "كلمة المرور لازم تكون 6 أحرف أو أكثر");
      valid = false;
    }

    if (confirmPassword !== password) {
      setText("confirmPasswordError", "تأكيد كلمة المرور غير مطابق");
      valid = false;
    }

    if (!valid) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "جاري إنشاء الحساب...";

    try {
      const userCredential = await mockCreateUserWithEmailAndPassword(email, password);
      const uid = userCredential.user.uid;

      mockSetDoc(uid, {
        fullName,
        email,
        phone,
        age: Number(age),
        job,
        childrenCount: Number(childrenCount),
        status,
        pregnancyMonth: pregnancyMonth || null,
        pregnancyWeeks: pregnancyWeeks ? Number(pregnancyWeeks) : null,
        babyAgeMonths: babyAgeMonths ? Number(babyAgeMonths) : null,
        deliveryType: deliveryType || null,
        mentalState,
        physicalState,
        fatigueLevel,
        breastfeedingIssues,
        sleepIssues,
        needSpecialist,
        password: password
      });

      setText("successMessage", "تم إنشاء الحساب بنجاح");
      signupForm.reset();
      toggleConditionalFields();

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1200);

    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setText("generalError", "هذا البريد مستخدم بالفعل");
      } else if (error.code === "auth/invalid-email") {
        setText("generalError", "البريد الإلكتروني غير صالح");
      } else if (error.code === "auth/weak-password") {
        setText("generalError", "كلمة المرور ضعيفة");
      } else {
        setText("generalError", "حدث خطأ أثناء إنشاء الحساب");
        console.error(error);
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "إنشاء الحساب";
    }
  });
}

/* =========================
   LOGIN
========================= */
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    clearTexts("error");
    setText("generalError", "");

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const submitBtn = document.getElementById("loginBtn");

    let valid = true;

    if (!validateEmail(email)) {
      setText("loginEmailError", "البريد الإلكتروني غير صحيح");
      valid = false;
    }

    if (password.length < 6) {
      setText("loginPasswordError", "كلمة المرور غير صحيحة");
      valid = false;
    }

    if (!valid) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "جاري تسجيل الدخول...";

    try {
      const userCredential = await mockSignInWithEmailAndPassword(email, password);
      const userEmail = userCredential.user.email;
      
      if (ADMIN_EMAILS.includes(userEmail)) {
        window.location.href = "dashboard.html";
      } else {
        window.location.href = "index.html";
      }
    } catch (error) {
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        setText("generalError", "البريد الإلكتروني أو كلمة المرور غير صحيحة");
      } else {
        setText("generalError", "حدث خطأ أثناء تسجيل الدخول");
      }
      console.error(error);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "تسجيل الدخول";
    }
  });
}

/* =========================
   HOME PAGE
========================= */
const userNameEl = document.getElementById("userName");
const authButtons = document.getElementById("authButtons");
const userSection = document.getElementById("userSection");
const logoutBtn = document.getElementById("logoutBtn");
const assessmentIntro = document.getElementById("assessmentIntro");
const assessmentList = document.getElementById("assessmentList");
const assessmentListWrapper = document.getElementById("assessmentListWrapper");
const assessmentNote = document.getElementById("assessmentNote");
const motherAssessmentForm = document.getElementById("motherAssessmentForm");
const mentalStateInput = document.getElementById("mentalStateInput");
const physicalStateInput = document.getElementById("physicalStateInput");
const fatigueLevelInput = document.getElementById("fatigueLevelInput");
const breastfeedingIssuesInput = document.getElementById("breastfeedingIssuesInput");
const sleepIssuesInput = document.getElementById("sleepIssuesInput");
const needSpecialistInput = document.getElementById("needSpecialistInput");
const assessmentAdvice = document.getElementById("assessmentAdvice");
const adviceList = document.getElementById("adviceList");
const subscriptionPanel = document.getElementById("subscriptionPanel");
const mentalSupportCard = document.getElementById("mentalSupportCard");
const MENTAL_SUBSCRIPTION_PRICE = 200;

// دالة لضمان وجود قيم افتراضية للاشتراك
function ensureSubscriptionDefaults(userData) {
  if (!userData) return null;
  return {
    ...userData,
    mentalSubscriptionActive: userData.mentalSubscriptionActive || false,
    mentalSubscriptionActivatedAt: userData.mentalSubscriptionActivatedAt || null,
    mentalSubscriptionPending: userData.mentalSubscriptionPending || false,
    mentalSubscriptionRequestedAt: userData.mentalSubscriptionRequestedAt || null,
    mentalSubscriptionApprovedAt: userData.mentalSubscriptionApprovedAt || null
  };
}

// دالة لتحويل القيم التقنية إلى لغة عربية مفهومة
function formatAssessmentValue(val) {
  const map = {
    "stressed": "مجهدة", "anxious": "قلقة", "good": "جيدة", "stable": "مستقرة",
    "weak": "ضعيفة", "high": "عالٍ", "difficulty": "صعوبات", "need_guidance": "تحتاج توجيه",
    "interrupted": "تقطع", "bad": "سيء", "yes": "نعم", "no": "لا", "none": "لا يوجد"
  };
  return map[val] || val || "غير محدد";
}

// دالة تفعيل الاشتراك (محاكاة)
function requestMentalSubscriptionForCurrentUser() {
  if (!auth.currentUser) return null;
  const users = JSON.parse(localStorage.getItem('ehtewaa_users') || '{}');
  const userData = users[auth.currentUser.uid];
  if (userData) {
    if (userData.mentalSubscriptionActive) return userData;
    userData.mentalSubscriptionPending = true;
    userData.mentalSubscriptionRequestedAt = userData.mentalSubscriptionRequestedAt || new Date().toISOString();
    localStorage.setItem('ehtewaa_users', JSON.stringify(users));
    return userData;
  }
  return null;
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await mockSignOut();
    window.location.href = "login.html";
  });
}

// إضافة منطق حفظ التقييم من الصفحة الرئيسية
if (motherAssessmentForm) {
  motherAssessmentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    const users = JSON.parse(localStorage.getItem('ehtewaa_users') || '{}');
    const userData = users[auth.currentUser.uid];

    if (userData) {
      // تحديث بيانات المستخدم في التخزين المحلي
      userData.mentalState = mentalStateInput.value;
      userData.physicalState = physicalStateInput.value;
      userData.fatigueLevel = fatigueLevelInput.value;
      userData.breastfeedingIssues = breastfeedingIssuesInput.value;
      userData.sleepIssues = sleepIssuesInput.value;
      userData.needSpecialist = needSpecialistInput.value;

      localStorage.setItem('ehtewaa_users', JSON.stringify(users));
      alert("تم حفظ التقييم بنجاح، يمكنك رؤية النصائح المحدثة الآن.");
      renderAssessment(userData);
    }
  });
}

function populateAssessmentForm(userData) {
  if (!motherAssessmentForm) return;
  mentalStateInput.value = userData?.mentalState || "";
  physicalStateInput.value = userData?.physicalState || "";
  fatigueLevelInput.value = userData?.fatigueLevel || "";
  breastfeedingIssuesInput.value = userData?.breastfeedingIssues || "";
  sleepIssuesInput.value = userData?.sleepIssues || "";
  needSpecialistInput.value = userData?.needSpecialist || "";
}

function hideAdvice() {
  if (!assessmentAdvice) return;
  assessmentAdvice.classList.add("hidden");
  if (adviceList) adviceList.innerHTML = "";
}

function showAdvice(messages) {
  if (!assessmentAdvice || !adviceList) return;
  assessmentAdvice.classList.remove("hidden");
  adviceList.innerHTML = messages.map(item => `<li>${item}</li>`).join("");
}

function renderSubscriptionPanel(userData) {
  if (!subscriptionPanel) return;

  if (!auth.currentUser) {
    subscriptionPanel.classList.add("hidden");
    subscriptionPanel.innerHTML = "";
    return;
  }

  const safeUserData = ensureSubscriptionDefaults(userData);
  const isActive = Boolean(safeUserData?.mentalSubscriptionActive);
  const isPending = Boolean(safeUserData?.mentalSubscriptionPending);
  const activatedText = safeUserData?.mentalSubscriptionActivatedAt
    ? new Date(safeUserData.mentalSubscriptionActivatedAt).toLocaleDateString('ar-EG')
    : "غير مفعل";
  const requestedText = safeUserData?.mentalSubscriptionRequestedAt
    ? new Date(safeUserData.mentalSubscriptionRequestedAt).toLocaleDateString('ar-EG')
    : "غير محدد";

  subscriptionPanel.classList.remove("hidden");
  subscriptionPanel.innerHTML = `
    <h2>اشتراك الدعم النفسي</h2>
    <p>سعر الاشتراك لكل حساب هو <strong>${MENTAL_SUBSCRIPTION_PRICE} جنيه</strong> ويمنحك الوصول إلى مزايا وروابط الدعم النفسي.</p>
    <ul>
      <li><strong>الحالة:</strong> ${isActive ? "مفعل" : isPending ? "قيد المراجعة" : "غير مفعل"}</li>
      <li><strong>آخر تفعيل:</strong> ${activatedText}</li>
      <li><strong>تاريخ الطلب:</strong> ${isPending ? requestedText : "-"}</li>
      <li><strong>الاستخدام:</strong> روابط ومزايا الدعم النفسي داخل الموقع.</li>
    </ul>
    <div class="buttons">
      ${isActive
        ? '<a href="mental-support.html" class="btn">الدخول إلى الدعم النفسي</a>'
        : `<button type="button" class="btn" id="activateMentalSubscriptionBtn">${isPending ? "طلب التفعيل قيد المراجعة" : `طلب تفعيل الاشتراك ${MENTAL_SUBSCRIPTION_PRICE} جنيه`}</button>`}
    </div>
  `;

  const activateBtn = document.getElementById("activateMentalSubscriptionBtn");
  if (activateBtn) {
    if (isPending) {
      activateBtn.disabled = true;
    }
    activateBtn.addEventListener("click", () => {
      const updatedData = requestMentalSubscriptionForCurrentUser();
      if (updatedData) renderAssessment(updatedData);
    });
  }
}

function updateMentalSupportCard(userData) {
  if (!mentalSupportCard) return;

  const description = mentalSupportCard.querySelector("p");
  if (!description) return;

  if (!auth.currentUser) {
    description.textContent = "سجلي الدخول ثم فعلي اشتراك 200 جنيه للوصول إلى مزايا وروابط الدعم النفسي.";
    return;
  }

  const safeUserData = ensureSubscriptionDefaults(userData);
  if (safeUserData?.mentalSubscriptionActive) {
    description.textContent = "اشتراكك النفسي مفعل. ادخلي الآن إلى روابط الجلسات ومزايا الدعم النفسي.";
  } else if (safeUserData?.mentalSubscriptionPending) {
    description.textContent = "تم إرسال طلب تفعيل الاشتراك. سيتم فتح المزايا بعد موافقة المدير.";
  } else {
    description.textContent = "هذه الميزة مدفوعة. اطلبِ اشتراك 200 جنيه من حسابك لفتح روابط ومزايا الدعم النفسي.";
  }
}

function generateAdvice(userData) {
  const advice = [];

  if (!userData) return ["أكدي تعبئة التقييم لحصولك على النصيحة الفورية."];

  if (userData.mentalState === "stressed" || userData.mentalState === "anxious") {
    advice.push("حاولي التحدث مع شخص موثوق أو الحصول على دعم نفسي للحفاظ على هدوئك.");
  }

  if (userData.physicalState === "weak") {
    advice.push("استشيري طبيبًا أو أخصائي صحة لضمان صحتك الجسدية ومتابعة التغذية.");
  }

  if (userData.fatigueLevel === "high") {
    advice.push("قسمي مهامك وخذي فترات راحة قصيرة متكررة لتقليل الإرهاق.");
  }

  if (userData.breastfeedingIssues === "difficulty") {
    advice.push("حاولي الحصول على دعم استشاري للرضاعة لتحسين الوضع التدريجي.");
  }

  if (userData.breastfeedingIssues === "need_guidance") {
    advice.push("يُنصح بمراجعة أخصائية رضاعة للحصول على نصائح مباشرة.");
  }

  if (userData.sleepIssues === "interrupted" || userData.sleepIssues === "bad") {
    advice.push("حاولي تنظيم روتين نوم ثابت لك ولطفلك للحصول على راحة أفضل.");
  }

  if (userData.needSpecialist === "yes") {
    advice.push("ينصح بالتواصل مع أخصائي نفسي أو صحي حسب حاجتك.");
  }

  if (advice.length === 0) {
    advice.push("أنتِ في حالة جيدة حالياً. استمري في رعاية نفسك وطفلك.");
  }

  return advice;
}

function renderAssessment(userData) {
  const safeUserData = ensureSubscriptionDefaults(userData);

  if (auth.currentUser) {
    const users = JSON.parse(localStorage.getItem('ehtewaa_users') || '{}');
    const currentData = users[auth.currentUser.uid];
    
    if (authButtons) authButtons.style.display = "none";
    if (userSection) userSection.style.display = "block";
    if (userNameEl && currentData) userNameEl.textContent = `أهلاً بكِ يا ${currentData.fullName.split(' ')[0]} ✨`;
    
    const navDashboard = document.getElementById("navDashboard");
    if (navDashboard && ADMIN_EMAILS.includes(auth.currentUser.email)) {
      navDashboard.classList.remove("hidden");
    } else if (navDashboard) {
      navDashboard.classList.add("hidden");
    }

    if (motherAssessmentForm) motherAssessmentForm.classList.remove("hidden");
    if (assessmentListWrapper) assessmentListWrapper.style.display = "block";
    if (assessmentNote) assessmentNote.classList.add("hidden");
    populateAssessmentForm(safeUserData);
    renderSubscriptionPanel(safeUserData);
    updateMentalSupportCard(safeUserData);

    if (safeUserData) {
      if (assessmentIntro) assessmentIntro.textContent = "يمكنك تحديث التقييم الآن والحصول على النصيحة الفورية.";
      if (assessmentList) assessmentList.innerHTML = `
        <li><strong>الحالة النفسية:</strong> ${formatAssessmentValue(userData.mentalState)}</li>
        <li><strong>الحالة الجسدية:</strong> ${formatAssessmentValue(userData.physicalState)}</li>
        <li><strong>مستوى الإرهاق:</strong> ${formatAssessmentValue(userData.fatigueLevel)}</li>
        <li><strong>مشاكل الرضاعة:</strong> ${formatAssessmentValue(userData.breastfeedingIssues)}</li>
        <li><strong>مشاكل النوم:</strong> ${formatAssessmentValue(userData.sleepIssues)}</li>
        <li><strong>دعم أخصائي:</strong> ${formatAssessmentValue(userData.needSpecialist)}</li>
      `;
      showAdvice(generateAdvice(safeUserData));
    } else {
      if (assessmentIntro) assessmentIntro.textContent = "املئي التقييم وسنقدم لك النصيحة الفورية فوراً.";
      if (assessmentList) assessmentList.innerHTML = `
        <li>الحالة النفسية</li>
        <li>الحالة الجسدية</li>
        <li>مستوى الإرهاق</li>
        <li>مشاكل الرضاعة</li>
        <li>مشاكل النوم</li>
        <li>الحاجة لدعم أخصائي</li>
      `;
      hideAdvice();
    }
  } else {
    if (authButtons) authButtons.style.display = "flex";
    if (userSection) userSection.style.display = "none";
    renderSubscriptionPanel(null);
    updateMentalSupportCard(null);
    if (motherAssessmentForm) motherAssessmentForm.classList.add("hidden");
    if (assessmentListWrapper) assessmentListWrapper.style.display = "block";
    if (assessmentNote) {
      assessmentNote.classList.remove("hidden");
      assessmentNote.textContent = "يمكنك التسجيل الآن لبدء التقييم.";
    }
    if (assessmentIntro) assessmentIntro.textContent = "سجلي حسابًا لتعبئة التقييم الأولي والحصول على دعم مخصص.";
  }
}

// تحديث حالة الصفحة عند التحميل
const initialUserData = auth.currentUser ? mockGetDoc(auth.currentUser.uid) : null;
if (typeof renderAssessment === 'function') {
  renderAssessment(initialUserData);
}
