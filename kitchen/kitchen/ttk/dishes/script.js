let currentLanguage = "ru";

const sections = [
  { id: "breakfasts", title: { ru: "Завтраки", en: "Breakfasts" }, file: "data/breakfast.json" },
  { id: "soups", title: { ru: "Супы", en: "Soups" }, file: "data/soups.json" },
  { id: "salads", title: { ru: "Салаты и закуски", en: "Salads & Snacks" }, file: "data/salads.json" },
  { id: "mains", title: { ru: "Основные блюда", en: "Main Courses" }, file: "data/mains.json" }
];

function init() {
  const container = document.getElementById("sections-container");
  container.innerHTML = "";

  sections.forEach(sec => {
    const secBtn = document.createElement("button");
    secBtn.className = "section-btn";
    secBtn.textContent = sec.title[currentLanguage];
    secBtn.onclick = () => toggleSection(sec.id, sec.file);
    container.appendChild(secBtn);

    const secContent = document.createElement("div");
    secContent.className = "section-content";
    secContent.id = `section-${sec.id}`;
    container.appendChild(secContent);
  });
}

function toggleSection(sectionId, jsonFile) {
  const content = document.getElementById(`section-${sectionId}`);

  if (content.style.display === "flex") {
    content.style.display = "none";
    content.innerHTML = "";
  } else {
    // закрыть остальные
    document.querySelectorAll(".section-content").forEach(el => {
      el.style.display = "none";
      el.innerHTML = "";
    });

    fetch(jsonFile)
      .then(res => res.json())
      .then(dishes => {
        content.style.display = "flex";
        dishes.forEach((dish, index) => {
          const dishBtn = document.createElement("button");
          dishBtn.className = "dish-btn";
          dishBtn.textContent = dish.name[currentLanguage];
          dishBtn.onclick = () => toggleCard(sectionId, index, dish);
          content.appendChild(dishBtn);

          const card = document.createElement("div");
          card.className = "card";
          card.id = `card-${sectionId}-${index}`;

          const ingredientsHtml = dish.ingredients.map(ing => 
            `<li>${ing.name[currentLanguage]} — ${ing.amount}</li>`
          ).join("");

          card.innerHTML = `
            <h3>${dish.name[currentLanguage]}</h3>
            <p><b>${currentLanguage === "ru" ? "Ингредиенты" : "Ingredients"}:</b></p>
            <ul>${ingredientsHtml}</ul>
            <p><b>${currentLanguage === "ru" ? "Процесс" : "Process"}:</b> ${dish.process[currentLanguage]}</p>
            ${dish.photo ? `<img src="фото/${dish.photo}" alt="${dish.name[currentLanguage]}">` : ""}
          `;
          content.appendChild(card);
        });
      });
  }
}

function toggleCard(sectionId, index) {
  const card = document.getElementById(`card-${sectionId}-${index}`);
  card.style.display = card.style.display === "block" ? "none" : "block";
}

function switchLanguage(lang) {
  currentLanguage = lang;
  init();
}

function goHome() {
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", init);