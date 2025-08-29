const daysToShow = 10; // можно увеличить до 14
let currentLang = "ru";

const names = {
  chef: ["Стас"],
  pastry: ["Максим", "Тимофей", "Ирина"],
  kitchen: ["Максим", "Мигель", "Шавкат"]
};

function setLanguage(lang) {
  currentLang = lang;
  document.querySelectorAll("[data-ru]").forEach(el => {
    el.textContent = el.getAttribute(`data-${lang}`);
  });
  buildSchedule();
}

function getMonday(d) {
  d = new Date(d);
  const day = d.getDay(); // 0-вс, 1-пн ...
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function getDates() {
  const dates = [];
  let start = getMonday(new Date());
  for (let i = 0; i < daysToShow; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function buildSchedule() {
  const dates = getDates();
  const dateRow = document.getElementById("date-row");
  const dayRow = document.getElementById("day-row");
  const body = document.getElementById("schedule-body");

  // очищаем
  dateRow.innerHTML = `<th class="name-col" data-ru="Имя" data-en="Name">${currentLang === "ru" ? "Имя" : "Name"}</th>`;
  dayRow.innerHTML = `<th class="name-col" data-ru="День" data-en="Day">${currentLang === "ru" ? "День" : "Day"}</th>`;
  body.innerHTML = "";

  // даты и дни недели
  dates.forEach(d => {
    const day = d.toLocaleDateString(currentLang, { weekday: "short" });
    const dateStr = d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();

    const thDate = document.createElement("th");
    thDate.textContent = dateStr;
    if (isToday) thDate.classList.add("today");
    dateRow.appendChild(thDate);

    const thDay = document.createElement("th");
    thDay.textContent = day;
    if (isToday) thDay.classList.add("today");
    dayRow.appendChild(thDay);
  });

  // вставляем данные по секциям
  buildSection("Шеф", names.chef, dates, body);
  buildSection("Кухня", names.kitchen, dates, body);
  buildSection("Десерты", names.pastry, dates, body);
}

function buildSection(title, people, dates, body) {
  const sectionRow = document.createElement("tr");
  sectionRow.classList.add("section-row");
  const td = document.createElement("td");
  td.colSpan = dates.length + 1;
  td.textContent = title;
  sectionRow.appendChild(td);
  body.appendChild(sectionRow);

  people.forEach((name, idx) => {
    const row = document.createElement("tr");
    const tdName = document.createElement("td");
    tdName.classList.add("name-col");
    tdName.textContent = name;
    row.appendChild(tdName);

    dates.forEach((d, i) => {
      const td = document.createElement("td");
      let shift = 0;

      if (title === "Шеф") {
        // 5/2 пн-пт работа
        shift = d.getDay() >= 1 && d.getDay() <= 5 ? 1 : 0;
      } else if (title === "Кухня") {
        // 4/2 со смещением по idx
        shift = ((i + idx * 2) % 6) < 4 ? 1 : 0;
      } else if (title === "Десерты") {
        // пока заглушка
        shift = 1;
      }

      td.textContent = shift;
      td.classList.add(shift ? "shift-yes" : "shift-no");

      if (d.toDateString() === new Date().toDateString()) {
        td.classList.add("today");
      }

      row.appendChild(td);
    });

    body.appendChild(row);
  });
}

document.addEventListener("DOMContentLoaded", buildSchedule);