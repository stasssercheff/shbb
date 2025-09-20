async function loadLanguage(lang) {
  try {
    const response = await fetch(`lang/${lang}.json`);
    const translations = await response.json();

    // Применяем переводы
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (translations[key]) {
        el.textContent = translations[key];
      }
    });

    // Дата
    const dateEl = document.getElementById("current-date");
    if (dateEl && translations.date_format) {
      const today = new Date();
      dateEl.textContent = today.toLocaleDateString(translations.date_format, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    }
  } catch (err) {
    console.error("Ошибка загрузки перевода:", err);
  }
}

// Обработчики кнопок
document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const lang = btn.getAttribute("data-lang");
    loadLanguage(lang);
  });
});

// Язык по умолчанию
loadLanguage("ru");