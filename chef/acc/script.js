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

// Показываем текущую дату
document.getElementById("current-date").textContent = new Date().toLocaleDateString("ru-RU");

// Загружаем график из Google Sheets
async function loadSchedule() {
  const resp = await fetch(CSV_URL);
  const text = await resp.text();
  const rows = text.trim().split("\n").map(r => r.split(","));
  csvData = rows;

  const tableBody = document.getElementById("schedule").querySelector("tbody");
  tableBody.innerHTML = "";

  rows.forEach((row, rIdx) => {
    const tr = document.createElement("tr");
    row.forEach((cell, cIdx) => {
      const td = document.createElement("td");
      td.textContent = cell.trim();

      // Подсветка смен
      if (rIdx > 1) { 
        if (cell === "1") td.classList.add("shift-1");
        if (cell === "0") td.classList.add("shift-0");
        if (cell === "VR") td.classList.add("shift-VR");
        if (cell === "Б") td.classList.add("shift-Б");
      }

      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });
}

// Рассчет зарплаты за выбранный период (прошедший)
function calculateSalary(periodStart, periodEnd) {
  const summary = {};
  for (let r = 2; r < csvData.length; r++) {
    const dateParts = csvData[r][0].split(".");
    if (dateParts.length < 3) continue;
    const date = new Date(+dateParts[2], dateParts[1]-1, +dateParts[0]);

    if (date >= periodStart && date <= periodEnd) {
      for (let c = 1; c < csvData[r].length; c++) {
        const worker = csvData[1][c].trim();
        if (!employees[worker]) continue;
        const val = csvData[r][c].trim();
        if (val === "1") {
          if (!summary[worker]) summary[worker] = { shifts: 0, rate: employees[worker].rate, total: 0 };
          summary[worker].shifts++;
          summary[worker].total += employees[worker].rate;
        }
      }
    }
  }
  return summary;
}

// Формируем текст ЗП
function formatSalaryMessage(periodStart, periodEnd, summary) {
  let message = `ЗП за период ${String(periodStart.getDate()).padStart(2,'0')}.${String(periodStart.getMonth()+1).padStart(2,'0')} - ${String(periodEnd.getDate()).padStart(2,'0')}.${String(periodEnd.getMonth()+1).padStart(2,'0')}\n\n`;
  let total = 0;
  for (let worker in summary) {
    const info = summary[worker];
    message += `${worker} (${employees[worker].position})\n`;
    message += `количество смен: ${info.shifts}\n`;
    message += `ставка: ${info.rate}\n`;
    message += `к выплате: ${info.total}\n\n`;
    total += info.total;
  }
  message += `Итого к выплате: ${total}`;
  return message;
}

// Генерация PNG через html2canvas (только таблица графика)
function generateScheduleImage() {
  const container = document.getElementById("schedule");
  html2canvas(container, { scale: 2 }).then(canvas => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "schedule.png";
    link.click();
  });
}

// Отправка Telegram + Email
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
        subject: "ЗП за период",
        from_name: "SHBB Payroll",
        reply_to: "no-reply@shbb.com",
        message: msg
      })
    });

    alert('✅ ЗП отправлено!');
  } catch(err) {
    alert('❌ Ошибка отправки: ' + err.message);
    console.error(err);
  }
}

// Определяем предыдущий период
function getPreviousPeriod(periodVal) {
  const now = new Date();
  let start, end;

  if (periodVal === "1-15") {
    const prevMonth = new Date(now.getFullYear(), now.getMonth()-1, 1);
    start = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1);
    end = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 15);
  } else {
    const prevMonth = new Date(now.getFullYear(), now.getMonth()-1, 1);
    start = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 16);
    end = new Date(prevMonth.getFullYear(), prevMonth.getMonth() +1, 0);
  }
  return [start, end];
}

// Обработчики кнопок
document.addEventListener("DOMContentLoaded", () => {
  loadSchedule();

  document.getElementById("generateBtn"
