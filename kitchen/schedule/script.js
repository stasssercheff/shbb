// Настройки
const chefSchedule = [1,1,1,1,1,0,0]; // 5/2
const kitchenStaff = ["Максим", "Мигель", "Шавкат"];
const kitchenSchedule = [1,1,1,1,0,0]; // 4/2
const kitchenShiftOffset = [0,1,2]; // смещение для каждого сотрудника
const dessertsStaff = ["Максим","Тимофей","Ирина"]; // можно заполнить аналогично

const staff = [
    { role: "Шеф", names: ["Стас"], schedule: chefSchedule },
    { role: "Кухня", names: kitchenStaff, schedule: kitchenSchedule, offset: kitchenShiftOffset },
    { role: "Десерты", names: dessertsStaff, schedule: [] } // заполняешь сам
];

// Получаем текущую дату и дни недели
const today = new Date();
const daysShortRU = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
const monthDays = 7; // на 7 дней показываем график

// --- Заполнение шапки ---
const dateRow = document.getElementById("date-row");
const dayRow = document.getElementById("day-row");

for(let i=0;i<monthDays;i++){
    let d = new Date();
    d.setDate(today.getDate()+i);
    const tdDate = document.createElement("th");
    tdDate.textContent = d.getDate();
    if(d.toDateString() === today.toDateString()) tdDate.classList.add("today");
    dateRow.appendChild(tdDate);

    const tdDay = document.createElement("th");
    tdDay.textContent = daysShortRU[d.getDay()===0?6:d.getDay()-1]; // Пн=0
    if(d.toDateString() === today.toDateString()) tdDay.classList.add("today");
    dayRow.appendChild(tdDay);
}

// --- Заполнение тела графика ---
const tbody = document.getElementById("schedule-body");

staff.forEach(group => {
    group.names.forEach((name,i)=>{
        const tr = document.createElement("tr");

        // Первая колонка — роль + имя
        const tdName = document.createElement("td");
        tdName.textContent = `${group.role}: ${name}`;
        tdName.classList.add("fixed-column","name-cell");
        tr.appendChild(tdName);

        for(let j=0;j<monthDays;j++){
            const td = document.createElement("td");
            let work = 0;
            if(group.role === "Шеф") work = group.schedule[j % 7];
            else if(group.role === "Кухня") {
                const offset = group.offset[i];
                work = group.schedule[(j+offset)%6]; // 6-дневный цикл 4/2
            } else {
                work = 0; // десерты пока пусто
            }
            td.textContent = work ? "X" : "-";
            tr.appendChild(td);
        }

        tbody.appendChild(tr);
    });
});