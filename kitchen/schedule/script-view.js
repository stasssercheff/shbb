// script-view.js

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSpNWtZImdMKoOxbV6McfEXEB67ck7nzA1EcBXNOFdnDTK4o9gniAuz82paEdGAyRSlo6dFKO9zCyLP/pub?gid=0&single=true&output=csv";

async function loadSchedule() {
  try {
    const response = await fetch(CSV_URL);
    const text = await response.text();
    const rows = text.trim().split("\n").map(r => r.split(","));

    const table = document.getElementById("schedule");
    const theadDates = document.getElementById("header-dates");
    const theadDays = document.getElementById("header-days");
    const tbody = table.querySelector("tbody");

    theadDates.innerHTML = '<th class="sticky-col">Дата</th>';
    theadDays.innerHTML = '<th class="sticky-col">День</th>';
    tbody.innerHTML = "";

    // находим индекс понедельника
    let startIndex = 2;
    for (let i = 2; i < rows[1].length; i++) {
      if (rows[1][i].trim().toLowerCase().startsWith("пн")) {
        startIndex = i;
        break;
      }
    }

    // первая строка (даты)
    for (let i = startIndex; i < rows[0].length; i++) {
      const th = document.createElement("th");
      th.textContent = rows[0][i];
      if (isToday(rows[0][i])) th.classList.add("today");
      theadDates.appendChild(th);
    }

    // вторая строка (дни недели)
    for (let i = startIndex; i < rows[1].length; i++) {
      const th = document.createElement("th");
      th.textContent = rows[1][i];
      if (isToday(rows[0][i])) th.classList.add("today");
      theadDays.appendChild(th);
    }

    // тело таблицы
    for (let r = 2; r < rows.length; r++) {
      const tr = document.createElement("tr");

      if (rows[r][0].toLowerCase().includes("раздел")) {
        tr.classList.add("section-row");
      }

      // первые два столбца (статичные)
      for (let c = 0; c < 2; c++) {
        const td = document.createElement("td");
        td.textContent = rows[r][c] || "";
        td.classList.add("sticky-col");
        tr.appendChild(td);
      }

      // остальные (смены)
      for (let c = startIndex; c < rows[r].length; c++) {
        const td = document.createElement("td");
        const val = rows[r][c].trim();

        td.textContent = val;

        if (val === "1") td.classList.add("shift-1");
        if (val === "0") td.classList.add("shift-0");
        if (val === "О") td.classList.add("shift-O");
        if (val === "Б") td.classList.add("shift-Б");

        if (isToday(rows[0][c])) td.classList.add("today");

        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    }

  } catch (err) {
    console.error("Ошибка загрузки расписания:", err);
  }
}

// проверка: сегодня ли эта дата
function isToday(dateStr) {
  const today = new Date();
  const d = today.getDate().toString().padStart(2, "0");
  const m = (today.getMonth() + 1).toString().padStart(2, "0");
  const y = today.getFullYear();

  const full = `${d}.${m}.${y}`;
  const short = `${d}.${m}`;

  return dateStr.trim() === full || dateStr.trim() === short;
}

loadSchedule();