let currentLang = "ru";

document.addEventListener("DOMContentLoaded", () => {
  const sections = ["breakfast", "soup", "salad", "main"];
  sections.forEach(section => loadSection(section));

  // Дата
  const dateEl = document.getElementById("current-date");
  const today = new Date();
  dateEl.textContent = today.toLocaleDateString("ru-RU", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  // Аккордеоны разделов
  document.querySelectorAll(".accordion").forEach(btn => {
    btn.addEventListener("click", () => {
      const panel = document.getElementById(`${btn.dataset.section}-section`);
      panel.style.display = panel.style.display === "block" ? "none" : "block";
    });
  });
});

function loadSection(section) {
  fetch(`data/${section}.json`)
    .then(res => res.json())
    .then(data => renderSection(section, data))
    .catch(err => console.error(`Ошибка загрузки ${section}:`, err));
}

function renderSection(section, data) {
  const container = document.getElementById(`${section}-section`);
  container.innerHTML = "";

  data.forEach(dish => {
    // Кнопка блюда
    const btn = document.createElement("button");
    btn.className = "dish-btn";
    btn.dataset.name = JSON.stringify(dish.name);
    btn.textContent = dish.name[currentLang];
    container.appendChild(btn);

    // Контейнер таблицы
    const wrapper = document.createElement("div");
    wrapper.className = "table-container";
    container.appendChild(wrapper);

    // Таблица
    const table = document.createElement("table");
    table.className = "dish-table";
    wrapper.appendChild(table);

    // Тело таблицы
    const tbody = document.createElement("tbody");
    const rowCount = dish.ingredients.length;

    dish.ingredients.forEach((ing, i) => {
      const tr = document.createElement("tr");

      const tdNum = document.createElement("td");
      tdNum.textContent = String(i + 1);
      tdNum.style.width = "40px";
      tr.appendChild(tdNum);

      const tdIng = document.createElement("td");
      tdIng.textContent = ing[currentLang];
      tr.appendChild(tdIng);

      if (i === 0) {
        const tdProcess = document.createElement("td");
        tdProcess.textContent = dish.process[currentLang];
        tdProcess.rowSpan = rowCount;
        tdProcess.style.width = "400px";
        tr.appendChild(tdProcess);

        const tdPhoto = document.createElement("td");
        if (dish.photo) {
          const img = document.createElement("img");
          img.src = dish.photo;
          img.style.width = "100px";
          img.style.height = "100px";
          img.style.objectFit = "cover";
          tdPhoto.appendChild(img);
        }
        tdPhoto.rowSpan = rowCount;
        tr.appendChild(tdPhoto);
      }

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);

    // Раскрытие таблицы
    btn.addEventListener("click", () => {
      wrapper.style.display = wrapper.style.display === "block" ? "none" : "block";
    });
  });
}