let currentLanguage = "ru";

const sections = [
  { id: "breakfasts", title: { ru: "Завтраки", en: "Breakfasts" }, file: "../data/breakfasts.json" },
  { id: "soups", title: { ru: "Супы", en: "Soups" }, file: "../data/soups.json" },
  { id: "salads", title: { ru: "Салаты и закуски", en: "Salads & Snacks" }, file: "../data/salads.json" },
  { id: "mains", title: { ru: "Основные блюда", en: "Main Courses" }, file: "../data/mains.json" }
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

  if (content.style.display === "block") {
    content.style.display = "none";
    content.innerHTML = "";
  } else {
    document.querySelectorAll(".section-content").forEach(el => {
      el.style.display = "none";
      el.innerHTML = "";
    });

    fetch(jsonFile)
      .then(res => res.json())
      .then(dishes => {
        content.style.display = "block";
        dishes.forEach((dish, index) => {
          const dishBtn = document.createElement("button");
          dishBtn.className = "dish-btn";
          dishBtn.textContent = dish.name[currentLanguage];
          dishBtn.onclick = () => toggleCard(sectionId, index, dish);
          content.appendChild(dishBtn);

          const card = document.createElement("div");
          card.className = "dish-details";
          card.id = `card-${sectionId}-${index}`;
          card.style.display = "none";
          card.innerHTML = renderDishTable(dish);
          content.appendChild(card);
        });
      })
      .catch(err => {
        content.style.display = "block";
        content.innerHTML = `<p style="color:red">Ошибка загрузки данных</p>`;
        console.error(err);
      });
  }
}

function renderDishTable(dish) {
  const name = dish.name[currentLanguage];
  const process = dish.process[currentLanguage];
  const photo = dish.photo ? `<img src="../photos/${dish.photo}" alt="${name}" class="dish-photo">` : "";

  let rows = "";
  dish.ingredients.forEach((ing, i) => {
    rows += `
      <tr>
        <td>${i + 1}</td>
        <td>${ing.name}</td>
        <td>${ing.amount}</td>
        <td>${i === 0 ? process : ""}</td>
      </tr>
    `;
  });

  return `
    <table class="dish-table">
      <caption>${name}</caption>
      <thead>
        <tr>
          <th>№</th>
          <th>${currentLanguage === "ru" ? "Ингредиент" : "Ingredient"}</th>
          <th>${currentLanguage === "ru" ? "Количество" : "Amount"}</th>
          <th>${currentLanguage === "ru" ? "Описание" : "Process"}</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    ${photo}
  `;
}

function toggleCard(sectionId, index, dish) {
  const card = document.getElementById(`card-${sectionId}-${index}`);
  card.style.display = card.style.display === "block" ? "none" : "block";
}

function switchLanguage(lang) {
  currentLanguage = lang;
  init();
}

function goHome() {
  window.location.href = "../index.html";
}

function goBack() {
  history.back();
}

document.addEventListener("DOMContentLoaded", init);