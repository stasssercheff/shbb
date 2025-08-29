const staffSections = {
  "Шефы": [
    { name: "Стас", role: "chef" },
    { name: "Ирина", role: "chef" }
  ],
  "Повара": [
    { name: "Максим", role: "cook" },
    { name: "Мигель", role: "cook" },
    { name: "Шавкат", role: "cook" },
    { name: "Тимофей", role: "cook" }
  ],
  "Кондитеры": [
    { name: "Анастасия", role: "chef" } // пример, можно поменять
  ]
};

const patterns = {
  chef: [1, 1, 1, 1, 1, 0, 0], // 5/2
  cook: [1, 1, 1, 1, 0, 0]     // 4/2
};

const states = ["1", "0", "О", "Б"];
const classes = { "1": "cell-1", "0": "cell-0", "О": "cell-O", "Б": "cell-B" };

const table = document.getElementById("schedule");
const saved = JSON.parse(localStorage.getItem("scheduleData") || "{}");

// Получаем понедельник текущей недели
function getMonday(d) {
  d = new Date(d);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

const startDate = getMonday(new Date());
const daysToShow = 60; // «вечный» график, можно 365, будет прокрутка

// Заголовки
const rowDate = table.insertRow();
const rowDay = table.insertRow();
rowDate.insertCell().textContent = "Дата";
rowDay.insertCell().textContent = "День";

for (let i = 0; i < daysToShow; i++) {
  let d = new Date(startDate);
  d.setDate(d.getDate() + i);
  const dateStr = d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
  const dayStr = d.toLocaleDateString("ru-RU", { weekday: "short" });

  rowDate.insertCell().textContent = dateStr;
  rowDay.insertCell().textContent = dayStr;
}

// Добавляем сотрудников по секциям
for (let section in staffSections) {
  // строка-разделитель
  const secRow = table.insertRow();
  const secCell = secRow.insertCell();
  secCell.colSpan = daysToShow + 1;
  secCell.textContent = section;
  secRow.classList.add("section-row");

  staffSections[section].forEach((person) => {
    const row = table.insertRow();
    row.insertCell().textContent = person.name;

    for (let i = 0; i < daysToShow; i++) {
      const pattern = patterns[person.role];
      const base = pattern[i % pattern.length].toString();

      const cell = row.insertCell();
      const key = `${person.name}-${i}`;

      let value = saved[key] || base;
      cell.textContent = value;
      updateCellClass(cell, value);
      cell.setAttribute("data-key", key);
    }
  });
}

// Клик по ячейкам
table.addEventListener("click", (e) => {
  const cell = e.target;
  if (cell.cellIndex === 0 || cell.parentNode.rowIndex < 2 || cell.parentNode.classList.contains("section-row")) return;

  let current = cell.textContent.trim();
  let next = states[(states.indexOf(current) + 1) % states.length];
  cell.textContent = next;
  updateCellClass(cell, next);

  saved[cell.dataset.key] = next;
  localStorage.setItem("scheduleData", JSON.stringify(saved));
});

function updateCellClass(cell, value) {
  cell.className = classes[value] || "";
}