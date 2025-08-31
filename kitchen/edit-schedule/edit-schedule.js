const table = document.getElementById("schedule");
const tbody = table.querySelector("tbody");

fetch('../data/schedule.json')
  .then(res => res.json())
  .then(data => renderEditorTable(data));

function renderEditorTable(data){
  tbody.innerHTML = "";
  for(let section in data){
    if(section === "exceptions") continue;
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
      for(let i=0;i<60;i++){
        const val = days[i % days.length];
        const cell = row.insertCell();
        cell.textContent = val;
        cell.className = { "1":"shift-1","0":"shift-0","O":"shift-O","Б":"shift-Б" }[val]||"";

        // применяем исключения
        if(typeof extensions !== "undefined"){
          if(extensions[section] && extensions[section][name]){
            const key = new Date(new Date("2025-08-31").setDate(new Date("2025-08-31").getDate()+i)).toISOString().split("T")[0];
            if(extensions[section][name][key]){
              cell.textContent = extensions[section][name][key];
              cell.className = { "1":"shift-1","0":"shift-0","O":"shift-O","Б":"shift-Б" }[extensions[section][name][key]]||"";
            }
          }
        }

        cell.contentEditable = "true";
        cell.addEventListener("input", ()=>updateCode(section,name,i,cell));
      }
    }
  }
  updateCodeArea();
}

let tempExtensions = {};

function updateCode(section,name,i,cell){
  const key = new Date(new Date("2025-08-31").setDate(new Date("2025-08-31").getDate()+i)).toISOString().split("T")[0];
  if(!tempExtensions[section]) tempExtensions[section]={};
  if(!tempExtensions[section][name]) tempExtensions[section][name]={};
  tempExtensions[section][name][key] = cell.textContent;
  updateCodeArea();
}

function updateCodeArea(){
  document.getElementById("code-area").value = "const extensions = " + JSON.stringify(tempExtensions, null, 2) + ";";
}

document.getElementById("copy-btn").addEventListener("click", ()=>{
  const code = document.getElementById("code-area");
  code.select();
  document.execCommand("copy");
});