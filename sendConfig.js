// === sendConfig.js ===
// Глобальный файл для управления языками отправки сообщений

// Загружаем все профили из localStorage или создаём дефолтные
let sendProfiles = JSON.parse(localStorage.getItem("sendProfiles")) || {
  kitchen: ["ru"], // кухня по умолчанию отправляет на русском
  hall: ["ru"],    // зал — тоже
  bar: ["ru"]      // бар — тоже
};

// Сохраняем профили в localStorage
function saveProfiles() {
  localStorage.setItem("sendProfiles", JSON.stringify(sendProfiles));
}

// Устанавливаем языки для конкретного профиля
function setSendLanguages(profile, langs) {
  sendProfiles[profile] = langs;
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
  return document.body.dataset.profile || "kitchen"; // по умолчанию кухня
}
