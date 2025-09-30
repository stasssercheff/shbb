// === sendConfig.js ===
// Глобальный файл для управления языками отправки сообщений

// Загружаем профили из localStorage или создаём дефолтные
let sendProfiles;
try {
  sendProfiles = JSON.parse(localStorage.getItem("sendProfiles")) || {
    rest: ["ru"],     
    hall: ["vi"],
    kitchen: ["ru", "en"],
    pastry: ["ru"],
    extra1: ["ru"],
    extra2: ["ru"],
    extra3: ["ru"]
  };
  console.log("📦 sendProfiles после загрузки из localStorage:", sendProfiles);
} catch (e) {
  console.warn("⚠ Ошибка чтения sendProfiles, создаю дефолтные");
  sendProfiles = {
    rest: ["ru"],
    hall: ["vi"],
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
  console.log("💾 sendProfiles сохранены:", sendProfiles);
}

// Получаем текущий профиль страницы
function getCurrentProfile() {
  const profile = document.body.dataset.profile || "rest";
  console.log("📄 Текущий профиль страницы:", profile);
  return profile;
}

// Получаем языки для профиля
function getSendLanguages(profile) {
  const langs = sendProfiles[profile] || ["ru"];
  console.log(`🔍 getSendLanguages('${profile}') →`, langs);
  return langs;
}

// Устанавливаем массив языков отправки глобально
const currentProfile = getCurrentProfile();
window.sendLangs = getSendLanguages(currentProfile);

// Исправляем старые записи, например для hall
if (currentProfile === "hall" && window.sendLangs.includes("ru")) {
  console.log("⚠ Старый язык 'ru' для hall исправляю на 'en'");
  sendProfiles[currentProfile] = ["en"];
  saveProfiles();
  window.sendLangs = sendProfiles[currentProfile];
}

console.log("🌍 window.sendLangs:", window.sendLangs);

// Остальные функции (setSendLanguages, toggleLanguage и т.д.)
function setSendLanguages(profile, langs) {
  if (!Array.isArray(langs)) throw new Error("langs должен быть массивом");
  sendProfiles[profile] = langs.map(String);
  console.log(`✅ Для профиля '${profile}' установлены языки:`, sendProfiles[profile]);
  saveProfiles();
}

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

function isLanguageSelected(profile, lang) {
  return (sendProfiles[profile] || []).includes(lang);
}
