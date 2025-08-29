// Данные для графика
const scheduleData = [
  { section: "Шеф", names: ["Стас"] },
  { section: "Кухня", names: ["Максим", "Мигель", "Шавкат", "Ирина"] },
  { section: "Кондитеры", names: ["Тимофей", "Ирина"] }
];

// Функция генерации графика
function generateSchedule(days = 10) {
  const table = document.getElementById("schedule-table");
  table.innerHTML = "";

  const today = new Date();
  
  // Шапка таблицы
  let headerRow = "<tr><th>Раздел / Имя</th>";
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const isToday = i === 0 ? " today" : "";
    headerRow += `<th class="${isToday}">${date.toLocaleDateString()}</th>`;
  }
  headerRow += "</tr>";
  table.innerHTML += headerRow;

  // Тело таблицы
  scheduleData.forEach(group => {
    // Раздел
    table.innerHTML += `<tr><td class="section-cell" colspan="${days + 1}">${group.section}</td></tr>`;
    
    // Имена
    group.names.forEach(name => {
      let row = `<tr><td class="name-cell">${name}</td>`;
      for (let i = 0; i < days; i++) {
        // Пример: случайные смены
        const shift = Math.random() > 0.5 ? 1 : 0;
        const cls = shift ? "shift-yes" : "shift-no";
        const isToday = i === 0 ? " today" : "";
        row += `<td class="${cls}${isToday}">${shift}</td>`;
      }
      row += "</tr>";
      table.innerHTML += row;
    });
  });
}

// Перевод интерфейса
const translations = {
  ru: {
    back: "← Назад",
    home: "На главную",
    header: "Раздел / Имя"
  },
  en: {
    back: "← Back",
    home: "Home",
    header: "Section / Name"
  }
};

function setLanguage(lang) {
  document.querySelector(".nav-buttons button:first-child").textContent = translations[lang].back;
  document.querySelector(".nav-buttons button:last-child").textContent = translations[lang].home;
  document.querySelector("#schedule-table th:first-child").textContent = translations[lang].header;
}

document.getElementById("language-select").addEventListener("change", (e) => {
  setLanguage(e.target.value);
});

// Генерация при загрузке
generateSchedule(10);