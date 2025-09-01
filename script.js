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

    const today = new Date();
    today.setHours(0,0,0,0);

    const csvDates = rows[0].slice(2).map(d => parseDate(d));

    // индекс для окна 7 дней с сегодня как 4-й день
    let todayIndex = csvDates.findIndex(d => d.getTime() === today.getTime());
    if(todayIndex === -1) todayIndex = 0; // если сегодня раньше 01.09
    let startIndex = todayIndex - 3;
    if(startIndex < 0) startIndex = 0;
    let endIndex = startIndex + 7;
    if(endIndex > csvDates.length) {
      endIndex = csvDates.length;
      startIndex = Math.max(0, endIndex - 7);
    }

    // заголовки
    for (let i = startIndex; i < endIndex; i++) {
      const thDate = document.createElement("th");
      thDate.textContent = rows[0][i+2];
      if(csvDates[i].getTime() === today.getTime()) thDate.classList.add("today");
      theadDates.appendChild(thDate);

      const thDay = document.createElement("th");
      thDay.textContent = rows[1][i+2];
      if(csvDates[i].getTime() === today.getTime()) thDay.classList.add("today");
      theadDays.appendChild(thDay);
    }

    // тело
    for (let r=2; r<rows.length; r++) {
      const tr = document.createElement("tr");

      if(rows[r][0].toLowerCase().includes("раздел")) tr.classList.add("section-row");

      const tdName = document.createElement("td");
      tdName.textContent = rows[r][1] || rows[r][0];
      tdName.classList.add("sticky-col");
      tr.appendChild(tdName);

      for(let c=startIndex; c<endIndex; c++) {
        const td = document.createElement("td");
        const val = (rows[r][c+2] || "").trim();
        td.textContent = val;

        if(val==="1") td.classList.add("shift-1");
        if(val==="0") td.classList.add("shift-0");
        if(val==="О") td.classList.add("shift-O");
        if(val==="Б") td.classList.add("shift-Б");

        if(csvDates[c].getTime() === today.getTime()) td.classList.add("today");

        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    }

  } catch(err) {
    console.error("Ошибка загрузки CSV:", err);
  }
}

function parseDate(str){
  const [d,m,y] = str.split(".").map(Number);
  return new Date(y,m-1,d);
}

loadSchedule();