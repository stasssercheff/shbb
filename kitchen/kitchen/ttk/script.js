let currentLang = "ru";

// переключение языка
function switchLanguage(lang) {
  currentLang = lang;
  document.querySelectorAll(".section-btn").forEach(btn => {
    const sec = btn.dataset.section;
    if (sec === "breakfast") btn.textContent = lang === "ru" ? "Завтраки" : "Breakfast";
    if (sec === "soup") btn.textContent = lang === "ru" ? "Супы" : "Soups";
    if (sec === "salad") btn.textContent = lang === "ru" ? "Салаты" : "Salads";
    if (sec === "main") btn.textContent = lang === "ru" ? "Основные блюда" : "Main dishes";
  });
  document.querySelectorAll(".section-panel").forEach(panel => {
    panel.innerHTML = ""; // перерисуем блюда
    loadSection(panel.id.replace("-section", ""));
  });
}

// загружаем все json
document.addEventListener("DOMContentLoaded", () => {
  const sections = ["breakfast", "soup", "salad", "main"];
  sections.forEach(section => loadSection(section));

  // дата
  const dateEl = document.getElementById("current-date");
  const today = new Date();
  dateEl.textContent = today.toLocaleDateString("ru-RU", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  // раскрытие секций
  document.querySelectorAll(".section-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const panel = document.getElementById(`${btn.dataset.section}-section`);
      panel.style.display = panel.style.display === "block" ? "none" : "block";
    });
  });
});

// загрузка json
function loadSection(section) {
  fetch(`data/${section}.json`)
    .then(res => res.json())
    .then(data => renderSection(section, data))
    .catch(err => console.error(`Ошибка загрузки ${section}:`, err));
}

// отрисовка раздела
function renderSection(section, data) {
  const container = document.getElementById(`${section}-section`);
  container.innerHTML = "";

  data.forEach(dish => {
    const btn = document.createElement("button");
    btn.className = "dish-btn";
    btn.textContent = dish.name[currentLang];
    container.appendChild(btn);

    const details = document.createElement("div");
    details.style.display = "none";

    const tableWrapper = document.createElement("div");
    tableWrapper.className = "table-container";

    const table = document.createElement("table");
    table.className = "dish-table";

    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th>№</th>
        <th>${currentLang === "ru" ? "Ингредиент" : "Ingredient"}</th>
        <th>${currentLang === "ru" ? "Кол-во" : "Amount"}</th>
      </tr>`;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    dish.ingredients.forEach((ing, i) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${i + 1}</td>
        <td>${ing[currentLang]}</td>
        <td>${ing.amount}</td>`;
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    details.appendChild(tableWrapper);

    const process = document.createElement("div");
    process.className = "dish-process";
    process.textContent = dish.process[currentLang];
    details.appendChild(process);

    container.appendChild(details);

    btn.addEventListener("click", () => {
      details.style.display = details.style.display === "block" ? "none" : "block";
    });
  });
}

// возврат
function goHome() {
  location.href = "index.html";
}
function goBack() {
  history.back();
}