const daysToShow = 10;
const today = new Date();
let currentLang = "ru";

const translations = {
  ru: {
    back: "◀ Назад",
    home: "🏠 Главная",
    chef: "Шеф",
    kitchen: "Кухня",
    desserts: "Десерты",
    dow: ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"]
  },
  en: {
    back: "◀ Back",
    home: "🏠 Home",
    chef: "Chef",
    kitchen: "Kitchen",
    desserts: "Desserts",
    dow: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
  }
};

function getDates() {
  const dates = [];
  for (let i = 0; i < daysToShow; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function generateShifts(pattern, days) {
  const result = [];
  let idx = 0;
  for (let i = 0; i < days; i++) {
    result.push(pattern[idx]);
    idx = (idx + 1) % pattern.length;
  }
  return result;
}

function generateChefSchedule(days) {
  const shifts = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dow = d.getDay(); // 0-вс, 6-сб
    shifts.push(dow === 0 || dow === 6 ? 0 : 1);
  }
  return shifts;
}

function generateKitchenSchedules(names, days) {
  const schedules = {};
  names.forEach((name, i) => {
    const pattern = [1,1,1,1,0,0];
    const rotated = pattern.slice(i*2).concat(pattern.slice(0,i*2));
    schedules[name] = generateShifts(rotated, days);
  });
  return schedules;
}

function buildTable() {
  const table = document.getElementById("schedule-table");
  table.innerHTML = "";
  const dates = getDates();
  const t = translations[currentLang];

  const sections = [
    { name: t.chef, people: { "Стас": generateChefSchedule(daysToShow) } },
    { name: t.kitchen, people: generateKitchenSchedules(["Максим","Мигель","Шавкат"], daysToShow) },
    { name: t.desserts, people: { "Максим": [], "Тимофей": [], "Ирина": [] } }
  ];

  let thead = "<thead><tr><th class='name-col'>"+ (currentLang==="ru"?"Имя":"Name") +"</th>";
  dates.forEach(d => {
    const isToday = d.toDateString() === today.toDateString() ? "today" : "";
    thead += `<th class="${isToday}">${d.getDate()}.${d.getMonth()+1}</th>`;
  });
  thead += "</tr><tr><th class='name-col'></th>";
  dates.forEach(d => {
    const isToday = d.toDateString() === today.toDateString() ? "today" : "";
    thead += `<th class="${isToday}">${t.dow[d.getDay()]}</th>`;
  });
  thead += "</tr></thead>";

  let tbody = "<tbody>";
  sections.forEach(sec => {
    tbody += `<tr class="section-row"><td class="name-col" colspan="${daysToShow+1}">${sec.name}</td></tr>`;
    for (const [person, shifts] of Object.entries(sec.people)) {
      let row = `<tr><td class="name-col">${person}</td>`;
      if (shifts.length === 0) {
        for (let i=0;i<daysToShow;i++) row += "<td></td>";
      } else {
        shifts.forEach((s, idx) => {
          const d = dates[idx];
          const isToday = d.toDateString() === today.toDateString() ? "today" : "";
          row += `<td class="${s ? "shift-yes" : "shift-no"} ${isToday}">${s}</td>`;
        });
      }
      row += "</tr>";
      tbody += row;
    }
  });
  tbody += "</tbody>";

  table.innerHTML = thead + tbody;
}

function initButtons() {
  document.getElementById("btn-back").onclick = () => window.history.back();
  document.getElementById("btn-home").onclick = () => window.location.href = "/index.html";
  document.querySelectorAll(".lang-switch button").forEach(btn => {
    btn.onclick = () => {
      currentLang = btn.dataset.lang;
      document.getElementById("btn-back").textContent = translations[currentLang].back;
      document.getElementById("btn-home").textContent = translations[currentLang].home;
      buildTable();
    };
  });
}

initButtons();
buildTable();