let scheduleData = {};

async function loadData() {
  const res = await fetch("../Data/schedule.json");
  scheduleData = await res.json();

  const sectionSelect = document.getElementById("sectionSelect");
  sectionSelect.innerHTML = "";

  for (const section in scheduleData) {
    if (section === "exceptions") continue;
    const opt = document.createElement("option");
    opt.value = section;
    opt.textContent = section;
    sectionSelect.appendChild(opt);
  }

  updateNameSelect();
}

function updateNameSelect() {
  const section = document.getElementById("sectionSelect").value;
  const nameSelect = document.getElementById("nameSelect");
  nameSelect.innerHTML = "";

  for (const name in scheduleData[section]) {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    nameSelect.appendChild(opt);
  }
}

function addException() {
  const date = document.getElementById("dateInput").value;
  const section = document.getElementById("sectionSelect").value;
  const name = document.getElementById("nameSelect").value;
  const value = document.getElementById("valueSelect").value;

  if (!date) {
    alert("Выберите дату");
    return;
  }

  if (!scheduleData.exceptions) scheduleData.exceptions = {};
  if (!scheduleData.exceptions[section]) scheduleData.exceptions[section] = {};
  if (!scheduleData.exceptions[section][name]) scheduleData.exceptions[section][name] = {};

  scheduleData.exceptions[section][name][date] = value;

  document.getElementById("output").textContent = JSON.stringify(scheduleData, null, 2);
}

function downloadJson() {
  const blob = new Blob([JSON.stringify(scheduleData, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "schedule.json";
  link.click();
}

document.getElementById("sectionSelect").addEventListener("change", updateNameSelect);

loadData();