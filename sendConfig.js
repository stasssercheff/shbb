// === sendConfig.js ===
// Глобальный файл для управления языками отправки сообщений

let sendProfiles;
try {
  sendProfiles = JSON.parse(localStorage.getItem("sendProfiles")) || {
    rest: ["ru"],
    hall: ["en"],
    kitchen: ["ru", "en"],
    pastry: ["ru"],
    extra1: ["ru"],
    extra2: ["ru"],
    extra3: ["ru"]
  };
  console.log("📦 [sendConfig.js] Загруженные профили из localStorage:", sendProfiles);
} catch (e) {
  console.warn("⚠ Ошибка чтения sendProfiles, сбрасываю на дефолтные");
  sendProfiles = {
    rest: ["ru"],
    hall: ["en"],
    kitchen: ["ru", "en"],
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
  console.log("💾 [sendConfig.js] Сохранил sendProfiles:", sendProfiles);
}

// Устанавливаем языки для конкретного профиля
function setSendLanguages(profile, langs) {
  if (!Array.isArray(langs)) throw new Error("langs должен быть массивом");
  sendProfiles[profile] = langs.map(String);
  console.log(`✅ Для профиля '${profile}' установлены языки:`, sendProfiles[profile]);
  saveProfiles();
}

// Получаем языки для конкретного профиля
function getSendLanguages(profile) {
  const langs = sendProfiles[profile] || ["ru"];
  console.log(`🔍 getSendLanguages('${profile}') →`, langs);
  return langs;
}

// Проверяем, выбран ли язык
function isLanguageSelected(profile, lang) {
  return (sendProfiles[profile] || []).includes(lang);
}

// Определяем профиль страницы (по атрибуту <body data-profile="...">)
function getCurrentProfile() {
  const profile = document.body.dataset.profile || "rest";
  console.log("📄 Текущий профиль страницы:", profile);
  return profile;
}

// Включение/выключение языка
function toggleLanguage(profile, lang) {
  const langs = sendProfiles[profile] || [];
  if (langs.includes(lang)) {
    sendProfiles[profile] = langs.filter(l => l !== lang);
    console.log(`❌ Язык '${lang}' убран из профиля '${profile}'`);
  } else {
    sendProfiles[profile] = [...langs, lang];
    console.log(`➕ Язык '${lang}' добавлен в профиль '${profile}'`);
  }
  saveProfiles();
}

// ✅ Глобально массив языков отправки
window.sendLangs = getSendLanguages(getCurrentProfile());
console.log("🌍 Установлены языки отправки:", window.sendLangs);
