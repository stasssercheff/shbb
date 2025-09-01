const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSpNWtZImdMKoOxbV6McfEXEB67ck7nzA1EcBXNOFdnDTK4o9gniAuz82paEdGAyRSlo6dFKO9zCyLP/pub?gid=0&single=true&output=csv";
const DAYS_TO_SHOW = 10;

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

    // Заголовки дат
    for (let i = 2; i < 2 + DAYS_TO_SHOW; i++) {
      const th = document.createElement("th");
      th.textContent = rows[0][i];
      if (isToday(rows[0][i])) th.classList.add("today");
      theadDates.appendChild(th);
    }

    // Заголовки дней недели
    for (let i = 2; i < 2 + DAYS_TO_SHOW; i++) {
      const th = document.createElement("th");
      th.textContent = rows[1][i];
      if (isToday(rows[0][i])) th.classList.add("today");
      theadDays.appendChild(th);
    }

    // Тело таблицы
    for (let r = 2; r < rows.length; r++) {
      const tr = document.createElement("tr");

      if (rows[r][0].toLowerCase().includes("раздел")) {
        tr.classList.add("section-row");
      }

      // Первые два столбца — статичные
      for (let c = 0; c < 2; c++) {
        const td = document.createElement("td");
        td.textContent = rows[r][c] || "";
        td.classList.add("sticky-col");
        tr.appendChild(td);
      }

      // Остальные — смены
      for (let c = 2; c < 2 + DAYS_TO_SHOW; c++) {
        const td = document.createElement("td");
        const val = (rows[r][c] || "").trim();

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

function isToday(dateStr) {
  const today = new Date();
  const d = today.getDate().toString().padStart(2, "0");
  const m = (today.getMonth() + 1).toString().padStart(2, "0");
  const y = today.getFullYear();
  const todayStr = `${d}.${m}.${y}`;
  return dateStr.trim() === todayStr;
}

// Запуск
loadSchedule();