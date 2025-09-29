// === sendConfig.js ===
// Глобальный файл для управления языками отправки сообщений

// Загружаем все профили из localStorage или создаём дефолтные
let sendProfiles;
try {
  sendProfiles = JSON.parse(localStorage.getItem("sendProfiles")) || {
    rest: ["ru"],     // ✅ все страницы без атрибута
    hall: ["en"],
    kitchen: ["ru", "en"],
    pastry: ["ru"],
    extra1: ["ru"],   // запасной
    extra2: ["ru"],   // запасной
    extra3: ["ru"]    // запасной
  };
  console.log("📦 [sendConfig.js] Загруженные профили из localStorage:", sendProfiles);
}
// Сохраняем профили в localStorage
function saveProfiles() {
  localStorage.setItem("sendProfiles", JSON.stringify(sendProfiles));
  console.log("💾 [sendConfig.js] Сохранил sendProfiles:", sendProfiles);
}

// Устанавливаем языки для конкретного профиля
function setSendLanguages(profile, langs) {
  if (!Array.isArray(langs)) {
    throw new Error("langs должен быть массивом");
  }
  sendProfiles[profile] = langs.map(String);
  console.log(`✅ [sendConfig.js] Для профиля '${profile}' установлены языки:`, sendProfiles[profile]);
  saveProfiles();
}

// Получаем языки для конкретного профиля
function getSendLanguages(profile) {
  const langs = sendProfiles[profile] || ["ru"];
  console.log(`🔍 [sendConfig.js] getSendLanguages('${profile}') →`, langs);
  return langs;
}

// Проверяем, выбран ли язык
function isLanguageSelected(profile, lang) {
  return (sendProfiles[profile] || []).includes(lang);
}

// Определяем профиль страницы (по атрибуту <body data-profile="...">)
function getCurrentProfile() {
  const profile = document.body.dataset.profile || "rest"; // ✅ теперь rest по умолчанию
  console.log("📄 [sendConfig.js] Текущий профиль страницы:", profile);
  return profile;
}

// Удобная функция для включения/выключения языка
function toggleLanguage(profile, lang) {
  const langs = sendProfiles[profile] || [];
  if (langs.includes(lang)) {
    sendProfiles[profile] = langs.filter(l => l !== lang);
    console.log(`❌ [sendConfig.js] Язык '${lang}' убран из профиля '${profile}'`);
  } else {
    sendProfiles[profile] = [...langs, lang];
    console.log(`➕ [sendConfig.js] Язык '${lang}' добавлен в профиль '${profile}'`);
  }
  saveProfiles();
}

// ✅ Глобально сохраняем массив языков отправки (а не только первый)
window.sendLangs = getSendLanguages(getCurrentProfile());
console.log("🌍 [sendConfig.js] Установлены языки отправки:", window.sendLangs);
