const table = document.getElementById("schedule");
const tbody = table.querySelector("tbody");
const headerDates = document.getElementById("header-dates");
const headerDays = document.getElementById("header-days");

const classes = { "1":"shift-1", "0":"shift-0", "О":"shift-O", "Б":"shift-Б" };
const today = new Date();
today.setHours(0,0,0,0);

function getMonday(d) {
  d = new Date(d);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

const startDate = getMonday(new Date("2025-08-31"));
const daysToShow = 60; // вечный график

// Заголовки
for(let i=0;i<daysToShow;i++){
  let d = new Date(startDate);
  d.setDate(d.getDate()+i);

  const dateStr = d.toLocaleDateString("ru-RU",{day:"2-digit",month:"2-digit"});
  const dayStr = d.toLocaleDateString("ru-RU",{weekday:"short"});

  let thDate = document.createElement("th");
  thDate.textContent = dateStr;
  if(d.getTime() === today.getTime()) thDate.classList.add("today");
  headerDates.appendChild(thDate);

  let thDay = document.createElement("th");
  thDay.textContent = dayStr;
  if(d.getTime() === today.getTime()) thDay.classList.add("today");
  headerDays.appendChild(thDay);
}

// Загрузка JSON
fetch('../data/schedule.json')
  .then(res => res.json())
  .then(data => renderTable(data));

function renderTable(data) {
  for(let section in data){
    const secRow = tbody.insertRow();
    const secCell = secRow.insertCell();
    secCell.colSpan = daysToShow+1;
    secCell.textContent = section;
    secRow.classList.add("separator");

    const staff = data[section];
    for(let name in staff){
      const row = tbody.insertRow();
      const nameCell = row.insertCell();
      nameCell.textContent = name;
      nameCell.classList.add("sticky-col");

      const days = staff[name];
      for(let i=0;i<daysToShow;i++){
        const val = days[i % days.length];
        const cell = row.insertCell();
        cell.textContent = val;
        cell.className = classes[val]||"";

        const d = new Date(startDate);
        d.setDate(d.getDate()+i);
        d.setHours(0,0,0,0);
        if(d.getTime() === today.getTime()) cell.classList.add("today");
      }
    }
  }
}