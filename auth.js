import { auth, db } from "./firebase-config.js";

function sanitizeUserRecord(userData) {
  if (!userData) return null;

  const {
    mentalSubscriptionPrice,
    mentalSubscriptionActive,
    mentalSubscriptionActivatedAt,
    ...cleanUserData
  } = userData;

  return cleanUserData;
}

function cleanupLegacyMentalSupportFlags() {
  const users = JSON.parse(localStorage.getItem('ehtewaa_users') || '{}');
  const cleanedUsers = {};

  Object.entries(users).forEach(([uid, userData]) => {
    cleanedUsers[uid] = sanitizeUserRecord(userData);
  });

  localStorage.setItem('ehtewaa_users', JSON.stringify(cleanedUsers));

  const currentUser = localStorage.getItem('ehtewaa_currentUser');
  if (!currentUser) return;

  const parsedCurrentUser = JSON.parse(currentUser);
  const cleanedCurrentUser = {
    uid: parsedCurrentUser.uid,
    email: parsedCurrentUser.email
  };

  localStorage.setItem('ehtewaa_currentUser', JSON.stringify(cleanedCurrentUser));
}

// 🎯 محاكاة Firebase Auth Functions
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
  const existingUser = sanitizeUserRecord(users[uid] || {});
  const nextUserData = sanitizeUserRecord({
    ...existingUser,
    ...data
  });

  users[uid] = {
    ...nextUserData,
    uid,
    password: data.password ?? existingUser.password ?? "",
    createdAt: existingUser.createdAt || new Date().toISOString()
  };

  localStorage.setItem('ehtewaa_users', JSON.stringify(users));
}

function mockGetDoc(uid) {
  const users = JSON.parse(localStorage.getItem('ehtewaa_users') || '{}');
  return sanitizeUserRecord(users[uid] || null);
}

