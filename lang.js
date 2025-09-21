const translations = {
  "greeting": { "ru": "Портал сотрудников", "en": "Employee Portal", "vi": "Cổng nhân viên" },
  "page_title": { "ru": "Страница выбора", "en": "Selection page", "vi": "Trang lựa chọn" },
  "date": { "ru": "Дата", "en": "Date", "vi": "Ngày" },
  "kitchen": { "ru": "Кухня", "en": "Kitchen", "vi": "Bếp" },
  "guest_area": { "ru": "Зал", "en": "Guest area", "vi": "Khu vực khách" }
};

// читаем сохранённый язык или по умолчанию ru
let currentLang = localStorage.getItem("lang") || "ru";

function switchLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang); // сохраняем выбор

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (translations[key] && translations[key][lang]) {
      el.textContent = translations[key][lang];
    }
  });

  // обновляем дату
  const dateEl = document.getElementById("current-date");
  if (dateEl) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    dateEl.textContent = new Date().toLocaleDateString(lang, options);
  }
}

// обработка кнопок выбора языка
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => switchLanguage(btn.dataset.lang));
  });

  // показываем текущий язык по умолчанию или сохранённый
  switchLanguage(currentLang);
});