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

    // Вычисляем индекс сегодняшнего дня в данных
    const today = new Date();
    today.setHours(0,0,0,0);
    let todayIndex = 2; // по умолчанию первый день
    for (let i = 2; i < rows[0].length; i++) {
      const [d, m, y] = rows[0][i].split(".");
      const dt = new Date(`${y}-${m}-${d}`);
      if (dt.getTime() === today.getTime()) {
        todayIndex = i;
        break;
      }
    }

    // Показываем 7 дней вокруг сегодняшнего дня
    const startCol = Math.max(2, todayIndex - 3);
    const endCol = startCol + 7;

    // Заголовки
    for (let i = startCol; i < Math.min(endCol, rows[0].length); i++) {
      const thDate = document.createElement("th");
      thDate.textContent = rows[0][i];
      if (i === todayIndex) thDate.classList.add("today");
      theadDates.appendChild(thDate);

      const thDay = document.createElement("th");
      thDay.textContent = rows[1][i];
      if (i === todayIndex) thDay.classList.add("today");
      theadDays.appendChild(thDay);
    }

    // Тело таблицы
    for (let r = 2; r < rows.length; r++) {
      const tr = document.createElement("tr");
      if (rows[r][0].toLowerCase().includes("раздел")) tr.classList.add("section-row");

      // Имя — зафиксировано
      const tdName = document.createElement("td");
      tdName.textContent = rows[r][0] || "";
      tdName.classList.add("sticky-col");
      tr.appendChild(tdName);

      // Остальные 7 дней
      for (let c = startCol; c < Math.min(endCol, rows[r].length); c++) {
        const td = document.createElement("td");
        const val = (rows[r][c] || "").trim();
        td.textContent = val;

        if (val === "1") td.classList.add("shift-1");
        if (val === "0") td.classList.add("shift-0");
        if (val === "О") td.classList.add("shift-O");
        if (val === "Б") td.classList.add("shift-Б");

        if (c === todayIndex) td.classList.add("today");
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
  } catch (err) {
    console.error("Ошибка загрузки расписания:", err);
  }
}

loadSchedule();