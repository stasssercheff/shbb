document.addEventListener("DOMContentLoaded", () => {
  const tableContainer = document.getElementById("schedule-table");
  const csvUrl =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSpNWtZImdMKoOxbV6McfEXEB67ck7nzA1EcBXNOFdnDTK4o9gniAuz82paEdGAyRSlo6dFKO9zCyLP/pub?gid=0&single=true&output=csv";

  fetch(csvUrl)
    .then((response) => response.text())
    .then((csvText) => {
      const rows = csvText.trim().split("\n").map((row) => row.split(","));
      renderTable(rows);
    })
    .catch((err) => {
      console.error("Ошибка загрузки CSV:", err);
      tableContainer.innerHTML = "<p>Не удалось загрузить данные.</p>";
    });

  function renderTable(data) {
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    // --- заголовки ---
    const headerRow = document.createElement("tr");
    data[0].forEach((cell, idx) => {
      const th = document.createElement("th");
      th.textContent = cell;
      if (idx === 0) th.classList.add("sticky-col");
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // --- строки данных ---
    const today = new Date().toLocaleDateString("ru-RU");

    data.slice(1).forEach((row) => {
      const tr = document.createElement("tr");

      row.forEach((cell, idx) => {
        const td = document.createElement("td");
        td.textContent = cell;

        if (idx === 0) {
          td.classList.add("sticky-col");

          // подсветка сегодняшней даты
          if (cell.trim() === today) {
            td.classList.add("today");
          }
        }

        // стили для смен (shift-1, shift-0, shift-O, shift-Б)
        if (["1", "0", "O", "Б"].includes(cell.trim())) {
          td.classList.add(`shift-${cell.trim()}`);
        }

        tr.appendChild(td);
      });

      // разделители
      if (row[0].toLowerCase().includes("раздел")) {
        tr.classList.add("section-row");
      }

      tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    tableContainer.innerHTML = "";
    tableContainer.appendChild(table);
  }
});