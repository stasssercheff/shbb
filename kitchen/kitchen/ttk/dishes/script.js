let currentLang = "ru";

document.addEventListener("DOMContentLoaded", () => {
  const sections = ["breakfast", "soup", "salad", "main"];
  sections.forEach(section => loadSection(section));

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

function switchLanguage(lang) {
  currentLang = lang;

  document.querySelectorAll("[data-lang]").forEach(el => {
    el.textContent = lang === "ru" ? el.dataset.ru : el.dataset.en;
  });

  document.querySelectorAll(".dish-btn").forEach(btn => {
    const nameObj = JSON.parse(btn.dataset.name);
    btn.textContent = nameObj[currentLang];
  });

  document.querySelectorAll(".dish-process").forEach(proc => {
    const procObj = JSON.parse(proc.dataset.process);
    proc.textContent = procObj[currentLang];
  });

  document.querySelectorAll(".dish-table").forEach(table => {
    table.querySelectorAll("tbody tr").forEach((row, i) => {
      const ingData = JSON.parse(row.children[1].dataset.ingredients || "{}");
      if (ingData[currentLang]) row.children[1].textContent = ingData[currentLang];
      row.children[0].textContent = String(i + 1); // номер как текст
    });
  });
}

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
    wrapper.style.display = "none";
    container.appendChild(wrapper);

    // Таблица блюда
    const table = document.createElement("table");
    table.className = "dish-table";
    wrapper.appendChild(table);

    const tbody = document.createElement("tbody");
    const rowCount = dish.ingredients.length;

    dish.ingredients.forEach((ing, i) => {
      const tr = document.createElement("tr");

      // №
      const tdNum = document.createElement("td");
      tdNum.textContent = String(i + 1);
      tdNum.style.width = "40px";
      tr.appendChild(tdNum);

      // Ингредиент
      const tdIng = document.createElement("td");
      tdIng.textContent = ing[currentLang];
      tdIng.dataset.ingredients = JSON.stringify(ing);
      tdIng.style.width = "auto";
      tr.appendChild(tdIng);

      if (i === 0) {
        // Процесс
        const tdProcess = document.createElement("td");
        tdProcess.textContent = dish.process[currentLang];
        tdProcess.dataset.process = JSON.stringify(dish.process);
        tdProcess.rowSpan = rowCount;
        tdProcess.style.width = "400px";
        tr.appendChild(tdProcess);

        // Фото
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

    // Раскрытие таблицы по клику на название блюда
    btn.addEventListener("click", () => {
      wrapper.style.display = wrapper.style.display === "block" ? "none" : "block";
    });
  });
}

// Функции возврата
function goHome() { location.href = "index.html"; }
function goBack() { history.back(); }