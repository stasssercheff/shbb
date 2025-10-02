const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSpNWtZImdMKoOxbV6McfEXEB67ck7nzA1EcBXNOFdnDTK4o9gniAuz82paEdGAyRSlo6dFKO9zCyLP/pub?gid=0&single=true&output=csv";

const employees = {
  "Стас": { position: "Шеф", rate: 1300 },
  "Максим": { position: "Повар", rate: 650 },
  "Борис": { position: "Повар", rate: 600 },
  "Повар (без имени)": { position: "Повар", rate: 600 },
  "Ирина": { position: "Кондитер", rate: 650 },
  "Тимофей": { position: "Кондитер", rate: 650 }
};

let csvData = [];

document.getElementById("current-date").textContent = new Date().toLocaleDateString("ru-RU");

async function loadSchedule() {
  const resp = await fetch(CSV_URL);
  const text = await resp.text();
  csvData = text.trim().split("\n").map(r => r.split(","));
}

function getPeriodDates(periodVal) {
  const now = new Date();
  let start, end;
  if (periodVal === "1-15") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth(), 15);
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 16);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }
  return { start, end };
}

function buildTable(periodStart, periodEnd) {
  const header = document.getElementById("tableHeader");
  const body = document.getElementById("tableBody");
  header.innerHTML = "";
  body.innerHTML = "";

  if (!csvData.length) return;

  // Заголовок
  const dateHeader = document.createElement("th");
  dateHeader.textContent = "Дата";
  header.appendChild(dateHeader);

  const workers = Object.keys(employees);
  workers.forEach(w => {
    const th = document.createElement("th");
    th.textContent = w;
    header.appendChild(th);
  });

  // Строки
  for (let r = 2; r < csvData.length; r++) {
    const dateParts = csvData[r][0].split(".");
    if (dateParts.length < 3) continue;
    const date = new Date(+dateParts[2], dateParts[1]-1, +dateParts[0]);
    if (date < periodStart || date > periodEnd) continue;

    const tr = document.createElement("tr");
    const tdDate = document.createElement("td");
    tdDate.textContent = csvData[r][0];
    tr.appendChild(tdDate);

    workers.forEach(w => {
      const td = document.createElement("td");
      const idx = csvData[1].indexOf(w);
      const val = idx >= 0 ? csvData[r][idx].trim() : "";
      td.textContent = val;
      if (val === "1") td.classList.add("shift-1");
      if (val === "0") td.classList.add("shift-0");
      if (val === "VR") td.classList.add("shift-VR");
      if (val === "Б") td.classList.add("shift-Б");
      tr.appendChild(td);
    });

    body.appendChild(tr);
  }
}

function calculateZA(periodStart, periodEnd) {
  const summary = {};
  const workers = Object.keys(employees);
  workers.forEach(w => summary[w] = { shifts: 0, rate: employees[w].rate, total: 0 });

  for (let r = 2; r < csvData.length; r++) {
    const dateParts = csvData[r][0].split(".");
    if (dateParts.length < 3) continue;
    const date = new Date(+dateParts[2], dateParts[1]-1, +dateParts[0]);
    if (date < periodStart || date > periodEnd) continue;

    workers.forEach(w => {
      const idx = csvData[1].indexOf(w);
      if (idx < 0) return;
      const val = csvData[r][idx].trim();
      if (val === "1") {
        summary[w].shifts += 1;
        summary[w].total += employees[w].rate;
      }
    });
  }

  let msg = `ЗА за период ${periodStart.getDate()}.${periodStart.getMonth()+1} - ${periodEnd.getDate()}.${periodEnd.getMonth()+1}\n\n`;
  let totalAll = 0;
  workers.forEach(w => {
    const s = summary[w];
    msg += `${w} (${employees[w].position})\n`;
    msg += `количество смен: ${s.shifts}\n`;
    msg += `ставка: ${s.rate}\n`;
    msg += `к выплате: ${s.total}\n\n`;
    totalAll += s.total;
  });
  msg += `Итого к выплате: ${totalAll}`;
  return msg;
}

function showZA() {
  const periodVal = document.getElementById("periodSelect").value;
  const { start, end } = getPeriodDates(periodVal);
  buildTable(start, end);
  const msg = calculateZA(start, end);
  document.getElementById("salarySummary").textContent = msg;
}

function generateSalaryImage() {
  const container = document.querySelector(".table-container");
  html2canvas(container).then(canvas => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "salary.png";
    link.click();
  });
}

async function sendSalaryMessage() {
  const chat_id = '-1003149716465';
  const worker_url = 'https://shbb1.stassser.workers.dev/';
  const accessKey = "14d92358-9b7a-4e16-b2a7-35e9ed71de43";

  const msg = document.getElementById("salarySummary").textContent;

  try {
    // Telegram
    await fetch(worker_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id, text: msg })
    });

    // Email через Web3Forms
    await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        subject: "ЗА за период",
        from_name: "SHBB Payroll",
        reply_to: "no-reply@shbb.com",
        message: msg
      })
    });

    alert('✅ ЗА отправлено!');
  } catch(err) {
    alert('❌ Ошибка отправки: ' + err.message);
    console.error(err);
  }
}

document.getElementById("
