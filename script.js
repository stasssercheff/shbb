const translations = {
  ru: {
    mainTitle: "Главная страница",
    chooseSection: "Выберите раздел:",
    kitchen: "Кухня"
  },
  en: {
    mainTitle: "Home page",
    chooseSection: "Choose a section:",
    kitchen: "Kitchen"
  }
};

let currentLang = "ru";

document.getElementById("lang-switch").addEventListener("click", () => {
  currentLang = currentLang === "ru" ? "en" : "ru";
  document.getElementById("lang-switch").textContent = currentLang.toUpperCase();
  translatePage();
});

function translatePage() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    el.textContent = translations[currentLang][key];
  });
}

translatePage();