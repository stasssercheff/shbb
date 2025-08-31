const table = document.getElementById("schedule");
const tbody = table.querySelector("tbody");
const classes = { "1":"shift-1","0":"shift-0","О":"shift-O","Б":"shift-Б" };

function getMonday(d){
  d = new Date(d);
  const day = d.getDay();
  const diff = d.getDate() - day + (day===0?-6:1);
  return new Date(d.setDate(diff));
}

// Вечный график ±30 дней назад и 60 вперёд
const startDate = new Date();
startDate.setDate(startDate.getDate()-30);
const daysToShow = 90;

const headerDates = document.getElementById("header-dates");
const headerDays = document.getElementById("header-days");

const today = new Date();
today.setHours(0,0,0,0);

// Заголовки
for(let i=0;i<daysToShow;i++){
  const d = new Date(startDate);
  d.setDate(d.getDate()+i);

  const dateStr = d.toLocaleDateString("ru-RU",{day:"2-digit",month:"2-digit"});
  const dayStr = d.toLocaleDateString("ru-RU",{weekday:"short"});

  const thDate = document.createElement("th");
  thDate.textContent = dateStr;
  if(d.getTime() === today.getTime()) thDate.classList.add("today");
  headerDates.appendChild(thDate);

  const thDay = document.createElement("th");
  thDay.textContent = dayStr;
  if(d.getTime() === today.getTime()) thDay.classList.add("today");
  headerDays.appendChild(thDay);
}

// Данные из JSON
fetch('../data/schedule.json')
  .then(res => res.json())
  .then(data => renderTable(data));

function renderTable(data){
  for(const section in data){
    const staff = data[section];
    for(const name in staff){
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