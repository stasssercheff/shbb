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
} catch (e) {
  console.warn("⚠ Ошибка чтения sendProfiles, сбрасываю на дефолтные");
  sendProfiles = {
    rest: ["ru"],
    hall: ["ru"],
    kitchen: ["ru"],
    pastry: ["ru"],
    extra1: ["ru"],
    extra2: ["ru"],
    extra3: ["ru"]
  };
  localStorage.removeItem("sendProfiles");
}

// Сохраняем профили в localStorage
function saveProfiles() {
  localStorage.setItem("sendProfiles", JSON.stringify(sendProfiles));
}

// Устанавливаем языки для конкретного профиля
function setSendLanguages(profile, langs) {
  if (!Array.isArray(langs)) {
    throw new Error("langs должен быть массивом");
  }
  sendProfiles[profile] = langs.map(String);
  saveProfiles();
}

// Получаем языки для конкретного профиля
function getSendLanguages(profile) {
  return sendProfiles[profile] || ["ru"];
}

// Проверяем, выбран ли язык
function isLanguageSelected(profile, lang) {
  return (sendProfiles[profile] || []).includes(lang);
}

// Определяем профиль страницы (по атрибуту <body data-profile="...">)
function getCurrentProfile() {
  return document.body.dataset.profile || "rest"; // ✅ теперь rest по умолчанию
}

// Удобная функция для включения/выключения языка
function toggleLanguage(profile, lang) {
  const langs = sendProfiles[profile] || [];
  if (langs.includes(lang)) {
    sendProfiles[profile] = langs.filter(l => l !== lang);
  } else {
    sendProfiles[profile] = [...langs, lang];
  }
  saveProfiles();
}

// ✅ Глобально сохраняем текущий язык отправки для доступа в любых локальных скриптах
window.sendLang = getSendLanguages(getCurrentProfile())[0] || "ru";
console.log("🌍 [sendConfig.js] Установлен глобальный sendLang:", window.sendLang);
