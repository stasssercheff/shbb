const table = document.getElementById("edit-schedule").tBodies[0] || document.getElementById("edit-schedule");
const classes = { "1":"cell-1","0":"cell-0","ВЗ":"cell-ВЗ","Б":"cell-Б" };
const states = ["1","0","О","Б"];

function getMonday(d){
  d = new Date(d);
  const day = d.getDay();
  const diff = d.getDate() - day + (day===0?-6:1);
  return new Date(d.setDate(diff));
}

const startDate = getMonday(new Date());
const daysToShow = 60; // можно увеличить
const headerDates = document.getElementById("header-dates");
const headerDays = document.getElementById("header-days");

for(let i=0;i<daysToShow;i++){
  let d = new Date(startDate); d.setDate(d.getDate()+i);
  let thDate = document.createElement("th");
  thDate.textContent = d.toLocaleDateString("ru-RU",{day:"2-digit",month:"2-digit"});
  headerDates.appendChild(thDate);

  let thDay = document.createElement("th");
  thDay.textContent = d.toLocaleDateString("ru-RU",{weekday:"short"});
  headerDays.appendChild(thDay);
}

// Загружаем данные из JSON
fetch('../data/schedule.json')
  .then(res => res.json())
  .then(data => renderTable(data));

let savedData = {};

function renderTable(data){
  savedData = JSON.parse(JSON.stringify(data));
  for(let section in data){
    const secRow = table.insertRow();
    const secCell = secRow.insertCell();
    secCell.colSpan = daysToShow+1;
    secCell.textContent = section;
    secRow.classList.add("separator");

    const staff = data[section];
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
        cell.dataset.section = section;
        cell.dataset.name = name;
        cell.dataset.index = i;

        // клик для редактирования
        cell.addEventListener("click", e=>{
          let current = e.target.textContent.trim();
          let next = states[(states.indexOf(current)+1)%states.length];
          e.target.textContent = next;
          e.target.className = classes[next]||"";
          savedData[section][name][i % days.length] = next;
        });
      }
    }
  }
}

// Кнопка для скачивания JSON
document.getElementById("export-json").addEventListener("click", ()=>{
  const blob = new Blob([JSON.stringify(savedData,null,2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "schedule.json";
  a.click();
  URL.revokeObjectURL(url);
});