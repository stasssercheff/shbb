const table = document.getElementById("schedule-editor").querySelector("tbody");
const headerDates = document.getElementById("header-dates");
const headerDays = document.getElementById("header-days");

const classes = { "1":"shift-1","0":"shift-0","О":"shift-O","Б":"shift-Б" };
const states = ["1","0","О","Б"];
const today = new Date();
today.setHours(0,0,0,0);

function getMonday(d){
  d = new Date(d);
  const day = d.getDay();
  const diff = d.getDate() - day + (day===0?-6:1);
  return new Date(d.setDate(diff));
}

const startDate = getMonday(new Date());
const daysToShow = 60;
let data = {};

// Заголовки дат и дней
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

// Загружаем данные JSON
fetch('../data/schedule.json')
  .then(res => res.json())
  .then(json => {
    data = JSON.parse(JSON.stringify(json)); // клонируем объект
    renderTable(data);
  });

function renderTable(dataObj){
  for(let section in dataObj){
    if(section === "exceptions") continue; // исключения не рендерим

    // строка-разделитель
    const secRow = table.insertRow();
    const secCell = secRow.insertCell();
    secCell.colSpan = daysToShow+1;
    secRow.classList.add("section-row");

    const staff = dataObj[section];
    for(let name in staff){
      const row = table.insertRow();
      const nameCell = row.insertCell();
      nameCell.textContent = name;
      nameCell.classList.add("sticky-col");

      const days = staff[name];
      for(let i=0;i<daysToShow;i++){
        const val = days[i % days.length];
        const cell = row.insertCell();
        cell.textContent = val;
        cell.className = classes[val]||"";

        // подсветка сегодня
        const d = new Date(startDate);
        d.setDate(d.getDate()+i);
        d.setHours(0,0,0,0);
        if(d.getTime() === today.getTime()) cell.classList.add("today");

        // редактируемость
        cell.contentEditable = true;
        cell.addEventListener("input", e=>{
          const newVal = e.target.textContent.trim();
          if(states.includes(newVal)){
            days[i % days.length] = newVal;
            e.target.className = classes[newVal]||"";
          }
        });
      }
    }
  }
}

// Сохранение JSON
document.getElementById("save-json").addEventListener("click", ()=>{
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "schedule.json";
  a.click();
  URL.revokeObjectURL(url);
});