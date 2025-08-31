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
    data = JSON.parse(JSON.stringify(json));
    renderTable(data);
  });

function renderTable(dataObj){
  for(let section in dataObj){
    if(section === "exceptions") continue;

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

        const d = new Date(startDate);
        d.setDate(d.getDate()+i);
        d.setHours(0,0,0,0);
        if(d.getTime() === today.getTime()) cell.classList.add("today");

        cell.contentEditable = true;
        cell.addEventListener("input", e=>{
          const newVal = e.target.textContent.trim();
          if(states.includes(newVal)){
            days[i % days.length] = newVal;
            e.target.className = classes[newVal]||"";
            updateExtensionsCode();
          }
        });
      }
    }
  }

  const extTextarea = document.getElementById("extensions-code");

  function updateExtensionsCode() {
    const ext = {};
    for(let section in data){
      if(section==="exceptions") continue;
      ext[section]={};
      const staff = data[section];
      for(let name in staff){
        const row = [...table.rows].find(r=>r.cells[0].textContent.trim()===name);
        if(!row) continue;
        const daysObj = {};
        for(let i=0;i<daysToShow;i++){
          const val = row.cells[i+1].textContent.trim();
          if(val!==staff[name][i % staff[name].length]){
            const date = new Date(startDate);
            date.setDate(date.getDate()+i);
            const dateStr = date.toISOString().split("T")[0];
            daysObj[dateStr]=val;
          }
        }
        if(Object.keys(daysObj).length) ext[section][name]=daysObj;
      }
    }
    extTextarea.value = "const extensions = " + JSON.stringify(ext,null,2) + ";";
  }

  table.addEventListener("input", updateExtensionsCode);
  document.getElementById("copy-extensions").addEventListener("click", ()=>{
    extTextarea.select();
    document.execCommand("copy");
  });

  updateExtensionsCode();
}