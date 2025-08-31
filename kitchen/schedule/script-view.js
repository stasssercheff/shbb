const table = document.getElementById("schedule");
const tbody = table.querySelector("tbody");
const headerDates = document.getElementById("header-dates");
const headerDays = document.getElementById("header-days");

const classes = { 
  "1": "shift-1", 
  "0": "shift-0", 
  "О": "shift-O", 
  "Б": "shift-Б" 
};

const daysToShow = 60; // всего дней, график «вечный»
const startMonday = new Date('2025-08-31'); // начальная дата понедельника

const today = new Date();
today.setHours(0,0,0,0);

// Пример данных
const data = {
  "Шефы": {
    "Стас": ["1","1","1","1","1","0","0"]
  },
  "Кухня": {
    "Максим": ["0","1","1","1","1","0"],
    "Мигель": ["1","0","0","1","1","1"],
    "Шавкат": ["1","1","1","0","0","1"]
  },
  "Кондитеры": {
    "Тимофей": ["1","1","1","0","0","1","1"],
    "Ирина": ["1","1","1","0","0","1","1"]
  }
};

// Создаём заголовки с датами и днями
for(let i=0; i<daysToShow; i++){
  const d = new Date(startMonday);
  d.setDate(d.getDate() + i);

  const dateStr = d.toLocaleDateString("ru-RU",{day:"2-digit", month:"2-digit"});
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

// Рендер сотрудников и пустых строк между цехами
for(const section in data){
  const staff = data[section];

  // Пустая строка-разделитель
  const sepRow = tbody.insertRow();
  const sepCell = sepRow.insertCell();
  sepCell.colSpan = daysToShow + 1;
  sepCell.textContent = "";
  sepRow.classList.add("section-row");

  for(const name in staff){
    const row = tbody.insertRow();
    const nameCell = row.insertCell();
    nameCell.textContent = name;
    nameCell.classList.add("sticky-col");
    nameCell.style.maxWidth = "100px"; // чтобы имя не вылезало
    nameCell.style.overflow = "hidden";
    nameCell.style.textOverflow = "ellipsis";
    nameCell.style.whiteSpace = "nowrap";

    const days = staff[name];
    for(let i=0; i<daysToShow; i++){
      const val = days[i % days.length];
      const cell = row.insertCell();
      cell.textContent = val;
      cell.className = classes[val] || "";
      cell.style.width = "40px"; // уже ячейки

      // Подсветка сегодняшнего дня
      const d = new Date(startMonday);
      d.setDate(d.getDate() + i);
      d.setHours(0,0,0,0);
      if(d.getTime() === today.getTime()) cell.classList.add("today");
    }
  }
}