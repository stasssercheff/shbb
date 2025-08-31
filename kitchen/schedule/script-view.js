const table = document.getElementById("schedule");
const tbody = table.querySelector("tbody");
const classes = { "1":"shift-1","0":"shift-0","O":"shift-O","Б":"shift-Б" };

function getMonday(d){
  d = new Date(d);
  const day = d.getDay();
  const diff = d.getDate() - day + (day===0?-6:1);
  return new Date(d.setDate(diff));
}

const startDate = getMonday(new Date("2025-08-31")); // Начало с понедельника
const daysToShow = 60;
const headerDates = document.getElementById("header-dates");
const headerDays = document.getElementById("header-days");

const today = new Date();
today.setHours(0,0,0,0);

fetch('../data/schedule.json')
  .then(res => res.json())
  .then(data => renderTable(data));

function renderTable(data){
  for(let section in data){
    if(section === "exceptions") continue; // исключения не рендерим строкой
    const staff = data[section];
    for(let name in staff){
      const row = tbody.insertRow();
      const nameCell = row.insertCell();
      nameCell.textContent = name;
      nameCell.classList.add("sticky-col");
      nameCell.style.maxWidth = "80px"; 
      nameCell.style.whiteSpace = "nowrap";
      nameCell.style.overflow = "hidden";
      nameCell.style.textOverflow = "ellipsis";

      const days = staff[name];
      for(let i=0;i<daysToShow;i++){
        const val = days[i % days.length];
        const cell = row.insertCell();
        cell.textContent = val;
        cell.className = classes[val] || "";

        // Подсветка сегодня
        const d = new Date(startDate);
        d.setDate(d.getDate()+i);
        d.setHours(0,0,0,0);
        if(d.getTime() === today.getTime()) cell.classList.add("today");

        // Применяем исключения, если есть
        if(typeof extensions !== "undefined"){
          if(extensions[section] && extensions[section][name]){
            const key = d.toISOString().split("T")[0];
            if(extensions[section][name][key]){
              cell.textContent = extensions[section][name][key];
              cell.className = classes[extensions[section][name][key]] || "";
            }
          }
        }
      }
    }
  }
}