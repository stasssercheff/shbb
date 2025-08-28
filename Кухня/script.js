const translations = {
  ru: {
    kitchenTitle: "Кухня",
    chooseSection: "Выберите раздел кухни:",
    schedule: "График",
    desserts: "Цех десерты",
    workshop: "Цех кухня",
    back: "⬅ Назад"
  },
  en: {
    kitchenTitle: "Kitchen",
    chooseSection: "Choose a section:",
    schedule: "Schedule",
    desserts: "Desserts workshop",
    workshop: "Kitchen workshop",
    back: "⬅ Back"
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
