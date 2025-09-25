// === Дата ===
document.addEventListener("DOMContentLoaded", () => {
  updateDate();
});

// Функция обновления даты (зависит от выбранного языка)
function updateDate() {
  const dateEl = document.getElementById("current-date");
  if (!dateEl) return;

  const today = new Date();
  const lang = localStorage.getItem("lang") || "ru";

  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  dateEl.textContent = today.toLocaleDateString(langMap(lang), options);
}

// Приводим lang.js код к формату для toLocaleDateString
function langMap(lang) {
  switch (lang) {
    case "en": return "en-US";
    case "vi": return "vi-VN";
    default: return "ru-RU";
  }
}

// Навигация
function goHome() {
  location.href = "http://stasssercheff.github.io/shbb/";
}

function goBack() {
  history.back();
}

// Подписываемся на переключение языка, чтобы обновлять дату
document.addEventListener("langChanged", updateDate);
