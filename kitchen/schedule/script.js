document.addEventListener("DOMContentLoaded", () => {
  const scheduleBody = document.getElementById("scheduleBody");
  const datesRow = document.getElementById("datesRow");

  // массив сотрудников
  const staff = ["Шеф","Стас","Кухня","Максим","Мигель","Шавкат","Кондитеры","Тимофей","Ирина"];

  // пример данных: 1 - есть смена, 0 - нет
  // каждая строка соответствует сотруднику, 10 дней
  const data = [
    [1,1,1,1,1,0,0,1,1,0], // Шеф
    [1,1,1,1,1,1,0,1,1,1], // Стас
    [0,0,0,0,0,0,0,0,0,0], // Кухня
    [0,1,1,1,1,0,0,1,1,1], // Максим
    [1,0,0,1,1,1,1,0,0,1], // Мигель
    [0,1,1,0,0,1,1,1,1,0], // Шавкат
    [0,0,0,0,0,0,0,0,0,0], // Кондитеры
    [0,0,0,0,0,0,1,1,1,1], // Тимофей
    [1,1,1,1,0,0,1,1,1,1], // Ирина
  ];

  // даты — 10 дней начиная с сегодняшнего
  const today = new Date();
  for (let i = 0; i < 10; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);
    const iso = d.toISOString().split("T")[0];
    const day = d.toLocaleDateString("ru-RU",{ day:"2-digit", month:"2-digit" });
    const weekday = d.toLocaleDateString("ru-RU",{ weekday:"short" });
    const th = document.createElement("th");
    th.dataset.date = iso;
    th.innerHTML = `${day}<br>${weekday}`;
    datesRow.appendChild(th);
  }

  // строки смен
  staff.forEach((person, idx) => {
    const tr = document.createElement("tr");
    data[idx].forEach((shift, j) => {
      const td = document.createElement("td");
      td.textContent = shift;
      td.classList.add("shift-" + shift);
      tr.appendChild(td);
    });
    scheduleBody.appendChild(tr);
  });

  // подсветка сегодняшнего дня (целый столбец)
  const headers = document.querySelectorAll("#datesRow th");
  headers.forEach((th, colIdx) => {
    if (th.dataset.date === today.toISOString().split("T")[0]) {
      th.classList.add("today");
      const rows = scheduleBody.querySelectorAll("tr");
      rows.forEach(row => {
        if (row.cells[colIdx]) {
          row.cells[colIdx].classList.add("today");
        }
      });
    }
  });
});