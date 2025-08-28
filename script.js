// Настройки графика
const chefSchedule = [1,1,1,1,1,0,0]; // 5/2
const kitchenStaff = ["Максим", "Мигель", "Шавкат"];
const kitchenSchedule = [1,1,1,1,0,0]; // 4/2
const kitchenShiftOffset = [0,1,2]; // смещение
const dessertsStaff = ["Максим","Тимофей","Ирина"]; // заполняешь сам

const staff = [
    { role: "Шеф", names: ["Стас"], schedule: chefSchedule },
    { role: "Кухня", names: kitchenStaff, schedule: kitchenSchedule, offset: kitchenShiftOffset },
    { role: "Десерты", names: dessertsStaff, schedule: [] }
];

const today = new Date();
const daysShortRU = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
const totalDays = 14;

// --- Заголовки таблицы ---
const dateRow = document.getElementById("date-row");
const dayRow = document.getElementById("day-row");

for(let i=0;i<totalDays;i++){
    let d = new Date();
    d.setDate(today.getDate()+i);

    const tdDate = document.createElement("th");
    tdDate.textContent = d.getDate();
    dateRow.appendChild(tdDate);

    const tdDay = document.createElement("th");
    tdDay.textContent = daysShortRU[d.getDay()===0?6:d.getDay()-1];
    dayRow.appendChild(tdDay);
}

// --- Тело таблицы ---
const tbody = document.getElementById("schedule-body");

staff.forEach((group, groupIndex) => {
    group.names.forEach((name,i)=>{
        const tr = document.createElement("tr");

        const tdName = document.createElement("td");
        tdName.textContent = `${group.role}: ${name}`;
        tdName.classList.add("fixed-column","name-cell");
        tr.appendChild(tdName);

        for(let j=0;j<totalDays;j++){
            const td = document.createElement("td");
            let work = 0;
            if(group.role === "Шеф") work = group.schedule[j % 7];
            else if(group.role === "Кухня") work = group.schedule[(j + group.offset[i]) % 6];
            else work = 0;
            td.textContent = work;
            tr.appendChild(td);
        }

        tbody.appendChild(tr);
    });

    // Разделитель между подразделениями
    if(groupIndex < staff.length-1){
        const sep = document.createElement("tr");
        sep.classList.add("separator");
        const td = document.createElement("td");
        td.colSpan = totalDays + 1;
        sep.appendChild(td);
        tbody.appendChild(sep);
    }
});
