// Переводы
const translations = {
  ru: {
    title: "Заголовок 1",
    description: "Это описание страницы. Здесь будет информация для сотрудников."
  },
  en: {
    title: "Title 1",
    description: "This is the page description. Here will be information for employees."
  }
};

// Установка языка
function setLanguage(lang) {
  document.querySelectorAll("[data-lang]").forEach(el => {
    const key = el.getAttribute("data-lang");
    el.textContent = translations[lang][key];
  });

  // Запоминаем выбранный язык
  localStorage.setItem("lang", lang);
}

// Отображение даты и дня недели
function updateDate() {
  const date = new Date();
  const optionsDate = { day: "2-digit", month: "2-digit", year: "numeric" };
  const optionsDay = { weekday: "long" };

  document.getElementById("current-date").textContent =
    date.toLocaleDateString("ru-RU", optionsDate);

  document.getElementById("current-day").textContent =
    date.toLocaleDateString("ru-RU", optionsDay);
}

// При загрузке страницы
window.onload = () => {
  // Устанавливаем язык из localStorage или RU по умолчанию
  const savedLang = localStorage.getItem("lang") || "ru";
  setLanguage(savedLang);

  updateDate();
};