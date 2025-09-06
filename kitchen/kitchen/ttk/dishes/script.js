let currentLang = "ru";

// переключение языка
function switchLanguage(lang) {
  currentLang = lang;
  document.querySelectorAll("[data-lang]").forEach(el => {
    el.textContent = lang === "ru" ? el.dataset.ru : el.dataset.en;
  });
}

// при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  const sections = ["breakfast", "soup", "salad", "main"];
  sections.forEach(section => loadSection(section));

  // дата
  const dateEl = document.getElementById("current-date");
  const today = new Date();
  dateEl.textContent = today.toLocaleDateString("ru-RU", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  // аккордеоны разделов
  document.querySelectorAll(".accordion").forEach(btn => {
    btn.addEventListener("click", () => {
      const panel = document.getElementById(`${btn.dataset.section}-section`);
      panel.style.display = panel.style.display === "block" ? "none" : "block";
    });
  });
});

// загрузка JSON раздела
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

  data.forEach((dish) => {
    // кнопка-блюдо
    const btn = document.createElement("button");
    btn.className = "dish-btn";
    btn.textContent = dish.name[currentLang];
    container.appendChild(btn);

    // карточка блюда
    const details = document.createElement("div");
    details.style.display = "none";

    const tableWrapper = document.createElement("div");
    tableWrapper.className = "table-container";

    const table = document.createElement("table");
    table.className = "dish-table";

    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th>${currentLang === "ru" ? "Ингредиент" : "Ingredient"}</th>
        <th>${currentLang === "ru" ? "Кол-во" : "Amount"}</th>
        <th>${currentLang === "ru" ? "Технология приготовления" : "Cooking process"}</th>
        <th>${currentLang === "ru" ? "Фото" : "Photo"}</th>
      </tr>`;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    dish.ingredients.forEach((ing, i) => {
      const row = document.createElement("tr");

      // колонка 1: ингредиент
      const ingCell = document.createElement("td");
      ingCell.textContent = ing[currentLang];
      row.appendChild(ingCell);

      // колонка 2: количество
      const amountCell = document.createElement("td");
      amountCell.textContent = ing.amount;
      row.appendChild(amountCell);

      // колонка 3: технология (объединено вниз)
      if (i === 0) {
        const procCell = document.createElement("td");
        procCell.textContent = dish.process[currentLang];
        procCell.rowSpan = dish.ingredients.length;
        row.appendChild(procCell);

        // колонка 4: фото (объединено вниз)
        const photoCell = document.createElement("td");
        if (dish.photo) {
          const img = document.createElement("img");
          img.src = dish.photo;
          img.alt = dish.name[currentLang];
          img.style.maxWidth = "120px";
          img.style.height = "auto";
          photoCell.appendChild(img);
        } else {
          photoCell.textContent = "-";
        }
        photoCell.rowSpan = dish.ingredients.length;
        row.appendChild(photoCell);
      }

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    details.appendChild(tableWrapper);
    container.appendChild(details);

    // событие клика
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