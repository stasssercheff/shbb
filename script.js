// === Загрузка данных из Google Sheets ===
const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSpNWtZImdMKoOxbV6McfEXEB67ck7nzA1EcBXNOFdnDTK4o9gniAuz82paEdGAyRSlo6dFKO9zCyLP/pub?gid=0&single=true&output=csv";

document.addEventListener("DOMContentLoaded", () => {
  fetch(sheetUrl)
    .then(response => response.text())
    .then(csvText => {
      const rows = parseCSV(csvText);
      renderTable(rows);
    })
    .catch(err => console.error("Ошибка загрузки данных:", err));
});

// === CSV парсер ===
function parseCSV(text) {
  return text
    .trim()
    .split("\n")
    .map(line =>
      line.split(",").map(cell => cell.trim())
    );
}

// === Рендер таблицы ===
function renderTable(rows) {
  if (rows.length < 2) return;

  const table = document.getElementById("schedule");
  const theadDates = document.getElementById("header-dates");
  const theadDays = document.getElementById("header-days");
  const tbody = table.querySelector("tbody");

  // заголовки
  const headers = rows[0];
  const dates = rows[1];

  // находим индекс ближайшего понедельника
  let startIndex = 1;
  for (let i = 1; i < dates.length; i++) {
    const d = parseDate(dates[i]);
    if (d && d.getDay() === 1) { // 1 = понедельник
      startIndex = i;
      break;
    }
  }

  // строим заголовки
  for (let i = startIndex; i < headers.length; i++) {
    const thDate = document.createElement("th");
    thDate.textContent = headers[i];
    theadDates.appendChild(thDate);

    const thDay = document.createElement("th");
    thDay.textContent = dates[i];
    theadDays.appendChild(thDay);
  }

  // строки (включая последнюю!)
  for (let r = 2; r < rows.length; r++) {
    const tr = document.createElement("tr");

    for (let c = 0; c < rows[r].length; c++) {
      if (c < startIndex) continue;

      const td = document.createElement("td");
      td.textContent = rows[r][c];

      // первый столбец делаем "липким"
      if (c === startIndex) {
        td.classList.add("sticky-col");
      }

      // подсветка смен
      if (rows[r][c] === "1") td.classList.add("shift-1");
      if (rows[r][c] === "0") td.classList.add("shift-0");
      if (rows[r][c] === "О") td.classList.add("shift-O");
      if (rows[r][c] === "Б") td.classList.add("shift-Б");

      // подсветка сегодняшнего дня
      const colDate = parseDate(headers[c]);
      const today = new Date();
      if (colDate && isSameDate(colDate, today)) {
        td.classList.add("today");
      }

      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
}

// === Вспомогательные функции ===
function parseDate(str) {
  if (!str) return null;
  const parts = str.split(".");
  if (parts.length !== 3) return null;
  const [day, month, year] = parts.map(n => parseInt(n, 10));
  return new Date(year, month - 1, day);
}

function isSameDate(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}