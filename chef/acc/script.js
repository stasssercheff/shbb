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

// Показ текущей даты
document.getElementById("current-date").textContent = new Date().toLocaleDateString("ru-RU");

// Загружаем CSV и отображаем график
async function loadSchedule() {
  const resp = await fetch(CSV_URL);
  const text = await resp.text();
  const rows = text.trim().split("\n").map(r => r.split(","));
  csvData = rows;

  const table = document.getElementById("schedule").querySelector("tbody");
  table.innerHTML = "";

  rows.forEach(row => {
    const tr = document.createElement("tr");
    row.forEach(cell => {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
}

// Рассчет зарплаты
function calculateSalary(periodStart, periodEnd, selectedEmployees = null) {
  const salarySummary = {};
  for (let r = 2; r < csvData.length; r++) {
    const dateParts = csvData[r][0].split(".");
    if (dateParts.length < 3) continue;
    const date = new Date(+dateParts[2], dateParts[1]-1, +dateParts[0]);

    if (date >= periodStart && date <= periodEnd) {
      for (let c = 1; c < csvData[r].length; c++) {
        const worker = csvData[1][c].trim();
        if (!employees[worker]) continue;
        if (selectedEmployees && !selectedEmployees.includes(worker)) continue;

        const val = csvData[r][c].trim();
        if (val === "1") {
          if (!salarySummary[worker]) salarySummary[worker] = { shifts: 0, rate: employees[worker].rate, total: 0 };
          salarySummary[worker].shifts += 1;
          salarySummary[worker].total += employees[worker].rate;
        }
      }
    }
  }
  return salarySummary;
}

// Формируем текстовую сводку
function formatSalaryMessage(periodStart, periodEnd, salarySummary) {
  let message = `Период: ${periodStart.getDate()}-${periodStart.getMonth()+1} - ${periodEnd.getDate()}-${periodEnd.getMonth()+1}\n\n`;
  let totalPayment = 0;

  for (let worker in salarySummary) {
    const info = salarySummary[worker];
    message += `${worker} (${employees[worker].position})\n`;
    message += `количество смен: ${info.shifts}\n`;
    message += `ставка: ${info.rate}\n`;
    message += `к выплате: ${info.total}\n\n`;
    totalPayment += info.total;
  }

  message += `Итого к выплате: ${totalPayment}`;
  return message;
}

// Генерация PNG через html2canvas
function generateSalaryImage() {
  const container = document.getElementById("salarySummary");
  html2canvas(container).then(canvas => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "salary.png";
    link.click();
  });
}

// Отправка в Telegram и на email
async function sendSalaryMessage() {
  const chat_id = '-1003149716465'; // новый чат
  const worker_url = 'https://shbb1.stassser.workers.dev/';
  const accessKey = "14d92358-9b7a-4e16-b2a7-35e9ed71de43";
    const emailTo = 'stassserchef@gmail.com'; // заменишь на нужный адрес
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
            subject: "Сводка зарплаты",
            from_name: "SHBB Payroll",
            reply_to: "no-reply@shbb.com",
            message: msg
        })
    });

    alert('✅ Сводка отправлена!');
  } catch(err) {
    alert('❌ Ошибка отправки: ' + err.message);
    console.error(err);
  }
}

// Обработчики кнопок
document.getElementById("generateBtn").addEventListener("click", () => {
  const periodVal = document.getElementById("periodSelect").value;
  const now = new Date();
  let periodStart, periodEnd;
  if (periodVal === "1-15") {
    periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    periodEnd = new Date(now.getFullYear(), now.getMonth(), 15);
  } else {
    periodStart = new Date(now.getFullYear(), now.getMonth(), 16);
    periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }

  const salarySummary = calculateSalary(periodStart, periodEnd);
  const message = formatSalaryMessage(periodStart, periodEnd, salarySummary);
  document.getElementById("salarySummary").textContent = message;
});

document.getElementById("downloadImageBtn").addEventListener("click", generateSalaryImage);
document.getElementById("sendSalaryToTelegram").addEventListener("click", sendSalaryMessage);

loadSchedule();
