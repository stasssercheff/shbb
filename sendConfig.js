// === sendConfig.js ===
// Глобальный файл для управления языками отправки сообщений без localStorage

// Дефолтные профили
const sendProfiles = {
  rest: ["ru"],
  hall: ["en"],       // <-- язык для hall
  kitchen: ["ru", "en"],
  pastry: ["ru"],
  extra1: ["ru"],
  extra2: ["vi"],
  extra3: ["ru"]
};

// Получаем текущий профиль страницы
function getCurrentProfile() {
  const profile = document.body.dataset.profile || "rest";
  console.log("📄 Текущий профиль страницы:", profile);
  return profile;
}

// Получаем массив языков для отправки по текущему профилю
function getSendLanguages(profile) {
  const langs = sendProfiles[profile] || ["ru"];
  console.log(`🔍 getSendLanguages('${profile}') →`, langs);
  return langs;
}

// Каждый раз динамически берём языки для текущей страницы
const currentProfile = getCurrentProfile();
window.sendLangs = getSendLanguages(currentProfile);

console.log("🌍 window.sendLangs:", window.sendLangs);

// Функции управления (не используют localStorage)
function setSendLanguages(profile, langs) {
  if (!Array.isArray(langs)) throw new Error("langs должен быть массивом");
  sendProfiles[profile] = langs.map(String);
  console.log(`✅ Для профиля '${profile}' установлены языки:`, sendProfiles[profile]);
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
}

function isLanguageSelected(profile, lang) {
  return (sendProfiles[profile] || []).includes(lang);
}
