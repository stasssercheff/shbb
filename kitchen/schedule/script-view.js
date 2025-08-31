const table = document.getElementById("schedule");
const tbody = table.querySelector("tbody");
const classes = { "1":"shift-1","0":"shift-0","О":"shift-O","Б":"shift-Б" };

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

// Создаем заголовки
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

// Функция получения значения с учетом исключений
function getCellValue(section, name, dateIndex) {
  let val = scheduleData[section][name][dateIndex % scheduleData[section][name].length];
  const d = new Date(startDate);
  d.setDate(d.getDate()+dateIndex);
  const dateStr = d.toISOString().split('T')[0];

  if(extensions[section] && extensions[section][name] && extensions[section][name][dateStr] !== undefined){
    val = extensions[section][name][dateStr];
  }
  return val;
}

// Рендер таблицы
function renderTable(){
  for(let section in scheduleData){
    const staff = scheduleData[section];
    for(let name in staff){
      const row = tbody.insertRow();
      const nameCell = row.insertCell();
      nameCell.textContent = name;
      nameCell.classList.add("sticky-col");

      for(let i=0;i<daysToShow;i++){
        const cell = row.insertCell();
        const val = getCellValue(section, name, i);
        cell.textContent = val;
        cell.className = classes[val]||"";

        const d = new Date(startDate);
        d.setDate(d.getDate()+i);
        d.setHours(0,0,0,0);
        if(d.getTime() === today.getTime()) cell.classList.add("today");
      }
    }

    // Разделитель между подразделениями
    const sepRow = tbody.insertRow();
    const sepCell = sepRow.insertCell();
    sepCell.colSpan = daysToShow+1;
    sepCell.classList.add("separator");
  }
}

renderTable();