// استرجاع المستخدم الحالي عند التحميل
cleanupLegacyMentalSupportFlags();
const savedUser = localStorage.getItem('ehtewaa_currentUser');
if (savedUser) {
  const parsedUser = JSON.parse(savedUser);
  auth.currentUser = {
    uid: parsedUser.uid,
    email: parsedUser.email
  };
}

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
      
      const adminEmails = ["admin@example.com"];
      
      if (adminEmails.includes(userEmail)) {
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
const mentalSupportPanel = document.getElementById("mentalSupportPanel");
const mentalSupportCard = document.getElementById("mentalSupportCard");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await mockSignOut();
    window.location.href = "login.html";
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

function renderMentalSupportPanel() {
  if (!mentalSupportPanel) return;

  mentalSupportPanel.classList.remove("hidden");
  mentalSupportPanel.innerHTML = `
    <h2>الدعم النفسي متاح مجانًا</h2>
    <p>يمكنك الآن استخدام مزايا وروابط الدعم النفسي داخل الموقع مباشرة وبدون أي رسوم.</p>
    <ul>
      <li><strong>الوصول:</strong> مفتوح لجميع الزائرات.</li>
      <li><strong>الروابط:</strong> الجلسات، الدعم الجماعي، والخدمات المرتبطة متاحة مباشرة.</li>
      <li><strong>الحساب:</strong> تسجيل الدخول اختياري فقط إذا رغبتِ في حفظ التقييم والمتابعة.</li>
    </ul>
    <div class="buttons">
      <a href="mental-support.html" class="btn">الدخول إلى الدعم النفسي</a>
    </div>
  `;
}

function updateMentalSupportCard(userData) {
  if (!mentalSupportCard) return;

  const description = mentalSupportCard.querySelector("p");
  if (!description) return;

  description.textContent = auth.currentUser
    ? "الدعم النفسي متاح مجانًا الآن. ادخلي مباشرة إلى الروابط والجلسات والمزايا داخل الموقع."
    : "الدعم النفسي متاح مجانًا الآن. يمكنكِ التصفح مباشرة أو تسجيل الدخول لحفظ التقييم.";
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
  const safeUserData = userData || null;

  if (auth.currentUser) {
    if (authButtons) authButtons.style.display = "none";
    if (userSection) userSection.style.display = "block";
    if (motherAssessmentForm) motherAssessmentForm.classList.remove("hidden");
    if (assessmentListWrapper) assessmentListWrapper.style.display = "block";
    if (assessmentNote) assessmentNote.classList.add("hidden");
    populateAssessmentForm(safeUserData);
    renderMentalSupportPanel();
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
    renderMentalSupportPanel();
    updateMentalSupportCard(null);
    if (motherAssessmentForm) motherAssessmentForm.classList.add("hidden");
    if (assessmentListWrapper) assessmentListWrapper.style.display = "block";
    if (assessmentNote) {
      assessmentNote.classList.remove("hidden");
      assessmentNote.textContent = "يمكنك التسجيل الآن لبدء التقييم.";
    }
    if (assessmentIntro) assessmentIntro.textContent = "سجلي حسابًا لتعبئة التقييم الأولي والحصول على دعم مخصص.";
    if (assessmentList) assessmentList.innerHTML = `
      <li>الحالة النفسية للأم</li>
      <li>الحالة الجسدية والأعراض الصحية</li>
      <li>مستوى الإرهاق والقدرة على التحمل</li>
      <li>مشاكل الرضاعة وإرشاد الرضاعة الطبيعية</li>
      <li>مشاكل النوم والراحة الليلية</li>
      <li>تحديد الحاجة لدعم أخصائي نفسي أو صحي</li>
    `;
    hideAdvice();
  }
}

if (motherAssessmentForm) {
  motherAssessmentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    const currentUserData = mockGetDoc(auth.currentUser.uid) || {};
    const updatedData = {
      ...currentUserData,
      mentalState: mentalStateInput.value || null,
      physicalState: physicalStateInput.value || null,
      fatigueLevel: fatigueLevelInput.value || null,
      breastfeedingIssues: breastfeedingIssuesInput.value || null,
      sleepIssues: sleepIssuesInput.value || null,
      needSpecialist: needSpecialistInput.value || null,
      password: currentUserData.password || ""
    };
    mockSetDoc(auth.currentUser.uid, updatedData);
    const savedData = mockGetDoc(auth.currentUser.uid);
    renderAssessment(savedData);
  });
}

if (userNameEl || authButtons || userSection) {
  if (auth.currentUser) {
    const userData = mockGetDoc(auth.currentUser.uid);
    if (userData && userNameEl) userNameEl.textContent = `أهلاً ${userData.fullName}`;
    renderAssessment(userData);
  } else {
    renderAssessment(null);
  }

  auth.addEventListener((user) => {
    if (user) {
      const userData = mockGetDoc(user.uid);
      if (authButtons) authButtons.style.display = "none";
      if (userSection) userSection.style.display = "block";
      if (userData && userNameEl) userNameEl.textContent = `أهلاً ${userData.fullName}`;
      renderAssessment(userData);
    } else {
      if (authButtons) authButtons.style.display = "flex";
      if (userSection) userSection.style.display = "none";
      renderAssessment(null);
    }
  });
}

function formatAssessmentValue(value) {
  const mapping = {
    stable: 'مستقرة',
    stressed: 'مرهقة',
    anxious: 'متوترة',
    good: 'جيدة',
    average: 'متوسطة',
    weak: 'ضعيفة',
    low: 'منخفض',
    medium: 'متوسط',
    high: 'مرتفع',
    none: 'لا توجد',
    difficulty: 'صعوبة في الرضاعة',
    need_guidance: 'تحتاج إرشاد',
    interrupted: 'مقطعة',
    bad: 'سيئة',
    yes: 'نعم',
    no: 'لا'
  };
  return mapping[value] || value || 'غير محدد';
}
