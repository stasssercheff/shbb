/* script.js — вывод всех завтраков одной кнопкой, таблица с объединением */
let currentLang = "ru";
let breakfastData = null;

document.addEventListener("DOMContentLoaded", () => {
  // дата
  const dateEl = document.getElementById("current-date");
  if (dateEl) {
    const today = new Date();
    dateEl.textContent = today.toLocaleDateString("ru-RU", {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    });
  }

  // аккордеон завтраки
  const breakfastBtn = document.querySelector('.accordion[data-section="breakfast"]');
  if (breakfastBtn) {
    breakfastBtn.addEventListener("click", () => toggleBreakfastPanel());
  }
});

function toggleBreakfastPanel() {
  const panel = document.getElementById("breakfast-section");
  if (!panel) return;

  if (panel.style.display === "block") {
    panel.style.display = "none";
    return;
  }

  if (breakfastData) {
    renderBreakfastTables(panel, breakfastData);
    panel.style.display = "block";
    return;
  }

  fetch("data/breakfast.json")
    .then(res => res.json())
    .then(data => {
      breakfastData = data;
      renderBreakfastTables(panel, breakfastData);
      panel.style.display = "block";
    })
    .catch(err => {
      console.error("Ошибка загрузки:", err);
      panel.innerHTML = `<div style="color:red">Ошибка загрузки данных</div>`;
      panel.style.display = "block";
    });
}

function switchLanguage(lang) {
  currentLang = lang;
  const panel = document.getElementById("breakfast-section");
  if (breakfastData && panel && panel.style.display === "block") {
    renderBreakfastTables(panel, breakfastData);
  }
}

function renderBreakfastTables(container, data) {
  container.innerHTML = "";

  data.forEach((dish, dishIndex) => {
    // Заголовок блюда
    const title = document.createElement("h3");
    title.textContent = dish.name && dish.name[currentLang] ? dish.name[currentLang] : "";
    title.style.marginTop = "20px";
    container.appendChild(title);

    // Таблица для блюда
    const wrapper = document.createElement("div");
    wrapper.className = "table-container";

    const table = document.createElement("table");
    table.className = "dish-table";

    // Заголовки
    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th style="width:40px">${currentLang === "ru" ? "№" : "No"}</th>
        <th>${currentLang === "ru" ? "Наименование продукта" : "Ingredient"}</th>
        <th style="width:80px">${currentLang === "ru" ? "Кол-во" : "Amount"}</th>
        <th>${currentLang === "ru" ? "Технология" : "Process"}</th>
        <th style="width:120px">${currentLang === "ru" ? "Фото" : "Photo"}</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    const ingCount = dish.ingredients?.length || 1;

    for (let i = 0; i < ingCount; i++) {
      const tr = document.createElement("tr");

      // №
      const tdNum = document.createElement("td");
      tdNum.textContent = String(i + 1);
      tr.appendChild(tdNum);

      // Наименование
      const tdIng = document.createElement("td");
      tdIng.textContent = dish.ingredients && dish.ingredients[i]
        ? dish.ingredients[i][currentLang] || ""
        : "-";
      tr.appendChild(tdIng);

      // Кол-во
      const tdAmount = document.createElement("td");
      tdAmount.textContent = dish.ingredients && dish.ingredients[i]
        ? String(dish.ingredients[i].amount || "")
        : "-";
      tr.appendChild(tdAmount);

      // Технология (rowspan)
      if (i === 0) {
        const tdProc = document.createElement("td");
        tdProc.textContent = dish.process && dish.process[currentLang] ? dish.process[currentLang] : "-";
        tdProc.rowSpan = ingCount;
        tdProc.style.verticalAlign = "top";
        tr.appendChild(tdProc);

        // Фото (rowspan)
        const tdPhoto = document.createElement("td");
        if (dish.photo) {
          const img = document.createElement("img");
          img.src = dish.photo;
          img.alt = dish.name && dish.name[currentLang] ? dish.name[currentLang] : "";
          img.style.maxWidth = "120px";
          img.style.height = "auto";
          img.style.display = "block";
          tdPhoto.appendChild(img);
        } else {
          tdPhoto.textContent = "-";
        }
        tdPhoto.rowSpan = ingCount;
        tdPhoto.style.verticalAlign = "top";
        tr.appendChild(tdPhoto);
      }

      tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    wrapper.appendChild(table);
    container.appendChild(wrapper);
  });
}