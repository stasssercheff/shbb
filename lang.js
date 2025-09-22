let currentLang = localStorage.getItem("lang") || "ru";
let translations = {};

// Загружаем словарь из JSON
async function loadTranslations() {
  try {
    // ищем lang.json в текущей или родительских папках (до 6 уровней вверх)
    let paths = [
      "./lang.json",
      "../lang.json",
      "../../lang.json",
      "../../../lang.json",
      "../../../../lang.json",
      "../../../../../lang.json"
    ];

    for (let path of paths) {
      try {
        const res = await fetch(path);
        if (res.ok) {
          translations = await res.json();
          break;
        }
      } catch (e) {
        // пропускаем неудачные пути
      }
    }

    switchLanguage(currentLang);
  } catch (err) {
    console.error("Ошибка загрузки переводов:", err);
  }
}

function switchLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);

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

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => switchLanguage(btn.dataset.lang));
  });

  loadTranslations();
});