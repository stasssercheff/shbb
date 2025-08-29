const table = document.getElementById("edit-schedule");
const tbody = table.querySelector("tbody");
const classes = { "1":"cell-1","0":"cell-0","О":"cell-O","Б":"cell-B" };
const states = ["1","0","О","Б"];

function getMonday(d){
  d=new Date(d); const day=d.getDay(); const diff=d.getDate()-day+(day===0?-6:1);
  return new Date(d.setDate(diff));
}

const startDate = getMonday(new Date());
const daysToShow = 365;
const headerDates = document.getElementById("edit-header-dates");
const headerDays = document.getElementById("edit-header-days");

for(let i=0;i<daysToShow;i++){
  let d=new Date(startDate); d.setDate(d.getDate()+i);
  let dateStr=d.toLocaleDateString("ru-RU",{day:"2-digit",month:"2-digit"});
  let dayStr=d.toLocaleDateString("ru-RU",{weekday:"short"});
  let thDate=document.createElement("th"); thDate.textContent=dateStr; headerDates.appendChild(thDate);
  let thDay=document.createElement("th"); thDay.textContent=dayStr; headerDays.appendChild(thDay);
}

// Загружаем данные
fetch('../data/schedule.json')
  .then(res => res.json())
  .then(data => renderEditableTable(data));

function renderEditableTable(data){
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
        cell.setAttribute("data-key", `${section}|${name}|${i}`);
      }
    }
  }
}

// Переключение ячеек
table.addEventListener("click", e=>{
  const cell = e.target;
  if(cell.cellIndex===0||cell.parentNode.classList.contains("separator")) return;
  let current = cell.textContent.trim();
  let next = states[(states.indexOf(current)+1)%states.length];
  cell.textContent = next;
  cell.className = classes[next]||"";
});

// Кнопка скачать JSON
document.getElementById("save-btn").addEventListener("click", ()=>{
  const newData = {};
  tbody.querySelectorAll("tr").forEach((row)=>{
    if(row.classList.contains("separator")) return;
    const sectionCell = row.previousElementSibling.firstChild.textContent;
    if(!newData[sectionCell]) newData[sectionCell]={};
    const name = row.cells[0].textContent;
    newData[sectionCell][name] = Array.from(row.cells).slice(1).map(td=>td.textContent);
  });

  const blob = new Blob([JSON.stringify(newData,null,2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href =