// ========================
// Настройки графика
// ========================
const chefSchedule = [1,1,1,1,1,0,0]; // 5/2
const kitchenStaff = ["Максим", "Мигель", "Шавкат"];
const kitchenSchedule = [1,1,1,1,0,0]; // 4/2
const kitchenShiftOffset = [0,1,2]; // смещение для каждого
const dessertsStaff = ["Максим","Тимофей","Ирина"];
const dessertsSchedule = [1,1,1,1,0,0]; // 4/2 для десертов
const dessertsShiftOffset = [0,1,2];

const staff = [
    { role: "Шеф", names: ["Стас"], schedule: chefSchedule },
    { role: "Кухня", names: kitchenStaff, schedule: kitchenSchedule, offset: kitchenShiftOffset },
    { role: "Десерты", names: dessertsStaff, schedule: dessertsSchedule, offset: dessertsShiftOffset }
];

const totalDays = 14;
const daysShortRU = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
const today = new Date();

// ========================
// Массив для ручных корректировок
// ========================
const manualEdits = [
    // {name:"Шеф: Стас", day:3, value:0},
    // {name:"Кухня: Максим", day:5, value:1}
];

// ========================
// Найти ближайший понедельник
// ========================
const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // Пн=1 ... Вс=7
const firstMonday = new Date(today);
firstMonday.setDate(today.getDate() - (dayOfWeek - 1));

// ========================
// Генерация заголовка таблицы
// ========================
const dateRow = document.getElementById("date-row");
const dayRow = document.getElementById("day-row");

for (let i = 0; i < totalDays; i++) {
    const d = new Date(firstMonday);
    d.setDate(firstMonday.getDate() + i);

    const tdDate = document.createElement("th");
    tdDate.textContent = d.getDate();
    if(d.toDateString() === today.toDateString()){
        tdDate.style.background = "#ffe680"; // выделяем сегодняшний день
    }
    dateRow.appendChild(tdDate);

    const tdDay = document.createElement("th");
    tdDay.textContent = daysShortRU[d.getDay() === 0 ? 6 : d.getDay() - 1];
    dayRow.appendChild(tdDay);
}

// ========================
// Генерация тела таблицы
// ========================
const tbody = document.getElementById("schedule-body");

staff.forEach((group, groupIndex) => {
    group.names.forEach((name, i) => {
        const tr = document.createElement("tr");

        // Имя слева
        const tdName = document.createElement("td");
        tdName.textContent = `${group.role}: ${name}`;
        tdName.classList.add("fixed-column","name-cell");
        tr.appendChild(tdName);

        for (let j = 0; j < totalDays; j++) {
            const td = document.createElement("td");
            let work = 0;

            if(group.role === "Шеф"){
                work = group.schedule[j % group.schedule.length];
            } else if(group.role === "Кухня"){
                const offset = group.offset[i];
                work = group.schedule[(j + offset) % group.schedule.length];
            } else if(group.role === "Десерты"){
                const offset = group.offset[i];
                work = group.schedule[(j + offset) % group.schedule.length];
            }

            td.textContent = work;
            tr.appendChild(td);
        }

        tbody.appendChild(tr);

        // Применяем разовые корректировки
        manualEdits.forEach(edit => {
            if(edit.name === tdName.textContent){
                const tdToEdit = tr.children[edit.day + 1]; // +1 из-за колонки имени
                if(tdToEdit){
                    tdToEdit.textContent = edit.value;
                }
            }
        });
    });

    // Разделитель между подразделениями
    if(groupIndex < staff.length - 1){
        const sep = document.createElement("tr");
        sep.classList.add("separator");
        const td = document.createElement("td");
        td.colSpan = totalDays + 1;
        sep.appendChild(td);
        tbody.appendChild(sep);
    }
});
