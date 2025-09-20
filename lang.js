let translations = {};

async function loadTranslations() {
  const response = await fetch("lang.json");
  translations = await response.json();
}

async function setLanguage(lang) {
  if (!translations[lang]) return;

  // обновляем все элементы с data-i18n
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const translation = translations[lang][key];
    if (translation) {
      el.textContent = translation;
    }
  });

  // обновляем дату
  const dateEl = document.getElementById("current-date");
  if (dateEl && translations[lang].date_format) {
    const today = new Date();
    dateEl.textContent = today.toLocaleDateString(translations[lang].date_format, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadTranslations();
  setLanguage("ru");

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang");
      setLanguage(lang);
    });
  });
});