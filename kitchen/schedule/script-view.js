document.addEventListener("DOMContentLoaded", () => {
  const table = document.getElementById("schedule");
  const headerDates = document.getElementById("header-dates");
  const headerDays = document.getElementById("header-days");
  const tbody = table.querySelector("tbody");

  // === Даты (пример: 01.08–31.12) ===
  const startDate = new Date("2024-08-01"); // начало графика
  const endDate = new Date("2024-12-31");   // конец графика
  const today = new Date();
  today.setHours(0,0,0,0);

  const dates = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }

  // === Заголовки ===
  headerDates.innerHTML = `<th class="sticky-col">Дата</th>`;
  headerDays.innerHTML = `<th class="sticky-col">День</th>`;

  dates.forEach(date => {
    const dateStr = date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
    const dayStr = date.toLocaleDateString("ru-RU", { weekday: "short" });

    const isToday = date.getTime() === today.getTime();

    const thDate = document.createElement("th");
    thDate.textContent = dateStr;
    if (isToday) thDate.classList.add("today-header");

    const thDay = document.createElement("th");
    thDay.textContent = dayStr;
    if (isToday) thDay.classList.add("today-header");

    headerDates.appendChild(thDate);
    headerDays.appendChild(thDay);
  });

  // === Данные (пример сотрудников) ===
  const employees = ["Стас", "Максим", "Мигель", "Шавкат", "Ирина", "Тимофей"];
  employees.forEach(name => {
    const tr = document.createElement("tr");
    const tdName = document.createElement("td");
    tdName.textContent = name;
    tdName.classList.add("sticky-col");
    tr.appendChild(tdName);

    dates.forEach(() => {
      const td = document.createElement("td");
      td.textContent = ""; // тут будут смены из Google Sheets
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  // === Автопрокрутка: сегодня = 4-й столбец ===
  const tableContainer = document.querySelector(".table-container");
  const todayIndex = dates.findIndex(d => d.getTime() === today.getTime());
  if (todayIndex >= 0) {
    const targetIndex = Math.max(todayIndex - 3, 0); // чтобы сегодня был 4-й
    const cellWidth = 82; // примерная ширина ячейки
    tableContainer.scrollLeft = targetIndex * cellWidth;
  }
});