const staffSections = {
  "Шеф": [{ name: "Стас", role: "chef" }],
  "Кухня": [
    { name: "Максим", role: "cook" },
    { name: "Мигель", role: "cook" },
    { name: "Шавкат", role: "cook" }
  ],
  "Кондитеры": [
    { name: "Тимофей", role: "cook" },
    { name: "Ирина", role: "cook" }
  ]
};

const patterns = { chef: [1,1,1,1,1,0,0], cook: [1,1,1,1,0,0] };
const classes = { "1":"cell-1","0":"cell-0","О":"cell-O","Б":"cell-B" };
const table = document.getElementById("schedule");
const tbody = table.querySelector("tbody");

// Получаем данные из localStorage или создаём пустой объект
const saved = JSON.parse(localStorage.getItem("scheduleData") || "{}");

function getMonday(d){
  d = new Date(d);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

const startDate = getMonday(new Date());
const daysToShow = 365; // вечный график

// Заголовки
const headerDates = document.getElementById("header-dates");
const headerDays = document.getElementById("header-days");

for(let i=0;i<daysToShow;i++){
  let d=new Date(startDate);
  d.setDate(d.getDate()+i);
  const dateStr=d.toLocaleDateString("ru-RU",{day:"2-digit",month:"2-digit"});
  const dayStr=d.toLocaleDateString("ru-RU",{weekday:"short"});

  let thDate=document.createElement("th"); thDate.textContent=dateStr; headerDates.appendChild(thDate);
  let thDay=document.createElement("th"); thDay.textContent=dayStr; headerDays.appendChild(thDay);
}

// Добавляем сотрудников
for(let section in staffSections){
  const secRow = tbody.insertRow();
  const secCell = secRow.insertCell();
  secCell.colSpan = daysToShow+1;
  secCell.textContent = section;
  secRow.classList.add("separator");

  staffSections[section].forEach(person=>{
    const row = tbody.insertRow();
    const nameCell = row.insertCell();
    nameCell.textContent = person.name;
    nameCell.classList.add("sticky-col");

    for(let i=0;i<daysToShow;i++){
      const pattern = patterns[person.role];
      const base = pattern[i%pattern.length].toString();
      const cell = row.insertCell();
      const key = `${person.name}-${i}`;
      let value = saved[key] || base;
      cell.textContent=value;
      updateCellClass(cell,value);
    }
  });
}

function updateCellClass(cell,value){ cell.className=classes[value]||""; }
// **клики по ячейкам отключены**, просмотр только