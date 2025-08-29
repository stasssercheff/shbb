const totalDays = 14;

const staff = [
    { role: "Шеф", names: ["Стас"], schedule: [1,1,1,1,1,0,0] },
    { role: "Кухня", names: ["Максим","Мигель","Шавкат"], schedule: [1,1,1,1,0,0], offset:[0,1,2] }
];

const dessertsStaff = ["Максим","Тимофей","Ирина"];
staff.push({ role: "Десерты", names: dessertsStaff, schedule:[1,1,1,1,0,0], offset:[0,1,2] });

const dateRow = document.getElementById("date-row");
const dayRow = document.getElementById("day-row");
const tbody = document.getElementById("schedule-body");

const today = new Date();
const daysShortRU = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

// Заголовки
const thDate = document.createElement("th");
thDate.textContent = "Дата";
dateRow.appendChild(thDate);

const thDay = document.createElement("th");
thDay.textContent = "День";
dayRow.appendChild(thDay);

// Даты и дни
for(let i=0; i<totalDays; i++){
    const d = new Date();
    d.setDate(today.getDate() - today.getDay() + 1 + i);

    const thD = document.createElement("th");
    const thWeek = document.createElement("th");

    if(i < totalDays-1){
        thD.textContent = d.getDate();
        thWeek.textContent = daysShortRU[d.getDay() === 0 ? 6 : d.getDay()-1];
    } else {
        thD.textContent = "";
        thWeek.textContent = "";
    }

    dateRow.appendChild(thD);
    dayRow.appendChild(thWeek);
}

// Тело таблицы
staff.forEach((group, groupIndex)=>{
    group.names.forEach((name,i)=>{
        const tr = document.createElement("tr");

        // Фиксированный первый столбец
        const tdName = document.createElement("td");
        tdName.textContent = name;
        tdName.classList.add("fixed-column");
        tr.appendChild(tdName);

        for(let j=0;j<totalDays;j++){
            const td = document.createElement("td");
            let val=0;

            if(group.role==="Шеф") val = group.schedule[j%7];
            else val = group.schedule[(j + (group.offset?group.offset[i]:0)) % group.schedule.length];

            td.textContent = val;

            if(val===0) td.classList.add("work-0");

            const d = new Date();
            d.setDate(today.getDate() - today.getDay() + 1 + j);
            if(d.toDateString() === today.toDateString()){
                td.classList.add("today");
            }

            tr.appendChild(td);
        }

        tbody.appendChild(tr);
    });

    // Разделитель с названием следующего подразделения
    if(groupIndex < staff.length-1){
        const sep = document.createElement("tr");
        sep.classList.add("separator");
        const td = document.createElement("td");
        td.colSpan = totalDays + 1;
        td.textContent = staff[groupIndex+1].role; // название следующего подразделения
        sep.appendChild(td);
        tbody.appendChild(sep);
    }
});
