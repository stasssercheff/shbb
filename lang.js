let translations = {};
let currentLang = "ru";

// Загружаем JSON с переводами
async function loadTranslations() {
  try {
    const response = await fetch("../lang.json"); // путь поправь, если нужно
    translations = await response.json();

    // Загружаем сохранённый язык из localStorage
    const savedLang = localStorage.getItem("lang");
    if (savedLang && translations[savedLang]) {
      currentLang = savedLang;
    }

    applyTranslations(currentLang);
  } catch (error) {
    console.error("Ошибка загрузки lang.json:", error);
  }
}

// Применяем перевод
function applyTranslations(lang) {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  // Меняем lang у <html>
  document.documentElement.setAttribute("lang", lang);
  currentLang = lang;
  localStorage.setItem("lang", lang); // сохраняем выбор
}

// Навешиваем обработчики на кнопки
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const lang = btn.dataset.lang;
      if (lang) {
        applyTranslations(lang);
      }
    });
  });

  loadTranslations();
});